// ============================================================================
// THÁI HƯ TIÊN MÔN — Handcrafted 3D Xianxia Cultivation Diorama Map Engine
// 8 Distinct Cultivation Realms matching exact game.json fight.zones collision:
//   camp   -> Thanh Lam Phế Đỉnh (Jade Floating Mountain & Glowing Spirit Crystals)
//   grove  -> U Lâm Yêu Cốc (Bioluminescent Bamboo & Spirit-Peach Lotus Pond)
//   ford   -> Bích Thủy Hàn Đàm (Glacier-Jade River & White-Jade Immortal Bridge)
//   pass   -> Xích Viêm Hỏa Cốc (Obsidian Volcanic Canyon & Glowing Molten Lava!)
//   ridge  -> Huyền Băng Tuyết Lĩnh (Sparkling Snow Peak & Frost-Jade Bagua Altar!)
//   gate   -> Cửu U Ma Vực (Obsidian Demon Palisade, Purple Soul Flames & Blood Moon)
//   tower  -> Thông Thiên Tháp (Celestial Cloud Pagoda & Golden Bagua Hall)
//   shadow -> Lôi Kiếp Đài (Thundercloud Tribulation Altar & Lightning Monoliths!)
// ============================================================================

(function () {
  function mulberry32(seed) {
    let a = seed >>> 0;
    return function () {
      a |= 0;
      a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  const TEX = {
    WHITE: 0,
    GRASS: 1,
    COBBLE: 2,
    SNOW: 3,        // Sparkling Alpine Snow & Ice Sheen (for Huyền Băng Tuyết Lĩnh!)
    CLIFF: 4,       // Stratified Volcanic/Mountain Cliff Rock
    JADE_STONE: 5,  // White-Jade Immortal Carved Masonry
    WOOD: 6,        // Lacquered Crimson/Cedar Timber
    ROOF: 7,        // Glazed Jade-Slate Celestial Roof Tiles
    BARK: 8,        // Bamboo & Pine Bark
    FOLIAGE: 9,     // Painterly Blossom / Pine / Frost Foliage
    WATER: 10,      // Animated Crystal Spirit Water (or Molten Lava when tinted orange-red!)
    PAGODA_TILE: 11,// Celestial Jade-Gold Pagoda Tiles
    OBSIDIAN: 12,   // Volcanic / Thundercloud Obsidian Stone
    LANTERN: 13,    // Glowing Immortal Spirit Lantern / Crystal / Lava Core
    BANNER: 14,     // Immortal Sect Silk Banner
    BAGUA: 15       // Celestial Taiji-Bagua Spirit Array
  };

  // 0=SOLID(outline), 1=GROUND, 2=SWAY, 3=WATER_ANIM, 4=EMISSIVE_GLOW, 5=LAVA_ANIM
  const FLAG = { SOLID: 0, GROUND: 1, SWAY: 2, WATER: 3, EMISSIVE: 4, LAVA: 5 };

  function makeXianxiaTexture(layerId, size = 512) {
    const cvs = document.createElement('canvas');
    cvs.width = size; cvs.height = size;
    const ctx = cvs.getContext('2d');
    const rnd = mulberry32(4099 + layerId * 977);
    const tileWrap = (fn) => {
      for (let ox = -1; ox <= 1; ox++) {
        for (let oy = -1; oy <= 1; oy++) {
          ctx.save(); ctx.translate(ox * size, oy * size); fn(); ctx.restore();
        }
      }
    };

    if (layerId === TEX.WHITE) {
      ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, size, size); return cvs;
    }

    if (layerId === TEX.GRASS) {
      ctx.fillStyle = '#3d744a'; ctx.fillRect(0, 0, size, size);
      const tones = ['#2e6440', '#4d8756', '#5c9b64', '#26573b', '#6baa6e'];
      for (let i = 0; i < 620; i++) {
        const x = rnd() * size, y = rnd() * size;
        const rx = 14 + rnd() * 34, ry = 8 + rnd() * 20, rot = rnd() * Math.PI;
        const col = tones[Math.floor(rnd() * tones.length)];
        tileWrap(() => {
          ctx.globalAlpha = 0.24 + rnd() * 0.22;
          ctx.fillStyle = col;
          ctx.beginPath(); ctx.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2); ctx.fill();
        });
      }
      for (let i = 0; i < 900; i++) {
        const x = rnd() * size, y = rnd() * size, h = 7 + rnd() * 14, lean = (rnd() - 0.5) * 9;
        ctx.strokeStyle = rnd() > 0.45 ? 'rgba(134, 218, 152, 0.44)' : 'rgba(26, 62, 42, 0.36)';
        ctx.lineWidth = 1.4 + rnd() * 1.4;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.quadraticCurveTo(x + lean * 0.4, y - h * 0.5, x + lean, y - h); ctx.stroke();
      }
      for (let i = 0; i < 48; i++) {
        ctx.fillStyle = rnd() > 0.4 ? 'rgba(168, 252, 240, 0.78)' : 'rgba(255, 224, 240, 0.72)';
        ctx.beginPath(); ctx.arc(rnd() * size, rnd() * size, 2 + rnd() * 2.2, 0, Math.PI * 2); ctx.fill();
      }
      return cvs;
    }

    if (layerId === TEX.COBBLE) {
      // Painterly Carved Immortal Courtyard Flagstones with bevels, subtle jade moss & gold mortar veins
      ctx.fillStyle = '#2d4440'; ctx.fillRect(0, 0, size, size);
      const rows = 8, cols = 6, rh = size / rows, cw = size / cols;
      for (let r = 0; r < rows; r++) {
        const xOff = (r % 2) * (cw * 0.5);
        for (let c = -1; c <= cols; c++) {
          const bx = c * cw + xOff + (rnd() - 0.5) * 4;
          const by = r * rh + (rnd() - 0.5) * 3;
          const bw = cw - 6 - rnd() * 2.5, bh = rh - 6 - rnd() * 2.5;
          const v = 162 + Math.floor(rnd() * 34);
          const g = ctx.createLinearGradient(bx, by, bx, by + bh);
          g.addColorStop(0, `rgb(${v + 4}, ${v + 16}, ${v + 14})`);
          g.addColorStop(0.55, `rgb(${v - 10}, ${v + 4}, ${v + 3})`);
          g.addColorStop(1, `rgb(${v - 28}, ${v - 14}, ${v - 12})`);
          ctx.fillStyle = g;
          ctx.beginPath(); ctx.roundRect(bx + 3, by + 3, bw, bh, 7); ctx.fill();
          // Top highlight rim & bottom bevel shadow
          ctx.strokeStyle = 'rgba(232, 255, 250, 0.42)'; ctx.lineWidth = 1.8; ctx.stroke();
          // Subtle inner chiselled frame on select slabs
          if (rnd() > 0.55) {
            ctx.strokeStyle = 'rgba(22, 42, 40, 0.16)'; ctx.lineWidth = 1.2;
            ctx.strokeRect(bx + 8, by + 8, bw - 10, bh - 10);
          }
          // Stone speckle grain
          for (let s = 0; s < 5; s++) {
            ctx.fillStyle = rnd() > 0.5 ? 'rgba(255,255,255,0.14)' : 'rgba(20,38,36,0.16)';
            ctx.fillRect(bx + 6 + rnd() * (bw - 8), by + 6 + rnd() * (bh - 8), 2.5, 2.5);
          }
        }
      }
      // Subtle jade-emerald moss tufts tucked into flagstone seams
      for (let m = 0; m < 44; m++) {
        const mx = rnd() * size, my = Math.floor(rnd() * rows) * rh + (rnd() - 0.5) * 4;
        ctx.fillStyle = rnd() > 0.4 ? 'rgba(64, 152, 108, 0.42)' : 'rgba(116, 198, 134, 0.34)';
        ctx.beginPath(); ctx.ellipse(mx, my, 4 + rnd() * 7, 2 + rnd() * 3, rnd() * 0.6, 0, Math.PI * 2); ctx.fill();
      }
      return cvs;
    }

    if (layerId === TEX.SNOW) {
      // Sparkling glacial alpine snow with subtle blue ice shadows!
      ctx.fillStyle = '#d8eaf6'; ctx.fillRect(0, 0, size, size);
      const tones = ['#c4ddf0', '#e6f3fc', '#b6d2e8', '#f2f9ff'];
      for (let i = 0; i < 480; i++) {
        const x = rnd() * size, y = rnd() * size, rx = 18 + rnd() * 44, ry = 10 + rnd() * 24;
        const col = tones[Math.floor(rnd() * tones.length)];
        tileWrap(() => {
          ctx.globalAlpha = 0.25 + rnd() * 0.24;
          ctx.fillStyle = col;
          ctx.beginPath(); ctx.ellipse(x, y, rx, ry, rnd() * 0.6, 0, Math.PI * 2); ctx.fill();
        });
      }
      for (let i = 0; i < 240; i++) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.fillRect(rnd() * size, rnd() * size, 3, 3);
      }
      return cvs;
    }

    if (layerId === TEX.CLIFF) {
      ctx.fillStyle = '#525660'; ctx.fillRect(0, 0, size, size);
      for (let i = 0; i < 65; i++) {
        const y = rnd() * size, h = 10 + rnd() * 28, v = 58 + Math.floor(rnd() * 64);
        ctx.fillStyle = `rgba(${v}, ${v + 4}, ${v + 10}, 0.48)`;
        ctx.beginPath(); ctx.moveTo(0, y);
        ctx.bezierCurveTo(size * 0.33, y + (rnd() - 0.5) * 28, size * 0.66, y + (rnd() - 0.5) * 28, size, y);
        ctx.lineTo(size, y + h); ctx.lineTo(0, y + h); ctx.closePath(); ctx.fill();
      }
      for (let i = 0; i < 120; i++) {
        const x = rnd() * size, y = rnd() * size;
        ctx.strokeStyle = rnd() > 0.35 ? 'rgba(20, 22, 28, 0.45)' : 'rgba(192, 206, 222, 0.28)';
        ctx.lineWidth = 1.6 + rnd() * 2.4;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + (rnd() - 0.5) * 85, y + (rnd() - 0.5) * 28); ctx.stroke();
      }
      return cvs;
    }

    if (layerId === TEX.JADE_STONE) {
      // Engraved White-Jade Temple Masonry with Subtle Cloud-Scroll Reliefs & Gold Trim
      ctx.fillStyle = '#556e72'; ctx.fillRect(0, 0, size, size);
      const rows = 8, cols = 4, rh = size / rows, cw = size / cols;
      for (let r = 0; r < rows; r++) {
        const off = (r % 2) * (cw * 0.5);
        for (let c = -1; c <= cols; c++) {
          const x = c * cw + off, y = r * rh, v = 180 + Math.floor(rnd() * 24);
          const g = ctx.createLinearGradient(x, y, x, y + rh);
          g.addColorStop(0, `rgb(${v - 4}, ${v + 12}, ${v + 12})`);
          g.addColorStop(1, `rgb(${v - 22}, ${v - 4}, ${v - 2})`);
          ctx.fillStyle = g;
          ctx.fillRect(x + 2, y + 2, cw - 4, rh - 4);
          ctx.fillStyle = 'rgba(240, 255, 252, 0.42)'; ctx.fillRect(x + 2, y + 2, cw - 4, 4);
          ctx.fillStyle = 'rgba(20, 38, 42, 0.32)'; ctx.fillRect(x + 2, y + rh - 5, cw - 4, 3);
          // Delicate carved Xianxia border & cloud motif inside alternating blocks
          ctx.strokeStyle = 'rgba(218, 188, 108, 0.24)'; ctx.lineWidth = 1.4;
          ctx.strokeRect(x + 7, y + 7, cw - 14, rh - 14);
          if ((r + c) % 2 === 0) {
            ctx.strokeStyle = 'rgba(98, 178, 174, 0.24)'; ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.arc(x + cw * 0.5, y + rh * 0.5, 10, 0, Math.PI * 2);
            ctx.stroke();
          }
        }
      }
      return cvs;
    }

    if (layerId === TEX.WOOD) {
      // Imperial Cinnabar-Mahogany Lacquer Pillars & Beams with Rich Grain & Gold Filigree Banding
      ctx.fillStyle = '#6c2b1e'; ctx.fillRect(0, 0, size, size);
      const planks = 8, pw = size / planks;
      for (let i = 0; i < planks; i++) {
        const x = i * pw, tone = 116 + Math.floor(rnd() * 28);
        const g = ctx.createLinearGradient(x, 0, x + pw, 0);
        g.addColorStop(0, `rgb(${tone - 22}, ${Math.floor(tone * 0.34)}, ${Math.floor(tone * 0.22)})`);
        g.addColorStop(0.45, `rgb(${tone + 18}, ${Math.floor(tone * 0.52)}, ${Math.floor(tone * 0.32)})`);
        g.addColorStop(1, `rgb(${tone - 28}, ${Math.floor(tone * 0.30)}, ${Math.floor(tone * 0.20)})`);
        ctx.fillStyle = g;
        ctx.fillRect(x + 2, 0, pw - 3, size);
        for (let gIdx = 0; gIdx < 18; gIdx++) {
          ctx.strokeStyle = rnd() > 0.45 ? 'rgba(38, 12, 8, 0.26)' : 'rgba(236, 168, 104, 0.16)';
          ctx.lineWidth = 1.3;
          const gx = x + 4 + rnd() * (pw - 8);
          ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx + (rnd() - 0.5) * 5, size); ctx.stroke();
        }
        ctx.fillStyle = 'rgba(24, 8, 6, 0.58)'; ctx.fillRect(x, 0, 2.5, size);
      }
      // Ornamental carved gold lacquer trim bands top & bottom
      for (const gy of [20, size - 26]) {
        ctx.fillStyle = 'rgba(232, 186, 82, 0.45)'; ctx.fillRect(0, gy, size, 6);
        ctx.fillStyle = 'rgba(255, 240, 178, 0.32)'; ctx.fillRect(0, gy + 1, size, 2);
      }
      return cvs;
    }

    if (layerId === TEX.ROOF) {
      // Celestial Glazed Scalloped Emerald-Jade Pagoda Roof Tiles with Imperial Gold Rim Sheen!
      ctx.fillStyle = '#12323d'; ctx.fillRect(0, 0, size, size);
      const cols = 12, rows = 10, cw = size / cols, rh = size / rows;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x = c * cw, y = r * rh;
          // Curved tubular ceramic ridge gradient
          const grad = ctx.createLinearGradient(x, y, x + cw, y);
          grad.addColorStop(0.0, '#0e2833');
          grad.addColorStop(0.32, '#2a7582');
          grad.addColorStop(0.55, '#46a3a8');
          grad.addColorStop(0.82, '#1e5866');
          grad.addColorStop(1.0, '#0c202a');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.moveTo(x + 1, y);
          ctx.lineTo(x + cw - 1, y);
          ctx.lineTo(x + cw - 1, y + rh - 8);
          ctx.quadraticCurveTo(x + cw * 0.5, y + rh + 4, x + 1, y + rh - 8);
          ctx.closePath();
          ctx.fill();
          // Glaze specular highlight along ridge crown
          ctx.fillStyle = 'rgba(186, 255, 248, 0.28)';
          ctx.fillRect(x + cw * 0.36, y + 2, cw * 0.22, rh - 10);
          // Overlapping scalloped eave shadow + faint gold ceramic lip on eave row
          ctx.strokeStyle = (r === rows - 1) ? 'rgba(244, 204, 96, 0.72)' : 'rgba(6, 18, 24, 0.62)';
          ctx.lineWidth = (r === rows - 1) ? 3.2 : 2.6;
          ctx.beginPath();
          ctx.moveTo(x + 1, y + rh - 7);
          ctx.quadraticCurveTo(x + cw * 0.5, y + rh + 4, x + cw - 1, y + rh - 7);
          ctx.stroke();
        }
      }
      return cvs;
    }

    if (layerId === TEX.BARK) {
      ctx.fillStyle = '#5c463c'; ctx.fillRect(0, 0, size, size);
      for (let i = 0; i < 160; i++) {
        ctx.fillStyle = rnd() > 0.45 ? 'rgba(34, 24, 20, 0.35)' : 'rgba(136, 114, 96, 0.25)';
        ctx.fillRect(rnd() * size, rnd() * size, 5 + rnd() * 14, 24 + rnd() * 68);
      }
      for (let n = 0; n < 4; n++) {
        const y = n * (size / 4) + 12;
        ctx.fillStyle = 'rgba(22, 18, 16, 0.28)'; ctx.fillRect(0, y, size, 5);
        ctx.fillStyle = 'rgba(225, 235, 215, 0.16)'; ctx.fillRect(0, y + 5, size, 3);
      }
      return cvs;
    }

    if (layerId === TEX.FOLIAGE) {
      ctx.fillStyle = '#c8dcd0'; ctx.fillRect(0, 0, size, size);
      for (let i = 0; i < 500; i++) {
        const x = rnd() * size, y = rnd() * size, r = 10 + rnd() * 24, v = 175 + Math.floor(rnd() * 80);
        tileWrap(() => {
          ctx.globalAlpha = 0.48;
          ctx.fillStyle = `rgb(${v}, ${Math.min(255, v + 8)}, ${v + 4})`;
          ctx.beginPath(); ctx.ellipse(x, y, r, r * 0.65, rnd() * Math.PI, 0, Math.PI * 2); ctx.fill();
        });
      }
      ctx.globalAlpha = 1; return cvs;
    }

    if (layerId === TEX.WATER) {
      ctx.fillStyle = '#1d7a8a'; ctx.fillRect(0, 0, size, size);
      for (let i = 0; i < 180; i++) {
        const x = rnd() * size, y = rnd() * size, rx = 24 + rnd() * 54, ry = 7 + rnd() * 16;
        tileWrap(() => {
          ctx.globalAlpha = 0.25;
          ctx.strokeStyle = rnd() > 0.35 ? '#d8ffff' : '#125060';
          ctx.lineWidth = 2.5 + rnd() * 3;
          ctx.beginPath(); ctx.ellipse(x, y, rx, ry, (rnd() - 0.5) * 0.25, 0, Math.PI * 2); ctx.stroke();
        });
      }
      ctx.globalAlpha = 1; return cvs;
    }

    if (layerId === TEX.PAGODA_TILE) {
      // Imperial Jade-Gold Inscribed Sect Sanctuary Floor Tiles
      ctx.fillStyle = '#142a32'; ctx.fillRect(0, 0, size, size);
      const n = 4, s = size / n;
      for (let r = 0; r < n; r++) {
        for (let c = 0; c < n; c++) {
          const x = c * s, y = r * s;
          const g = ctx.createLinearGradient(x, y, x + s, y + s);
          if ((r + c) % 2 === 0) {
            g.addColorStop(0, '#2e5964'); g.addColorStop(1, '#1d3c46');
          } else {
            g.addColorStop(0, '#234752'); g.addColorStop(1, '#18313a');
          }
          ctx.fillStyle = g;
          ctx.fillRect(x + 3, y + 3, s - 6, s - 6);
          ctx.strokeStyle = 'rgba(238, 198, 96, 0.65)'; ctx.lineWidth = 2.4;
          ctx.strokeRect(x + 9, y + 9, s - 18, s - 18);
          // Corner jade-gold brackets + glowing center lotus diamond
          const cx = x + s * 0.5, cy = y + s * 0.5;
          ctx.strokeStyle = 'rgba(130, 246, 236, 0.36)'; ctx.lineWidth = 1.6;
          ctx.beginPath();
          ctx.moveTo(cx, cy - 18); ctx.lineTo(cx + 18, cy);
          ctx.lineTo(cx, cy + 18); ctx.lineTo(cx - 18, cy);
          ctx.closePath(); ctx.stroke();
          ctx.fillStyle = 'rgba(138, 250, 240, 0.62)';
          ctx.beginPath(); ctx.arc(cx, cy, 5.5, 0, Math.PI * 2); ctx.fill();
        }
      }
      return cvs;
    }

    if (layerId === TEX.OBSIDIAN) {
      ctx.fillStyle = '#141322'; ctx.fillRect(0, 0, size, size);
      for (let i = 0; i < 95; i++) {
        ctx.fillStyle = rnd() > 0.5 ? 'rgba(42, 36, 72, 0.36)' : 'rgba(18, 22, 42, 0.45)';
        ctx.beginPath(); ctx.ellipse(rnd() * size, rnd() * size, 20 + rnd() * 55, 10 + rnd() * 25, rnd() * 3, 0, Math.PI * 2); ctx.fill();
      }
      for (let i = 0; i < 48; i++) {
        ctx.strokeStyle = 'rgba(128, 212, 255, 0.28)'; ctx.lineWidth = 1.6;
        const x = rnd() * size, y = rnd() * size;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + (rnd() - 0.5) * 115, y + (rnd() - 0.5) * 115); ctx.stroke();
      }
      return cvs;
    }

    if (layerId === TEX.LANTERN) {
      const grad = ctx.createRadialGradient(size * 0.5, size * 0.5, 18, size * 0.5, size * 0.5, size * 0.62);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(0.45, '#ffe28a');
      grad.addColorStop(1, '#e87830');
      ctx.fillStyle = grad; ctx.fillRect(0, 0, size, size);
      ctx.strokeStyle = 'rgba(40, 28, 18, 0.32)'; ctx.lineWidth = 4;
      for (let i = 1; i < 6; i++) {
        const p = (i / 6) * size;
        ctx.beginPath(); ctx.moveTo(p, 0); ctx.lineTo(p, size); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(0, p); ctx.lineTo(size, p); ctx.stroke();
      }
      return cvs;
    }

    if (layerId === TEX.BANNER) {
      ctx.fillStyle = '#e8f5f2'; ctx.fillRect(0, 0, size, size);
      ctx.strokeStyle = '#d4a640'; ctx.lineWidth = 22;
      ctx.strokeRect(20, 20, size - 40, size - 40);
      ctx.strokeStyle = 'rgba(20, 62, 68, 0.80)'; ctx.lineWidth = 16; ctx.lineCap = 'round';
      ctx.beginPath(); ctx.arc(size * 0.5, size * 0.46, 92, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(size * 0.5, size * 0.22); ctx.lineTo(size * 0.5, size * 0.72); ctx.stroke();
      return cvs;
    }

    if (layerId === TEX.BAGUA) {
      // Luminous Cyan-Gold Immortal Teleportation Bagua Array (with glowing spirit crystal corner pylons!)
      const cx = size * 0.5, cy = size * 0.5;
      const bg = ctx.createRadialGradient(cx, cy, 24, cx, cy, size * 0.54);
      bg.addColorStop(0, '#1e4656'); bg.addColorStop(0.62, '#142634'); bg.addColorStop(1, '#0c1824');
      ctx.fillStyle = bg; ctx.fillRect(0, 0, size, size);

      // Outer radiant spirit rune ring & 8 golden star beams
      ctx.strokeStyle = 'rgba(98, 248, 238, 0.34)'; ctx.lineWidth = 16;
      ctx.beginPath(); ctx.arc(cx, cy, 232, 0, Math.PI * 2); ctx.stroke();
      ctx.strokeStyle = '#72fff4'; ctx.lineWidth = 6;
      ctx.beginPath(); ctx.arc(cx, cy, 232, 0, Math.PI * 2); ctx.stroke();
      ctx.strokeStyle = '#f8d46c'; ctx.lineWidth = 5;
      ctx.beginPath(); ctx.arc(cx, cy, 194, 0, Math.PI * 2); ctx.stroke();
      ctx.beginPath(); ctx.arc(cx, cy, 114, 0, Math.PI * 2); ctx.stroke();

      // 8-pointed celestial teleportation star + glowing cyan corner crystal nodes
      ctx.strokeStyle = 'rgba(248, 212, 108, 0.46)'; ctx.lineWidth = 2.5;
      for (let k = 0; k < 8; k++) {
        const a1 = (k / 8) * Math.PI * 2;
        const a2 = ((k + 3) / 8) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a1) * 192, cy + Math.sin(a1) * 192);
        ctx.lineTo(cx + Math.cos(a2) * 192, cy + Math.sin(a2) * 192);
        ctx.stroke();
        // Glowing outer spirit crystal orb
        const ox = cx + Math.cos(a1) * 214, oy = cy + Math.sin(a1) * 214;
        ctx.fillStyle = (k % 2 === 0) ? '#78fff8' : '#ffe078';
        ctx.beginPath(); ctx.arc(ox, oy, 8, 0, Math.PI * 2); ctx.fill();
      }
      for (let k = 0; k < 8; k++) {
        ctx.save(); ctx.translate(cx, cy); ctx.rotate((k / 8) * Math.PI * 2);
        ctx.fillStyle = '#ffe078';
        for (let b = 0; b < 3; b++) {
          const y = -174 + b * 16;
          if ((k >> b) & 1) ctx.fillRect(-34, y, 68, 8);
          else { ctx.fillRect(-34, y, 28, 8); ctx.fillRect(6, y, 28, 8); }
        }
        ctx.restore();
      }
      ctx.fillStyle = '#72fff4'; ctx.beginPath(); ctx.arc(cx, cy, 86, -Math.PI * 0.5, Math.PI * 0.5); ctx.fill();
      ctx.fillStyle = '#10202e'; ctx.beginPath(); ctx.arc(cx, cy, 86, Math.PI * 0.5, Math.PI * 1.5); ctx.fill();
      ctx.fillStyle = '#72fff4'; ctx.beginPath(); ctx.arc(cx, cy - 43, 43, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#10202e'; ctx.beginPath(); ctx.arc(cx, cy + 43, 43, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#10202e'; ctx.beginPath(); ctx.arc(cx, cy - 43, 14, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#72fff4'; ctx.beginPath(); ctx.arc(cx, cy + 43, 14, 0, Math.PI * 2); ctx.fill();
      return cvs;
    }
    return cvs;
  }

  class MapMeshBuilder {
    constructor() { this.verts = []; this.indices = []; this.vCount = 0; }
    pushVert(x, y, z, u, v, nx, ny, nz, layer, r, g, b, a = 1, flag = FLAG.SOLID) {
      this.verts.push(x, y, z, u, v, nx, ny, nz, layer, r * 0.5, g * 0.5, b * 0.5, a, flag);
      return this.vCount++;
    }
    addQuad(p0, p1, p2, p3, uv0, uv1, uv2, uv3, layer, col, flag = FLAG.SOLID) {
      const ux = p1[0] - p0[0], uy = p1[1] - p0[1], uz = p1[2] - p0[2];
      const vx = p2[0] - p0[0], vy = p2[1] - p0[1], vz = p2[2] - p0[2];
      let nx = uy * vz - uz * vy, ny = uz * vx - ux * vz, nz = ux * vy - uy * vx;
      const len = Math.hypot(nx, ny, nz) || 1;
      nx /= len; ny /= len; nz /= len;
      const r = col[0], g = col[1], b = col[2], a = col[3] ?? 1;
      const i0 = this.pushVert(p0[0], p0[1], p0[2], uv0[0], uv0[1], nx, ny, nz, layer, r, g, b, a, flag);
      const i1 = this.pushVert(p1[0], p1[1], p1[2], uv1[0], uv1[1], nx, ny, nz, layer, r, g, b, a, flag);
      const i2 = this.pushVert(p2[0], p2[1], p2[2], uv2[0], uv2[1], nx, ny, nz, layer, r, g, b, a, flag);
      const i3 = this.pushVert(p3[0], p3[1], p3[2], uv3[0], uv3[1], nx, ny, nz, layer, r, g, b, a, flag);
      this.indices.push(i0, i1, i2, i0, i2, i3);
    }
    addGroundRect(x0, x1, z0, z1, y, layer, col, uvScale = 0.25, flag = FLAG.GROUND) {
      const u0 = x0 * uvScale, u1 = x1 * uvScale, v0 = z0 * uvScale, v1 = z1 * uvScale;
      const r = col[0], g = col[1], b = col[2], a = col[3] ?? 1;
      const i0 = this.pushVert(x0, y, z0, u0, v0, 0, 1, 0, layer, r, g, b, a, flag);
      const i1 = this.pushVert(x0, y, z1, u0, v1, 0, 1, 0, layer, r, g, b, a, flag);
      const i2 = this.pushVert(x1, y, z1, u1, v1, 0, 1, 0, layer, r, g, b, a, flag);
      const i3 = this.pushVert(x1, y, z0, u1, v0, 0, 1, 0, layer, r, g, b, a, flag);
      this.indices.push(i0, i1, i2, i0, i2, i3);
    }
    addRamp(x0, x1, z0, z1, y0, y1, axis, layer, sideLayer, col, sideCol, uvScale = 0.35, flag = FLAG.GROUND) {
      const p00 = [x0, y0, z0], p01 = [x0, axis === 'z' ? y1 : y0, z1];
      const p11 = [x1, y1, z1], p10 = [x1, axis === 'z' ? y0 : y1, z0];
      this.addQuad(p00, p01, p11, p10, [x0 * uvScale, z0 * uvScale], [x0 * uvScale, z1 * uvScale], [x1 * uvScale, z1 * uvScale], [x1 * uvScale, z0 * uvScale], layer, col, flag);
      const base = -0.35;
      this.addQuad([x0, base, z0], [x0, p00[1], z0], [x0, p01[1], z1], [x0, base, z1], [0, 0], [0, 1], [2, 1], [2, 0], sideLayer, sideCol, FLAG.GROUND);
      this.addQuad([x1, base, z1], [x1, p11[1], z1], [x1, p10[1], z0], [x1, base, z0], [0, 0], [0, 1], [2, 1], [2, 0], sideLayer, sideCol, FLAG.GROUND);
      this.addQuad([x0, base, z0], [x1, base, z0], [x1, p10[1], z0], [x0, p00[1], z0], [0, 0], [2, 0], [2, 1], [0, 1], sideLayer, sideCol, FLAG.GROUND);
      this.addQuad([x1, base, z1], [x0, base, z1], [x0, p01[1], z1], [x1, p11[1], z1], [0, 0], [2, 0], [2, 1], [0, 1], sideLayer, sideCol, FLAG.GROUND);
    }
    addBox(cx, cy, cz, sx, sy, sz, layer, col, rotY = 0, uvScale = 0.5, flag = FLAG.SOLID) {
      const hx = sx * 0.5, hy = sy * 0.5, hz = sz * 0.5;
      const ca = Math.cos(rotY), sa = Math.sin(rotY);
      const tf = (lx, ly, lz) => [cx + lx * ca + lz * sa, cy + ly, cz - lx * sa + lz * ca];
      const p000 = tf(-hx, -hy, -hz), p100 = tf(hx, -hy, -hz), p101 = tf(hx, -hy, hz), p001 = tf(-hx, -hy, hz);
      const p010 = tf(-hx, hy, -hz),  p110 = tf(hx, hy, -hz),  p111 = tf(hx, hy, hz),  p011 = tf(-hx, hy, hz);
      const ux = Math.max(0.5, sx * uvScale), uy = Math.max(0.5, sy * uvScale), uz = Math.max(0.5, sz * uvScale);
      this.addQuad(p010, p011, p111, p110, [0, 0], [0, uz], [ux, uz], [ux, 0], layer, col, flag);
      this.addQuad(p000, p010, p110, p100, [0, 0], [0, uy], [ux, uy], [ux, 0], layer, col, flag);
      this.addQuad(p101, p111, p011, p001, [0, 0], [0, uy], [ux, uy], [ux, 0], layer, col, flag);
      this.addQuad(p001, p011, p010, p000, [0, 0], [0, uy], [uz, uy], [uz, 0], layer, col, flag);
      this.addQuad(p100, p110, p111, p101, [0, 0], [0, uy], [uz, uy], [uz, 0], layer, col, flag);
    }
    addCylinder(cx, y0, y1, cz, r0, r1, segs, layer, col, flag = FLAG.SOLID, capTop = true) {
      const r = col[0], g = col[1], b = col[2], a = col[3] ?? 1;
      const ring0 = [], ring1 = [];
      for (let i = 0; i <= segs; i++) {
        const ang = (i / segs) * Math.PI * 2, ca = Math.cos(ang), sa = Math.sin(ang);
        const u = (i / segs) * Math.max(1, Math.round(Math.max(r0, r1) * 2)), vH = Math.max(0.5, (y1 - y0) * 0.5);
        ring0.push(this.pushVert(cx + ca * r0, y0, cz + sa * r0, u, 0, ca, 0.15, sa, layer, r, g, b, a, flag));
        ring1.push(this.pushVert(cx + ca * r1, y1, cz + sa * r1, u, vH, ca, 0.15, sa, layer, r, g, b, a, flag));
      }
      for (let i = 0; i < segs; i++) this.indices.push(ring0[i], ring1[i], ring1[i + 1], ring0[i], ring1[i + 1], ring0[i + 1]);
      if (capTop && r1 > 0.01) {
        const cIdx = this.pushVert(cx, y1, cz, 0.5, 0.5, 0, 1, 0, layer, r, g, b, a, flag);
        const topRing = [];
        for (let i = 0; i <= segs; i++) {
          const ang = (i / segs) * Math.PI * 2, ca = Math.cos(ang), sa = Math.sin(ang);
          topRing.push(this.pushVert(cx + ca * r1, y1, cz + sa * r1, 0.5 + ca * 0.5, 0.5 + sa * 0.5, 0, 1, 0, layer, r, g, b, a, flag));
        }
        for (let i = 0; i < segs; i++) this.indices.push(cIdx, topRing[i + 1], topRing[i]);
      }
    }
    addRock(cx, cy, cz, rx, ry, rz, seed, col = [0.54, 0.58, 0.62], layer = TEX.CLIFF) {
      const rnd = mulberry32(seed);
      const rings = 4, segs = 8, pts = [];
      for (let r = 0; r <= rings; r++) {
        const phi = (r / rings) * Math.PI * 0.85, sr = Math.sin(phi), cr = Math.cos(phi), row = [];
        for (let s = 0; s <= segs; s++) {
          const th = (s / segs) * Math.PI * 2;
          const j = (r === 0 || r === rings) ? 1.0 : (0.78 + rnd() * 0.42);
          const x = cx + Math.cos(th) * sr * rx * j, y = cy + (cr * 0.5 + 0.5) * ry * (0.85 + rnd() * 0.25), z = cz + Math.sin(th) * sr * rz * j;
          const nx = Math.cos(th) * sr, ny = Math.max(0.15, cr), nz = Math.sin(th) * sr, sh = 0.84 + ny * 0.22;
          row.push(this.pushVert(x, y, z, (s / segs) * 2, (r / rings) * 2, nx, ny, nz, layer, col[0] * sh, col[1] * sh, col[2] * sh, 1, FLAG.SOLID));
        }
        pts.push(row);
      }
      for (let r = 0; r < rings; r++) for (let s = 0; s < segs; s++) {
        const a = pts[r][s], b = pts[r + 1][s], c = pts[r + 1][s + 1], d = pts[r][s + 1];
        this.indices.push(a, d, c, a, c, b);
      }
    }
    // Glowing Spirit Crystal Cluster (signature Xianxia visual prop!)
    addSpiritCrystal(x, y, z, col = [0.32, 0.96, 0.92], scale = 1.0, seed = 1) {
      const rnd = mulberry32(seed);
      for (let i = 0; i < 3; i++) {
        const ox = (i === 0 ? 0 : (rnd() - 0.5) * 0.55) * scale;
        const oz = (i === 0 ? 0 : (rnd() - 0.5) * 0.55) * scale;
        const h = (i === 0 ? 1.65 : (0.85 + rnd() * 0.55)) * scale;
        const r = (i === 0 ? 0.26 : 0.16) * scale;
        this.addCylinder(x + ox, y, y + h * 0.72, z + oz, r, r * 0.85, 5, TEX.WHITE, col, FLAG.EMISSIVE, false);
        this.addCylinder(x + ox, y + h * 0.72, y + h, z + oz, r * 0.85, 0.02, 5, TEX.WHITE, [Math.min(1, col[0] + 0.35), Math.min(1, col[1] + 0.35), Math.min(1, col[2] + 0.35)], FLAG.EMISSIVE, true);
      }
    }
    addCanopyPuff(cx, cy, cz, rx, ry, col, seed) {
      const rnd = mulberry32(seed), rings = 4, segs = 9, pts = [];
      for (let r = 0; r <= rings; r++) {
        const phi = (r / rings) * Math.PI, sr = Math.sin(phi), cr = Math.cos(phi), row = [];
        for (let s = 0; s <= segs; s++) {
          const th = (s / segs) * Math.PI * 2, j = (r === 0 || r === rings) ? 1.0 : (0.86 + rnd() * 0.28);
          const x = cx + Math.cos(th) * sr * rx * j, y = cy + cr * ry * (cr < 0 ? 0.75 : 1.05), z = cz + Math.sin(th) * sr * rx * j;
          const tb = 0.76 + (cr * 0.5 + 0.5) * 0.36;
          row.push(this.pushVert(x, y, z, (s / segs) * 2, (r / rings) * 2, Math.cos(th) * sr, cr * 0.7 + 0.3, Math.sin(th) * sr, TEX.FOLIAGE, col[0] * tb, col[1] * tb, col[2] * tb, 1, FLAG.SWAY));
        }
        pts.push(row);
      }
      for (let r = 0; r < rings; r++) for (let s = 0; s < segs; s++) {
        const a = pts[r][s], b = pts[r + 1][s], c = pts[r + 1][s + 1], d = pts[r][s + 1];
        this.indices.push(a, d, c, a, c, b);
      }
    }
    addImmortalTree(x, y, z, style = 'peach', scale = 1.0, seed = 1) {
      const rnd = mulberry32(seed);
      const h = (style === 'pine' || style === 'snowpine' ? 4.7 : 3.6) * scale;
      const barkCol = style === 'snowpine' ? [0.44, 0.44, 0.52] : [0.46, 0.30, 0.24];
      // Flared buttress roots + gently S-curved multi-segment trunk + 3 spreading sculptural boughs!
      const leanX = (rnd() - 0.5) * 0.28 * scale, leanZ = (rnd() - 0.5) * 0.24 * scale;
      this.addCylinder(x, y - 0.12, y + h * 0.26, z, 0.38 * scale, 0.22 * scale, 8, TEX.BARK, barkCol, FLAG.SOLID, false);
      this.addCylinder(x + leanX * 0.4, y + h * 0.24, y + h * 0.58, z + leanZ * 0.4, 0.22 * scale, 0.15 * scale, 7, TEX.BARK, barkCol, FLAG.SOLID, false);
      this.addCylinder(x + leanX, y + h * 0.54, y + h * 0.88, z + leanZ, 0.15 * scale, 0.08 * scale, 7, TEX.BARK, barkCol, FLAG.SOLID, false);
      this.addBox(x - 0.44 * scale, y + h * 0.60, z + 0.16 * scale, 0.98 * scale, 0.12 * scale, 0.12 * scale, TEX.BARK, barkCol, 0.46, 0.5);
      this.addBox(x + 0.42 * scale, y + h * 0.66, z - 0.18 * scale, 0.92 * scale, 0.11 * scale, 0.11 * scale, TEX.BARK, barkCol, -0.42, 0.5);
      this.addBox(x + 0.08 * scale, y + h * 0.72, z + 0.40 * scale, 0.11 * scale, 0.11 * scale, 0.82 * scale, TEX.BARK, barkCol, 0.22, 0.5);
      const pals = {
        peach:    [[0.98, 0.50, 0.72], [1.0, 0.76, 0.88], [0.86, 0.34, 0.58], [1.0, 0.88, 0.94]],
        jade:     [[0.16, 0.66, 0.54], [0.34, 0.88, 0.72], [0.12, 0.48, 0.42], [0.50, 0.96, 0.82]],
        pine:     [[0.14, 0.46, 0.34], [0.24, 0.62, 0.46], [0.10, 0.34, 0.28], [0.34, 0.72, 0.54]],
        snowpine: [[0.78, 0.90, 0.98], [0.54, 0.78, 0.92], [0.94, 0.98, 1.00], [0.68, 0.86, 0.98]],
        flame:    [[0.96, 0.34, 0.16], [1.0, 0.68, 0.24], [0.76, 0.18, 0.12], [1.0, 0.84, 0.36]],
        void:     [[0.56, 0.22, 0.70], [0.80, 0.36, 0.86], [0.36, 0.16, 0.52], [0.90, 0.50, 0.94]]
      };
      const pal = pals[style] || pals.peach;
      if (style === 'pine' || style === 'snowpine') {
        // Tiered flat Donghua mountain-pine cloud pads!
        for (let k = 0; k < 6; k++) {
          const ang = k * 2.1 + seed;
          const offR = (k === 5 ? 0 : (0.48 - k * 0.06)) * scale;
          this.addCanopyPuff(
            x + leanX + Math.cos(ang) * offR,
            y + h * (0.38 + k * 0.125),
            z + leanZ + Math.sin(ang) * offR,
            (1.80 - k * 0.21) * scale,
            (0.46 - k * 0.03) * scale,
            pal[k % pal.length],
            seed + k * 29
          );
        }
      } else {
        // 9-cluster sculpted asymmetrical Xianxia blossom crown + luminous hanging spirit buds!
        const puffs = [
          [0.00, 1.02,  0.00, 1.26, 0.62], [-1.02, 0.80,  0.34, 1.02, 0.50], [ 1.00, 0.82, -0.30, 1.04, 0.52],
          [0.26, 0.76,  0.90, 0.92, 0.48], [-0.36, 0.76, -0.88, 0.92, 0.48],
          [0.58, 0.94,  0.52, 0.80, 0.46], [-0.58, 0.96, -0.46, 0.82, 0.46],
          [0.82, 0.72,  0.62, 0.72, 0.42], [-0.80, 0.74, -0.62, 0.74, 0.42]
        ];
        puffs.forEach((pf, i) => this.addCanopyPuff(
          x + leanX + pf[0] * scale, y + h * pf[1], z + leanZ + pf[2] * scale,
          pf[3] * scale, pf[4] * scale, pal[i % pal.length], seed + i * 17
        ));
        if (style === 'peach' || style === 'jade') {
          const budCol = style === 'peach' ? [1.0, 0.86, 0.94] : [0.56, 1.0, 0.90];
          for (let b = 0; b < 3; b++) {
            const ba = b * 2.1 + seed;
            this.addCylinder(x + Math.cos(ba) * 0.88 * scale, y + h * 0.56, y + h * 0.72, z + Math.sin(ba) * 0.88 * scale, 0.04 * scale, 0.06 * scale, 5, TEX.LANTERN, budCol, FLAG.EMISSIVE);
          }
        }
      }
    }
    addBambooCluster(x, y, z, stalks = 5, scale = 1.0, seed = 1) {
      const rnd = mulberry32(seed);
      for (let i = 0; i < stalks; i++) {
        const ox = (rnd() - 0.5) * 1.25 * scale, oz = (rnd() - 0.5) * 1.25 * scale, h = (3.8 + rnd() * 2.6) * scale;
        const bx = x + ox, bz = z + oz;
        // 3-segment jointed jade bamboo culm with pale nodal rings + dual cascading leaf sprays!
        const segs = 3;
        for (let s = 0; s < segs; s++) {
          const y0 = y - 0.08 + (s / segs) * h;
          const y1 = y + ((s + 1) / segs) * h;
          const r0 = (0.075 - s * 0.010) * scale, r1 = (0.068 - s * 0.010) * scale;
          this.addCylinder(bx, y0, y1, bz, r0, r1, 6, TEX.BARK, [0.20, 0.68, 0.44], FLAG.SWAY, s === segs - 1);
          if (s > 0) this.addCylinder(bx, y0 - 0.03 * scale, y0 + 0.04 * scale, bz, r0 * 1.22, r0 * 1.22, 6, TEX.WHITE, [0.68, 0.92, 0.72], FLAG.SWAY, false);
        }
        this.addCanopyPuff(bx + 0.14 * scale, y + h * 0.74, bz - 0.10 * scale, 0.74 * scale, 0.24 * scale, [0.22, 0.74, 0.48], seed + i * 23);
        this.addCanopyPuff(bx - 0.12 * scale, y + h * 0.92, bz + 0.12 * scale, 0.62 * scale, 0.22 * scale, [0.34, 0.84, 0.54], seed + i * 37);
      }
    }
    addSpiritLantern(x, y, z, scale = 1.0, glowCol = [0.46, 0.98, 0.92]) {
      const s = scale;
      this.addBox(x, y + 0.14 * s, z, 0.68 * s, 0.28 * s, 0.68 * s, TEX.JADE_STONE, [0.78, 0.86, 0.86], 0, 0.7);
      this.addCylinder(x, y + 0.28 * s, y + 1.42 * s, z, 0.18 * s, 0.14 * s, 6, TEX.JADE_STONE, [0.82, 0.90, 0.90], FLAG.SOLID);
      this.addBox(x, y + 1.76 * s, z, 0.38 * s, 0.50 * s, 0.38 * s, TEX.LANTERN, glowCol, 0, 1.0, FLAG.EMISSIVE);
      this.addCylinder(x, y + 2.02 * s, y + 2.42 * s, z, 0.54 * s, 0.05 * s, 6, TEX.ROOF, [0.56, 0.82, 0.88], FLAG.SOLID);
    }
    addFireBrazier(x, y, z, scale = 1.0, flameCol = [1.0, 0.54, 0.18]) {
      const s = scale;
      // Ornate bronze-jade Xianxia tripod cauldron with golden rim + 3-tongue layered spirit fire!
      this.addCylinder(x, y, y + 0.18 * s, z, 0.44 * s, 0.36 * s, 8, TEX.JADE_STONE, [0.52, 0.58, 0.60], FLAG.SOLID);
      this.addCylinder(x, y + 0.18 * s, y + 0.66 * s, z, 0.26 * s, 0.20 * s, 8, TEX.OBSIDIAN, [0.34, 0.36, 0.42], FLAG.SOLID);
      this.addCylinder(x, y + 0.62 * s, y + 0.98 * s, z, 0.22 * s, 0.56 * s, 8, TEX.OBSIDIAN, [0.32, 0.30, 0.36], FLAG.SOLID);
      this.addCylinder(x, y + 0.92 * s, y + 1.04 * s, z, 0.58 * s, 0.54 * s, 8, TEX.WHITE, [0.92, 0.76, 0.34], FLAG.SOLID);
      this.addCylinder(x, y + 0.96 * s, y + 1.08 * s, z, 0.44 * s, 0.38 * s, 8, TEX.LANTERN, flameCol, FLAG.EMISSIVE);
      // 3 layered flickering flame tongues (inner bright core + 2 outer wisps!)
      const coreCol = [Math.min(1, flameCol[0] + 0.35), Math.min(1, flameCol[1] + 0.38), Math.min(1, flameCol[2] + 0.30)];
      this.addCylinder(x, y + 1.02 * s, y + 1.82 * s, z, 0.22 * s, 0.02 * s, 6, TEX.LANTERN, coreCol, FLAG.EMISSIVE);
      this.addCylinder(x - 0.14 * s, y + 1.00 * s, y + 1.54 * s, z + 0.10 * s, 0.15 * s, 0.02 * s, 6, TEX.LANTERN, flameCol, FLAG.EMISSIVE);
      this.addCylinder(x + 0.14 * s, y + 1.00 * s, y + 1.48 * s, z - 0.08 * s, 0.14 * s, 0.02 * s, 6, TEX.LANTERN, flameCol, FLAG.EMISSIVE);
    }
    // Authentic Concave Curved Xianxia Flying-Eaves Roof (Mái Đao Cong Vút 2-Stage Sweep + Golden Dragon Ridge!)
    addCurvedRoof(x, y, z, rw, rd, rh, roofTint = [0.52, 0.84, 0.88], rotY = 0) {
      const ca = Math.cos(rotY), sa = Math.sin(rotY);
      const tf = (lx, ly, lz) => [x + lx * ca + lz * sa, y + ly, z - lx * sa + lz * ca];
      // 3 stacked concave-swept rings (wide upturned eaves -> mid swoop -> steep ridge crown!)
      const rings = [
        { hx: rw * 0.56, hz: rd * 0.56, yEdge: 0.04, yCorner: 0.42 }, // Upturned flying eave corners!
        { hx: rw * 0.36, hz: rd * 0.36, yEdge: rh * 0.46, yCorner: rh * 0.52 },
        { hx: rw * 0.16, hz: rd * 0.06, yEdge: rh, yCorner: rh }
      ];
      const makeRingPts = (rg) => [
        // 8-point ring: corners lifted higher than midpoints for authentic Chinese curved flying eaves!
        tf(-rg.hx, rg.yCorner, -rg.hz), tf(0, rg.yEdge, -rg.hz),
        tf( rg.hx, rg.yCorner, -rg.hz), tf(rg.hx, rg.yEdge, 0),
        tf( rg.hx, rg.yCorner,  rg.hz), tf(0, rg.yEdge,  rg.hz),
        tf(-rg.hx, rg.yCorner,  rg.hz), tf(-rg.hx, rg.yEdge, 0)
      ];
      const rPts = rings.map(makeRingPts);
      for (let r = 0; r < rPts.length - 1; r++) {
        const a = rPts[r], b = rPts[r + 1];
        for (let k = 0; k < 8; k++) {
          const kn = (k + 1) % 8;
          this.addQuad(a[k], b[k], b[kn], a[kn], [0, 0], [0, 1.4], [1.4, 1.4], [1.4, 0], TEX.ROOF, roofTint, FLAG.SOLID);
        }
      }
      // Cap top ridge + golden dragon spine beam & upturned corner chiwen finials!
      const top = rPts[2];
      this.addQuad(top[0], top[6], top[4], top[2], [0, 0], [0, 1], [1, 1], [1, 0], TEX.ROOF, roofTint, FLAG.SOLID);
      this.addBox(x, y + rh + 0.09, z, rw * 0.36, 0.18, Math.max(0.18, rd * 0.12), TEX.WHITE, [0.96, 0.80, 0.34], rotY, 0.8);
      for (const sgn of [-1, 1]) {
        const [rx, ry, rz] = tf(sgn * rw * 0.19, rh + 0.24, 0);
        this.addCylinder(rx, ry - 0.16, ry + 0.24, rz, 0.13, 0.04, 5, TEX.LANTERN, [1.0, 0.86, 0.38], FLAG.EMISSIVE);
      }
      // 4 Upturned Golden Corner Dragon Finials & Hanging Red-Gold Eave Lanterns!
      const ex = rw * 0.56, ez = rd * 0.56;
      for (const [cx, cz] of [[-ex, -ez], [ex, -ez], [-ex, ez], [ex, ez]]) {
        const [wx, wy, wz] = tf(cx, 0.42, cz);
        this.addCylinder(wx, wy - 0.04, wy + 0.44, wz, 0.15, 0.03, 5, TEX.WHITE, [0.98, 0.84, 0.36], FLAG.SOLID);
      }
    }
    addCloudBank(x, y, z, rx = 7.5, ry = 1.15, col = [0.94, 0.98, 1.0], seed = 55) {
      const rnd = mulberry32(seed);
      for (let i = 0; i < 4; i++) {
        const ox = (i - 1.5) * rx * 0.48 + (rnd() - 0.5) * 1.4;
        const oz = (rnd() - 0.5) * rx * 0.42;
        const oy = (rnd() - 0.5) * ry * 0.45;
        this.addCanopyPuff(x + ox, y + oy, z + oz, rx * (0.45 + rnd() * 0.28), ry * (0.7 + rnd() * 0.35), col, seed + i * 19);
      }
    }
    addImmortalPavilion(x, y, z, w = 4.8, d = 4.8, h = 3.5, tiers = 2, roofTint = [0.52, 0.84, 0.88], rotY = 0) {
      const ca = Math.cos(rotY), sa = Math.sin(rotY);
      const tf = (lx, lz) => [x + lx * ca + lz * sa, z - lx * sa + lz * ca];
      // Two-step carved white-jade foundation plinth
      this.addBox(x, y + 0.18, z, w + 1.1, 0.36, d + 1.1, TEX.JADE_STONE, [0.80, 0.88, 0.90], rotY, 0.45);
      this.addBox(x, y + 0.48, z, w + 0.6, 0.32, d + 0.6, TEX.JADE_STONE, [0.88, 0.94, 0.94], rotY, 0.45);
      const px = w * 0.42, pz = d * 0.42;
      for (const [lx, lz] of [[-px, -pz], [px, -pz], [-px, pz], [px, pz]]) {
        const [wx, wz] = tf(lx, lz);
        this.addCylinder(wx, y + 0.6, y + 0.6 + h, wz, 0.21, 0.18, 8, TEX.WOOD, [0.88, 0.22, 0.18], FLAG.SOLID);
        this.addCylinder(wx, y + 0.6, y + 0.78, wz, 0.28, 0.24, 8, TEX.JADE_STONE, [0.92, 0.96, 0.96], FLAG.SOLID);
      }
      // Plaster hall core + warm carved timber eaves beam
      this.addBox(x, y + 0.6 + h * 0.48, z, w * 0.72, h * 0.92, d * 0.72, TEX.WHITE, [0.94, 0.95, 0.91], rotY, 0.5);
      // Ornate Vermilion Double Doors + Golden Inscribed Plaque (Hoành Phi) + Glowing Warm Lattice Windows on Front Facade (-Z)!
      const frontZ = -d * 0.365;
      const [dx, dz] = tf(0, frontZ);
      this.addBox(dx, y + 0.6 + h * 0.32, dz, w * 0.28, h * 0.62, 0.12, TEX.WOOD, [0.76, 0.18, 0.15], rotY, 0.6);
      this.addBox(dx, y + 0.6 + h * 0.32, dz, w * 0.03, h * 0.62, 0.15, TEX.WHITE, [0.98, 0.82, 0.34], rotY, 0.8);
      // Golden Hoành Phi plaque above entrance
      const [pxH, pzH] = tf(0, frontZ - 0.06);
      this.addBox(pxH, y + 0.6 + h * 0.78, pzH, w * 0.38, h * 0.16, 0.12, TEX.OBSIDIAN, [0.12, 0.20, 0.24], rotY, 0.8);
      this.addBox(pxH, y + 0.6 + h * 0.78, pzH, w * 0.33, h * 0.11, 0.14, TEX.LANTERN, [1.0, 0.88, 0.44], rotY, 1.0, FLAG.EMISSIVE);
      // Warm Glowing Lattice Windows flanking front doorway
      for (const sgn of [-1, 1]) {
        const [wx, wz] = tf(sgn * w * 0.24, frontZ - 0.02);
        this.addBox(wx, y + 0.6 + h * 0.44, wz, w * 0.14, h * 0.28, 0.10, TEX.WOOD, [0.58, 0.18, 0.15], rotY, 0.6);
        this.addBox(wx, y + 0.6 + h * 0.44, wz, w * 0.10, h * 0.22, 0.12, TEX.LANTERN, [1.0, 0.86, 0.48], rotY, 1.0, FLAG.EMISSIVE);
      }
      for (let t = 0; t < tiers; t++) {
        const ry = y + 0.6 + h + t * 2.25, sc = 1.0 - t * 0.25, rw = (w + 1.9) * sc, rd = (d + 1.9) * sc;
        this.addBox(x, ry - 0.04, z, rw * 0.84, 0.28, rd * 0.84, TEX.WOOD, [0.84, 0.24, 0.18], rotY, 0.5);
        this.addBox(x, ry + 0.08, z, rw * 0.88, 0.14, rd * 0.88, TEX.WHITE, [0.96, 0.80, 0.34], rotY, 0.5);
        this.addCurvedRoof(x, ry + 0.12, z, rw, rd, 1.65 * sc, roofTint, rotY);
        if (t < tiers - 1) this.addBox(x, ry + 1.48, z, w * 0.56 * sc, 1.35, d * 0.56 * sc, TEX.WHITE, [0.93, 0.95, 0.92], rotY, 0.5);
        else this.addCylinder(x, ry + 1.85 * sc, ry + 2.75 * sc, z, 0.16, 0.03, 6, TEX.LANTERN, [1.0, 0.90, 0.44], FLAG.EMISSIVE);
      }
    }
    addSectBanner(x, y, z, tint = [0.24, 0.78, 0.74], height = 4.3, rotY = 0) {
      this.addCylinder(x, y, y + height, z, 0.08, 0.06, 6, TEX.JADE_STONE, [0.76, 0.84, 0.84], FLAG.SOLID);
      this.addCylinder(x, y + height, y + height + 0.3, z, 0.12, 0.02, 6, TEX.LANTERN, [1.0, 0.86, 0.40], FLAG.EMISSIVE);
      const ca = Math.cos(rotY), sa = Math.sin(rotY);
      this.addBox(x + 0.55 * ca, y + height - 0.18, z - 0.55 * sa, 1.15, 0.07, 0.07, TEX.WOOD, [0.50, 0.32, 0.22], rotY);
      this.addBox(x + 0.58 * ca, y + height - 1.25, z - 0.58 * sa, 0.96, 2.05, 0.05, TEX.BANNER, tint, rotY, 1.0, FLAG.SWAY);
    }
    addGrassTuft(x, y, z, col = [0.30, 0.76, 0.46], scale = 1.0, seed = 1) {
      const rnd = mulberry32(seed);
      for (let i = 0; i < 4; i++) {
        const ang = (i / 4) * Math.PI + rnd() * 0.5, h = (0.38 + rnd() * 0.34) * scale, w = (0.12 + rnd() * 0.06) * scale;
        const ca = Math.cos(ang), sa = Math.sin(ang), lean = (0.14 + rnd() * 0.16) * scale;
        const i0 = this.pushVert(x - ca * w, y, z - sa * w, 0, 0, 0, 1, 0, TEX.WHITE, col[0] * 0.65, col[1] * 0.65, col[2] * 0.65, 1, FLAG.SWAY);
        const i1 = this.pushVert(x + ca * w, y, z + sa * w, 1, 0, 0, 1, 0, TEX.WHITE, col[0] * 0.65, col[1] * 0.65, col[2] * 0.65, 1, FLAG.SWAY);
        const i2 = this.pushVert(x + sa * lean, y + h, z - ca * lean, 0.5, 1, 0, 1, 0, TEX.WHITE, col[0] * 1.18, col[1] * 1.18, col[2] * 1.15, 1, FLAG.SWAY);
        this.indices.push(i0, i2, i1);
      }
    }
    addWildflowerPatch(x, y, z, col = [1.0, 0.72, 0.86], seed = 1) {
      this.addGrassTuft(x, y, z, [0.24, 0.72, 0.44], 0.9, seed);
      const rnd = mulberry32(seed + 71);
      for (let i = 0; i < 3; i++) {
        const ox = (rnd() - 0.5) * 0.55, oz = (rnd() - 0.5) * 0.55;
        this.addCylinder(x + ox, y + 0.16, y + 0.28, z + oz, 0.11, 0.05, 5, TEX.LANTERN, col, FLAG.SWAY);
      }
    }
    addChevaux(x0, x1, z0, z1) {
      const w = x1 - x0, d = z1 - z0, alongX = w >= d, cx = (x0 + x1) * 0.5, cz = (z0 + z1) * 0.5, len = Math.max(w, d);
      this.addBox(cx, 0.62, cz, alongX ? len : 0.24, 0.24, alongX ? 0.24 : len, TEX.WOOD, [0.62, 0.44, 0.34], 0, 0.6);
      const count = Math.max(3, Math.floor(len / 0.85));
      for (let i = 0; i < count; i++) {
        const t = (i + 0.5) / count - 0.5, px = alongX ? cx + t * len : cx, pz = alongX ? cz : cz + t * len;
        this.addBox(px, 0.68, pz, 0.14, 1.48, 0.14, TEX.WOOD, [0.70, 0.52, 0.38], alongX ? 0.45 : -0.45, 0.8);
        this.addBox(px, 0.68, pz, 0.14, 1.48, 0.14, TEX.WOOD, [0.56, 0.40, 0.30], alongX ? -0.45 : 0.45, 0.8);
      }
    }
    addLotus(x, y, z, scale = 1.0) {
      this.addCylinder(x, y, y + 0.04, z, 0.52 * scale, 0.52 * scale, 10, TEX.WHITE, [0.18, 0.58, 0.40], FLAG.GROUND);
      this.addCylinder(x + 0.42 * scale, y, y + 0.03, z - 0.26 * scale, 0.32 * scale, 0.32 * scale, 8, TEX.WHITE, [0.22, 0.66, 0.44], FLAG.GROUND);
      this.addCylinder(x, y + 0.04, y + 0.18 * scale, z, 0.24 * scale, 0.12 * scale, 8, TEX.LANTERN, [1.0, 0.66, 0.86], FLAG.EMISSIVE);
      this.addCylinder(x, y + 0.12 * scale, y + 0.30 * scale, z, 0.13 * scale, 0.03 * scale, 6, TEX.LANTERN, [1.0, 0.92, 0.62], FLAG.EMISSIVE);
    }
    addFloatingSkyIsland(x, y, z, radius = 5.5, seed = 77) {
      // Dramatic inverted-cone Xianxia floating peak with jade grass cap, glowing waterfall spirit strip & miniature peach tree!
      this.addCylinder(x, y - radius * 1.9, y, z, 0.5, radius, 9, TEX.CLIFF, [0.42, 0.54, 0.62], FLAG.SOLID, true);
      this.addCylinder(x, y, y + 0.35, z, radius * 1.02, radius * 0.96, 9, TEX.GRASS, [0.64, 0.88, 0.78], FLAG.GROUND, true);
      // Floating cloud ring underneath island
      this.addCanopyPuff(x, y - radius * 0.55, z, radius * 1.35, radius * 0.28, [0.94, 0.98, 1.0], seed + 5);
      // Luminous spirit waterfall ribbon cascading into cloud sea
      this.addBox(x, y - radius * 1.0, z - radius * 0.88, radius * 0.24, radius * 2.1, 0.25, TEX.WATER, [0.58, 0.98, 1.0], 0, 1.0, FLAG.EMISSIVE);
      this.addImmortalTree(x, y + 0.35, z, seed % 2 === 0 ? 'peach' : 'pine', radius * 0.18, seed + 13);
    }
    addHorizonMountains(radius, heightBase, colNear, colFar, seed = 42) {
      const rnd = mulberry32(seed);
      for (let i = 0; i < 18; i++) {
        const ang = (i / 18) * Math.PI * 2 + (rnd() - 0.5) * 0.22, dist = radius + (rnd() - 0.3) * 14;
        this.addCylinder(Math.cos(ang) * dist, -2.0, heightBase * (0.7 + rnd() * 0.85), 12 + Math.sin(ang) * dist, 10 + rnd() * 11, 1.4, 7, TEX.CLIFF, i % 2 === 0 ? colNear : colFar, FLAG.GROUND, true);
      }
    }
    upload(gl) {
      const vao = gl.createVertexArray(); gl.bindVertexArray(vao);
      const vbo = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.verts), gl.STATIC_DRAW);
      const stride = 14 * 4;
      gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 3, gl.FLOAT, false, stride, 0);
      gl.enableVertexAttribArray(1); gl.vertexAttribPointer(1, 2, gl.FLOAT, false, stride, 12);
      gl.enableVertexAttribArray(2); gl.vertexAttribPointer(2, 3, gl.FLOAT, false, stride, 20);
      gl.enableVertexAttribArray(3); gl.vertexAttribPointer(3, 1, gl.FLOAT, false, stride, 32);
      gl.enableVertexAttribArray(4); gl.vertexAttribPointer(4, 4, gl.FLOAT, false, stride, 36);
      gl.enableVertexAttribArray(5); gl.vertexAttribPointer(5, 1, gl.FLOAT, false, stride, 52);
      const ibo = gl.createBuffer(); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);
      const idxArr = new Uint32Array(this.indices);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, idxArr, gl.STATIC_DRAW);
      gl.bindVertexArray(null);
      return { vao, count: idxArr.length, bboxMin: new Float32Array([0, 0, 0]), bboxSpan: new Float32Array([1, 1, 1]) };
    }
  }

  function getBiomeTheme(zoneId, regionIdx = 0, mode = 'field') {
    if (mode === 'shadow' || zoneId === 'shadow') {
      // Lôi Kiếp Đài — Stormy Thundercloud Sky & Electric Cyan-Violet Lightning!
      return {
        skyTop: [0.05, 0.06, 0.16], skyMid: [0.12, 0.16, 0.34], skyHor: [0.24, 0.32, 0.56],
        sunDir: [-0.28, 0.68, 0.66], sunCol: [0.72, 0.88, 1.05], ambCol: [0.34, 0.40, 0.64],
        fogCol: [0.14, 0.18, 0.34], tint: [0.90, 0.94, 1.06], mtnCol: [0.09, 0.12, 0.26],
        weather: 'spirit', moon: true
      };
    }
    if (mode === 'tower' || zoneId === 'tower') {
      // Thông Thiên Tháp — Golden Immortal Sea of Clouds!
      return {
        skyTop: [0.20, 0.48, 0.78], skyMid: [0.56, 0.78, 0.92], skyHor: [0.98, 0.90, 0.72],
        sunDir: [-0.38, 0.82, -0.35], sunCol: [1.08, 0.98, 0.80], ambCol: [0.56, 0.64, 0.76],
        fogCol: [0.80, 0.86, 0.88], tint: [1.02, 1.02, 0.98], mtnCol: [0.38, 0.54, 0.68],
        weather: 'gold', moon: false
      };
    }
    if (zoneId === 'pass') {
      // Xích Viêm Hỏa Cốc — Blazing Volcanic Magma Canyon!
      return {
        skyTop: [0.22, 0.08, 0.12], skyMid: [0.58, 0.22, 0.14], skyHor: [0.96, 0.48, 0.22],
        sunDir: [-0.46, 0.68, -0.40], sunCol: [1.14, 0.78, 0.54], ambCol: [0.52, 0.36, 0.38],
        fogCol: [0.62, 0.32, 0.24], tint: [1.08, 0.88, 0.80], mtnCol: [0.32, 0.14, 0.16],
        weather: 'embers', moon: false
      };
    }
    if (zoneId === 'ridge') {
      // Huyền Băng Tuyết Lĩnh — Crisp Sunlit Alpine Snow Peak!
      return {
        skyTop: [0.18, 0.46, 0.78], skyMid: [0.54, 0.76, 0.94], skyHor: [0.88, 0.94, 1.00],
        sunDir: [-0.36, 0.82, -0.38], sunCol: [1.02, 1.05, 1.12], ambCol: [0.52, 0.66, 0.84],
        fogCol: [0.76, 0.86, 0.96], tint: [0.96, 1.02, 1.08], mtnCol: [0.42, 0.58, 0.76],
        weather: 'snow', moon: false
      };
    }
    if (zoneId === 'gate' || regionIdx >= 4) {
      // Cửu U Ma Vực — Blood Moon Demon Fortress!
      return {
        skyTop: [0.16, 0.06, 0.18], skyMid: [0.46, 0.14, 0.28], skyHor: [0.84, 0.32, 0.38],
        sunDir: [-0.42, 0.66, -0.42], sunCol: [1.08, 0.70, 0.78], ambCol: [0.44, 0.34, 0.54],
        fogCol: [0.48, 0.24, 0.36], tint: [1.02, 0.84, 0.94], mtnCol: [0.24, 0.12, 0.28],
        weather: 'embers', moon: true
      };
    }
    if (zoneId === 'ford') {
      // Bích Thủy Hàn Đàm — Crystal Jade Glacier Valley with Drifting Peach Petals!
      return {
        skyTop: [0.16, 0.50, 0.74], skyMid: [0.48, 0.78, 0.88], skyHor: [0.86, 0.96, 0.96],
        sunDir: [-0.38, 0.86, -0.36], sunCol: [1.02, 1.05, 1.00], ambCol: [0.48, 0.66, 0.76],
        fogCol: [0.68, 0.86, 0.90], tint: [0.96, 1.04, 1.04], mtnCol: [0.28, 0.50, 0.60],
        weather: 'petals', moon: false
      };
    }
    if (zoneId === 'grove') {
      // U Lâm Yêu Cốc — Spirit-Peach & Emerald Fireflies!
      return {
        skyTop: [0.14, 0.42, 0.54], skyMid: [0.36, 0.68, 0.68], skyHor: [0.78, 0.92, 0.86],
        sunDir: [-0.36, 0.84, -0.36], sunCol: [1.04, 1.02, 0.90], ambCol: [0.46, 0.64, 0.64],
        fogCol: [0.62, 0.82, 0.78], tint: [0.96, 1.04, 0.98], mtnCol: [0.24, 0.48, 0.48],
        weather: 'petals', moon: false
      };
    }
    // Default (camp — Thanh Lam Phế Đỉnh: Celestial Dawn Jade & Gold!)
    return {
      skyTop: [0.18, 0.50, 0.76], skyMid: [0.50, 0.78, 0.86], skyHor: [0.92, 0.94, 0.86],
      sunDir: [-0.42, 0.84, -0.34], sunCol: [1.06, 1.02, 0.90], ambCol: [0.48, 0.64, 0.72],
      fogCol: [0.70, 0.84, 0.84], tint: [0.98, 1.03, 1.00], mtnCol: [0.30, 0.50, 0.58],
      weather: 'gold', moon: false
    };
  }

  class MurimEnv3D {
    constructor(gl) {
      this.gl = gl;
      this.texArray = null;
      this.zoneCache = {};
      this.initTexArray();
    }
    initTexArray() {
      const gl = this.gl, W = 512, H = 512, DEPTH = 16;
      const tex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D_ARRAY, tex);
      gl.texStorage3D(gl.TEXTURE_2D_ARRAY, 9, gl.RGBA8, W, H, DEPTH);
      for (let i = 0; i < DEPTH; i++) {
        gl.texSubImage3D(gl.TEXTURE_2D_ARRAY, 0, 0, 0, i, W, H, 1, gl.RGBA, gl.UNSIGNED_BYTE, makeXianxiaTexture(i, W));
      }
      gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_WRAP_S, gl.REPEAT);
      gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_WRAP_T, gl.REPEAT);
      gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
      gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.generateMipmap(gl.TEXTURE_2D_ARRAY);
      this.texArray = tex;

      // Upgrade 3D terrain layers with REAL hand-painted seamless 512px Xianxia tile textures from D:\tu-tien-2d!
      const REAL_LAYERS = [
        [TEX.GRASS,       'env_grass'],
        [TEX.COBBLE,      'env_cobble'],
        [TEX.SNOW,        'env_snow'],
        [TEX.CLIFF,       'env_cliff'],
        [TEX.JADE_STONE,  'env_jade_stone'],
        [TEX.WOOD,        'env_wood'],
        [TEX.WATER,       'env_water'],
        [TEX.PAGODA_TILE, 'env_pagoda'],
        [TEX.OBSIDIAN,    'env_obsidian']
      ];
      for (const [layerIdx, fname] of REAL_LAYERS) {
        const img = new Image();
        img.onload = () => {
          const cv = document.createElement('canvas');
          cv.width = W; cv.height = H;
          cv.getContext('2d').drawImage(img, 0, 0, W, H);
          gl.activeTexture(gl.TEXTURE0);
          gl.bindTexture(gl.TEXTURE_2D_ARRAY, this.texArray);
          gl.texSubImage3D(gl.TEXTURE_2D_ARRAY, 0, 0, 0, layerIdx, W, H, 1, gl.RGBA, gl.UNSIGNED_BYTE, cv);
          gl.generateMipmap(gl.TEXTURE_2D_ARRAY);
        };
        img.src = `assets/tex3d/${fname}.png?v=34`;
      }
    }

    getZoneScene(zoneDef, regionIdx = 0) {
      const zid = (zoneDef && zoneDef.id) || 'camp';
      const key = `${zid}_r${Math.min(4, Math.max(0, regionIdx || 0))}`;
      if (this.zoneCache[key]) return this.zoneCache[key];

      const mb = new MapMeshBuilder();
      const lights = [];
      const addLight = (x, y, z, col, radius = 10.5, flicker = 0.14) => {
        if (lights.length < 8) lights.push({ x, y, z, r: col[0], g: col[1], b: col[2], radius, flicker });
      };
      const zDef = zoneDef || { id: zid };
      const rnd = mulberry32(7777 + zid.charCodeAt(0) * 149 + regionIdx * 47);

      if (zid === 'camp') this.buildThanhLamPeak(mb, zDef, addLight, rnd);
      else if (zid === 'grove') this.buildSpiritGrove(mb, zDef, addLight, rnd);
      else if (zid === 'ford') this.buildGlacierFord(mb, zDef, addLight, rnd);
      else if (zid === 'pass') this.buildLavaCanyon(mb, zDef, addLight, rnd);
      else if (zid === 'ridge') this.buildSnowRidge(mb, zDef, addLight, rnd);
      else if (zid === 'gate') this.buildDemonGate(mb, zDef, addLight, rnd);
      else if (zid === 'tower') this.buildHeavenTower(mb, zDef, addLight);
      else if (zid === 'shadow') this.buildTribulationAltar(mb, zDef, addLight);
      else this.buildThanhLamPeak(mb, zDef, addLight, rnd);

      const built = { group: mb.upload(this.gl), lights };
      this.zoneCache[key] = built;
      return built;
    }

    // 1. THANH LAM PHẾ ĐỈNH (camp) — Authentic Floating White-Jade Immortal Sanctuary (Zero old Murim fences/roads!)
    buildThanhLamPeak(mb, zDef, addLight, rnd) {
      mb.addGroundRect(-55, 55, -24, 65, 0.0, TEX.GRASS, [0.90, 1.0, 0.94], 0.16);
      // Grand White-Jade & Gold Immortal Causeway (hand-painted jade_plaza + carved marble border!)
      mb.addGroundRect(-5.0, 5.2, -18, 36, 0.018, TEX.JADE_STONE, [0.94, 0.99, 0.98], 0.28);
      mb.addGroundRect(-4.1, 4.3, -18, 36, 0.032, TEX.COBBLE, [0.96, 1.0, 0.98], 0.24);
      // South Immortal Entry Bagua Terrace (y=0.05) + North Ascension Bagua Sanctuary (z=23.5)
      mb.addCylinder(0, 0.01, 0.055, 6.5, 5.6, 5.6, 20, TEX.JADE_STONE, [0.94, 0.99, 0.98], FLAG.GROUND);
      mb.addCylinder(0, 0.055, 0.08, 6.5, 3.2, 3.2, 20, TEX.BAGUA, [0.76, 1.0, 0.96], FLAG.EMISSIVE);
      mb.addCylinder(0, 0.01, 0.06, 23.5, 7.6, 7.6, 24, TEX.JADE_STONE, [0.95, 1.0, 0.99], FLAG.GROUND);
      mb.addCylinder(0, 0.06, 0.095, 23.5, 4.8, 4.8, 24, TEX.BAGUA, [0.80, 1.0, 0.96], FLAG.EMISSIVE);

      // Crystal Turquoise Spirit Spring & Lotus Ponds (curving jade stone rim!)
      for (const w of (zDef.water || [])) {
        mb.addGroundRect(w.x0 - 0.65, w.x1 + 0.65, w.z0 - 0.55, w.z1 + 0.55, 0.018, TEX.JADE_STONE, [0.82, 0.94, 0.92], 0.30);
        mb.addGroundRect(w.x0, w.x1, w.z0, w.z1, 0.052, TEX.WATER, [0.42, 0.98, 1.0], 0.25, FLAG.WATER);
        mb.addLotus((w.x0 + w.x1) * 0.5, 0.06, (w.z0 + w.z1) * 0.5, 0.95);
      }
      mb.addGroundRect(8.8, 13.0, -22, -3, 0.05, TEX.WATER, [0.42, 0.98, 1.0], 0.25, FLAG.WATER);
      mb.addGroundRect(11.8, 16.8, 12.6, 48, 0.05, TEX.WATER, [0.42, 0.98, 1.0], 0.25, FLAG.WATER);
      mb.addLotus(10.8, 0.06, -9.5, 1.05); mb.addLotus(14.0, 0.06, 18.0, 1.15);
      for (let z = -2; z <= 20; z += 3.2) {
        const bx = z < 4 ? 9.0 : (z < 9 ? 10.0 : 11.6);
        mb.addRock(bx - 0.3, -0.05, z, 0.65, 0.45, 0.55, 100 + z * 13);
        if (Math.floor(z) % 2 === 0) mb.addSpiritCrystal(bx - 0.85, 0, z + 0.9, [0.34, 0.98, 0.96], 0.92, 140 + z * 9);
      }
      // Replace old Murim wooden barricades with Carved White-Jade Immortal Balustrades & Lotus Pillars!
      for (const br of (zDef.breaks || [])) {
        const cx = (br.x0 + br.x1) * 0.5, cz = (br.z0 + br.z1) * 0.5;
        const bw = Math.max(0.55, Math.abs(br.x1 - br.x0)), bd = Math.max(0.55, Math.abs(br.z1 - br.z0));
        mb.addBox(cx, 0.34, cz, bw, 0.68, bd, TEX.JADE_STONE, [0.92, 0.98, 0.98], 0, 0.45);
        mb.addBox(cx, 0.72, cz, bw + 0.14, 0.14, bd + 0.14, TEX.JADE_STONE, [0.98, 1.0, 0.96], 0, 0.5);
        mb.addSpiritCrystal(cx, 0.80, cz, [0.44, 0.98, 0.96], 0.52, 700 + Math.floor(cx * 11 + cz * 7));
      }

      // Grand Curved-Eave Immortal Pavilions, North Palace Spirit Archway (z=31.0 — never blocks camera!) & Floating Sky Peaks!
      mb.addBox(-4.2, 2.5, 31.0, 0.72, 5.0, 0.90, TEX.JADE_STONE, [0.94, 0.99, 1.0], 0, 0.5);
      mb.addBox( 4.2, 2.5, 31.0, 0.72, 5.0, 0.90, TEX.JADE_STONE, [0.94, 0.99, 1.0], 0, 0.5);
      mb.addBox( 0.0, 4.9, 31.0, 10.0, 0.72, 1.4, TEX.WOOD, [0.86, 0.24, 0.20], 0, 0.5);
      mb.addCurvedRoof(0.0, 5.25, 31.0, 11.0, 3.0, 1.9, [0.42, 0.88, 0.92], 0);
      mb.addImmortalPavilion(-15.5, 0, 17.5, 5.0, 5.0, 3.6, 2, [0.44, 0.86, 0.90], 0.32);
      mb.addImmortalPavilion(0.0, 0, 36.5, 8.6, 5.8, 4.6, 3, [0.46, 0.88, 0.92], 0);
      for (const [lx, lz] of [[-5.6, 4.0], [5.8, 4.0], [-6.0, 18.5], [6.2, 18.5]]) {
        mb.addSpiritLantern(lx, 0, lz, 1.08, [0.48, 0.98, 0.94]);
        addLight(lx, 2.0, lz, [0.44, 0.96, 0.92], 12.0, 0.12);
      }
      for (const [cx, cz] of [[-8.8, 25.0], [8.8, 25.0]]) {
        mb.addSpiritCrystal(cx, 0, cz, [0.36, 0.98, 0.96], 1.55, 220 + cx);
        addLight(cx, 1.8, cz, [0.34, 0.92, 0.98], 12.5, 0.18);
      }
      mb.addSectBanner(-7.2, 0, 21.5, [0.24, 0.84, 0.80], 4.8, 0.22);
      mb.addSectBanner(7.4, 0, 21.5, [0.24, 0.84, 0.80], 4.8, -0.22);

      // Floating Immortal Sky Islands & Cloud Banks framing the horizon!
      mb.addFloatingSkyIsland(-24, 9.5, 36, 5.4, 101);
      mb.addFloatingSkyIsland(26, 11.0, 38, 6.0, 102);
      mb.addFloatingSkyIsland(0, 15.0, 54, 7.0, 103);
      mb.addCloudBank(-26, -1.8, 24, 9.0, 1.4, [0.95, 0.99, 1.0], 111);
      mb.addCloudBank(28, -1.6, 26, 9.5, 1.4, [0.95, 0.99, 1.0], 112);

      const trees = [[-13.5, 3, 'peach', 1.25], [-14, 9.5, 'peach', 1.2], [-12.5, 24.5, 'jade', 1.35], [16.5, 4.5, 'pine', 1.25], [16.0, 17.5, 'peach', 1.25], [-9.2, 31.5, 'peach', 1.35], [9.8, 31.5, 'jade', 1.35]];
      trees.forEach(([tx, tz, st, sc], i) => mb.addImmortalTree(tx, 0, tz, st, sc, 310 + i * 23));
      for (const [bx, bz] of [[-11.5, 13.5], [13.2, 23.0]]) mb.addBambooCluster(bx, 0, bz, 6, 1.2, 390 + bx);
      for (let i = 0; i < 42; i++) {
        const gx = (rnd() < 0.5 ? -1 : 1) * (5.4 + rnd() * 9.5), gz = -4 + rnd() * 34;
        if (gx > 8.4 && gz < 13) continue;
        if (i % 3 === 0) mb.addWildflowerPatch(gx, 0, gz, [1.0, 0.72, 0.88], 500 + i * 11);
        else mb.addGrassTuft(gx, 0, gz, [0.28, 0.76, 0.50], 0.9 + rnd() * 0.55, 500 + i * 11);
      }
      mb.addHorizonMountains(48, 19, [0.36, 0.60, 0.66], [0.28, 0.50, 0.60], 11);
    }

    // 2. U LÂM YÊU CỐC (grove) — Bioluminescent Spirit Bamboo, Glowing Lotus Pond & Peach Blossoms
    buildSpiritGrove(mb, zDef, addLight, rnd) {
      mb.addGroundRect(-55, 55, -24, 65, 0.0, TEX.GRASS, [0.76, 0.96, 0.86], 0.14);
      for (let z = -6; z <= 32; z += 2.2) {
        const px = 2.5 + Math.sin(z * 0.24) * 2.2;
        mb.addBox(px, 0.03, z, 2.2, 0.05, 1.4, TEX.COBBLE, [0.88, 0.96, 0.94], Math.cos(z * 0.24) * 0.3, 0.5, FLAG.GROUND);
      }
      for (const w of (zDef.water || [])) {
        mb.addCylinder(w.x, -0.05, 0.03, w.z, w.r + 0.55, w.r + 0.55, 22, TEX.JADE_STONE, [0.70, 0.82, 0.80], FLAG.GROUND);
        mb.addCylinder(w.x, 0.02, 0.06, w.z, w.r, w.r, 24, TEX.WATER, [0.28, 0.96, 0.92], FLAG.WATER);
        for (let k = 0; k < 16; k++) {
          const a = (k / 16) * Math.PI * 2;
          mb.addRock(w.x + Math.cos(a) * (w.r + 0.22), -0.04, w.z + Math.sin(a) * (w.r + 0.22), 0.55, 0.36, 0.48, 1200 + k * 17);
        }
        mb.addLotus(w.x - 1.1, 0.06, w.z + 0.8, 1.1);
        mb.addLotus(w.x + 1.0, 0.06, w.z - 0.7, 0.95);
        mb.addLotus(w.x + 0.2, 0.06, w.z + 1.4, 0.85);
        addLight(w.x, 1.2, w.z, [0.32, 0.95, 0.90], 11.0, 0.14);
      }
      (zDef.walls || []).forEach((t, idx) => {
        if (t.x === undefined || t.z === undefined) return;
        const nearCam = t.z < 12 && Math.abs(t.x) < 5;
        const sc = nearCam ? 0.66 : (0.76 + (idx % 3) * 0.10);
        if (idx % 3 === 1) mb.addBambooCluster(t.x, 0, t.z, 5, sc, 1400 + idx * 31);
        else mb.addImmortalTree(t.x, 0, t.z, idx % 4 === 0 ? 'peach' : 'jade', sc, 1500 + idx * 37);
      });
      mb.addImmortalPavilion(-14.5, 0, 22.5, 4.6, 4.6, 3.2, 2, [0.44, 0.84, 0.86], 0.45);
      for (const [lx, lz] of [[0.8, 9.5], [-6.8, 15.8], [5.8, 22.0], [-4.5, 4.2]]) {
        mb.addSpiritLantern(lx, 0, lz, 1.0, [0.50, 0.98, 0.86]);
        addLight(lx, 2.0, lz, [0.44, 0.96, 0.82], 10.5, 0.10);
      }
      for (let i = 0; i < 18; i++) {
        const fx = (i % 2 === 0 ? -1 : 1) * (3.2 + (i % 5) * 1.9);
        const fz = 1.5 + i * 1.55;
        if (i % 3 === 0) mb.addWildflowerPatch(fx, 0, fz, [1.0, 0.74, 0.90], 1700 + i * 17);
        else mb.addGrassTuft(fx, 0, fz, [0.22, 0.74, 0.46], 1.15, 1750 + i * 13);
      }
      mb.addHorizonMountains(46, 17, [0.28, 0.54, 0.54], [0.22, 0.44, 0.50], 33);
    }

    // 3. BÍCH THỦY HÀN ĐÀM (ford) — Glacier-Jade River & Arched White-Jade Immortal Bridge!
    buildGlacierFord(mb, zDef, addLight, rnd) {
      mb.addGroundRect(-55, 55, -24, 9.2, 0.0, TEX.GRASS, [0.80, 0.96, 0.92], 0.14);
      mb.addGroundRect(-55, 55, 14.8, 62, 0.0, TEX.GRASS, [0.80, 0.96, 0.92], 0.14);
      mb.addGroundRect(-55, 55, 8.4, 9.4, 0.015, TEX.JADE_STONE, [0.84, 0.94, 0.96], 0.35);
      mb.addGroundRect(-55, 55, 14.6, 15.6, 0.015, TEX.JADE_STONE, [0.84, 0.94, 0.96], 0.35);
      mb.addGroundRect(-55, 55, 9.0, 15.0, -0.08, TEX.WATER, [0.34, 0.94, 1.00], 0.24, FLAG.WATER);

      mb.addGroundRect(-2.4, 2.4, -14, 8.6, 0.025, TEX.COBBLE, [0.92, 0.98, 0.98], 0.32);
      mb.addGroundRect(-2.4, 2.4, 15.4, 38, 0.025, TEX.COBBLE, [0.92, 0.98, 0.98], 0.32);

      // Arched White-Marble & Cyan-Jade Immortal Bridge matching exact high b1 & b2!
      mb.addRamp(-1.55, 1.55, 8.5, 12.0, 0.02, 0.62, 'z', TEX.JADE_STONE, TEX.JADE_STONE, [0.92, 0.98, 0.98], [0.72, 0.86, 0.90], 0.5, FLAG.GROUND);
      mb.addRamp(-1.55, 1.55, 12.0, 15.5, 0.62, 0.02, 'z', TEX.JADE_STONE, TEX.JADE_STONE, [0.92, 0.98, 0.98], [0.72, 0.86, 0.90], 0.5, FLAG.GROUND);
      for (const sx of [-1.62, 1.62]) {
        mb.addRamp(sx - 0.12, sx + 0.12, 8.6, 12.0, 0.88, 1.48, 'z', TEX.JADE_STONE, TEX.JADE_STONE, [0.86, 0.96, 0.98], [0.64, 0.84, 0.88], 0.6, FLAG.SOLID);
        mb.addRamp(sx - 0.12, sx + 0.12, 12.0, 15.4, 1.48, 0.88, 'z', TEX.JADE_STONE, TEX.JADE_STONE, [0.86, 0.96, 0.98], [0.64, 0.84, 0.88], 0.6, FLAG.SOLID);
        for (const [pz, py] of [[8.6, 0.02], [10.3, 0.32], [12.0, 0.62], [13.7, 0.32], [15.4, 0.02]]) {
          mb.addBox(sx, py + 0.55, pz, 0.22, 1.15, 0.22, TEX.JADE_STONE, [0.88, 0.96, 0.98], 0, 0.7);
          if (pz === 8.6 || pz === 15.4) {
            mb.addBox(sx, py + 1.28, pz, 0.28, 0.32, 0.28, TEX.LANTERN, [0.46, 0.98, 1.00], 0, 1.0, FLAG.EMISSIVE);
            addLight(sx, py + 1.5, pz, [0.42, 0.92, 1.00], 10.5, 0.12);
          } else {
            mb.addBox(sx, py + 1.18, pz, 0.24, 0.14, 0.24, TEX.WHITE, [0.96, 0.82, 0.36], 0, 1.0);
          }
        }
      }
      // Ice-Lotus Stepping Stones across East Ford Gap (x=9..10.5, z=9..15)
      for (let i = 0; i < 6; i++) {
        mb.addCylinder(9.75 + Math.sin(i * 1.3) * 0.25, -0.15, 0.08, 9.3 + i * 1.08, 0.62, 0.54, 7, TEX.JADE_STONE, [0.86, 0.96, 0.98], FLAG.GROUND);
      }
      // Blooming Spirit Lotuses & Mossy River Rocks along the Glacier-Jade River!
      for (const [lx, lz, ls] of [[-4.8, 10.6, 1.0], [-7.6, 13.2, 1.15], [-11.0, 11.4, 0.95], [4.2, 13.4, 1.05], [6.6, 10.8, 1.1], [12.4, 12.6, 1.0]]) {
        mb.addLotus(lx, 0.01, lz, ls);
      }
      for (const [rx, rz] of [[-4.2, 8.9], [-8.8, 9.1], [4.4, 8.9], [7.8, 15.1], [-5.6, 15.0], [12.8, 8.9]]) {
        mb.addRock(rx, -0.04, rz, 0.62, 0.34, 0.52, 930 + Math.floor(rx * 13 + rz * 7), [0.54, 0.68, 0.72]);
      }
      // Lush swaying grass tufts & spirit wildflowers bordering the stone road and riverbanks!
      for (const [gx, gz, fl] of [
        [-4.2, 3.2, 1], [-7.5, 4.8, 0], [-3.4, 6.8, 1], [3.6, 4.0, 1], [6.8, 3.4, 0], [4.2, 7.2, 1],
        [-3.8, 17.5, 1], [3.9, 17.8, 0], [-6.8, 19.6, 1], [6.4, 20.2, 1], [-9.2, 2.5, 0], [8.6, 5.2, 1]
      ]) {
        if (fl) mb.addWildflowerPatch(gx, 0, gz, (gx > 0 ? [1.0, 0.86, 0.44] : [1.0, 0.68, 0.86]), 1600 + Math.floor(gx * 17 + gz * 13));
        else mb.addGrassTuft(gx, 0, gz, [0.24, 0.74, 0.46], 1.15, 1650 + Math.floor(gx * 19 + gz * 11));
      }
      mb.addImmortalPavilion(-12.5, 0, 19.5, 4.8, 4.8, 3.4, 2, [0.48, 0.86, 0.94], 0.38);
      for (const [bx, bz] of [[-9.5, 7.6], [-6.5, 16.4], [5.8, 16.4], [13.5, 16.2]]) mb.addBambooCluster(bx, 0, bz, 5, 1.05, 710 + bx * 13);
      for (const [tx, tz, st, sc] of [[-6.2, 6.4, 'peach', 1.15], [5.4, 6.2, 'peach', 1.1], [-5.2, 23.5, 'snowpine', 1.25], [6.8, 23.0, 'peach', 1.15]]) mb.addImmortalTree(tx, 0, tz, st, sc, 780 + tx * 19);
      mb.addSpiritCrystal(7.6, 0, 7.6, [0.42, 0.96, 1.0], 1.15, 801);
      mb.addSpiritCrystal(7.6, 0, 16.4, [0.42, 0.96, 1.0], 1.15, 802);
      addLight(7.6, 1.8, 7.6, [0.40, 0.92, 1.0], 10.5, 0.14);
      addLight(7.6, 1.8, 16.4, [0.40, 0.92, 1.0], 10.5, 0.14);
      mb.addHorizonMountains(45, 17, [0.36, 0.58, 0.68], [0.28, 0.48, 0.62], 22);
    }

    // 4. XÍCH VIÊM HỎA CỐC (pass) — Obsidian Volcanic Canyon & GLOWING MOLTEN LAVA RIVERS!!
    buildLavaCanyon(mb, zDef, addLight, rnd) {
      // Sunken Molten Magma Riverbed (-0.28m) + Elevated Dark Obsidian Canyon Road (0.04m)!
      mb.addGroundRect(-55, 55, -24, 65, -0.28, TEX.OBSIDIAN, [1.0, 0.36, 0.08], 0.14, FLAG.LAVA);
      mb.addBox(0, -0.10, -1.5, 11.4, 0.24, 33.5, TEX.OBSIDIAN, [0.44, 0.36, 0.38], 0, 0.24, FLAG.GROUND);
      mb.addGroundRect(-4.2, 4.2, -18, 14.5, 0.04, TEX.COBBLE, [0.64, 0.50, 0.46], 0.30);

      // Towering Stratified Volcanic Obsidian Cliffs matching exact walls wl1..wr3!
      for (const w of (zDef.walls || [])) {
        const cx = (w.x0 + w.x1) * 0.5, cz = (w.z0 + w.z1) * 0.5, sx = w.x1 - w.x0, sz = w.z1 - w.z0;
        const h = w.z0 >= 14 ? 5.8 : 4.4;
        mb.addBox(cx, h * 0.5 - 0.1, cz, sx, h, sz, TEX.CLIFF, [0.48, 0.38, 0.38], 0, 0.24);
        // Glowing lava fissure stripe near cliff base!
        const edgeX = cx < 0 ? w.x1 - 0.06 : w.x0 + 0.06;
        mb.addBox(edgeX, 0.22, cz, 0.24, 0.34, sz * 0.92, TEX.LANTERN, [1.0, 0.48, 0.12], 0, 0.6, FLAG.EMISSIVE);
        for (let rz = w.z0 + 1.4; rz < w.z1 - 0.6; rz += 2.8) {
          mb.addRock(edgeX, 0.2, rz, 0.82, 1.55, 1.2, 2050 + Math.floor(rz * 19 + cx * 7), [0.40, 0.34, 0.34]);
        }
        const treeX = cx < 0 ? Math.min(w.x1 - 1.5, cx + 1.2) : Math.max(w.x0 + 1.5, cx - 1.2);
        mb.addImmortalTree(treeX, h + 0.1, cz, 'flame', 1.15, 2100 + Math.floor(cz * 17 + cx));
      }

      // Carved Obsidian Stairs (z=14..18, h=0->1.6) & Elevated Flame Altar Terrace (z=18..31, h=1.6)
      mb.addRamp(-3.5, 3.5, 14.0, 18.0, 0.02, 1.62, 'z', TEX.OBSIDIAN, TEX.OBSIDIAN, [0.76, 0.62, 0.58], [0.52, 0.40, 0.38], 0.4, FLAG.GROUND);
      for (let s = 0; s < 8; s++) {
        mb.addBox(0, (s + 0.5) * 0.20, 14.25 + s * 0.48, 6.8, 0.20, 0.52, TEX.JADE_STONE, [0.80, 0.66, 0.58], 0, 0.45, FLAG.GROUND);
      }
      mb.addBox(0, 0.8, 24.5, 12.0, 1.62, 13.0, TEX.OBSIDIAN, [0.68, 0.56, 0.54], 0, 0.25, FLAG.GROUND);
      mb.addCylinder(0, 1.61, 1.65, 23.5, 4.4, 4.4, 18, TEX.BAGUA, [1.0, 0.62, 0.28], FLAG.EMISSIVE);

      mb.addImmortalPavilion(0, 1.6, 33.8, 8.2, 5.2, 4.2, 2, [0.82, 0.32, 0.22], 0);
      for (const [bx, by, bz] of [[-3.8, 0, 13.5], [3.8, 0, 13.5], [-4.8, 1.6, 19.2], [4.8, 1.6, 19.2], [-4.8, 1.6, 27.5], [4.8, 1.6, 27.5]]) {
        mb.addFireBrazier(bx, by, bz, 1.25, [1.0, 0.52, 0.14]);
        addLight(bx, by + 1.8, bz, [1.0, 0.48, 0.16], 13.5, 0.24);
      }
      for (const [cx, cy, cz] of [[-4.4, 0, 5.2], [4.4, 0, 5.2], [-4.6, 0, 10.4], [4.6, 0, 10.4], [-5.2, 1.6, 23.5], [5.2, 1.6, 23.5]]) {
        mb.addSpiritCrystal(cx, cy, cz, [1.0, 0.44, 0.14], 1.12, 2220 + Math.floor(cx * 11 + cz * 7));
      }
      mb.addHorizonMountains(48, 22, [0.46, 0.24, 0.22], [0.34, 0.18, 0.20], 44);
    }

    // 5. HUYỀN BĂNG TUYẾT LĨNH (ridge) — Sparkling Alpine Snow Sanctuary & Frost-Jade Bagua!
    buildSnowRidge(mb, zDef, addLight, rnd) {
      mb.addGroundRect(-55, 55, -24, 65, 0.0, TEX.SNOW, [0.94, 0.98, 1.04], 0.14);
      mb.addGroundRect(-2.8, 2.8, -14, 9.2, 0.025, TEX.JADE_STONE, [0.88, 0.96, 1.02], 0.30);

      // Elevated Frost-Jade Plateau (x=-8..6, z=12..26, h=1.8m)
      mb.addBox(-1.0, 0.9, 19.0, 14.0, 1.82, 14.0, TEX.JADE_STONE, [0.84, 0.94, 1.00], 0, 0.24, FLAG.GROUND);
      mb.addGroundRect(-7.8, 5.8, 12.2, 25.8, 1.82, TEX.SNOW, [0.96, 1.00, 1.04], 0.24, FLAG.GROUND);
      mb.addCylinder(-1.0, 1.82, 1.86, 19.0, 4.4, 4.4, 18, TEX.BAGUA, [0.68, 0.96, 1.05], FLAG.EMISSIVE);

      mb.addRamp(-2.0, 2.0, 9.0, 12.0, 0.02, 1.82, 'z', TEX.JADE_STONE, TEX.JADE_STONE, [0.90, 0.98, 1.04], [0.74, 0.86, 0.96], 0.45, FLAG.GROUND);
      for (let s = 0; s < 7; s++) mb.addBox(0, (s + 0.5) * 0.25, 9.2 + s * 0.42, 3.85, 0.25, 0.45, TEX.JADE_STONE, [0.94, 1.00, 1.05], 0, 0.5, FLAG.GROUND);
      mb.addRamp(-8.0, 6.0, 26.0, 29.0, 1.82, 0.02, 'z', TEX.SNOW, TEX.CLIFF, [0.92, 0.98, 1.04], [0.68, 0.78, 0.88], 0.3, FLAG.GROUND);
      mb.addRamp(6.0, 9.0, 19.5, 24.5, 1.82, 0.02, 'x', TEX.SNOW, TEX.CLIFF, [0.92, 0.98, 1.04], [0.68, 0.78, 0.88], 0.3, FLAG.GROUND);

      for (const w of (zDef.walls || [])) {
        const cx = (w.x0 + w.x1) * 0.5, cz = (w.z0 + w.z1) * 0.5;
        const sx = Math.max(0.32, w.x1 - w.x0), sz = Math.max(0.32, w.z1 - w.z0);
        const baseH = cz >= 11.7 && cz <= 26.2 && cx >= -8.3 && cx <= 6.3 ? 1.8 : 0.6;
        mb.addBox(cx, baseH + 0.42, cz, sx, 0.85, sz, TEX.JADE_STONE, [0.84, 0.94, 1.00], 0, 0.6);
      }
      for (const [lx, ly, lz] of [[-2.4, 1.8, 12.1], [2.4, 1.8, 12.1], [-7.2, 1.8, 25.0], [5.2, 1.8, 25.0]]) {
        mb.addSpiritLantern(lx, ly, lz, 1.05, [0.58, 0.96, 1.05]);
        addLight(lx, ly + 2.0, lz, [0.54, 0.90, 1.05], 11.5, 0.10);
      }
      mb.addSpiritCrystal(-7.0, 1.8, 12.8, [0.54, 0.96, 1.05], 1.35, 2401);
      mb.addSpiritCrystal(5.0, 1.8, 12.8, [0.54, 0.96, 1.05], 1.35, 2402);
      mb.addImmortalPavilion(-1.0, 0, 34.5, 7.0, 5.0, 3.8, 2, [0.58, 0.86, 0.98], 0);
      for (const [tx, tz, sc] of [[-12.5, 6, 1.4], [-13.5, 16, 1.35], [-12, 27, 1.45], [13, 7, 1.35], [14, 16, 1.4], [13, 28, 1.3]]) {
        mb.addImmortalTree(tx, 0, tz, 'snowpine', sc, 2500 + tx * 17 + tz);
      }
      for (const [cx, cz] of [[-4.8, 3.8], [4.8, 4.2], [-6.2, 8.4], [6.4, 8.6], [-8.8, 28.5], [8.2, 28.0]]) {
        mb.addSpiritCrystal(cx, 0, cz, [0.62, 0.94, 1.05], 1.15, 2610 + Math.floor(cx * 13 + cz));
      }
      mb.addHorizonMountains(46, 22, [0.68, 0.80, 0.94], [0.54, 0.68, 0.86], 55);
    }

    // 6. CỬU U MA VỰC (gate) — Obsidian Demon Wall, Purple Soul Flames & Blood Moon!
    buildDemonGate(mb, zDef, addLight, rnd) {
      mb.addGroundRect(-55, 55, -24, 65, 0.0, TEX.OBSIDIAN, [0.54, 0.44, 0.62], 0.16);
      mb.addGroundRect(2.6, 7.4, -14, 34, 0.028, TEX.COBBLE, [0.72, 0.56, 0.66], 0.30);

      for (const w of (zDef.walls || [])) {
        const cx = (w.x0 + w.x1) * 0.5, cz = (w.z0 + w.z1) * 0.5, len = w.x1 - w.x0;
        mb.addBox(cx, 0.5, cz, len, 1.0, 1.2, TEX.OBSIDIAN, [0.46, 0.38, 0.54], 0, 0.4);
        const logs = Math.max(4, Math.round(len / 0.52));
        for (let i = 0; i < logs; i++) {
          const lx = w.x0 + (i + 0.5) * (len / logs), lh = 3.1 + ((i * 7) % 3) * 0.2;
          mb.addCylinder(lx, 0.8, lh, cz, 0.22, 0.16, 6, TEX.OBSIDIAN, [0.38, 0.32, 0.48], FLAG.SOLID);
          mb.addCylinder(lx, lh, lh + 0.5, cz, 0.16, 0.02, 6, TEX.LANTERN, [0.96, 0.26, 0.48], FLAG.EMISSIVE);
        }
      }
      // Demon Fortress Gatehouse (x=3..7, z=14.5)
      mb.addBox(2.75, 2.3, 14.5, 0.78, 4.6, 1.4, TEX.OBSIDIAN, [0.52, 0.42, 0.60], 0, 0.5);
      mb.addBox(7.25, 2.3, 14.5, 0.78, 4.6, 1.4, TEX.OBSIDIAN, [0.52, 0.42, 0.60], 0, 0.5);
      mb.addBox(5.0, 4.4, 14.5, 5.8, 0.75, 1.9, TEX.WOOD, [0.64, 0.16, 0.26], 0, 0.5);
      mb.addCylinder(5.0, 5.1, 7.4, 14.5, 4.6, 0.3, 4, TEX.ROOF, [0.58, 0.22, 0.42], FLAG.SOLID);
      mb.addBox(3.4, 3.7, 13.7, 0.42, 0.56, 0.42, TEX.LANTERN, [1.0, 0.28, 0.52], 0, 1.0, FLAG.EMISSIVE);
      mb.addBox(6.6, 3.7, 13.7, 0.42, 0.56, 0.42, TEX.LANTERN, [1.0, 0.28, 0.52], 0, 1.0, FLAG.EMISSIVE);
      addLight(3.4, 3.6, 13.4, [1.0, 0.30, 0.54], 13.0, 0.20);
      addLight(6.6, 3.6, 13.4, [1.0, 0.30, 0.54], 13.0, 0.20);

      for (const [bx, bz] of [[1.5, 12.4], [8.5, 12.4], [-9.2, 12.4], [1.5, 17.5], [8.5, 17.5]]) {
        mb.addFireBrazier(bx, 0, bz, 1.2, [0.96, 0.30, 0.78]);
        addLight(bx, 1.8, bz, [0.92, 0.28, 0.72], 12.5, 0.22);
      }
      mb.addSectBanner(-2.5, 0, 13.2, [0.74, 0.16, 0.38], 4.8, 0.1);
      mb.addSectBanner(11.5, 0, 13.2, [0.74, 0.16, 0.38], 4.8, -0.1);
      for (const [tx, tz] of [[-13.5, 4], [14, 4.5], [-14.5, 24], [15.5, 24.5]]) mb.addImmortalTree(tx, 0, tz, 'void', 1.3, 2900 + tx * 11);
      for (const [cx, cz] of [[1.4, 4.2], [8.8, 4.5], [1.2, 9.2], [9.0, 9.6], [1.6, 21.5], [8.6, 21.8]]) {
        mb.addSpiritCrystal(cx, 0, cz, [0.92, 0.32, 0.86], 1.18, 2950 + Math.floor(cx * 11 + cz));
      }
      mb.addHorizonMountains(48, 20, [0.36, 0.20, 0.38], [0.24, 0.14, 0.32], 66);
    }

    // 7. THÔNG THIÊN THÁP (tower) — Celestial Golden-Jade Cloud Pagoda!
    buildHeavenTower(mb, zDef, addLight) {
      mb.addGroundRect(-7.0, 12.0, -5.5, 22.0, 0.0, TEX.PAGODA_TILE, [0.88, 0.96, 0.96], 0.26);
      mb.addCylinder(2.5, 0.01, 0.04, 9.5, 3.8, 3.8, 22, TEX.BAGUA, [0.86, 1.0, 0.96], FLAG.EMISSIVE);
      mb.addGroundRect(0.45, 4.55, -3.5, 14.0, 0.045, TEX.WHITE, [0.92, 0.76, 0.28], 0.5);
      mb.addGroundRect(0.70, 4.30, -3.5, 14.0, 0.052, TEX.WHITE, [0.16, 0.46, 0.52], 0.5);
      mb.addBox(-6.2, 0.65, 8.2, 0.9, 1.3, 27.5, TEX.JADE_STONE, [0.88, 0.96, 0.96], 0, 0.4);
      mb.addBox(11.2, 0.65, 8.2, 0.9, 1.3, 27.5, TEX.JADE_STONE, [0.88, 0.96, 0.96], 0, 0.4);
      mb.addBox(2.5, 0.85, 21.5, 18.2, 1.7, 1.1, TEX.JADE_STONE, [0.88, 0.96, 0.96], 0, 0.4);

      for (const [px, pz] of [[-1, 7], [6, 7], [-1, 12], [6, 12]]) {
        mb.addCylinder(px, 0, 0.42, pz, 0.58, 0.50, 8, TEX.JADE_STONE, [0.90, 0.96, 0.96], FLAG.SOLID);
        mb.addCylinder(px, 0.42, 6.2, pz, 0.42, 0.38, 10, TEX.WOOD, [0.84, 0.22, 0.18], FLAG.SOLID);
        mb.addCylinder(px, 1.6, 1.85, pz, 0.46, 0.46, 10, TEX.LANTERN, [1.0, 0.84, 0.36], FLAG.EMISSIVE);
        mb.addCylinder(px, 4.4, 4.65, pz, 0.44, 0.44, 10, TEX.LANTERN, [1.0, 0.84, 0.36], FLAG.EMISSIVE);
        mb.addBox(px, 3.4, pz - 0.58, 0.38, 0.52, 0.38, TEX.LANTERN, [1.0, 0.88, 0.48], 0, 1.0, FLAG.EMISSIVE);
        addLight(px, 3.2, pz - 0.7, [1.0, 0.82, 0.44], 12.0, 0.08);
      }
      mb.addRamp(0.0, 5.0, 14.0, 15.0, 0.02, 0.62, 'z', TEX.JADE_STONE, TEX.JADE_STONE, [0.94, 0.98, 0.98], [0.76, 0.86, 0.88], 0.5, FLAG.GROUND);
      mb.addBox(2.5, 0.3, 17.25, 9.0, 0.62, 4.5, TEX.PAGODA_TILE, [0.96, 1.0, 1.0], 0, 0.3, FLAG.GROUND);
      mb.addImmortalPavilion(2.5, 0.6, 25.0, 10.0, 5.0, 4.8, 2, [0.56, 0.88, 0.92], 0);
      mb.addHorizonMountains(50, 22, [0.56, 0.72, 0.84], [0.46, 0.64, 0.78], 77);
    }

    // 8. LÔI KIẾP ĐÀI (shadow) — Heavenly Tribulation Thunder Altar!
    buildTribulationAltar(mb, zDef, addLight) {
      mb.addGroundRect(-45, 45, -24, 55, 0.0, TEX.OBSIDIAN, [0.46, 0.52, 0.76], 0.16);
      mb.addGroundRect(-45, -6.5, -20, 45, -0.04, TEX.WATER, [0.24, 0.44, 0.88], 0.20, FLAG.WATER);
      mb.addGroundRect(8.5, 45, -20, 45, -0.04, TEX.WATER, [0.24, 0.44, 0.88], 0.20, FLAG.WATER);

      mb.addCylinder(0.5, -0.1, 0.70, 10.5, 3.7, 3.5, 24, TEX.OBSIDIAN, [0.74, 0.80, 1.02], FLAG.GROUND);
      mb.addCylinder(0.5, 0.70, 0.75, 10.5, 3.35, 3.35, 24, TEX.BAGUA, [0.56, 0.92, 1.08], FLAG.EMISSIVE);
      mb.addCylinder(0.5, 0.02, 0.36, 10.5, 4.2, 4.0, 24, TEX.JADE_STONE, [0.44, 0.54, 0.78], FLAG.GROUND);

      for (const [lx, lz] of [[-4, 8], [5, 8], [-4, 14], [5, 14]]) {
        mb.addSpiritLantern(lx, 0, lz, 1.25, [0.56, 0.86, 1.05]);
        addLight(lx, 2.4, lz, [0.50, 0.82, 1.08], 13.5, 0.22);
      }
      mb.addSpiritCrystal(0.5, 0.7, 8.8, [0.48, 0.96, 1.08], 1.35, 9901);
      addLight(0.5, 2.5, 8.8, [0.46, 0.94, 1.08], 15.0, 0.25);

      for (const [mx, mz, mh] of [[-11, 6, 8.5], [12, 7, 9.2], [-13, 18, 10.5], [14, 19, 9.8], [0.5, 24, 12.0]]) {
        mb.addBox(mx, mh * 0.5 - 0.5, mz, 1.8, mh, 1.8, TEX.OBSIDIAN, [0.46, 0.52, 0.78], mx * 0.15, 0.35);
        mb.addBox(mx, mh - 0.2, mz, 1.3, 0.26, 1.3, TEX.LANTERN, [0.56, 0.86, 1.08], mx * 0.15, 1.0, FLAG.EMISSIVE);
      }
      mb.addHorizonMountains(44, 18, [0.18, 0.24, 0.46], [0.14, 0.18, 0.38], 88);
    }

    // ==================== 100% BRAND-NEW 3D FLOATING IMMORTAL SECT SANCTUARY ====================
    // Completely replaces Murim town3d.bin! Dynamic 3D architecture reacts to each hall's Lv.0 / Building / Built!
    getTownScene(hallsState) {
      const hallIds = ['main', 'yard', 'gate', 'library', 'dorm', 'pharmacy', 'smithy', 'vault'];
      const nowMs = Date.now();
      const sig = hallIds.map(id => {
        const hs = (hallsState && hallsState[id]) || { lv: id === 'main' ? 1 : 0, buildEnd: 0 };
        const st = (hs.lv || 0) > 0 ? 'B' : 'R';
        const bd = (hs.buildEnd && hs.buildEnd > nowMs) ? 'C' : '';
        return `${id}:${st}${bd}`;
      }).join('|');
      if (this._townCache && this._townCache.sig === sig) return this._townCache.scene;

      const mb = new MapMeshBuilder();
      const lights = [];
      const addLight = (x, y, z, col, radius = 12.0, flicker = 0.12) => {
        if (lights.length < 8) lights.push({ x, y, z, r: col[0], g: col[1], b: col[2], radius, flicker });
      };

      // 1. Floating Jade Mountain Island Cliff Base suspended above Golden Sea of Clouds!
      mb.addCylinder(0, -14.0, -0.15, 6.0, 26.0, 34.0, 24, TEX.CLIFF, [0.46, 0.56, 0.60], FLAG.GROUND, true);
      mb.addGroundRect(-30, 30, -20, 32, 0.0, TEX.GRASS, [0.80, 0.96, 0.88], 0.14);
      // White-Jade Immortal Courtyard Platform + Glowing Spirit Water Moat Rings!
      mb.addBox(0, -0.02, 2.5, 28.0, 0.14, 24.0, TEX.JADE_STONE, [0.88, 0.96, 0.96], 0, 0.25, FLAG.GROUND);
      mb.addGroundRect(-13.2, 13.2, -9.0, 14.0, 0.06, TEX.COBBLE, [0.92, 0.98, 0.98], 0.28);
      // Glowing Spirit Spring Canals flanking the central Grand Stairway!
      mb.addGroundRect(-11.5, -4.5, 11.5, 15.2, 0.02, TEX.WATER, [0.34, 0.96, 1.00], 0.25, FLAG.WATER);
      mb.addGroundRect(4.5, 11.5, 11.5, 15.2, 0.02, TEX.WATER, [0.34, 0.96, 1.00], 0.25, FLAG.WATER);
      mb.addLotus(-8.0, 0.06, 13.4, 1.0); mb.addLotus(8.0, 0.06, 13.4, 1.0);

      // Centerpiece: Luminous Celestial Tụ Linh Đại Trận (Bagua Spirit Array!)
      mb.addCylinder(0, 0.06, 0.10, 2.0, 4.4, 4.4, 24, TEX.BAGUA, [0.76, 1.0, 0.98], FLAG.EMISSIVE);
      addLight(0, 1.8, 2.0, [0.44, 0.96, 0.94], 14.0, 0.10);

      // Upper Immortal Palace Terrace (y = 1.60) + Grand White-Jade Staircase
      mb.addBox(0, 0.80, 21.0, 26.0, 1.60, 12.5, TEX.JADE_STONE, [0.88, 0.95, 0.96], 0, 0.25, FLAG.GROUND);
      mb.addRamp(-3.6, 3.6, 11.0, 15.0, 0.06, 1.62, 'z', TEX.JADE_STONE, TEX.JADE_STONE, [0.94, 0.99, 1.0], [0.76, 0.86, 0.90], 0.45, FLAG.GROUND);
      for (let s = 0; s < 7; s++) mb.addBox(0, (s + 0.5) * 0.22, 11.3 + s * 0.52, 7.0, 0.22, 0.56, TEX.JADE_STONE, [0.96, 1.0, 1.0], 0, 0.5, FLAG.GROUND);
      // Terrace Balustrades & Glowing Spirit Lanterns
      mb.addBox(-8.6, 2.02, 14.9, 9.4, 0.84, 0.35, TEX.JADE_STONE, [0.88, 0.96, 0.98], 0, 0.5);
      mb.addBox(8.6, 2.02, 14.9, 9.4, 0.84, 0.35, TEX.JADE_STONE, [0.88, 0.96, 0.98], 0, 0.5);
      for (const [lx, ly, lz] of [[-4.2, 1.6, 14.9], [4.2, 1.6, 14.9], [-6.2, 0, -9.2], [6.2, 0, -9.2]]) {
        mb.addSpiritLantern(lx, ly, lz, 1.12, [0.54, 0.98, 0.94]);
        addLight(lx, ly + 2.2, lz, [0.46, 0.94, 0.94], 12.5, 0.12);
      }

      const isBuilt = (id) => ((hallsState && hallsState[id] && hallsState[id].lv) || (id === 'main' ? 1 : 0)) > 0;
      const isBuilding = (id) => !!(hallsState && hallsState[id] && hallsState[id].buildEnd > nowMs);
      const drawRuin = (x, y, z, w, d) => {
        mb.addBox(x, y + 0.25, z, w, 0.5, d, TEX.JADE_STONE, [0.70, 0.80, 0.80], 0.06, 0.4);
        // Glowing Cyan Spirit Blueprint Bagua Seal inviting the Sect Master to rebuild!
        const rad = Math.min(w, d) * 0.38;
        mb.addCylinder(x, y + 0.51, y + 0.54, z, rad, rad, 18, TEX.BAGUA, [0.46, 0.94, 0.92], FLAG.EMISSIVE);
        mb.addRock(x - w * 0.30, y + 0.32, z + d * 0.22, 0.72, 0.58, 0.68, 301 + Math.floor(x * 13));
        mb.addRock(x + w * 0.28, y + 0.32, z - d * 0.24, 0.66, 0.48, 0.62, 309 + Math.floor(z * 11));
        mb.addCylinder(x - w * 0.34, y + 0.48, y + 1.85, z - d * 0.28, 0.20, 0.17, 6, TEX.JADE_STONE, [0.78, 0.86, 0.86]);
        mb.addSpiritCrystal(x + w * 0.30, y + 0.50, z + d * 0.22, [0.42, 0.96, 0.94], 0.68, 350 + Math.floor(x * 7 + z));
      };
      const drawConstructArray = (x, y, z, r) => {
        mb.addCylinder(x, y + 0.08, y + 0.14, z, r, r, 18, TEX.BAGUA, [1.0, 0.88, 0.38], FLAG.EMISSIVE);
        mb.addSpiritCrystal(x, y + 0.1, z, [1.0, 0.86, 0.36], 1.25, 991);
      };

      // HALL 1: Thái Hư Chính Điện (main: 0, 1.6, 22.0) — Grand 3-Tier Jade Immortal Palace!
      mb.addImmortalPavilion(0, 1.6, 22.4, 9.6, 6.2, 4.4, 3, [0.42, 0.86, 0.88], 0);
      addLight(0, 5.2, 18.8, [1.0, 0.84, 0.46], 15.0, 0.10);
      if (isBuilding('main')) drawConstructArray(0, 1.6, 22.4, 5.8);

      // HALL 2: Diễn Kiếm Đài (yard: 0, 0, 2.0) — Glowing Floating Sword Monoliths around the Bagua!
      if (isBuilt('yard')) {
        for (const [sx, sz] of [[-6.5, -1.5], [-6.5, 5.5], [6.5, -1.5], [6.5, 5.5]]) {
          mb.addBox(sx, 0.25, sz, 1.0, 0.5, 1.0, TEX.JADE_STONE, [0.86, 0.94, 0.94], 0, 0.6);
          mb.addSpiritCrystal(sx, 0.5, sz, [0.42, 0.98, 0.94], 0.95, 400 + sx * 7 + sz);
        }
      }
      if (isBuilding('yard')) drawConstructArray(0, 0, 2.0, 4.8);

      // HALL 3: Hộ Sơn Đại Trận (gate: 0, 0, -11.5) — Grand White-Jade Nam Thiên Môn Archway with Curved Flying Eaves!
      if (isBuilt('gate')) {
        mb.addBox(-3.2, 2.6, -11.5, 0.9, 5.2, 1.2, TEX.JADE_STONE, [0.90, 0.96, 0.98], 0, 0.5);
        mb.addBox(3.2, 2.6, -11.5, 0.9, 5.2, 1.2, TEX.JADE_STONE, [0.90, 0.96, 0.98], 0, 0.5);
        mb.addBox(0, 5.0, -11.5, 8.6, 0.8, 1.8, TEX.WOOD, [0.84, 0.22, 0.20], 0, 0.5);
        mb.addCurvedRoof(0, 5.38, -11.5, 9.6, 3.4, 2.0, [0.44, 0.86, 0.90], 0);
        mb.addSpiritCrystal(-3.2, 5.2, -11.5, [0.46, 0.98, 1.0], 0.75, 511);
        mb.addSpiritCrystal(3.2, 5.2, -11.5, [0.46, 0.98, 1.0], 0.75, 512);
      } else drawRuin(0, 0, -11.5, 7.2, 2.6);
      if (isBuilding('gate')) drawConstructArray(0, 0, -11.5, 4.2);

      // HALL 4: Tàng Pháp Các (library: -19.5, 0, 21.0) — Tall 3-Tier Octagonal Scripture Pagoda!
      if (isBuilt('library')) mb.addImmortalPavilion(-19.5, 0, 21.0, 5.8, 5.8, 3.8, 3, [0.54, 0.68, 0.96], 0.22);
      else drawRuin(-19.5, 0, 21.0, 6.2, 6.2);
      if (isBuilding('library')) drawConstructArray(-19.5, 0, 21.0, 4.2);

      // HALL 5: Đệ Tử Tiên Phong (dorm: -17.5, 0, 2.2) — Spirit-Peach Immortal Grottoes!
      if (isBuilt('dorm')) {
        mb.addImmortalPavilion(-17.5, 0, 2.2, 5.8, 4.6, 3.0, 2, [0.46, 0.84, 0.82], 0.35);
        mb.addImmortalTree(-14.2, 0, 6.2, 'peach', 1.15, 610);
      } else drawRuin(-17.5, 0, 2.2, 5.8, 4.8);
      if (isBuilding('dorm')) drawConstructArray(-17.5, 0, 2.2, 4.0);

      // HALL 6: Luyện Đan Phòng (pharmacy: 19.5, 0, 19.8) — Alchemy Pavilion + Glowing Giant Bronze Cauldron!
      if (isBuilt('pharmacy')) {
        mb.addImmortalPavilion(19.5, 0, 19.8, 5.6, 5.6, 3.4, 2, [0.82, 0.66, 0.34], -0.25);
        mb.addFireBrazier(16.0, 0, 16.5, 1.55, [0.46, 0.98, 0.72]);
        addLight(16.0, 2.2, 16.5, [0.42, 0.98, 0.68], 12.0, 0.18);
      } else drawRuin(19.5, 0, 19.8, 5.8, 5.8);
      if (isBuilding('pharmacy')) drawConstructArray(19.5, 0, 19.8, 4.0);

      // HALL 7: Luyện Khí Đường (smithy: 20.5, 0, 3.8) — Celestial Sword Forge Pavilion + Blazing Fire Braziers!
      if (isBuilt('smithy')) {
        mb.addImmortalPavilion(20.5, 0, 3.8, 5.8, 5.0, 3.2, 2, [0.86, 0.38, 0.24], -0.35);
        mb.addFireBrazier(16.8, 0, 2.0, 1.45, [1.0, 0.52, 0.16]);
        addLight(16.8, 2.2, 2.0, [1.0, 0.52, 0.18], 12.5, 0.22);
      } else drawRuin(20.5, 0, 3.8, 5.8, 5.0);
      if (isBuilding('smithy')) drawConstructArray(20.5, 0, 3.8, 4.0);

      // HALL 8: Linh Thạch Khố (vault: 20.0, 0, -10.5) — Glowing Cyan Spirit Crystal Mine & Vault!
      if (isBuilt('vault')) {
        mb.addImmortalPavilion(20.0, 0, -10.5, 5.4, 5.0, 3.2, 2, [0.44, 0.88, 0.94], -0.42);
        mb.addSpiritCrystal(16.2, 0, -8.5, [0.36, 0.98, 1.0], 1.55, 711);
        mb.addSpiritCrystal(17.5, 0, -13.0, [0.44, 0.96, 0.92], 1.25, 712);
        addLight(16.2, 2.0, -8.5, [0.36, 0.94, 1.0], 12.0, 0.14);
      } else drawRuin(20.0, 0, -10.5, 5.6, 5.2);
      if (isBuilding('vault')) drawConstructArray(20.0, 0, -10.5, 4.0);

      // Lush Spirit-Peach Trees, Emerald Bamboo & Floating Mountain Peaks around the Immortal Island!
      for (const [tx, tz, st, sc] of [
        [-14.5, 13.5, 'peach', 1.35], [14.5, 13.5, 'peach', 1.35],
        [-14.5, -10.5, 'pine', 1.45], [-24.0, 12.0, 'jade', 1.5], [25.0, 12.0, 'peach', 1.45],
        [-10.0, 27.5, 'peach', 1.5], [10.0, 27.5, 'jade', 1.5], [0, 30.5, 'pine', 1.6]
      ]) mb.addImmortalTree(tx, 0, tz, st, sc, 800 + tx * 13 + tz);
      for (const [bx, bz] of [[-12.8, -4.5], [13.2, -4.5], [-22.5, -4.0], [23.5, -4.0]]) mb.addBambooCluster(bx, 0, bz, 6, 1.25, 860 + bx * 11);
      mb.addSectBanner(-10.5, 0, -9.5, [0.22, 0.82, 0.78], 5.0, 0.15);
      mb.addSectBanner(10.5, 0, -9.5, [0.22, 0.82, 0.78], 5.0, -0.15);
      // Lush Wildflowers & Swaying Spirit Grass framing the Immortal Sect lawns!
      for (const [gx, gz, fl] of [
        [-15.2, 9.5, 1], [-16.0, -5.5, 0], [-14.2, 15.6, 1], [15.4, 10.2, 1], [15.2, -5.0, 0],
        [14.5, 15.2, 1], [-8.5, -12.5, 1], [8.5, -12.5, 1], [-18.0, 14.5, 0], [18.5, 13.0, 0],
        [-12.2, 26.2, 1], [12.2, 26.2, 1]
      ]) {
        if (fl) mb.addWildflowerPatch(gx, 0, gz, (gx > 0 ? [1.0, 0.86, 0.44] : [1.0, 0.68, 0.88]), 2800 + Math.floor(gx * 13 + gz * 7));
        else mb.addGrassTuft(gx, 0, gz, [0.24, 0.76, 0.48], 1.25, 2850 + Math.floor(gx * 17 + gz * 9));
      }
      // Framing Floating Immortal Sky Islands + Sea of Clouds visible right inside default Town overview!
      mb.addFloatingSkyIsland(-22.5, 4.8, 28.5, 4.2, 906);
      mb.addFloatingSkyIsland(26.0, 5.6, 27.5, 4.5, 907);
      mb.addFloatingSkyIsland(-38, 11.5, 36, 6.2, 901);
      mb.addFloatingSkyIsland(40, 14.0, 34, 6.8, 902);
      mb.addFloatingSkyIsland(0, 18.5, 48, 7.6, 903);
      mb.addFloatingSkyIsland(-44, 7.5, 4, 4.8, 904);
      mb.addFloatingSkyIsland(45, 8.2, 6, 5.2, 905);
      for (const [cx, cy, cz, cr, sd] of [
        [-28, -2.5, 22, 8.5, 921], [29, -2.2, 20, 9.0, 922], [0, -3.0, 38, 12.0, 923],
        [-32, -3.2, -6, 8.0, 924], [32, -3.0, -8, 8.5, 925]
      ]) mb.addCloudBank(cx, cy, cz, cr, 1.4, [0.95, 0.98, 1.0], sd);
      mb.addHorizonMountains(56, 24, [0.38, 0.62, 0.68], [0.28, 0.50, 0.62], 99);

      const scene = { group: mb.upload(this.gl), lights };
      this._townCache = { sig, scene };
      return scene;
    }
  }

  window.MurimEnv3D = MurimEnv3D;
  window.getMurimBiomeTheme = getBiomeTheme;
})();
