import Link from "next/link";

export default function NotFound() {
  return (
    <div className="grain flex min-h-[100svh] flex-col justify-end bg-ink pb-16 pt-[calc(var(--header-h)+4rem)] text-bone">
      <div className="gutter">
        <p className="t-meta text-ash">404</p>
        <h1 className="t-mega mt-6">
          You went <span className="t-voice">somewhere else.</span>
        </h1>
        <p className="t-lede mt-8 max-w-[34ch] text-fog">
          Even for us, that&rsquo;s too far. The page isn&rsquo;t here — maybe it never was.
        </p>
        <div className="mt-10 flex gap-8">
          <Link href="/" className="t-meta link-line">
            Back to the start
          </Link>
          <Link href="/pieces" className="t-meta link-line text-ash hover:text-bone">
            See every piece
          </Link>
        </div>
      </div>
    </div>
  );
}
