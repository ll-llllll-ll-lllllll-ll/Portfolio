"use strict";

/* Ruin Archive miniature frame v3.4
   No index drawer. Fractures now follow a material logic: small chipped pits
   live on the four perspective bevels, while cracks cross the frame thickness
   from one boundary to another instead of stopping midway or escaping outside.
   The two right-side ports remain, each with a complete connecting fracture. */
(function () {
  var NS = "http://www.w3.org/2000/svg";
  var resizeRaf = 0;

  function hashString(str) {
    var h = 2166136261 >>> 0;
    for (var i = 0; i < str.length; i += 1) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  function mulberry32(seed) {
    var a = seed >>> 0;
    return function () {
      a |= 0;
      a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function seedFor(shell) {
    var old = Number(shell.dataset.ruinFrameSeed || "");
    if (Number.isFinite(old) && old > 0) return old >>> 0;
    var seed;
    try { seed = crypto.getRandomValues(new Uint32Array(1))[0] >>> 0; }
    catch (_) { seed = ((Date.now() ^ Math.floor(Math.random() * 0xffffffff)) >>> 0); }
    shell.dataset.ruinFrameSeed = String(seed);
    return seed;
  }

  function rngFor(shell, label) {
    return mulberry32((seedFor(shell) ^ hashString(label)) >>> 0);
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function parsePct(shell, name, fallback) {
    var raw = getComputedStyle(shell).getPropertyValue(name).trim();
    if (raw && raw.endsWith("%")) return clamp(parseFloat(raw) / 100, 0, 1);
    return fallback;
  }

  function lerp(a, b, t) { return a + (b - a) * t; }
  function pt(a, b, t) { return { x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) }; }

  function vector(a, b) {
    var dx = b.x - a.x;
    var dy = b.y - a.y;
    var len = Math.hypot(dx, dy) || 1;
    return { dx: dx, dy: dy, len: len, ux: dx / len, uy: dy / len };
  }

  function normal(a, b) {
    var v = vector(a, b);
    return { x: -v.uy, y: v.ux };
  }

  function svgFor(className, w, h) {
    var svg = document.createElementNS(NS, "svg");
    svg.setAttribute("class", "ruin-mini-authored-svg " + className);
    svg.setAttribute("viewBox", "0 0 " + Math.max(1, w) + " " + Math.max(1, h));
    svg.setAttribute("preserveAspectRatio", "none");
    svg.setAttribute("aria-hidden", "true");
    return svg;
  }

  function path(svg, d, cls, opacity) {
    var p = document.createElementNS(NS, "path");
    p.setAttribute("d", d);
    p.setAttribute("class", cls);
    if (opacity != null) p.style.opacity = String(opacity);
    svg.appendChild(p);
    return p;
  }

  function lineD(points) {
    return points.map(function (p, i) {
      return (i === 0 ? "M " : "L ") + p.x.toFixed(2) + " " + p.y.toFixed(2);
    }).join(" ");
  }

  function poly(svg, points, cls, opacity) {
    return path(svg, lineD(points), cls, opacity);
  }

  function organicCrack(svg, a, b, rng, cls, opacity, amplitude, segments) {
    var v = vector(a, b);
    var n = { x: -v.uy, y: v.ux };
    var pts = [a];
    var drift = 0;
    segments = Math.max(3, segments || 5);
    amplitude = amplitude == null ? 4 : amplitude;

    for (var i = 1; i < segments; i += 1) {
      var t = i / segments;
      var base = pt(a, b, t);
      var weight = Math.sin(Math.PI * t);
      drift = drift * 0.42 + (rng() - 0.5) * amplitude * 0.58;
      pts.push({
        x: base.x + n.x * drift * weight,
        y: base.y + n.y * drift * weight
      });
    }

    pts.push(b);
    poly(svg, pts, cls, opacity);
    return pts;
  }


  function throughCrack(svg, a, b, rng, opacity, amplitude, segments) {
    var v = vector(a, b);
    var n = { x: -v.uy, y: v.ux };
    var pts = [a];
    var drift = 0;
    segments = Math.max(4, segments || 6);
    amplitude = amplitude == null ? 5 : amplitude;

    for (var i = 1; i < segments; i += 1) {
      var t = i / segments;
      var base = pt(a, b, t);
      var weight = Math.sin(Math.PI * t);
      drift = drift * 0.30 + (rng() - 0.5) * amplitude * 0.75;
      pts.push({
        x: clamp(base.x + n.x * drift * weight, 0.75, svg.viewBox.baseVal.width - 0.75),
        y: clamp(base.y + n.y * drift * weight, 0.75, svg.viewBox.baseVal.height - 0.75)
      });
    }

    pts.push(b);
    poly(
      svg,
      pts,
      "ruin-fracture-crack ruin-fracture-through",
      opacity == null ? 0.52 : opacity
    );
    return pts;
  }

  function inwardNormal(a, b, center) {
    var n = normal(a, b);
    var mid = pt(a, b, 0.5);
    var plus = { x: mid.x + n.x * 5, y: mid.y + n.y * 5 };
    var minus = { x: mid.x - n.x * 5, y: mid.y - n.y * 5 };

    function dist2(p) {
      var dx = p.x - center.x;
      var dy = p.y - center.y;
      return dx * dx + dy * dy;
    }

    return dist2(plus) < dist2(minus) ? n : { x: -n.x, y: -n.y };
  }

  function damagedBevel(svg, a, b, rng, center, count, label) {
    count = Math.max(0, count || 0);
    if (!count) {
      poly(svg, [a, b], "ruin-fracture-border ruin-fracture-rail", 0.88);
      return [];
    }

    var v = vector(a, b);
    var inward = inwardNormal(a, b, center);
    var slots = [];
    var anchors = [];

    for (var i = 0; i < count; i += 1) {
      var baseT = (i + 1) / (count + 1);
      var t = clamp(baseT + (rng() - 0.5) * 0.13, 0.16, 0.84);
      var half = (5 + rng() * 6) / Math.max(v.len, 1);
      slots.push({
        t0: clamp(t - half, 0.08, 0.90),
        t1: clamp(t + half, 0.10, 0.92),
        depth: 2.1 + rng() * 3.8
      });
    }

    slots.sort(function(x, y) { return x.t0 - y.t0; });

    var pts = [a];
    slots.forEach(function(slot) {
      var p0 = pt(a, b, slot.t0);
      var p1 = pt(a, b, slot.t1);
      var mid = pt(a, b, (slot.t0 + slot.t1) * 0.5);
      var tangent = { x: v.ux, y: v.uy };
      var d = slot.depth;

      var f1 = {
        x: mid.x - tangent.x * 2.4 + inward.x * d * 0.60,
        y: mid.y - tangent.y * 2.4 + inward.y * d * 0.60
      };
      var deepest = {
        x: mid.x + inward.x * d,
        y: mid.y + inward.y * d
      };
      var f2 = {
        x: mid.x + tangent.x * 2.1 + inward.x * d * 0.55,
        y: mid.y + tangent.y * 2.1 + inward.y * d * 0.55
      };

      pts.push(p0, f1, deepest, f2, p1);
      anchors.push(deepest);
    });

    pts.push(b);
    poly(
      svg,
      pts,
      "ruin-fracture-border ruin-fracture-rail ruin-fracture-damaged-bevel",
      0.91
    );

    // A short secondary facet line inside some pits gives the chipped ceramic /
    // glass edge a layered break without creating floating decorative cracks.
    anchors.forEach(function(anchor, i) {
      if (rng() < 0.62) {
        var along = 3.5 + rng() * 3.5;
        poly(
          svg,
          [
            { x: anchor.x - v.ux * along, y: anchor.y - v.uy * along },
            anchor,
            { x: anchor.x + v.ux * along * 0.72, y: anchor.y + v.uy * along * 0.72 }
          ],
          "ruin-fracture-crack ruin-fracture-spall-seam",
          0.54
        );
      }
    });

    return anchors;
  }

  function naturalChip(svg, a, b, rng, opts) {
    opts = opts || {};
    var v = vector(a, b);
    var n = normal(a, b);
    var sign = opts.normalSign == null ? 1 : opts.normalSign;
    var width = Math.min(opts.width == null ? 36 : opts.width, v.len * 0.42);
    var centerT = clamp(opts.t == null ? 0.5 : opts.t, 0.18, 0.82);
    var halfT = width * 0.5 / v.len;
    var p1 = pt(a, b, centerT - halfT);
    var p2 = pt(a, b, centerT + halfT);
    var depth = opts.depth == null ? 4 : opts.depth;
    var tangent = { x: v.ux, y: v.uy };
    var facets = [];
    var count = 7 + Math.floor(rng() * 3);

    for (var i = 1; i < count; i += 1) {
      var u = i / count;
      var base = pt(p1, p2, u);
      var plateau = 0.62 + 0.14 * Math.sin(Math.PI * u);
      var dep = Math.max(depth * 0.34, depth * plateau * (0.90 + (rng() - 0.5) * 0.20));
      facets.push({
        x: base.x + tangent.x * ((rng() - 0.5) * width * 0.012) + n.x * sign * dep,
        y: base.y + tangent.y * ((rng() - 0.5) * width * 0.012) + n.y * sign * dep
      });
    }

    var edge = [a, p1].concat(facets, [p2, b]);
    poly(svg, edge, opts.className || "ruin-fracture-border", opts.opacity == null ? 0.88 : opts.opacity);

    if (opts.returnClassName) {
      var inset = opts.returnInset == null ? 1 : opts.returnInset;
      var c1 = {
        x: p1.x + tangent.x * width * 0.26 + n.x * sign * inset,
        y: p1.y + tangent.y * width * 0.26 + n.y * sign * inset
      };
      var c2 = {
        x: p1.x + tangent.x * width * 0.74 + n.x * sign * inset,
        y: p1.y + tangent.y * width * 0.74 + n.y * sign * inset
      };
      path(
        svg,
        "M " + p1.x.toFixed(2) + " " + p1.y.toFixed(2) +
        " C " + c1.x.toFixed(2) + " " + c1.y.toFixed(2) +
        ", " + c2.x.toFixed(2) + " " + c2.y.toFixed(2) +
        ", " + p2.x.toFixed(2) + " " + p2.y.toFixed(2),
        opts.returnClassName,
        opts.returnOpacity == null ? 0.70 : opts.returnOpacity
      );
    }

    return { p1: p1, p2: p2, facets: facets };
  }

  function architecture(shell) {
    var found = shell.querySelector(".ruin-mini-chassis");
    if (found) return found;

    var c = document.createElement("div");
    c.className = "ruin-mini-chassis";
    c.setAttribute("aria-hidden", "true");
    c.innerHTML =
      '<div class="ruin-mini-coords">31°49′50″◉ 113°8′34″◉</div>' +
      '<div class="ruin-mini-authored-fractures"></div>';
    shell.appendChild(c);
    return c;
  }

  function render(shell) {
    architecture(shell);
    var host = shell.querySelector(".ruin-mini-authored-fractures");
    if (!host) return;

    var r = shell.getBoundingClientRect();
    var w = r.width;
    var h = r.height;
    if (w < 140 || h < 140) return;
    host.innerHTML = "";

    var side = parsePct(shell, "--ruin-mini-frame-side", 0.069);
    var topPct = parsePct(shell, "--ruin-mini-frame-top", 0.036);
    var bottomPct = parsePct(shell, "--ruin-mini-frame-bottom", 0.0624);

    var il = w * side;
    var ir = w * (1 - side);
    var it = h * topPct;
    var ib = h * (1 - bottomPct);

    var tl = { x: il + 0.5, y: it + 0.5 };
    var tr = { x: ir - 0.5, y: it + 0.5 };
    var br = { x: ir - 0.5, y: ib - 0.5 };
    var bl = { x: il + 0.5, y: ib - 0.5 };

    var main = svgFor("ruin-fracture-main-frame", w, h);
    var perspective = svgFor("ruin-fracture-global", w, h);

    /* Top notch: broad faceted bite + return seam + crack. */
    var titleRng = rngFor(shell, "main-frame-top-notch-v132");
    var titleSide = titleRng() < 0.5 ? "left" : "right";
    var t = titleSide === "left" ? 0.13 + titleRng() * 0.20 : 0.67 + titleRng() * 0.18;
    var topV = vector(tl, tr);
    var notchWidth = 25 + titleRng() * 24;
    var half = notchWidth * 0.5 / topV.len;
    var n1 = pt(tl, tr, t - half);
    var n2 = pt(tl, tr, t + half);
    var root = { x: pt(tl, tr, t).x, y: it - (8 + titleRng() * 7) };

    poly(main, [
      tl, n1,
      { x: n1.x + notchWidth * 0.22, y: it - 2.5 },
      root,
      { x: n2.x - notchWidth * 0.16, y: it - 1.8 },
      n2, tr
    ], "ruin-fracture-border", 0.92);

    path(
      main,
      "M " + n1.x.toFixed(2) + " " + n1.y.toFixed(2) +
      " Q " + root.x.toFixed(2) + " " + (it - 1).toFixed(2) +
      " " + n2.x.toFixed(2) + " " + n2.y.toFixed(2),
      "ruin-fracture-crack ruin-fracture-notch-return",
      0.76
    );

    /* Right upper attached bite. */
    var upperRng = rngFor(shell, "main-frame-right-upper-v132");
    var uy = it + (ib - it) * (0.14 + upperRng() * 0.10);
    var uh = 19 + upperRng() * 13;
    var ud = 13 + upperRng() * 10;
    var upStart = { x: ir, y: uy - uh };
    var upEnd = { x: ir, y: uy + uh };

    poly(main, [
      tr, upStart,
      { x: ir + ud * 0.18, y: uy - uh * 0.82 },
      { x: ir + ud * 0.58, y: uy - uh * 0.34 },
      { x: ir + ud, y: uy + uh * 0.10 },
      { x: ir + ud * 0.74, y: uy + uh * 0.58 },
      { x: ir + ud * 0.34, y: uy + uh * 0.88 },
      upEnd
    ], "ruin-fracture-border", 0.94);

    path(
      main,
      "M " + upStart.x.toFixed(2) + " " + upStart.y.toFixed(2) +
      " C " + (ir + 1).toFixed(2) + " " + (uy - uh * 0.55).toFixed(2) +
      ", " + (ir + 1.6).toFixed(2) + " " + uy.toFixed(2) +
      ", " + upEnd.x.toFixed(2) + " " + upEnd.y.toFixed(2),
      "ruin-fracture-crack ruin-fracture-notch-return",
      0.72
    );

    /* Right lower notch, deeper and connected to the outward crack tree. */
    var lowerRng = rngFor(shell, "main-frame-right-lower-v132");
    var ly = it + (ib - it) * (0.66 + lowerRng() * 0.13);
    var lh = 39 + lowerRng() * 31;
    var ld = 7 + lowerRng() * 9;
    var loStart = { x: ir, y: ly - lh * 0.5 };
    var loRoot = { x: ir + ld, y: ly + (lowerRng() - 0.5) * 6 };
    var loEnd = { x: ir, y: ly + lh * 0.5 };

    poly(main, [
      upEnd, loStart,
      { x: ir + ld * 0.20, y: ly - lh * 0.36 },
      { x: ir + ld * 0.62, y: ly - lh * 0.20 },
      loRoot,
      { x: ir + ld * 0.76, y: ly + lh * 0.16 },
      { x: ir + ld * 0.40, y: ly + lh * 0.33 },
      loEnd, br
    ], "ruin-fracture-border", 0.94);

    path(
      main,
      "M " + loStart.x.toFixed(2) + " " + loStart.y.toFixed(2) +
      " C " + (ir + 1).toFixed(2) + " " + (ly - lh * 0.18).toFixed(2) +
      ", " + (ir + 1.1).toFixed(2) + " " + (ly + lh * 0.18).toFixed(2) +
      ", " + loEnd.x.toFixed(2) + " " + loEnd.y.toFixed(2),
      "ruin-fracture-crack ruin-fracture-notch-return",
      0.72
    );

    poly(main, [br, bl], "ruin-fracture-border", 0.78);

    /* Left stone bite. */
    var leftRng = rngFor(shell, "main-frame-left-pit-v132");
    var py = it + (ib - it) * (0.34 + leftRng() * 0.40);
    var ph = Math.min(75, Math.max(36, (ib - it) * (0.065 + leftRng() * 0.05)));
    var pd = 6 + leftRng() * 8;
    var pTop = { x: il, y: py - ph * 0.5 };
    var pBottom = { x: il, y: py + ph * 0.5 };

    poly(main, [bl, pBottom], "ruin-fracture-border", 0.90);
    poly(main, [
      pBottom,
      { x: il - pd * 0.28, y: py + ph * 0.35 },
      { x: il - pd * 0.72, y: py + ph * 0.15 },
      { x: il - pd, y: py - ph * 0.03 },
      { x: il - pd * 0.55, y: py - ph * 0.28 },
      pTop
    ], "ruin-fracture-border", 0.92);
    poly(main, [pTop, tl], "ruin-fracture-border", 0.90);

    /* ---------------------------------------------------------------
       Material fracture system v3.4
       ---------------------------------------------------------------
       1) The four perspective bevels carry chipped pits.
       2) The upper-left bevel always keeps several pits; the others appear
          probabilistically so the frame changes without becoming noisy.
       3) Every crack crosses a complete strip of frame material: inner edge to
          outer edge, or port to outer edge. No suspended half-cracks.
       4) The two right-side ports keep their current geometry and now each
          terminate in a complete connector fracture.
    --------------------------------------------------------------- */

    var outerTL = { x: 0.5, y: 0.5 };
    var outerTR = { x: w - 0.5, y: 0.5 };
    var outerBR = { x: w - 0.5, y: h - 0.5 };
    var outerBL = { x: 0.5, y: h - 0.5 };
    var frameCenter = { x: w * 0.5, y: h * 0.5 };

    var tlBevelRng = rngFor(shell, "bevel-pits-tl-v134");
    var trBevelRng = rngFor(shell, "bevel-pits-tr-v134");
    var blBevelRng = rngFor(shell, "bevel-pits-bl-v134");
    var brBevelRng = rngFor(shell, "bevel-pits-br-v134");

    var tlAnchors = damagedBevel(
      perspective,
      outerTL,
      tl,
      tlBevelRng,
      frameCenter,
      2 + (tlBevelRng() < 0.52 ? 1 : 0),
      "tl"
    );

    var trAnchors = damagedBevel(
      perspective,
      outerTR,
      tr,
      trBevelRng,
      frameCenter,
      trBevelRng() < 0.66 ? 1 + (trBevelRng() < 0.28 ? 1 : 0) : 0,
      "tr"
    );

    var blAnchors = damagedBevel(
      perspective,
      outerBL,
      bl,
      blBevelRng,
      frameCenter,
      blBevelRng() < 0.60 ? 1 + (blBevelRng() < 0.24 ? 1 : 0) : 0,
      "bl"
    );

    var brAnchors = damagedBevel(
      perspective,
      outerBR,
      br,
      brBevelRng,
      frameCenter,
      brBevelRng() < 0.62 ? 1 + (brBevelRng() < 0.26 ? 1 : 0) : 0,
      "br"
    );

    /* Keep the two right ports, but make their connectors complete:
       port tip -> outer right boundary. */
    var upperPortTip = {
      x: ir + ud,
      y: uy + uh * 0.10
    };
    var upperConnectorRng = rngFor(shell, "right-upper-connector-v134");
    throughCrack(
      main,
      upperPortTip,
      {
        x: w - 0.75,
        y: clamp(upperPortTip.y + (upperConnectorRng() - 0.5) * 22, 2, h - 2)
      },
      upperConnectorRng,
      0.58,
      5.6,
      6
    );

    var lowerConnectorRng = rngFor(shell, "right-lower-connector-v134");
    throughCrack(
      main,
      loRoot,
      {
        x: w - 0.75,
        y: clamp(loRoot.y + (lowerConnectorRng() - 0.5) * 30, 2, h - 2)
      },
      lowerConnectorRng,
      0.62,
      6.4,
      6
    );

    /* Additional through-fractures across the frame bands.
       Their endpoints always touch two real boundaries of the material. */
    var topThroughRng = rngFor(shell, "top-through-v134");
    if (topThroughRng() < 0.72) {
      var topX = lerp(il, ir, 0.22 + topThroughRng() * 0.56);
      throughCrack(
        main,
        { x: topX, y: it },
        {
          x: clamp(topX + (topThroughRng() - 0.5) * 34, 2, w - 2),
          y: 0.75
        },
        topThroughRng,
        0.48,
        4.6,
        5
      );
    }

    var leftThroughRng = rngFor(shell, "left-through-v134");
    if (leftThroughRng() < 0.64) {
      var leftY = lerp(it, ib, 0.22 + leftThroughRng() * 0.56);
      throughCrack(
        main,
        { x: il, y: leftY },
        {
          x: 0.75,
          y: clamp(leftY + (leftThroughRng() - 0.5) * 30, 2, h - 2)
        },
        leftThroughRng,
        0.46,
        4.8,
        5
      );
    }

    var bottomThroughRng = rngFor(shell, "bottom-through-v134");
    if (bottomThroughRng() < 0.68) {
      var bottomX = lerp(il, ir, 0.20 + bottomThroughRng() * 0.60);
      throughCrack(
        main,
        { x: bottomX, y: ib },
        {
          x: clamp(bottomX + (bottomThroughRng() - 0.5) * 38, 2, w - 2),
          y: h - 0.75
        },
        bottomThroughRng,
        0.45,
        5.0,
        5
      );
    }

    /* If a chipped bevel exists near a through-fracture, connect one chip back
       to the nearest frame boundary. These are short, complete material cracks,
       never floating branches. */
    if (tlAnchors.length) {
      var aTL = tlAnchors[0];
      var tlLinkRng = rngFor(shell, "tl-chip-through-v134");
      throughCrack(
        perspective,
        aTL,
        aTL.x < aTL.y ? { x: 0.75, y: aTL.y } : { x: aTL.x, y: 0.75 },
        tlLinkRng,
        0.38,
        2.8,
        4
      );
    }

    if (trAnchors.length) {
      var aTR = trAnchors[0];
      var trLinkRng = rngFor(shell, "tr-chip-through-v134");
      throughCrack(
        perspective,
        aTR,
        (w - aTR.x) < aTR.y ? { x: w - 0.75, y: aTR.y } : { x: aTR.x, y: 0.75 },
        trLinkRng,
        0.34,
        2.6,
        4
      );
    }

    if (blAnchors.length) {
      var aBL = blAnchors[0];
      var blLinkRng = rngFor(shell, "bl-chip-through-v134");
      throughCrack(
        perspective,
        aBL,
        aBL.x < (h - aBL.y) ? { x: 0.75, y: aBL.y } : { x: aBL.x, y: h - 0.75 },
        blLinkRng,
        0.34,
        2.6,
        4
      );
    }

    if (brAnchors.length) {
      var aBR = brAnchors[0];
      var brLinkRng = rngFor(shell, "br-chip-through-v134");
      throughCrack(
        perspective,
        aBR,
        (w - aBR.x) < (h - aBR.y) ? { x: w - 0.75, y: aBR.y } : { x: aBR.x, y: h - 0.75 },
        brLinkRng,
        0.34,
        2.6,
        4
      );
    }

    host.appendChild(perspective);
    host.appendChild(main);
    shell.dataset.fractureReady = "true";
  }

  function enhance() {
    var shell = document.querySelector('.room-view[data-room="ruin-atlas"] .ruin-mini-shell');
    if (!shell) return;
    architecture(shell);
    if (shell.dataset.faithfulFrameV34 !== "1") {
      shell.dataset.faithfulFrameV34 = "1";
      requestAnimationFrame(function () { render(shell); });
    }
  }

  function schedule() {
    cancelAnimationFrame(resizeRaf);
    resizeRaf = requestAnimationFrame(function () {
      resizeRaf = 0;
      enhance();
      var shell = document.querySelector('.room-view[data-room="ruin-atlas"] .ruin-mini-shell');
      if (shell) render(shell);
    });
  }

  var app = document.getElementById("app");
  if (app && window.MutationObserver) {
    new MutationObserver(function () {
      requestAnimationFrame(enhance);
    }).observe(app, { childList: true, subtree: true });
  }

  window.addEventListener("resize", schedule, { passive: true });
  window.addEventListener("orientationchange", schedule, { passive: true });
  requestAnimationFrame(enhance);
})();
