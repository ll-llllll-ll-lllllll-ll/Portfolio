"use strict";

/* Ruin Archive miniature frame v3.3
   No index drawer. Restores the earlier, more expressive fracture language:
   larger stone bites, branching cracks and a transferred corner fracture.
   The frame depth is controlled by CSS and is now about 60% of the original. */
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

    var titleCrackRng = rngFor(shell, "main-frame-top-notch-crack-v132-" + titleSide);
    var titleDir = titleSide === "left" ? -1 : 1;
    organicCrack(
      main,
      root,
      {
        x: root.x + titleDir * (17 + titleCrackRng() * 21),
        y: Math.max(2, root.y - (29 + titleCrackRng() * 27))
      },
      titleCrackRng,
      "ruin-fracture-crack",
      0.70,
      4.2,
      5
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

    /* Outward crack tree from the lower-right damage. */
    var outRng = rngFor(shell, "main-frame-right-outward-tree-v132");
    var junction = {
      x: loRoot.x + 47 + outRng() * 23,
      y: loRoot.y + 8 + outRng() * 11
    };

    organicCrack(
      main, loRoot, junction, outRng,
      "ruin-fracture-crack ruin-fracture-outward-stem", 0.62, 2.6, 5
    );

    organicCrack(
      main,
      junction,
      { x: Math.min(w - 4, junction.x + 105), y: junction.y - (5 + outRng() * 10) },
      outRng,
      "ruin-fracture-crack ruin-fracture-outward-branch",
      0.55,
      2.6,
      5
    );

    var downEnd = {
      x: Math.min(w - 5, junction.x + 86),
      y: junction.y + 54 + outRng() * 23
    };

    organicCrack(
      main, junction, downEnd, outRng,
      "ruin-fracture-crack ruin-fracture-outward-branch", 0.52, 3, 5
    );

    if (outRng() < 0.76) {
      organicCrack(
        main,
        pt(junction, downEnd, 0.44),
        { x: Math.min(w - 5, junction.x + 72), y: junction.y + 74 },
        outRng,
        "ruin-fracture-crack ruin-fracture-outward-branch",
        0.40,
        2.0,
        4
      );
    }

    /* Outer top-left spall and transferred fracture, restored from the older
       frame system. It makes the break read as material failure rather than
       a decorative line laid over the map. */
    var outerTL = { x: 0.5, y: 0.5 };
    var innerTL = { x: il, y: it };
    var prng = rngFor(shell, "perspective-top-left-v132");

    var chip = naturalChip(perspective, outerTL, innerTL, prng, {
      width: 42 + prng() * 18,
      depth: 4.0 + prng() * 2.8,
      normalSign: 1,
      t: 0.48 + prng() * 0.20,
      opacity: 0.90,
      returnInset: 1,
      className: "ruin-fracture-border ruin-fracture-spall-major",
      returnClassName: "ruin-fracture-crack ruin-fracture-spall-seam",
      returnOpacity: 0.76
    });

    poly(perspective, [{ x: w - 0.5, y: 0.5 }, tr], "ruin-fracture-border", 0.86);

    /* Lower perspective rails: outer bottom corners return to the two inner
       bottom corners, matching the broken picture-frame construction. */
    poly(
      perspective,
      [{ x: 0.5, y: h - 0.5 }, bl],
      "ruin-fracture-border ruin-fracture-rail",
      0.90
    );
    poly(
      perspective,
      [{ x: w - 0.5, y: h - 0.5 }, br],
      "ruin-fracture-border ruin-fracture-rail",
      0.90
    );

    var transfer = rngFor(shell, "perspective-transfer-v132");
    var attachA = chip.facets[Math.max(0, Math.floor(chip.facets.length * 0.55))] || pt(outerTL, innerTL, 0.62);
    var attachB = pt(chip.p2, innerTL, 0.44);
    var leftEdge = { x: 0.5, y: h * (0.27 + transfer() * 0.20) };
    var mid = { x: (attachA.x + attachB.x) * 0.5, y: (attachA.y + attachB.y) * 0.5 };
    var fork = pt(leftEdge, mid, 0.76);
    var s1 = pt(leftEdge, fork, 0.38);
    var s2 = pt(leftEdge, fork, 0.73);

    organicCrack(perspective, leftEdge, s1, transfer, "ruin-fracture-crack ruin-fracture-corner-stem", 0.49, 5.2, 5);
    organicCrack(perspective, s1, s2, transfer, "ruin-fracture-crack ruin-fracture-corner-stem", 0.53, 4.8, 4);
    organicCrack(perspective, s2, fork, transfer, "ruin-fracture-crack ruin-fracture-corner-stem", 0.57, 5.0, 5);
    organicCrack(perspective, fork, attachA, transfer, "ruin-fracture-crack ruin-fracture-corner-branch", 0.49, 3.4, 4);
    organicCrack(perspective, fork, attachB, transfer, "ruin-fracture-crack ruin-fracture-corner-branch", 0.45, 3.1, 4);

    naturalChip(perspective, pt(outerTL, innerTL, 0.18), pt(outerTL, innerTL, 0.38), transfer, {
      width: 15 + transfer() * 9,
      depth: 1.8 + transfer() * 1.7,
      normalSign: 1,
      t: 0.5,
      opacity: 0.88,
      returnInset: 0.92,
      className: "ruin-fracture-border ruin-fracture-spall-secondary",
      returnClassName: "ruin-fracture-crack ruin-fracture-spall-seam",
      returnOpacity: 0.70
    });

    host.appendChild(perspective);
    host.appendChild(main);
    shell.dataset.fractureReady = "true";
  }

  function enhance() {
    var shell = document.querySelector('.room-view[data-room="ruin-atlas"] .ruin-mini-shell');
    if (!shell) return;
    architecture(shell);
    if (shell.dataset.faithfulFrameV32 !== "1") {
      shell.dataset.faithfulFrameV32 = "1";
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
