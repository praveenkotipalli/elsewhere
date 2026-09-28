// app/components/stitch/renderer.ts
// Draws stitch legs as shaded thread ribbons. Each leg is one instance of a
// 25-segment triangle strip bent along a quadratic curve in the vertex shader.

import type { Leg } from './engine';

const SEGMENTS = 24;

const VERTEX = `
precision highp float;
attribute float aSeg;
attribute float aSide;
attribute vec2 aP0;
attribute vec2 aP1;
attribute vec2 aCtrl;
attribute vec3 aColor;
attribute float aWidth;
attribute float aProgress;
attribute vec4 aMat;   // sheen, sheenW, ply, plyFreq
attribute float aEdge;
uniform vec2 uRes;
varying vec3 vColor;
varying float vSide;
varying float vAlong;
varying float vLen;
varying vec4 vMat;
varying float vEdge;
vec2 qbez(float t, vec2 p0, vec2 c, vec2 p1) {
  float u = 1.0 - t;
  return u * u * p0 + 2.0 * u * t * c + t * t * p1;
}
void main() {
  // Only the sewn part of the thread is drawn while it is being stitched.
  float t = aSeg * clamp(aProgress, 0.0, 1.0);
  vec2 pos = qbez(t, aP0, aCtrl, aP1);
  vec2 pa = qbez(clamp(t - 0.01, 0.0, 1.0), aP0, aCtrl, aP1);
  vec2 pb = qbez(clamp(t + 0.01, 0.0, 1.0), aP0, aCtrl, aP1);
  vec2 dir = normalize(pb - pa + vec2(0.0001, 0.0));
  vec2 nrm = vec2(-dir.y, dir.x);
  float taper = smoothstep(0.0, 0.10, aSeg) * (1.0 - smoothstep(0.90, 1.0, aSeg));
  pos += nrm * aSide * (aWidth * 0.5) * mix(0.72, 1.0, taper);
  vec2 clip = (pos / uRes) * 2.0 - 1.0;
  gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);
  vColor = aColor;
  vSide = aSide;
  vAlong = aSeg;
  vLen = length(aP1 - aP0);
  vMat = aMat;
  vEdge = aEdge;
}`;

const FRAGMENT = `
precision highp float;
varying vec3 vColor;
varying float vSide;
varying float vAlong;
varying float vLen;
varying vec4 vMat;
varying float vEdge;
void main() {
  float s = abs(vSide);
  float sheenAmt = vMat.x, sheenW = vMat.y, plyAmt = vMat.z, plyFreq = vMat.w;
  // Round thread profile: darker at the rim, a lighter sheen along the crown.
  float lift = sqrt(max(0.0, 1.0 - s * s));
  vec3 pale = vColor + (vec3(1.0) - vColor) * (sheenAmt * 0.34);
  vec3 sheenCol = mix(min(vec3(1.0), vColor * (1.0 + sheenAmt * 0.65)), pale, 0.4);
  vec3 col = mix(vColor * vEdge, vColor, smoothstep(0.0, 0.55, lift));
  col = mix(col, sheenCol, smoothstep(1.0 - sheenW * 0.7, 1.0, lift));
  // Twisted ply and fibre texture along the length of the thread.
  float twists = max(3.0, vLen * plyFreq);
  col *= 1.0 + sin((vAlong * twists + vSide * 0.9) * 6.2831853) * 0.12 * plyAmt;
  col += sin(vAlong * twists * 6.0 + vSide * 8.0) * 0.02 * plyAmt * vColor;
  col *= 1.0 - smoothstep(0.78, 1.0, s) * 0.25;
  gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0 - smoothstep(0.90, 1.0, s));
}`;

// Per-leg attributes that never change: p0, p1, rgb, width, material(4), edge.
const STATIC_FLOATS = 13;
// Per-leg attributes updated every frame: control point and progress.
const DYNAMIC_FLOATS = 3;

export class StitchRenderer {
  private gl: WebGLRenderingContext;
  private ext: ANGLE_instanced_arrays;
  private dynBuf: WebGLBuffer;
  private dynData: Float32Array;
  private uRes: WebGLUniformLocation | null;

  /** Returns null when WebGL (with instancing) isn't available. */
  static create(canvas: HTMLCanvasElement, legs: Leg[]) {
    const gl = canvas.getContext('webgl', {
      antialias: false,
      premultipliedAlpha: false,
      alpha: true,
      powerPreference: 'low-power',
    });
    const ext = gl?.getExtension('ANGLE_instanced_arrays');
    if (!gl || !ext) return null;
    try {
      return new StitchRenderer(gl, ext, legs);
    } catch {
      return null;
    }
  }

