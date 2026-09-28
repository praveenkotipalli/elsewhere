// app/components/stitch/engine.ts
// A tiny cross-stitch engine. Every grid cell is sewn with a "unit" made of
// several thread legs; each leg is a quadratic curve whose control point is
// driven by cloth physics, so threads bend away from the pointer and spring back.

export type StitchUnit = 'satin' | 'cross' | 'tweed';
export type PlacedUnit = { r: number; c: number; unit: StitchUnit; color: string };

type Point = [number, number];
type LegShape = [Point, Point];

type Node = {
  cx: number;
  cy: number;
  ox: number;
  oy: number;
  vx: number;
  vy: number;
  nbr: Node[];
  /** Share of the full disturbance this node may have while settling (0..1). */
  keep: number;
};

export type Material = {
  widthMul: number;
  sheen: number;
  sheenW: number;
  ply: number;
  plyFreq: number;
  edge: number;
};

export type Leg = {
  c: number;
  /** Fabric backing for the cell: moves with the cloth but ignores the pointer. */
  base?: boolean;
  node: Node;
  a: Point;
  b: Point;
  mid: Point;
  cxp: number;
  cyp: number;
  ox: number;
  oy: number;
  vx: number;
  vy: number;
  rgb: [number, number, number];
  width: number;
  material: Material;
  t0: number;
  t1: number;
  progress: number;
  drawn: boolean;
};

// Soft, low-sheen cotton thread.
export const COTTON: Material = {
  widthMul: 1,
  sheen: 0.35,
  sheenW: 0.16,
  ply: 0.35,
  plyFreq: 0.45,
  edge: 0.36,
};

// Horizontal back-and-forth rows across a cell.
function rows(n: number): LegShape[] {
  const legs: LegShape[] = [];
  for (let i = 0; i < n; i++) {
    const y = (i + 0.5) / n;
    legs.push(i % 2 ? [[1, y], [0, y]] : [[0, y], [1, y]]);
  }
  return legs;
}

// Parallel diagonal hatching ("/" or "\") that fills the cell.
function hatch(n: number, dir: '/' | '\\'): LegShape[] {
  const legs: LegShape[] = [];
  const count = 2 * n - 1;
  for (let i = 1; i <= count; i++) {
    const t = i / (count + 1);
    const lo = Math.max(0, 2 * t - 1);
    const hi = Math.min(1, 2 * t);
    legs.push(dir === '/' ? [[lo, hi], [hi, lo]] : [[lo, lo], [hi, hi]]);
  }
  return legs;
}

const UNITS: Record<StitchUnit, LegShape[]> = {
  cross: [
    [[0, 1], [1, 0]],
    [[0, 0], [1, 1]],
  ],
  satin: hatch(7, '/'),
  tweed: [...rows(3), ...hatch(3, '/'), ...hatch(3, '\\')],
};

const STEP_MS = 1000 / 60;
// Width of the soft edge between settled and still-disturbed cloth. Wide, so
// each thread eases down gradually as the edge passes rather than snapping.
const SETTLE_EDGE_CELLS = 10;
// Flat, matte thread used for the backing under each cell.
const BACKING: Material = { widthMul: 1, sheen: 0, sheenW: 0, ply: 0, plyFreq: 0, edge: 1 };

function hexToRGB(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16) / 255) as [number, number, number];
}

type LegInit = Pick<Leg, 'c' | 'node' | 'a' | 'b' | 'rgb' | 'width' | 'material' | 'base'>;

function makeLeg(init: LegInit): Leg {
  const mid: Point = [(init.a[0] + init.b[0]) / 2, (init.a[1] + init.b[1]) / 2];
  return {
    ...init,
    mid,
    cxp: mid[0],
    cyp: mid[1],
    ox: 0,
    oy: 0,
    vx: 0,
    vy: 0,
    t0: 0,
    t1: 0,
    progress: 0,
    drawn: false,
  };
}

export class StitchEngine {
  readonly W: number;
  readonly H: number;
  legs: Leg[] = [];
  nodes = new Map<string, Node>();

  physics = { spring: 14, radius: 0, intensity: 1, sway: false };
  /**
   * While set, the cloth calms from the outside in: threads further than
   * `radius` from (x, y) are eased back to rest, with a soft edge. Shrinking
   * the radius to zero settles everything, the centre last.
   */
  settle: { x: number; y: number; radius: number } | null = null;
  pointer = { x: -9999, y: -9999, down: false, active: false };
  private physicsIdle = false;

