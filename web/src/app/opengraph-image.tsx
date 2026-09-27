import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

export const alt = "Elsewhere — They'll ask where you got it.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  const photo = await readFile(join(process.cwd(), "public/images/drop-001/afterhours-bomber-01.jpg"));
  const src = `data:image/jpeg;base64,${photo.toString("base64")}`;

  return new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%", background: "#0d0d0c", color: "#ece9e3" }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 56, flex: 1 }}>
          <div style={{ fontSize: 22, letterSpacing: 3 }}>ELSEWHERE</div>
          <div style={{ display: "flex", flexDirection: "column", fontSize: 92, lineHeight: 0.9, letterSpacing: -4, fontWeight: 600 }}>
            <span>They&apos;ll ask</span>
            <span>where you</span>
            <span>got it.</span>
          </div>
          <div style={{ fontSize: 20, color: "#8e8b85", letterSpacing: 2 }}>DROP 001 — FIRST SIGHTING</div>
        </div>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt="" width={420} height={630} style={{ objectFit: "cover", width: 420, height: 630 }} />
      </div>
    ),
    size,
  );
}
