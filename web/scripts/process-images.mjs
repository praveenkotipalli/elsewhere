import sharp from 'sharp';
const R = 'C:/Users/pc/Desktop/elsewhere/raw/';
const O = 'C:/Users/pc/Desktop/elsewhere/web/public/images/';
const jobs = [
  // [src, out, crop|null, maxWidth]
  ['dragon-denim-1.png', 'drop-001/dragon-denim-01.jpg', null, 1536],
  ['dragon-denim-1.png', 'drop-001/dragon-denim-02.jpg', { left: 250, top: 650, width: 660, height: 880 }, 1200],
  ['dragon-denim-1.png', 'drop-001/dragon-denim-03.jpg', { left: 330, top: 1380, width: 880, height: 660 }, 1200],
  ['afterhours-bomber-1.png', 'drop-001/afterhours-bomber-01.jpg', null, 1536],
  ['afterhours-bomber-1.png', 'drop-001/afterhours-bomber-02.jpg', { left: 500, top: 520, width: 660, height: 880 }, 1200],
  ['static-tee-1.png', 'drop-001/static-tee-01.jpg', null, 1536],
  ['static-tee-1.png', 'drop-001/static-tee-02.jpg', { left: 380, top: 700, width: 780, height: 1040 }, 1200],
  ['red-room-1.png', 'drop-001/red-room-overshirt-01.jpg', { left: 0, top: 0, width: 1395, height: 1860 }, 1536],
  ['red-room-1.png', 'drop-001/red-room-overshirt-02.jpg', { left: 450, top: 380, width: 660, height: 880 }, 1200],
  ['detail-rings.png', 'drop-001/soft-metal-01.jpg', null, 1536],
  ['detail-rings.png', 'drop-001/soft-metal-02.jpg', { left: 480, top: 840, width: 900, height: 1200 }, 1200],
  ['world-room.png', 'world/room.jpg', { left: 0, top: 460, width: 1536, height: 1152 }, 1536],
];
for (const [src, out, crop, w] of jobs) {
  let img = sharp(R + src);
  if (crop) img = img.extract(crop);
  const info = await img.resize({ width: w, withoutEnlargement: true })
    .jpeg({ quality: 84, mozjpeg: true, progressive: true })
    .toFile(O + out);
  console.log(out, info.width + 'x' + info.height, Math.round(info.size / 1024) + 'KB');
}
