from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
script_path = ROOT / "script.js"
style_path = ROOT / "style.css"
index_path = ROOT / "index.html"

script = script_path.read_text(encoding="utf-8")
style = style_path.read_text(encoding="utf-8")
index = index_path.read_text(encoding="utf-8")


def replace_once(text, old, new, label):
    if old not in text:
        raise SystemExit(f"missing anchor: {label}")
    return text.replace(old, new, 1)


# ---------------------------------------------------------------------------
# 1. Remove the old LQY identity everywhere in text-like project files.
# ---------------------------------------------------------------------------
text_suffixes = {".html", ".js", ".css", ".json", ".xml", ".txt", ".yml", ".yaml", ".webmanifest"}
for path in ROOT.rglob("*"):
    if not path.is_file() or ".git" in path.parts or path.suffix.lower() not in text_suffixes:
        continue
    try:
        raw = path.read_text(encoding="utf-8")
    except UnicodeDecodeError:
        continue
    updated = re.sub(r"\bLQY\b", "sky-sea-lake-cloud", raw, flags=re.IGNORECASE)
    if updated != raw:
        path.write_text(updated, encoding="utf-8")

script = script_path.read_text(encoding="utf-8")
style = style_path.read_text(encoding="utf-8")
index = index_path.read_text(encoding="utf-8")

# Belt-and-suspenders identity metadata. document.title is also changed by the
# global text replacement above, but these tags prevent stale app/tab naming.
if 'name="application-name"' not in index:
    index = replace_once(
        index,
        "    <title>sky-sea-lake-cloud</title>",
        "    <title>sky-sea-lake-cloud</title>\n    <meta name=\"application-name\" content=\"sky-sea-lake-cloud\" />\n    <meta name=\"apple-mobile-web-app-title\" content=\"sky-sea-lake-cloud\" />\n    <meta property=\"og:site_name\" content=\"sky-sea-lake-cloud\" />",
        "identity metadata",
    )

# ---------------------------------------------------------------------------
# 2. Ruin Atlas becomes a real lightweight Leaflet module instead of the old
#    generic contained image stage. Keep the long-form notes beneath it.
# ---------------------------------------------------------------------------
ruin_slug = '    slug: "ruin-atlas",'
ruin_pos = script.find(ruin_slug)
if ruin_pos < 0:
    raise SystemExit("missing ruin-atlas data block")
images_pos = script.find("    images: [", ruin_pos)
notes_pos = script.find("    notes: [", images_pos)
if images_pos < 0 or notes_pos < 0:
    raise SystemExit("missing ruin-atlas image/notes anchors")
script = script[:images_pos] + "    images: [],\n" + script[notes_pos:]

preview_helper = r'''
function renderRuinAtlasPreview() {
  var updatedCopy = {
    zh: "地点更新于 [2026 10 3]",
    en: "sites updated [2026 10 3]",
    ja: "地点更新 [2026 10 3]"
  };
  var ariaCopy = {
    zh: "墟域图·遗构馆 互动地图",
    en: "Ruin Archive interactive map",
    ja: "墟域図・遺構館 インタラクティブ地図"
  };

  return '<section class="ruin-mini-section">' +
    '<div class="ruin-mini-shell" data-tone="22">' +
      '<div id="ruin-mini-map" class="ruin-mini-map" role="region" aria-label="' + escapeHtml(ariaCopy[state.lang] || ariaCopy.en) + '"></div>' +
      '<div class="ruin-mini-fracture-host" aria-hidden="true"></div>' +
    '</div>' +
    '<p class="ruin-mini-updated">' + escapeHtml(updatedCopy[state.lang] || updatedCopy.en) + '</p>' +
  '</section>';
}

'''
if "function renderRuinAtlasPreview()" not in script:
    script = replace_once(script, "function renderRoom(item) {", preview_helper + "function renderRoom(item) {", "renderRoom function")

image_loop_anchor = '  images.forEach(function(image, index) {'
if 'if (item.slug === "ruin-atlas") {' not in script:
    script = replace_once(
        script,
        image_loop_anchor,
        '  if (item.slug === "ruin-atlas") {\n    html += renderRuinAtlasPreview();\n  }\n\n' + image_loop_anchor,
        "ruin atlas preview insertion",
    )