  constructor(
    readonly cols: number,
    readonly rows: number,
    readonly cell: number,
    units: PlacedUnit[],
    { material = COTTON, backing = 0 }: { material?: Material; backing?: number } = {},
  ) {
    this.W = cols * cell;
    this.H = rows * cell;

    for (const u of units) {
      const node = this.ensureNode(u.c, u.r);
      const shapes = UNITS[u.unit];
      const n = shapes.length;
      const width = (n > 14 ? 2.1 : n > 6 ? 3 : 4.4) * material.widthMul * (cell / 22);
      const rgb = hexToRGB(u.color);
      const x = u.c * cell;
      const y = u.r * cell;

      // A pale wash of the thread colour stands in for the fabric showing
      // between stitches, so gaps don't read as holes on a dark page. It runs
      // a little past the cell so neighbouring backings overlap seamlessly.
      if (backing) {
        this.legs.push(
          makeLeg({
            c: u.c,
            node,
            a: [x - cell * 0.15, y + cell / 2],
            b: [x + cell * 1.15, y + cell / 2],
            rgb: rgb.map((v) => v + (1 - v) * backing) as [number, number, number],
            width: cell * 1.08,
            material: BACKING,
            base: true,
          }),
        );
      }
      for (const [[ax, ay], [bx, by]] of shapes) {
        this.legs.push(
          makeLeg({ c: u.c, node, a: [x + ax * cell, y + ay * cell], b: [x + bx * cell, y + by * cell], rgb, width, material }),
        );
      }
    }
  }

  private ensureNode(c: number, r: number) {
    const key = `${c},${r}`;
    const existing = this.nodes.get(key);
    if (existing) return existing;
    const node: Node = {
      cx: c * this.cell + this.cell / 2,
      cy: r * this.cell + this.cell / 2,
      ox: 0,
      oy: 0,
      vx: 0,
      vy: 0,
      nbr: [],
      keep: 1,
    };
    this.nodes.set(key, node);
    for (const [dc, dr] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const other = this.nodes.get(`${c + dc},${r + dr}`);
      if (other) {
        node.nbr.push(other);
        other.nbr.push(node);
      }
    }
    return node;
  }

  /**
   * Sew every cell in, sweeping left to right. Within a cell the legs are
   * stitched one after another, each overlapping the previous a little.
   */
  sewIn(now: number, legDur = 120, stagger = 4) {
    const speed = 2 * legDur;
    const byCell = new Map<Node, Leg[]>();
    for (const leg of this.legs) {
      const list = byCell.get(leg.node) ?? [];
      list.push(leg);
      byCell.set(leg.node, list);
    }
    for (const legs of byCell.values()) {
      const delay = legs[0].c * stagger;
      const per = speed / legs.length;
      legs.forEach((leg, i) => {
        leg.t0 = now + delay + i * per * 0.75;
        leg.t1 = leg.t0 + per;
        leg.progress = 0;
        leg.drawn = false;
      });
    }
  }

  revealAll() {
    for (const leg of this.legs) {
      leg.t0 = leg.t1 = 0;
      leg.progress = 1;
      leg.drawn = true;
    }
  }

  /** Push an in-progress sew-in later, e.g. after the tab was hidden. */
  shiftTimeline(ms: number) {
    for (const leg of this.legs) {
      if (leg.t1 > leg.t0 && !leg.drawn) {
        leg.t0 += ms;
        leg.t1 += ms;
      }
    }
  }

  setPointer(x: number, y: number, opts: { down?: boolean; active?: boolean } = {}) {
    this.pointer.x = x;
    this.pointer.y = y;
    if (opts.down !== undefined) this.pointer.down = opts.down;
    if (opts.active !== undefined) this.pointer.active = opts.active;
    if (this.pointer.active) this.physicsIdle = false;
  }

  releasePointer() {
    this.pointer.down = false;
  }

  clearPointer() {
    this.pointer = { x: -9999, y: -9999, down: false, active: false };
  }

  wakePhysics() {
    this.physicsIdle = false;
  }

  /** Put every thread exactly back at rest, dropping any stored velocity. */
  calm() {
    for (const n of this.nodes.values()) n.ox = n.oy = n.vx = n.vy = 0;
    for (const leg of this.legs) {
      leg.ox = leg.oy = leg.vx = leg.vy = 0;
      leg.cxp = leg.mid[0];
      leg.cyp = leg.mid[1];
    }
    this.physicsIdle = true;
  }

