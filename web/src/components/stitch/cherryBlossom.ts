// app/components/stitch/cherryBlossom.ts
// Cross-stitch pattern for the blossom tree: 44x44 grid. Each row lists
// "<col><stitch><hex>" entries, where stitch is s = satin, x = cross, t = tweed.

import type { StitchUnit, PlacedUnit } from './engine';

const KINDS: Record<string, StitchUnit> = { s: 'satin', x: 'cross', t: 'tweed' };

const ROWS: Record<number, string> = {
  9: '18se595b3 28seaabc4 29seec5d6',
  10: '17se9adc2 18se680a9 19se483a8 20sedb8ca 26seec7d4 27se795b3 28se37da5 29se47ba4 30se47ca5 31sf0c6d6',
  11: '13sefccd8 17se99fba 19seaa6be 20se68aad 21sedbacc 24secafc7 25se995b6 26se78bae 27secb8cc 28se7a6c0 29se386ab 30se478a3 31seaa3bd',
  12: '11sefcedb 12sedb5c9 14seab5c9 15se79ab9 16se5b4c9 18se796b6 19se586ab 20se47aa4 21se588aa 23se7a1bc 24se9a0bc 25seba3bd 26se487ab 27se499b7 28se48fb0 29se28aae 30se288ac 31se89eb9 32sefcad6',
  13: '11seeb6c9 12se8a1bc 13se694b5 14seec8d7 15se583a9 16seaafc4 17seaacc2 18se47da5 19se9a1bb 20se579a3 21se47ca5 22se49fbc 23se29cb9 24se486ab 25se681a8 26se57da5 27secbbcf 28se7aec5 29se38aae 30sebb3ca 35sf2c9d7',
  14: '9sedb8cc 10sedb9cc 11sefcbd7 12se89fb9 13se281a8 14se7a7c1 15se481a8 16se59db9 17se58fb0 18se18fb1 19se68eb0 20se79ab6 21se37fa6 22se486ab 23se7a5be 24se486ab 25se898b5 26se484a9 27se894b5 28se8aac0 29se591b0 30se8a4bf 31sedb5c9 32seaa1bd 33seda9c2',
  15: '9seba9c4 10se48caf 11se59fbc 12se483a9 13se487a9 14sefcdda 15se89fba 16se288ac 17se4a3be 19se497b7 20se78bad 21se89fb9 22se89fb8 23se076a0 24se494b2 25xcd6a91 26xda719b 27xe06b98 28se37fa5 29se696b3 30se795b1 31se481a7 32se380a8 33se38fb1 34se9a0bb 35sedbbcc 36sedb5c9',
  16: '9se7a9c2 10se28eb0 11se280a7 12sea92b4 13sf2bccf 14sebb5c7 15se585aa 16xdf6a98 17se284a9 18se38aae 19se286aa 20se18fb0 21se17ca2 22se9a6bd 23se797b5 24se58dad 25sde8dab 26se17da3 27xe1719c 28xdf6595 29se276a1 30se794b3 31seebace 32seeb9cd 33se690b1 34se899b5 35se589ad 36seba7c3',
  17: '8se8b0c7 9se4a1bd 10se191b2 11se479a3 12se995b5 13seabcc5 14xc07f81 15se593af 16se58faf 17xd66290 18xdf6696 19se27ca4 20se5b9c8 21xb25a63 22sdb7b9c 23se692b1 24se682a8 25se590af 26se1769f 27se382a6 28xe0729c 29xe1709c 30se895b4 31secb4c9 32se9acc5 33se48eb0 34se690b1 35se386ab 36seba5c1',
  18: '6sf0c5d7 7se996b6 8se27fa7 9se294b4 10se191b2 11se479a3 12se582a8 13sdf8fa8 14xaf746c 15xac6d64 16se084a5 17xd66592 18xdc6292 19xd7658e 20xa97a6a 21xae505b 22xd7628c 23xde6595 24se9a7c1 25xa95e5e 26sd396a4 27se79dba 28se798b5 29se487aa 30se585aa 31se582a8 32se37ca4 33se381a8 34se37ea6 35se384aa 36se78db0 37sf1bbd0',
  19: '6sf1c8d9 7se898b8 8se486aa 9se58eb0 10se38eae 11se687ab 12se78baf 13seba6be 14sd393a0 15xad7f70 16xae505b 17xd17591 18xa8454e 19xa5424a 20xa75154 21xd46188 22xdf6695 23xdf6897 24seaa5bf 25sb69284 26sb29480 27scf8695 28se58dae 29xc57384 30xcb7487 31se382a6 32se47fa6 33se587ab 34se478a2 35se37ca5 36se588ab 37se88fb1',
  20: '7seaaac2 8se695b2 9se588ac 10se78fb1 11seca9c1 12seba7c0 13sf1c1d1 14se691b3 15se0b3bc 16xa16457 17xad6766 18x9a4a43 19xa04e4b 20se28aa9 21se278a1 22xd35889 23xe0719d 24xd86d97 26xb47d75 27xa85356 28xb15961 29xa4504f 30xc1717c 31se692b1 32se593b1 33se58aad 34se478a2 35se37da4 36se695b3 37se9a2bd',
  21: '6sebb7cd 7se9a7c0 8se695b1 9se584a9 10se790b2 11sf1cbd8 12secb7c9 13se38dad 14se493b1 15se190ad 16xce7c95 17xa5524e 18xb55959 19xaf5b5f 20se596af 21se58fb0 22xd2638e 23xd1628e 24xd0628d 25se3b2c4 26xbc747a 27x863f2a 28x934537 29xbf6274 30se284a6 31se695b3 32se696b2 33sde7da1 34xd96a95 35se37da4 36se793b2 37sebabc2',
  22: '5sf1c7d7 6seec6d5 7seeb9ce 8se7a0b9 9se589ac 10se384a9 11sebb2c6 12se7a1bd 13xdf6b99 14se2a5b9 15se1a1b8 16xc9638a 17xc96e87 18xaa745a 19x814120 20xbc6b77 21sdb95ab 22xd7759c 23sce7d9d 24xd7749a 25xbe6977 26x874630 27x86442e 28xc66f84 29sde80a4 30se491b0 31sde7fa2 32xd87399 33xd47698 34xd67199 35se99eb9 36se794b2 37se890b2',
  23: '6secb5ca 7seec1d2 8sebc0d2 9se487ab 10se47ea6 11se283a8 12se079a3 13xdf709a 14se184a6 15se498b4 16xd77199 17sd18ca7 18se8ccd3 19xa36f50 20t783918 21xcb7088 22sd083a2 24xce7a8b 25t7b3a1e 26x833f28 27xbb6272 28sdf81a6 29sde93b0 30se290b1 31xd2658f 32xc54d7d 33xce5d89 34seda7c2 36se58aae 37seaaac3',
  24: '9seeb2cb 10se691b2 11sedc8d5 12se8a3be 13xde5d91 14xdd5c90 15xdd6896 16xcf6890 17sedbbce 18se480a7 20t7a3714 21xb56167 23sdbc7b9 24x935530 25x8c402b 26xc9677e 27se58daf 28se395b5 29se4a0ba 30se49fb9 31sdb7aa1 32xd56391 33xd46490 34sea9ab9 35sf1cad9 36sefc1d4',
  25: '9seebcd1 10se8a6c0 11se8b2c9 12xe075a0 13xe2749f 14xdd6094 15xde6e9c 16se37ea6 17se485ab 18se57da6 20t893b0c 21t76340a 22scab5a4 23x8d4a23 24x824622 25sd68299 26se48daf 27sefc9d8 28se99cba 29se394b3 30se491b2 31xd36c94 32xcf6d94 33se384a9 34se482a9 35se89eba',
  26: '11sedc1d2 13se791b1 14sebafc7 16se8a3bd 18se798b6 20xa5490c 21t843505 22t72360f 23x824f2d 24sd4c6ba 28secafc5 29seec7d5 30sedb4ca 31sefc2d4 33sefc9d8 34seeb6cb',
  27: '20xa64a0c 21t743205 22x855433 30sf0c4d5',
  28: '20xa4490c 21t78370d 22sdbd0c6',
  29: '19xae571b 20xa14405 21t79390f',
  30: '19xab5317 20t833605 21t783d15',
  31: '19xa95115 20t783b14 21sd1c1b4',
  32: '18xac571d 19xa04406 20t763e19',
  33: '18xaa5111 19t873702 20t753e17',
  34: '18xab4f11 19t6e2c01 20t5a3117',
  35: '17xab5923 18t863704 19t4c1f00 20t543219',
  36: '14se7d2c1 15sc18860 16xaa714d 17t8a3b08 18t702d01 19t4e290e 20sb9aea2',
  37: '14xae6736 15t893705 16t702c00 17t672900 18t4f2000 19t502e14',
  38: '12se7d2bf 13xbd7e51 14t883906 15t722f05 16t672c04 17t502304 18t452005 19t4a250b 20x8c7564',
  39: '13sd0a485 14sbc9882 15sb39581 16sb09582 17sa18f82 18sa08f83 19sa18f83 20sa9998e',
};

export const CHERRY_BLOSSOM = {
  cols: 44,
  rows: 44,
  cell: 16,
  units: Object.entries(ROWS).flatMap(([r, row]) =>
    row.split(' ').map((entry): PlacedUnit => {
      const [, c, kind, hex] = entry.match(/^(\d+)([sxt])([0-9a-f]{6})$/)!;
      return { r: Number(r), c: Number(c), unit: KINDS[kind], color: `#${hex}` };
    }),
  ),
};
