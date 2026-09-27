import { Lines, Reveal } from "@/components/motion/Reveal";

const STEPS = [
  { n: "01", title: "See it.", body: "Every piece here is a proposal. Real designs, photographed properly, not made yet." },
  { n: "02", title: "Want it.", body: "Tap “I'm interested”. It costs nothing. It's a vote, and we count every one." },
  { n: "03", title: "We make it.", body: "The pieces with the most yeses go into production, in small runs. The list hears first." },
];

export function Statement() {
  return (
    <section aria-labelledby="statement-title" className="gutter py-[clamp(6rem,16vw,14rem)]">
      <div className="grid gap-y-10 md:grid-cols-12 md:gap-x-6">
        <Reveal className="md:col-span-3">
          <p className="t-meta text-stone">(Why we exist)</p>
        </Reveal>
        <div className="md:col-span-9">
          <Lines
            as="h2"
            lines={[
              "Made for the",
              <span key="v" className="t-voice">
                second look.
              </span>,
            ]}
            className="t-display"
            id="statement-title"
          />
          <Reveal delay={200} className="mt-10 grid gap-6 md:mt-14 md:grid-cols-9 md:gap-6">
            <p className="t-lede md:col-span-5">
              Nobody needs another hoodie. We make the other thing — the piece someone notices from across the room, then
              can&rsquo;t stop thinking about. Strange details. Small runs. Clothes first, then objects for your room, your
              desk, your hands.
            </p>
            <p className="t-body text-stone md:col-span-3 md:col-start-7">
              And we don&rsquo;t guess. Nothing gets made until enough people say they want it.
            </p>
          </Reveal>
        </div>
      </div>

      <ol className="mt-20 grid border-t border-ink/15 md:mt-32 md:grid-cols-3">
        {STEPS.map((s, i) => (
          <Reveal
            as="li"
            key={s.n}
            delay={i * 120}
            className="flex gap-5 border-b border-ink/15 py-7 md:flex-col md:gap-16 md:border-b-0 md:border-r md:py-8 md:pr-8 md:last:border-r-0 md:[&:not(:first-child)]:pl-8"
          >
            <span className="t-meta pt-1 text-stone">{s.n}</span>
            <div>
              <h3 className="t-headline">{s.title}</h3>
              <p className="t-body mt-3 max-w-[32ch] text-stone">{s.body}</p>
            </div>
          </Reveal>
        ))}
      </ol>
    </section>
  );
}