  private constructor(gl: WebGLRenderingContext, ext: ANGLE_instanced_arrays, legs: Leg[]) {
    this.gl = gl;
    this.ext = ext;

    const compile = (type: number, src: string) => {
      const shader = gl.createShader(type)!;
      gl.shaderSource(shader, src);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader) ?? '');
      return shader;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VERTEX));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FRAGMENT));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog) ?? '');
    gl.useProgram(prog);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    this.uRes = gl.getUniformLocation(prog, 'uRes');

    const attr = (name: string) => gl.getAttribLocation(prog, name);
    const bind = (loc: number, size: number, stride: number, offset: number, divisor: number) => {
      if (loc < 0) return;
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, size, gl.FLOAT, false, stride * 4, offset * 4);
      ext.vertexAttribDivisorANGLE(loc, divisor);
    };

    // Shared strip geometry: (seg, side) pairs along the thread.
    const strip: number[] = [];
    for (let i = 0; i <= SEGMENTS; i++) strip.push(i / SEGMENTS, -1, i / SEGMENTS, 1);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(strip), gl.STATIC_DRAW);
    bind(attr('aSeg'), 1, 2, 0, 0);
    bind(attr('aSide'), 1, 2, 1, 0);

    const data = new Float32Array(legs.length * STATIC_FLOATS);
    let k = 0;
    for (const leg of legs) {
      const m = leg.material;
      data.set(
        [leg.a[0], leg.a[1], leg.b[0], leg.b[1], ...leg.rgb, leg.width, m.sheen, m.sheenW, m.ply, m.plyFreq, m.edge],
        k,
      );
      k += STATIC_FLOATS;
    }
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    bind(attr('aP0'), 2, STATIC_FLOATS, 0, 1);
    bind(attr('aP1'), 2, STATIC_FLOATS, 2, 1);
    bind(attr('aColor'), 3, STATIC_FLOATS, 4, 1);
    bind(attr('aWidth'), 1, STATIC_FLOATS, 7, 1);
    bind(attr('aMat'), 4, STATIC_FLOATS, 8, 1);
    bind(attr('aEdge'), 1, STATIC_FLOATS, 12, 1);

    this.dynData = new Float32Array(legs.length * DYNAMIC_FLOATS);
    this.dynBuf = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.dynBuf);
    gl.bufferData(gl.ARRAY_BUFFER, this.dynData, gl.DYNAMIC_DRAW);
    bind(attr('aCtrl'), 2, DYNAMIC_FLOATS, 0, 1);
    bind(attr('aProgress'), 1, DYNAMIC_FLOATS, 2, 1);
  }

  render(legs: Leg[], worldW: number, worldH: number) {
    const { gl, dynData } = this;
    let k = 0;
    for (const leg of legs) {
      dynData[k++] = leg.cxp;
      dynData[k++] = leg.cyp;
      dynData[k++] = leg.progress;
    }
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform2f(this.uRes, worldW, worldH);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.dynBuf);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, dynData);
    this.ext.drawArraysInstancedANGLE(gl.TRIANGLE_STRIP, 0, (SEGMENTS + 1) * 2, legs.length);
  }
}

/** Plain canvas fallback for devices without WebGL: one curved stroke per leg. */
export function render2D(ctx: CanvasRenderingContext2D, legs: Leg[], worldW: number) {
  const { width, height } = ctx.canvas;
  const scale = width / worldW;
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
  ctx.clearRect(0, 0, width / scale, height / scale);
  ctx.lineCap = 'round';
  for (const leg of legs) {
    if (leg.progress <= 0) continue;
    const t = leg.progress;
    const [x0, y0] = leg.a;
    // Split the curve at t so a half-sewn thread draws only its sewn part.
    const cx = x0 + (leg.cxp - x0) * t;
    const cy = y0 + (leg.cyp - y0) * t;
    const u = 1 - t;
    const ex = u * u * x0 + 2 * u * t * leg.cxp + t * t * leg.b[0];
    const ey = u * u * y0 + 2 * u * t * leg.cyp + t * t * leg.b[1];
    const [r, g, b] = leg.rgb.map((v) => Math.round(v * 255));
    ctx.strokeStyle = `rgb(${r},${g},${b})`;
    ctx.lineWidth = leg.width;
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.quadraticCurveTo(cx, cy, ex, ey);
    ctx.stroke();
  }
}
