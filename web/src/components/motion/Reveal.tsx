import type { CSSProperties, ElementType, ReactNode } from "react";

type Props = {
  as?: ElementType;
  kind?: "fade" | "image" | "lines";
  delay?: number;
  /** Above the fold: animate on page load with CSS alone, never wait for hydration. */
  onLoad?: boolean;
  className?: string;
  children: ReactNode;
} & Record<string, unknown>;

/** Marks an element for the shared RevealObserver. Works in server components. */
export function Reveal({ as: Tag = "div", kind = "fade", delay = 0, onLoad = false, className, children, ...rest }: Props) {
  return (
    <Tag
      {...(onLoad ? { "data-reveal-load": kind } : { "data-reveal": kind })}
      className={className}
      style={{ "--reveal-delay": `${delay}ms` } as CSSProperties}
      {...rest}
    >
      {children}
    </Tag>
  );
}

/** Headline split into masked lines that rise in sequence. */
export function Lines({
  lines,
  as = "h2",
  className,
  delay = 0,
  id,
  onLoad = false,
}: {
  lines: ReactNode[];
  as?: ElementType;
  className?: string;
  delay?: number;
  id?: string;
  onLoad?: boolean;
}) {
  return (
    <Reveal as={as} kind="lines" delay={delay} onLoad={onLoad} className={className} id={id}>
      {lines.map((line, i) => (
        <span key={i} className="line">
          <span className="line-inner" style={{ "--i": i } as CSSProperties}>
            {line}
          </span>
        </span>
      ))}
    </Reveal>
  );
}
