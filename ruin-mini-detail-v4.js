"use strict";

/* Ruin Archive miniature detail pass v4
   - detach the five-step reading environment control from Leaflet chrome
   - remove miniature bottom labels
   - port the Index Drawer fractured-stele / frosted-rubbing logic into the
     compact drawer without changing the real Leaflet map underneath. */
(function () {
  var NS = "http://www.w3.org/2000/svg";
  var raf = 0;
  var observers = new WeakMap();

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function hash32(str) {
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
    var existing = Number(shell.dataset.ruinSteleSeed || "");
    if (Number.isFinite(existing) && existing > 0) return existing >>> 0;
    var seed;
    try { seed = crypto.getRandomValues(new Uint32Array(1))[0] >>> 0; }
    catch (_) { seed = ((Date.now() ^ Math.floor(Math.random() * 0xffffffff)) >>> 0); }
    shell.dataset.ruinSteleSeed = String(seed);
    return seed;
  }

  function polygonArea(points) {
    var sum = 0;
    for (var i = 0; i < points.length; i += 1) {
      var a = points[i];
      var b = points[(i + 1) % points.length];
      sum += a.x * b.y - b.x * a.y;
    }
    return Math.abs(sum) * 0.5;
  }

  function centroid(points) {
    var x = 0, y = 0;
    points.forEach(function (p) { x += p.x; y += p.y; });
    return { x: x / points.length, y: y / points.length };
  }

  function signedDistance(point, origin, normal) {
    return (point.x - origin.x) * normal.x + (point.y - origin.y) * normal.y;
  }

  function clipHalfPlane(points, origin, normal, threshold, keepGreater) {
    var out = [];
    function inside(p) {
      var d = signedDistance(p, origin, normal);
      return keepGreater ? d >= threshold : d <= threshold;
    }
    function intersect(a, b) {
      var da = signedDistance(a, origin, normal) - threshold;
      var db = signedDistance(b, origin, normal) - threshold;
      var denom = da - db;
      var t = Math.abs(denom) < 1e-9 ? 0.5 : da / denom;
      t = clamp(t, 0, 1);
      return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
    }
    for (var i = 0; i < points.length; i += 1) {
      var a = points[i];
      var b = points[(i + 1) % points.length];
      var ain = inside(a), bin = inside(b);
      if (ain && bin) out.push({ x: b.x, y: b.y });
      else if (ain && !bin) out.push(intersect(a, b));
      else if (!ain && bin) {
        out.push(intersect(a, b));
        out.push({ x: b.x, y: b.y });
      }
    }
    return out;
  }

  function lineHits(points, origin, dir) {
    var hits = [];
    function cross(a, b) { return a.x * b.y - a.y * b.x; }
    for (var i = 0; i < points.length; i += 1) {
      var a = points[i], b = points[(i + 1) % points.length];
      var edge = { x: b.x - a.x, y: b.y - a.y };
      var rel = { x: a.x - origin.x, y: a.y - origin.y };
      var denom = cross(dir, edge);
      if (Math.abs(denom) < 1e-8) continue;
      var t = cross(rel, edge) / denom;
      var u = cross(rel, dir) / denom;
      if (u >= -1e-6 && u <= 1 + 1e-6) {
        hits.push({ x: origin.x + dir.x * t, y: origin.y + dir.y * t, t: t });
      }
    }
    hits.sort(function (a, b) { return a.t - b.t; });
    return hits;
  }

  function splitCell(cell, angleDeg, rng, gap) {
    var c = centroid(cell);
    var theta = angleDeg * Math.PI / 180;
    var dir = { x: Math.cos(theta), y: Math.sin(theta) };
    var normal = { x: -dir.y, y: dir.x };
    var origin = {
      x: c.x + (rng() - 0.5) * 22,
      y: c.y + (rng() - 0.5) * 8
    };
    var hits = lineHits(cell, origin, dir);
    if (hits.length < 2) return null;

    var left = clipHalfPlane(cell, origin, normal, -gap * 0.5, false);
    var right = clipHalfPlane(cell, origin, normal, gap * 0.5, true);
    if (left.length < 3 || right.length < 3) return null;
    if (polygonArea(left) < 850 || polygonArea(right) < 850) return null;

    return {
      cells: [left, right],
      crack: [hits[0], hits[hits.length - 1]]
    };
  }

  function weightedIndex(cells, rng) {
    var weights = cells.map(function (cell) { return Math.max(0, polygonArea(cell) - 650); });
    var total = weights.reduce(function (a, b) { return a + b; }, 0);
    if (total <= 0) return -1;
    var r = rng() * total;
    for (var i = 0; i < weights.length; i += 1) {
      r -= weights[i];
      if (r <= 0) return i;
    }
    return cells.length - 1;
  }

  function roughCrack(a, b, rng) {
    var dx = b.x - a.x, dy = b.y - a.y;
    var len = Math.hypot(dx, dy) || 1;
    var nx = -dy / len, ny = dx / len;
    var points = [a];
    var drift = 0;
    var segments = 5 + Math.floor(rng() * 3);
    for (var i = 1; i < segments; i += 1) {
      var t = i / segments;
      var envelope = Math.sin(Math.PI * t);
      drift = drift * 0.42 + (rng() - 0.5) * 1.9;
      points.push({
        x: a.x + dx * t + nx * drift * envelope,
        y: a.y + dy * t + ny * drift * envelope
      });
    }
    points.push(b);
    return points;
  }

  function pathD(points, close) {
    var d = points.map(function (p, i) {
      return (i ? "L" : "M") + " " + p.x.toFixed(2) + " " + p.y.toFixed(2);
    }).join(" ");
    return close ? d + " Z" : d;
  }

  function svgEl(name, attrs) {
    var el = document.createElementNS(NS, name);
    Object.keys(attrs || {}).forEach(function (key) { el.setAttribute(key, attrs[key]); });
    return el;
  }

  function maskUrl(cells, w, h) {
    var polygons = cells.map(function (cell) {
      var pts = cell.map(function (p) { return p.x.toFixed(2) + "," + p.y.toFixed(2); }).join(" ");
      return '<polygon points="' + pts + '" fill="white"/>';
    }).join("");
    var svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + w.toFixed(2) + ' ' + h.toFixed(2) + '" preserveAspectRatio="none">' + polygons + '</svg>';
    return 'url("data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg) + '")';
  }

  function parsePct(shell, name, fallback) {
    var raw = getComputedStyle(shell).getPropertyValue(name).trim();
    if (!raw) return fallback;
    if (raw.endsWith("%")) return clamp(parseFloat(raw) / 100, 0, 1);
    return fallback;
  }

  function renderStele(shell) {
    var drawer = shell.querySelector(".ruin-mini-index-drawer");
    if (!drawer) return;

    var rect = shell.getBoundingClientRect();
    var w = rect.width, h = rect.height;
    if (w < 180 || h < 140) return;

    var side = parsePct(shell, "--ruin-mini-frame-side", 0.115);
    var bottom = parsePct(shell, "--ruin-mini-frame-bottom", 0.104);
    var topY = h * (1 - bottom);
    var left = w * side;
    var right = w * (1 - side);
    var silhouette = [
      { x: 0.8, y: h - 0.8 },
      { x: left, y: topY },
      { x: right, y: topY },
      { x: w - 0.8, y: h - 0.8 }
    ];

    var seed = seedFor(shell) ^ hash32(Math.round(w) + "x" + Math.round(h) + "-mini-stele-v4");
    var rng = mulberry32(seed >>> 0);
    var cells = [silhouette];
    var cracks = [];
    var compact = w < 680;
    var target = compact ? (rng() < 0.72 ? 1 : 2) : (rng() < 0.34 ? 1 : (rng() < 0.78 ? 2 : 3));
    var anglePools = [[48, 69], [111, 132], [78, 96]];
    var attempts = 0;

    while (cracks.length < target && attempts++ < 24) {
      var index = weightedIndex(cells, rng);
      if (index < 0) break;
      var pool = anglePools[Math.floor(rng() * anglePools.length)];
      var angle = pool[0] + rng() * (pool[1] - pool[0]);
      var gap = (compact ? 1.4 : 1.8) + rng() * (compact ? 1.3 : 1.8);
      var result = splitCell(cells[index], angle, rng, gap);
      if (!result) continue;
      cells.splice(index, 1, result.cells[0], result.cells[1]);
      cracks.push(result.crack);
    }

    var layer = drawer.querySelector(".ruin-mini-stele-layer");
    if (!layer) {
      layer = document.createElement("div");
      layer.className = "ruin-mini-stele-layer";
      layer.setAttribute("aria-hidden", "true");
      drawer.appendChild(layer);
    }
    layer.replaceChildren();

    var frost = document.createElement("div");
    frost.className = "ruin-mini-stele-frost";
    var mask = maskUrl(cells, w, h);
    frost.style.maskImage = mask;
    frost.style.webkitMaskImage = mask;
    layer.appendChild(frost);

    var svg = svgEl("svg", {
      viewBox: "0 0 " + w + " " + h,
      preserveAspectRatio: "none",
      class: "ruin-mini-stele-svg",
      "aria-hidden": "true"
    });

    cells.forEach(function (cell, index) {
      var local = mulberry32((seed ^ hash32("stone-" + index)) >>> 0);
      var face = svgEl("path", {
        d: pathD(cell, true),
        class: "ruin-mini-stele-fragment",
        "vector-effect": "non-scaling-stroke"
      });
      face.style.setProperty("--stone-alpha", (0.84 + local() * 0.065).toFixed(3));
      face.style.setProperty("--stone-stroke-alpha", (0.72 + local() * 0.15).toFixed(3));
      face.style.setProperty("--stone-stroke-width", (0.72 + local() * 0.16).toFixed(3));
      svg.appendChild(face);
    });

    cracks.forEach(function (pair, index) {
      var local = mulberry32((seed ^ hash32("crack-" + index)) >>> 0);
      var rough = roughCrack(pair[0], pair[1], local);
      var gapPath = svgEl("path", {
        d: pathD(rough, false),
        class: "ruin-mini-stele-gap",
        "vector-effect": "non-scaling-stroke"
      });
      var seamPath = svgEl("path", {
        d: pathD(rough, false),
        class: "ruin-mini-stele-seam",
        "vector-effect": "non-scaling-stroke"
      });
      svg.appendChild(gapPath);
      svg.appendChild(seamPath);
    });

    layer.appendChild(svg);
    drawer.classList.add("ruin-mini-stele-ready");
    shell.dataset.ruinSteleFragments = String(cells.length);
  }

  function detachTone(shell) {
    var tone = shell.querySelector(".ruin-mini-tone-control");
    if (!tone) return false;
    if (tone.parentElement !== shell) shell.appendChild(tone);
    tone.classList.remove("leaflet-bar", "leaflet-control");
    tone.classList.add("ruin-mini-tone-detached");
    tone.style.removeProperty("margin");
    return true;
  }

  function cleanLabels(shell) {
    shell.querySelectorAll(".ruin-mini-index-labels").forEach(function (node) { node.remove(); });
  }

  function installShell(shell) {
    if (!shell || !shell.isConnected) return;
    cleanLabels(shell);
    detachTone(shell);
    renderStele(shell);

    if (!observers.has(shell) && "ResizeObserver" in window) {
      var ro = new ResizeObserver(function () {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(function () {
          cleanLabels(shell);
          detachTone(shell);
          renderStele(shell);
        });
      });
      ro.observe(shell);
      observers.set(shell, ro);
    }
  }

  function scan() {
    var shell = document.querySelector('.room-view[data-room="ruin-atlas"] .ruin-mini-shell');
    if (shell) installShell(shell);
  }

  var mutationRaf = 0;
  function scheduleScan() {
    if (mutationRaf) return;
    mutationRaf = requestAnimationFrame(function () {
      mutationRaf = 0;
      scan();
    });
  }

  var observer = new MutationObserver(scheduleScan);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  window.addEventListener("hashchange", scheduleScan);
  window.addEventListener("pageshow", scheduleScan, { passive: true });
  document.addEventListener("DOMContentLoaded", scheduleScan, { once: true });
  scheduleScan();
})();
