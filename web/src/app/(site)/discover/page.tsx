import type { Metadata } from "next";
import { Lines, Reveal } from "@/components/motion/Reveal";
import { ExploreYourWorld } from "@/components/worlds/ExploreYourWorld";
import { WorldTracker } from "@/components/worlds/WorldTracker";
import { getRooms } from "@/lib/worlds/rooms";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Explore",
  description: "Discover Elsewhere by the people, worlds and feelings you're into — style icons, anime worlds, essentials and aesthetics.",
  alternates: { canonical: "/discover" },
};

export default async function DiscoverPage() {
  const rooms = await getRooms();
  return (
    <div className="pt-[calc(var(--header-h)+clamp(3rem,8vw,7rem))]">
      <WorldTracker worldId={null} name="Discover" family="discover" href="/discover" />
      <header className="gutter grid gap-y-6 md:grid-cols-12 md:gap-x-6">
        <p className="t-meta text-stone md:col-span-3">(Explore)</p>
        <div className="md:col-span-9">
          <Lines onLoad as="h1" lines={["Pick a door.", <span key="v" className="t-voice">Every room is different.</span>]} className="t-mega" />
          <Reveal onLoad delay={250}>
            <p className="t-lede mt-8 max-w-[42ch]">
              Tell us what kind of person, world or feeling you&rsquo;re into. We&rsquo;ll show you the things that belong there.
            </p>
          </Reveal>
        </div>
      </header>
      <ExploreYourWorld rooms={rooms} heading={false} className="pt-[clamp(3rem,7vw,6rem)]" />
    </div>
  );
}