# ---------------------------------------------------------------------------
# 3. Lightweight Leaflet simulation of the archive map.
#    - same 4000×3000 CRS.Simple world
#    - current ruin-map.svg from the archive site
#    - live site-data.js markers, with a small baked fallback
#    - same five reading-environment steps and map membrane logic
#    - procedural fractured transparent edge derived from main site logic
# ---------------------------------------------------------------------------
mini_runtime = r'''
  var ruinMiniLeafletPromise = null;
  var ruinMiniSitesPromise = null;
  var ruinMiniMapInstance = null;
  var ruinMiniMountToken = 0;

  var RUIN_MINI_TONE_STEPS = [0, 22, 45, 60, 100];
  var RUIN_MINI_TONE_KEY = "ruin-reader-tone";
  var RUIN_MINI_WARM_POINT = 45;
  var RUIN_MINI_PALETTES = {
    paper: {
      bg: [255, 255, 251], paper: [255, 255, 251], text: [28, 28, 26],
      muted: [103, 103, 97], line: [205, 205, 197], lineStrong: [102, 102, 96], marker: [17, 17, 17]
    },
    warm: {
      bg: [235, 227, 209], paper: [243, 235, 218], text: [50, 47, 42],
      muted: [103, 96, 84], line: [193, 183, 161], lineStrong: [112, 105, 91], marker: [57, 52, 44]
    },
    night: {
      bg: [25, 26, 24], paper: [31, 32, 30], text: [204, 201, 191],
      muted: [143, 141, 133], line: [66, 67, 62], lineStrong: [121, 120, 112], marker: [202, 199, 188]
    }
  };

  var RUIN_MINI_FALLBACK_SITES = [
    { name: "瘟猪坝沉墟", lat: 30.454417, lng: 104.047667, archiveDate: "2025.04", type: "garden" },
    { name: "电台路焦土", lat: 31.225833, lng: 121.618333, archiveDate: "2026.03", type: "garden" },
    { name: "山葬灰脉", lat: 32.04174, lng: 119.83912, archiveDate: "2017.08", type: "record" },
    { name: "硅脉遗厂", lat: 31.1936472, lng: 121.6131444, archiveDate: "2018.05", type: "record" },
    { name: "裂翼坪", lat: 41.860278, lng: -87.606111, archiveDate: "2021.08", type: "record" },
    { name: "钟寂残堂", lat: 41.7874631760, lng: -87.6333067890, archiveDate: "2022.11", type: "record" },
    { name: "池骸湾", lat: 37.78060, lng: -122.51370, archiveDate: "2023.08", type: "record" },
    { name: "褶层湾", lat: 47.1808, lng: -122.5537, archiveDate: "2023.12", type: "record" },
    { name: "隐染悬里", lat: 37.4543556, lng: 141.0370611, archiveDate: "2024.01", type: "record" }
  ];

  function ruinMiniClamp(value, min, max) {
    return Math.max(min, Math.min(max, Number(value) || 0));
  }

  function ruinMiniMix(a, b, t) {
    return a + (b - a) * t;
  }

  function ruinMiniMixArray(a, b, t) {
    return a.map(function(value, index) { return ruinMiniMix(value, b[index], t); });
  }

  function ruinMiniInterpolateTone(value, key) {
    var tone = ruinMiniClamp(value, 0, 100);
    if (tone <= RUIN_MINI_WARM_POINT) {
      return ruinMiniMixArray(RUIN_MINI_PALETTES.paper[key], RUIN_MINI_PALETTES.warm[key], tone / RUIN_MINI_WARM_POINT);
    }
    return ruinMiniMixArray(
      RUIN_MINI_PALETTES.warm[key],
      RUIN_MINI_PALETTES.night[key],
      (tone - RUIN_MINI_WARM_POINT) / (100 - RUIN_MINI_WARM_POINT)
    );
  }

  function ruinMiniRgb(values) {
    return "rgb(" + values.slice(0, 3).map(function(value) { return Math.round(value); }).join(", ") + ")";
  }

  function readRuinMiniTone() {
    try {
      var saved = localStorage.getItem(RUIN_MINI_TONE_KEY);
      if (saved !== null && saved !== "") return ruinMiniClamp(saved, 0, 100);
    } catch (_) {}
    return 22;
  }

  function saveRuinMiniTone(value) {
    try { localStorage.setItem(RUIN_MINI_TONE_KEY, String(Math.round(ruinMiniClamp(value, 0, 100)))); } catch (_) {}
  }

  function ensureRuinMiniLeaflet() {
    if (window.L && window.L.map) return Promise.resolve(window.L);
    if (ruinMiniLeafletPromise) return ruinMiniLeafletPromise;

    ruinMiniLeafletPromise = new Promise(function(resolve, reject) {
      if (!document.getElementById("ruin-mini-leaflet-css")) {
        var link = document.createElement("link");
        link.id = "ruin-mini-leaflet-css";
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
      }

      var existing = document.getElementById("ruin-mini-leaflet-js");
      if (existing) {
        existing.addEventListener("load", function() { resolve(window.L); }, { once: true });
        existing.addEventListener("error", reject, { once: true });
        if (window.L && window.L.map) resolve(window.L);
        return;
      }

      var scriptEl = document.createElement("script");
      scriptEl.id = "ruin-mini-leaflet-js";
      scriptEl.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      scriptEl.onload = function() { resolve(window.L); };
      scriptEl.onerror = reject;
      document.head.appendChild(scriptEl);
    });

    return ruinMiniLeafletPromise;
  }

  function ensureRuinMiniSites() {
    if (Array.isArray(window.sites) && window.sites.length) return Promise.resolve(window.sites);
    if (ruinMiniSitesPromise) return ruinMiniSitesPromise;

    ruinMiniSitesPromise = new Promise(function(resolve) {
      var existing = document.getElementById("ruin-mini-site-data");
      var finish = function() {
        resolve(Array.isArray(window.sites) && window.sites.length ? window.sites : RUIN_MINI_FALLBACK_SITES);
      };

      if (existing) {
        existing.addEventListener("load", finish, { once: true });
        existing.addEventListener("error", finish, { once: true });
        window.setTimeout(finish, 1200);
        return;
      }

      var scriptEl = document.createElement("script");
      scriptEl.id = "ruin-mini-site-data";
      scriptEl.src = "https://ruin-archive.site/data/site-data.js?v=20261003";
      scriptEl.onload = finish;
      scriptEl.onerror = finish;
      document.head.appendChild(scriptEl);
    });

    return ruinMiniSitesPromise;
  }

  function ruinMiniGeoToSvg(lat, lng) {
    var shiftedLng = Number(lng) + 180;
    if (shiftedLng > 180) shiftedLng -= 360;
    var x = (shiftedLng + 180) / 360;
    var y = (Number(lat) + 90) / 180;
    return [y * 3000, x * 4000];
  }

  function ruinMiniEscape(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;");
  }

  function ruinMiniMembraneState(map, tone) {
    var zoom = map.getZoom();
    var ratio = ruinMiniClamp((zoom + 0.20) / 3.15, 0, 1);
    var warmT = Math.min(1, tone / RUIN_MINI_WARM_POINT);
    var nightT = tone <= RUIN_MINI_WARM_POINT ? 0 : Math.min(1, (tone - RUIN_MINI_WARM_POINT) / (100 - RUIN_MINI_WARM_POINT));

    var dynamicBlur = 0.40 + ratio * 2.3;
    var zoomContrast = 1.8 - ratio * 0.8;
    var dynamicContrast = zoomContrast * ruinMiniMix(1, 0.96, warmT) * ruinMiniMix(1, 0.91, nightT);
    var zoomBrightness = 1.02 + ratio * 0.7;
    var dynamicBrightness = zoomBrightness * ruinMiniMix(1, 0.92, warmT) * ruinMiniMix(1, 0.84, nightT);
    var warmSepia = ruinMiniMix(0.33, 0.50, warmT);
    var dynamicSepia = ruinMiniMix(warmSepia, 0.08, nightT);
    var nightInvert = ruinMiniMix(0, 0.88, nightT);
    var zoomInvert = ratio * 0.15;
    var dynamicInvert = nightInvert + ((1 - nightInvert) * zoomInvert);
    var opacity = (1 - ratio * 0.45) * ruinMiniMix(1, 0.94, warmT);

    return {
      filter: "blur(" + dynamicBlur.toFixed(3) + "px) contrast(" + dynamicContrast.toFixed(3) + ") brightness(" + dynamicBrightness.toFixed(3) + ") sepia(" + dynamicSepia.toFixed(3) + ") invert(" + dynamicInvert.toFixed(3) + ")",
      opacity: opacity,
      blend: nightT > 0.12 ? "normal" : ((ratio > 0 || tone > 3) ? "multiply" : "normal")
    };
  }

  function applyRuinMiniTone(shell, map, worldPane, value, persist) {
    var tone = ruinMiniClamp(value, 0, 100);
    var paper = ruinMiniInterpolateTone(tone, "paper");
    var bg = ruinMiniInterpolateTone(tone, "bg");
    var text = ruinMiniInterpolateTone(tone, "text");
    var muted = ruinMiniInterpolateTone(tone, "muted");
    var line = ruinMiniInterpolateTone(tone, "line");
    var lineStrong = ruinMiniInterpolateTone(tone, "lineStrong");
    var marker = ruinMiniInterpolateTone(tone, "marker");

    shell.dataset.tone = String(Math.round(tone));
    shell.style.setProperty("--ruin-mini-bg", ruinMiniRgb(bg));
    shell.style.setProperty("--ruin-mini-paper", ruinMiniRgb(paper));
    shell.style.setProperty("--ruin-mini-text", ruinMiniRgb(text));
    shell.style.setProperty("--ruin-mini-muted", ruinMiniRgb(muted));
    shell.style.setProperty("--ruin-mini-line", ruinMiniRgb(line));
    shell.style.setProperty("--ruin-mini-line-strong", ruinMiniRgb(lineStrong));
    shell.style.setProperty("--ruin-mini-marker", ruinMiniRgb(marker));

    if (map && map.getContainer()) map.getContainer().style.background = ruinMiniRgb(paper);
    if (map && worldPane) {
      var membrane = ruinMiniMembraneState(map, tone);
      worldPane.style.filter = membrane.filter;
      worldPane.style.opacity = String(membrane.opacity);
      worldPane.style.mixBlendMode = membrane.blend;
    }

    shell.querySelectorAll(".ruin-mini-tone-button").forEach(function(button) {
      var active = Number(button.dataset.tone) === Number(RUIN_MINI_TONE_STEPS.reduce(function(best, step) {
        return Math.abs(step - tone) < Math.abs(best - tone) ? step : best;
      }, RUIN_MINI_TONE_STEPS[0]));
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-checked", active ? "true" : "false");
    });

    if (persist) saveRuinMiniTone(tone);
  }

  function makeRuinMiniToneControl(L, shell, map, worldPane) {
    var labelsByTone = {
      0: "original",
      22: "soft eye-care",
      45: "eye-care",
      60: "dark",
      100: "night"
    };
    var ToneControl = L.Control.extend({
      options: { position: "topright" },
      onAdd: function() {
        var box = L.DomUtil.create("div", "ruin-mini-tone-control leaflet-bar");
        box.setAttribute("role", "radiogroup");
        box.setAttribute("aria-label", "reading environment");
        RUIN_MINI_TONE_STEPS.forEach(function(tone, index) {
          var button = document.createElement("button");
          button.type = "button";
          button.className = "ruin-mini-tone-button";
          button.dataset.tone = String(tone);
          button.setAttribute("role", "radio");
          button.setAttribute("aria-label", labelsByTone[tone]);
          button.title = labelsByTone[tone];
          button.innerHTML = '<span class="ruin-mini-eclipse ruin-mini-eclipse-' + index + '" aria-hidden="true"></span>';
          button.addEventListener("click", function(event) {
            event.preventDefault();
            event.stopPropagation();
            applyRuinMiniTone(shell, map, worldPane, tone, true);
          });
          box.appendChild(button);
        });
        L.DomEvent.disableClickPropagation(box);
        L.DomEvent.disableScrollPropagation(box);
        return box;
      }
    });
    new ToneControl().addTo(map);
  }

  function renderRuinMiniFractureFrame(shell) {
    var host = shell.querySelector(".ruin-mini-fracture-host");
    var mapEl = shell.querySelector(".ruin-mini-map");
    if (!host || !mapEl) return;
    host.innerHTML = "";

    var rect = mapEl.getBoundingClientRect();
    var shellRect = shell.getBoundingClientRect();
    var x0 = rect.left - shellRect.left;
    var y0 = rect.top - shellRect.top;
    var w = rect.width;
    var h = rect.height;
    if (w < 80 || h < 80) return;

    var svgNS = "http://www.w3.org/2000/svg";
    var svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("class", "ruin-mini-fracture-svg");
    svg.setAttribute("viewBox", "0 0 " + shellRect.width + " " + shellRect.height);

    function path(d, className, opacity) {
      var el = document.createElementNS(svgNS, "path");
      el.setAttribute("d", d);
      el.setAttribute("class", className || "ruin-mini-fracture-line");
      if (opacity != null) el.setAttribute("opacity", String(opacity));
      svg.appendChild(el);
      return el;
    }

    var rand = Math.random;
    var topSide = rand() < 0.5 ? "left" : "right";
    var topT = topSide === "left" ? 0.12 + rand() * 0.20 : 0.68 + rand() * 0.16;
    var topW = 24 + rand() * 28;
    var topD = 7 + rand() * 8;
    var tx = x0 + w * topT;
    var rightY = y0 + h * (0.58 + rand() * 0.24);
    var rightH = 32 + rand() * 34;
    var rightD = 7 + rand() * 8;
    var leftY = y0 + h * (0.30 + rand() * 0.28);
    var leftH = 18 + rand() * 22;
    var leftD = 3 + rand() * 5;

    var border = [
      "M", x0 + 0.5, y0 + 0.5,
      "L", tx - topW * 0.50, y0 + 0.5,
      "L", tx - topW * 0.18, y0 + topD * 0.30,
      "L", tx + topW * 0.04, y0 + topD,
      "L", tx + topW * 0.23, y0 + topD * 0.44,
      "L", tx + topW * 0.50, y0 + 0.5,
      "L", x0 + w - 0.5, y0 + 0.5,
      "L", x0 + w - 0.5, rightY - rightH * 0.50,
      "L", x0 + w - rightD * 0.35, rightY - rightH * 0.21,
      "L", x0 + w - rightD, rightY + rightH * 0.04,
      "L", x0 + w - rightD * 0.42, rightY + rightH * 0.24,
      "L", x0 + w - 0.5, rightY + rightH * 0.50,
      "L", x0 + w - 0.5, y0 + h - 0.5,
      "L", x0 + 0.5, y0 + h - 0.5,
      "L", x0 + 0.5, leftY + leftH * 0.50,
      "L", x0 + leftD * 0.35, leftY + leftH * 0.15,
      "L", x0 + leftD, leftY - leftH * 0.05,
      "L", x0 + leftD * 0.26, leftY - leftH * 0.30,
      "L", x0 + 0.5, leftY - leftH * 0.50,
      "Z"
    ].join(" ");
    path(border, "ruin-mini-fracture-border", 0.94);

    var topTipX = tx + topW * 0.04;
    var topTipY = y0 + topD;
    var topDir = topSide === "left" ? -1 : 1;
    path(
      "M " + topTipX + " " + topTipY +
      " C " + (topTipX + topDir * (18 + rand() * 12)) + " " + (topTipY + 12 + rand() * 7) +
      ", " + (topTipX + topDir * (32 + rand() * 18)) + " " + (topTipY + 25 + rand() * 10) +
      ", " + (topTipX + topDir * (50 + rand() * 24)) + " " + (topTipY + 43 + rand() * 15),
      "ruin-mini-fracture-crack", 0.84
    );
    path(
      "M " + (topTipX + topDir * 31) + " " + (topTipY + 26) +
      " Q " + (topTipX + topDir * 44) + " " + (topTipY + 18) +
      " " + (topTipX + topDir * 58) + " " + (topTipY + 22),
      "ruin-mini-fracture-branch", 0.62
    );

    var rightTipX = x0 + w - rightD;
    var rightTipY = rightY + rightH * 0.04;
    path(
      "M " + rightTipX + " " + rightTipY +
      " C " + (rightTipX - 18 - rand() * 12) + " " + (rightTipY + 7 + rand() * 9) +
      ", " + (rightTipX - 38 - rand() * 18) + " " + (rightTipY + 18 + rand() * 12) +
      ", " + (rightTipX - 66 - rand() * 28) + " " + (rightTipY + 42 + rand() * 20),
      "ruin-mini-fracture-crack", 0.78
    );
    path(
      "M " + (rightTipX - 37) + " " + (rightTipY + 19) +
      " Q " + (rightTipX - 44) + " " + (rightTipY + 38) +
      " " + (rightTipX - 61) + " " + (rightTipY + 49),
      "ruin-mini-fracture-branch", 0.58
    );

    host.appendChild(svg);

    // The map itself loses small edge bites, so the frame is truly broken rather
    // than a decorative crack merely drawn above a rectangular grey card.
    var topA = ((tx - topW * 0.50 - x0) / w * 100).toFixed(2);
    var topB = ((tx + topW * 0.50 - x0) / w * 100).toFixed(2);
    var topMid = ((tx - x0) / w * 100).toFixed(2);
    var rightA = ((rightY - rightH * 0.50 - y0) / h * 100).toFixed(2);
    var rightB = ((rightY + rightH * 0.50 - y0) / h * 100).toFixed(2);
    var rightMid = ((rightY - y0) / h * 100).toFixed(2);
    mapEl.style.clipPath = "polygon(0 0, " + topA + "% 0, " + topMid + "% 1.35%, " + topB + "% 0, 100% 0, 100% " + rightA + "%, 98.7% " + rightMid + "%, 100% " + rightB + "%, 100% 100%, 0 100%)";
  }

  function destroyRuinAtlasMiniMap() {
    ruinMiniMountToken += 1;
    if (ruinMiniMapInstance) {
      try { ruinMiniMapInstance.remove(); } catch (_) {}
      ruinMiniMapInstance = null;
    }
  }

  function mountRuinAtlasMiniMap(item) {
    if (!item || item.slug !== "ruin-atlas") {
      destroyRuinAtlasMiniMap();
      return;
    }

    var container = document.getElementById("ruin-mini-map");
    var shell = document.querySelector(".ruin-mini-shell");
    if (!container || !shell || container.dataset.mounted === "true") return;
    container.dataset.mounted = "true";
    var token = ++ruinMiniMountToken;

    Promise.all([ensureRuinMiniLeaflet(), ensureRuinMiniSites()]).then(function(results) {
      if (token !== ruinMiniMountToken || !container.isConnected || !shell.isConnected) return;
      var L = results[0];
      var sites = Array.isArray(results[1]) && results[1].length ? results[1] : RUIN_MINI_FALLBACK_SITES;
      if (!L || !L.map) return;

      if (ruinMiniMapInstance) {
        try { ruinMiniMapInstance.remove(); } catch (_) {}
      }

      var map = L.map(container, {
        crs: L.CRS.Simple,
        minZoom: -2.2,
        maxZoom: 3,
        zoomControl: false,
        attributionControl: false,
        zoomSnap: 0.25,
        zoomDelta: 0.5,
        wheelPxPerZoomLevel: 90,
        inertia: true,
        maxBoundsViscosity: 0.54
      });
      ruinMiniMapInstance = map;

      var bounds = [[0, 0], [3000, 4000]];
      map.createPane("ruinMiniWorldPane");
      var worldPane = map.getPane("ruinMiniWorldPane");
      worldPane.style.zIndex = "210";
      worldPane.style.pointerEvents = "none";

      L.imageOverlay(
        "https://ruin-archive.site/assets/ruin-map.svg?v=20261003",
        bounds,
        { pane: "ruinMiniWorldPane", interactive: false }
      ).addTo(map);

      sites.forEach(function(site) {
        if (!site || !Number.isFinite(Number(site.lat)) || !Number.isFinite(Number(site.lng))) return;
        var isGarden = site.type === "garden";
        var icon = L.divIcon({
          className: "ruin-mini-marker-icon " + (isGarden ? "is-garden" : "is-record"),
          html: '<span class="ruin-mini-marker-dot"></span>',
          iconSize: isGarden ? [10, 10] : [7, 7],
          iconAnchor: isGarden ? [5, 5] : [3.5, 3.5]
        });
        var marker = L.marker(ruinMiniGeoToSvg(site.lat, site.lng), { icon: icon, keyboard: false }).addTo(map);
        marker.bindTooltip(
          '<span class="ruin-mini-tooltip-name">' + ruinMiniEscape(site.name) + '</span>' +
          (site.archiveDate ? '<span class="ruin-mini-tooltip-date">' + ruinMiniEscape(site.archiveDate) + '</span>' : ''),
          { direction: "top", offset: [0, -7], opacity: 1, className: "ruin-mini-tooltip" }
        );
      });

      var initialTone = readRuinMiniTone();
      makeRuinMiniToneControl(L, shell, map, worldPane);
      applyRuinMiniTone(shell, map, worldPane, initialTone, false);

      map.on("zoomend", function() {
        applyRuinMiniTone(shell, map, worldPane, Number(shell.dataset.tone || initialTone), false);
      });
      map.on("movestart", function() { shell.classList.add("is-navigating"); });
      map.on("moveend", function() { shell.classList.remove("is-navigating"); });

      map.fitBounds(bounds, { padding: [20, 20], animate: false });
      map.setMaxBounds([[-520, -800], [3520, 4800]]);
      applyRuinMiniTone(shell, map, worldPane, initialTone, false);

      requestAnimationFrame(function() {
        if (!container.isConnected) return;
        map.invalidateSize(false);
        renderRuinMiniFractureFrame(shell);
      });

      var resizeTimer = 0;
      var onResize = function() {
        window.clearTimeout(resizeTimer);
        resizeTimer = window.setTimeout(function() {
          if (!shell.isConnected || token !== ruinMiniMountToken) {
            window.removeEventListener("resize", onResize);
            return;
          }
          map.invalidateSize(false);
          renderRuinMiniFractureFrame(shell);
        }, 100);
      };
      window.addEventListener("resize", onResize, { passive: true });
    }).catch(function() {
      container.dataset.mounted = "error";
      container.innerHTML = '<p class="ruin-mini-load-error">map temporarily unavailable</p>';
      renderRuinMiniFractureFrame(shell);
    });
  }
'''