  private physicsStep(now: number) {
    const sway = this.physics.sway;
    const pointerActive = this.pointer.active;
    if (this.physicsIdle && !pointerActive && !sway) return;

    const damping = 0.86;
    const coupling = 0.14;
    const spring = this.physics.spring / 1000;
    const radius = this.physics.radius;
    const intensity = this.physics.intensity;
    const push = (this.pointer.down ? 1.9 : 0.55) * intensity;
    const maxNode = 0.5 * this.cell * intensity;
    const maxLeg = 0.32 * this.cell * intensity;
    const { x: px, y: py } = this.pointer;
    const settle = this.settle;
    const settleEdge = SETTLE_EDGE_CELLS * this.cell;
    let motion = 0;
    let offset = 0;

    // Cloth nodes: pushed by the pointer, pulled toward their neighbours and home.
    for (const node of this.nodes.values()) {
      // How much this node may still be disturbed (1 = freely, 0 = at rest).
      if (settle) {
        const t = Math.min(1, Math.max(0, (settle.radius - Math.hypot(node.cx - settle.x, node.cy - settle.y)) / settleEdge));
        node.keep = t * t * (3 - 2 * t);
      } else {
        node.keep = 1;
      }
      let fx = 0;
      let fy = 0;
      if (pointerActive) {
        const dx = node.cx + node.ox - px;
        const dy = node.cy + node.oy - py;
        const d2 = dx * dx + dy * dy;
        if (d2 < radius * radius) {
          const d = Math.sqrt(d2) || 1;
          const fall = 1 - d / radius;
          const f = fall * fall * radius * 0.9 * push;
          fx += (dx / d) * f;
          fy += (dy / d) * f;
        }
      }
      if (sway) {
        fx += 0.25 * Math.sin(0.001 * now + 0.05 * node.cy);
        fy += 0.25 * Math.cos(0.0013 * now + 0.05 * node.cx);
      }
      if (node.nbr.length > 0) {
        let ax = 0;
        let ay = 0;
        for (const n of node.nbr) {
          ax += n.ox;
          ay += n.oy;
        }
        fx += (ax / node.nbr.length - node.ox) * coupling * 40;
        fy += (ay / node.nbr.length - node.oy) * coupling * 40;
      }
      node.vx = (node.vx + 0.02 * fx - node.ox * spring) * damping;
      node.vy = (node.vy + 0.02 * fy - node.oy * spring) * damping;
      node.ox += node.vx;
      node.oy += node.vy;
      const len = Math.hypot(node.ox, node.oy);
      const nodeCap = maxNode * node.keep;
      if (len > nodeCap) {
        const k = nodeCap / len;
        node.ox *= k;
        node.oy *= k;
        node.vx *= 0.5;
        node.vy *= 0.5;
      }
      motion += Math.abs(node.vx) + Math.abs(node.vy);
      offset = Math.max(offset, Math.abs(node.ox) + Math.abs(node.oy));
    }

    // Threads: follow their cell's node, with an extra nudge from the pointer.
    for (const leg of this.legs) {
      if (leg.progress <= 0) continue;
      if (leg.drawn) {
        leg.vx = (leg.vx + (leg.node.ox - leg.ox) * 0.5) * 0.8;
        leg.vy = (leg.vy + (leg.node.oy - leg.oy) * 0.5) * 0.8;
        if (pointerActive && !leg.base) {
          const dx = leg.mid[0] + leg.ox - px;
          const dy = leg.mid[1] + leg.oy - py;
          const d2 = dx * dx + dy * dy;
          if (d2 < radius * radius) {
            const d = Math.sqrt(d2) || 1;
            const fall = 1 - d / radius;
            const f = fall * fall * push * 0.9;
            leg.vx += (dx / d) * f;
            leg.vy += (dy / d) * f;
          }
        }
        leg.ox += leg.vx;
        leg.oy += leg.vy;
        const len = Math.hypot(leg.ox, leg.oy);
        const legCap = maxLeg * leg.node.keep;
        if (len > legCap) {
          const k = legCap / len;
          leg.ox *= k;
          leg.oy *= k;
        }
        motion += Math.abs(leg.vx) + Math.abs(leg.vy);
        offset = Math.max(offset, Math.abs(leg.ox) + Math.abs(leg.oy));
      }
      leg.cxp = leg.mid[0] + leg.ox * 2;
      leg.cyp = leg.mid[1] + leg.oy * 2;
    }

    const threshold = 0.05 + (this.nodes.size + this.legs.length) * 4e-4;
    // Slow creeping still counts as motion: only stop once every thread is
    // (almost) back in place, so the cloth never freezes mid-recovery.
    this.physicsIdle = !pointerActive && !sway && motion < threshold && offset < 0.02 * this.cell;
  }

  private lastTick: number | null = null;
  private pending = 0;

  /** Advance one frame. Returns true once nothing is moving any more. */
  tick(now: number) {
    // The physics is tuned per 60 Hz step; run it in fixed steps so it feels
    // the same on 30, 60 and 120 Hz displays.
    const elapsed = this.lastTick === null ? STEP_MS : Math.min(now - this.lastTick, 4 * STEP_MS);
    this.lastTick = now;
    this.pending += elapsed;
    while (this.pending >= STEP_MS) {
      this.physicsStep(now);
      this.pending -= STEP_MS;
    }
    let done = true;
    for (const leg of this.legs) {
      if (leg.t1 <= leg.t0) {
        leg.progress = 1;
        leg.drawn = true;
        continue;
      }
      const t = Math.max(0, Math.min(1, (now - leg.t0) / (leg.t1 - leg.t0)));
      leg.progress = t;
      if (t >= 1) leg.drawn = true;
      else done = false;
    }
    const settled = done && this.physicsIdle;
    if (settled) this.lastTick = null;
    return settled;
  }
}
