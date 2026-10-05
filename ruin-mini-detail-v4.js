"use strict";

/* Ruin Archive miniature detail pass v4.2
   The first stele port was too literal for this shallow miniature handle:
   full stone-cell partitions turned into two oversized V-shaped cuts.
   This revision adapts the production MOBILE Index Drawer treatment instead:
   keep the authored trapezoid/frosted slab, then add only 1–3 restrained,
   faceted rubbing fractures inside the visible handle. */
(function () {
  var NS = "http://www.w3.org/2000/svg";
  var observers = new WeakMap();
  var mutationRaf = 0;

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
    var existing = Number(shell.dataset.ruinMobileDrawerSeed || "");
    if (Number.isFinite(existing) && existing > 0) return existing >>> 0;
    var seed;
    try { seed = crypto.getRandomValues(new Uint32Array(1))[0] >>> 0; }
    catch (_) { seed = ((Date.now() ^ Math.floor(Math.random() * 0xffffffff)) >>> 0); }
    shell.dataset.ruinMobileDrawerSeed = String(seed);
    return seed;
  }

  function parsePct(shell, name, fallback) {
    var raw = getComputedStyle(shell).getPropertyValue(name).trim();
    if (!raw) return fallback;
    if (raw.endsWith("%")) return clamp(parseFloat(raw) / 100, 0, 1);
    return fallback;
  }

  function svgEl(name, attrs) {
    var el = document.createElementNS(NS, name);
    Object.keys(attrs || {}).forEach(function (key) {
      el.setAttribute(key, attrs[key]);
    });
    return el;
  }

  function pathD(points) {
    return points.map(function (p, i) {
      return (i ? "L " : "M ") + p.x.toFixed(2) + " " + p.y.toFixed(2);
    }).join(" ");
  }

  function makeDrawerFracture(rng, x1, y1, x2, y2, height) {
    var dx = x2 - x1;
    var dy = y2 - y1;
    var len = Math.max(1, Math.hypot(dx, dy));
    var tx = dx / len;
    var ty = dy / len;
    var nx = -ty;
    var ny = tx;
    var count = 10 + Math.floor(rng() * 4);
    var amp = clamp(height * 0.050, 2.0, 4.8);
    var pts = [];
    var facet = 0;

    for (var i = 0; i < count; i += 1) {
      var t = i / (count - 1);
      var fade = Math.sin(Math.PI * t);

      if (i > 0 && i < count - 1) {
        facet = facet * 0.72 + (rng() - 0.5) * 0.72;
        if (rng() < 0.14) {
          facet += (rng() < 0.5 ? -1 : 1) * (0.14 + rng() * 0.26);
        }
        facet = clamp(facet, -1, 1);
      } else {
        facet = 0;
      }

      var normalOffset = facet * amp * fade;
      var alongOffset = (i === 0 || i === count - 1)
        ? 0
        : (rng() - 0.5) * Math.min(1.1, len * 0.012);

      pts.push({
        x: x1 + dx * t + tx * alongOffset + nx * normalOffset,
        y: y1 + dy * t + ty * alongOffset + ny * normalOffset
      });
    }
    return pts;
  }

  function detachTone(shell) {
    var tone = shell.querySelector(".ruin-mini-tone-control");
    if (!tone) return;
    if (tone.parentElement !== shell) shell.appendChild(tone);
    tone.classList.remove("leaflet-bar", "leaflet-control");
    tone.classList.add("ruin-mini-tone-detached");
    tone.style.removeProperty("margin");
  }

  function cleanLabels(shell) {
    shell.querySelectorAll(".ruin-mini-index-labels").forEach(function (node) {
      node.remove();
    });
  }

  function removeOldStele(shell) {
    shell.querySelectorAll(".ruin-mini-stele-layer").forEach(function (node) {
      node.remove();
    });
  }

  function renderMobileDrawer(shell, force) {
    var drawer = shell.querySelector(".ruin-mini-index-drawer");
    if (!drawer) return;

    var rect = shell.getBoundingClientRect();
    var w = rect.width;
    var h = rect.height;
    if (w < 180 || h < 140) return;

    var side = parsePct(shell, "--ruin-mini-frame-side", 0.115);
    var bottom = parsePct(shell, "--ruin-mini-frame-bottom", 0.104);
    var handleH = Math.max(34, h * bottom);
    var handleTop = h - handleH;
    var leftInset = w * side;
    var rightInset = w * side;

    var seed = seedFor(shell);
    var key = [
      Math.round(w),
      Math.round(h),
      Math.round(handleH),
      seed
    ].join("x");

    var layer = drawer.querySelector(".ruin-mini-mobile-stele-layer");
    if (!layer) {
      layer = document.createElement("div");
      layer.className = "ruin-mini-mobile-stele-layer";
      layer.setAttribute("aria-hidden", "true");
      drawer.appendChild(layer);
    }

    if (!force && layer.dataset.renderKey === key) return;
    layer.dataset.renderKey = key;
    layer.style.top = handleTop.toFixed(2) + "px";
    layer.style.height = handleH.toFixed(2) + "px";
    layer.replaceChildren();

    var svg = svgEl("svg", {
      viewBox: "0 0 " + w.toFixed(2) + " " + handleH.toFixed(2),
      preserveAspectRatio: "none",
      class: "ruin-mini-mobile-stele-svg",
      "aria-hidden": "true",
      focusable: "false"
    });

    var defs = svgEl("defs");
    var clip = svgEl("clipPath", { id: "ruin-mini-mobile-stele-clip-" + (seed >>> 0) });
    var polygon = svgEl("polygon", {
      points:
        "0," + handleH.toFixed(2) + " " +
        leftInset.toFixed(2) + ",0 " +
        (w - rightInset).toFixed(2) + ",0 " +
        w.toFixed(2) + "," + handleH.toFixed(2)
    });
    clip.appendChild(polygon);
    defs.appendChild(clip);
    svg.appendChild(defs);

    var group = svgEl("g", {
      "clip-path": "url(#ruin-mini-mobile-stele-clip-" + (seed >>> 0) + ")"
    });
    svg.appendChild(group);

    /* Production mobile drawer rule: 1–3 correlated, faceted fracture traces. */
    var local = mulberry32((seed ^ hash32(
      Math.round(w) + "x" + Math.round(handleH) + "-mobile-drawer-stele-v3745"
    )) >>> 0);
    var lineCount = 1 + Math.floor(local() * 3);

    for (var i = 0; i < lineCount; i += 1) {
      var lineRng = mulberry32((seed ^ hash32(
        "mobile-drawer-stele-line-" + i + "-v3745"
      )) >>> 0);
      var xBase = w * (0.20 + local() * 0.60);
      var drift = w * (0.02 + local() * 0.08);
      var topY = Math.min(handleH * 0.18, 4 + local() * 8);
      var bottomY = handleH * (0.70 + local() * 0.22);
      var pts = makeDrawerFracture(
        lineRng,
        xBase,
        topY,
        xBase + (local() < 0.5 ? -1 : 1) * drift,
        bottomY,
        handleH
      );

      var path = svgEl("path", {
        d: pathD(pts),
        class: "ruin-mini-mobile-stele-fracture-line",
        "vector-effect": "non-scaling-stroke"
      });
      group.appendChild(path);
    }

    layer.appendChild(svg);
  }

  function installShell(shell) {
    if (!shell || !shell.isConnected) return;

    cleanLabels(shell);
    detachTone(shell);
    removeOldStele(shell);
    renderMobileDrawer(shell, false);

    if (!observers.has(shell) && "ResizeObserver" in window) {
      var resizeRaf = 0;
      var ro = new ResizeObserver(function () {
        cancelAnimationFrame(resizeRaf);
        resizeRaf = requestAnimationFrame(function () {
          cleanLabels(shell);
          detachTone(shell);
          removeOldStele(shell);
          renderMobileDrawer(shell, false);
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

  function scheduleScan() {
    if (mutationRaf) return;
    mutationRaf = requestAnimationFrame(function () {
      mutationRaf = 0;
      scan();
    });
  }

  var observer = new MutationObserver(function (records) {
    var relevant = records.some(function (record) {
      return Array.from(record.addedNodes || []).some(function (node) {
        return node.nodeType === 1 &&
          (node.matches?.('.room-view[data-room="ruin-atlas"], .ruin-mini-shell') ||
           node.querySelector?.('.room-view[data-room="ruin-atlas"] .ruin-mini-shell, .ruin-mini-shell'));
      });
    });
    if (relevant) scheduleScan();
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });

  window.addEventListener("hashchange", scheduleScan);
  window.addEventListener("pageshow", scheduleScan, { passive: true });
  document.addEventListener("DOMContentLoaded", scheduleScan, { once: true });
  scheduleScan();
})();