if "function mountRuinAtlasMiniMap(item)" not in script:
    script = replace_once(script, "  function mountSeawaterWorld(item) {", mini_runtime + "\n\n  function mountSeawaterWorld(item) {", "seawater mount anchor")

if "    mountRuinAtlasMiniMap(item);" not in script:
    script = replace_once(
        script,
        "    mountSeawaterWorld(item);",
        "    mountSeawaterWorld(item);\n    mountRuinAtlasMiniMap(item);",
        "room enhancement mount call",
    )

# ---------------------------------------------------------------------------
# 4. Presentation: remove generic grey image-stage language and make the map
#    read as a transparent cracked field inside the portfolio page.
# ---------------------------------------------------------------------------
style_marker = "/* ===== Ruin Archive lightweight Leaflet preview ===== */"
if style_marker not in style:
    style += r'''

/* ===== Ruin Archive lightweight Leaflet preview ===== */
.room-view[data-room="ruin-atlas"] {
  background: #f4f3ee;
}

.room-view[data-room="ruin-atlas"] .room-lead {
  min-height: 54svh;
  padding-bottom: 7vh;
}

.ruin-mini-section {
  position: relative;
  z-index: 2;
  width: min(94vw, 1540px);
  margin: 0 auto clamp(84px, 12vh, 150px);
  padding: 0 clamp(14px, 2.2vw, 34px);
}

.ruin-mini-shell {
  --ruin-mini-bg: rgb(255,255,251);
  --ruin-mini-paper: rgb(255,255,251);
  --ruin-mini-text: rgb(28,28,26);
  --ruin-mini-muted: rgb(103,103,97);
  --ruin-mini-line: rgb(205,205,197);
  --ruin-mini-line-strong: rgb(102,102,96);
  --ruin-mini-marker: rgb(17,17,17);
  position: relative;
  width: 100%;
  height: clamp(500px, 70svh, 780px);
  background: transparent;
  border: 0;
  box-shadow: none;
  isolation: isolate;
}

.ruin-mini-map {
  position: absolute;
  inset: 13px;
  z-index: 1;
  overflow: hidden;
  background: var(--ruin-mini-paper);
  border: 0;
  outline: 0;
  cursor: crosshair;
  transition: background-color 260ms ease;
}

.ruin-mini-shell .leaflet-container {
  background: var(--ruin-mini-paper);
  color: var(--ruin-mini-text);
  font-family: var(--sans);
  cursor: crosshair;
}

.ruin-mini-shell .leaflet-pane,
.ruin-mini-shell .leaflet-control-container {
  transition: color 260ms ease;
}

.ruin-mini-shell .leaflet-image-layer {
  backface-visibility: hidden;
}

.ruin-mini-fracture-host {
  position: absolute;
  inset: 0;
  z-index: 900;
  overflow: visible;
  pointer-events: none;
}

.ruin-mini-fracture-svg {
  display: block;
  width: 100%;
  height: 100%;
  overflow: visible;
  pointer-events: none;
  shape-rendering: geometricPrecision;
}

.ruin-mini-fracture-border,
.ruin-mini-fracture-crack,
.ruin-mini-fracture-branch {
  fill: none;
  stroke: var(--ruin-mini-line-strong);
  vector-effect: non-scaling-stroke;
  stroke-linecap: round;
  stroke-linejoin: round;
  transition: stroke 260ms ease;
}

.ruin-mini-fracture-border { stroke-width: 0.98; }
.ruin-mini-fracture-crack { stroke-width: 0.96; }
.ruin-mini-fracture-branch { stroke-width: 0.88; }

.ruin-mini-shell.is-navigating .ruin-mini-fracture-svg {
  opacity: 0.82;
}

.ruin-mini-tone-control.leaflet-bar {
  display: flex;
  align-items: center;
  gap: 4px;
  margin: 13px 13px 0 0 !important;
  padding: 6px 7px;
  border: 1px solid var(--ruin-mini-line-strong) !important;
  border-radius: 0 !important;
  background: color-mix(in srgb, var(--ruin-mini-paper) 76%, transparent) !important;
  box-shadow: none !important;
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
}

.ruin-mini-tone-button {
  display: grid;
  place-items: center;
  width: 23px;
  height: 23px;
  border: 0 !important;
  border-radius: 0 !important;
  background: transparent !important;
  color: var(--ruin-mini-text);
  opacity: 0.46;
  transition: opacity 150ms ease, transform 150ms ease;
}

.ruin-mini-tone-button:hover,
.ruin-mini-tone-button.is-active {
  opacity: 1;
}

.ruin-mini-tone-button.is-active {
  transform: translateY(-1px);
}

.ruin-mini-eclipse {
  display: block;
  width: 11px;
  height: 11px;
  overflow: hidden;
  border: 1px solid var(--ruin-mini-line-strong);
  border-radius: 50%;
  background: var(--ruin-mini-paper);
}

.ruin-mini-eclipse-0 { background: var(--ruin-mini-paper); }
.ruin-mini-eclipse-1 { background: linear-gradient(90deg, var(--ruin-mini-text) 22%, var(--ruin-mini-paper) 22%); }
.ruin-mini-eclipse-2 { background: linear-gradient(90deg, var(--ruin-mini-text) 48%, var(--ruin-mini-paper) 48%); }
.ruin-mini-eclipse-3 { background: linear-gradient(90deg, var(--ruin-mini-text) 70%, var(--ruin-mini-paper) 70%); }
.ruin-mini-eclipse-4 { background: var(--ruin-mini-text); }

.ruin-mini-marker-icon {
  display: grid !important;
  place-items: center;
  border: 0 !important;
  background: transparent !important;
}

.ruin-mini-marker-dot {
  display: block;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--ruin-mini-marker);
  box-shadow: 0 0 0 0.45px color-mix(in srgb, var(--ruin-mini-paper) 60%, transparent);
  transition: width 120ms ease, height 120ms ease, background-color 260ms ease;
}

.ruin-mini-marker-icon.is-garden .ruin-mini-marker-dot {
  width: 7px;
  height: 7px;
}

.ruin-mini-marker-icon:hover .ruin-mini-marker-dot {
  width: 10px;
  height: 10px;
}

.ruin-mini-shell .leaflet-tooltip.ruin-mini-tooltip {
  display: flex;
  align-items: baseline;
  gap: 10px;
  padding: 7px 9px;
  border: 1px solid var(--ruin-mini-line-strong);
  border-radius: 0;
  background: color-mix(in srgb, var(--ruin-mini-paper) 88%, transparent);
  color: var(--ruin-mini-text);
  box-shadow: none;
  font-size: 10px;
  line-height: 1.3;
  letter-spacing: 0.06em;
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
}

.ruin-mini-shell .leaflet-tooltip.ruin-mini-tooltip::before {
  display: none;
}

.ruin-mini-tooltip-date {
  color: var(--ruin-mini-muted);
  font-size: 9px;
}

.ruin-mini-updated {
  margin: 14px 13px 0;
  color: rgba(23, 24, 19, 0.42);
  font-size: 9px;
  font-weight: 400;
  letter-spacing: 0.11em;
  text-align: right;
}

.ruin-mini-load-error {
  position: absolute;
  left: 50%;
  top: 50%;
  margin: 0;
  transform: translate(-50%, -50%);
  color: var(--ruin-mini-muted);
  font-size: 10px;
  letter-spacing: .08em;
}

@media (max-width: 760px) {
  .room-view[data-room="ruin-atlas"] .room-lead {
    min-height: 48svh;
  }

  .ruin-mini-section {
    width: 100%;
    margin-bottom: 88px;
    padding: 0 10px;
  }

  .ruin-mini-shell {
    height: min(64svh, 620px);
  }

  .ruin-mini-map {
    inset: 8px;
  }

  .ruin-mini-tone-control.leaflet-bar {
    margin: 9px 9px 0 0 !important;
    padding: 5px;
  }

  .ruin-mini-tone-button {
    width: 25px;
    height: 25px;
  }

  .ruin-mini-updated {
    margin: 10px 8px 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .ruin-mini-tone-button,
  .ruin-mini-marker-dot,
  .ruin-mini-fracture-svg {
    transition: none !important;
  }
}
'''

# ---------------------------------------------------------------------------
# 5. Cache bust final source references.
# ---------------------------------------------------------------------------
index = re.sub(r"style\.css\?v=[^\"]+", "style.css?v=20261006-ruinmini1", index)
index = re.sub(r"script\.js\?v=[^\"]+", "script.js?v=20261006-ruinmini1", index)

script_path.write_text(script, encoding="utf-8")
style_path.write_text(style, encoding="utf-8")
index_path.write_text(index, encoding="utf-8")

print("Portfolio Ruin Archive mini-map patch applied")
