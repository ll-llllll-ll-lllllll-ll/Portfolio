"use strict";

/* Ruin Archive miniature frame v4.3
   First clean rebuild step:
   - fully transparent frame
   - outer rectangle
   - inner rectangle
   - four straight perspective corner joins
   - no cracks, chips, ports, randomness or filled surfaces
*/
(function () {
  var NS = "http://www.w3.org/2000/svg";
  var resizeRaf = 0;

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function parsePct(shell, name, fallback) {
    var raw = getComputedStyle(shell).getPropertyValue(name).trim();
    if (raw && raw.endsWith("%")) {
      return clamp(parseFloat(raw) / 100, 0, 1);
    }
    return fallback;
  }

  function svgEl(name) {
    return document.createElementNS(NS, name);
  }

  function addPath(svg, d) {
    var p = svgEl("path");
    p.setAttribute("d", d);
    p.setAttribute("class", "ruin-mini-frame-line");
    svg.appendChild(p);
    return p;
  }

  function architecture(shell) {
    var chassis = shell.querySelector(".ruin-mini-chassis");

    if (!chassis) {
      chassis = document.createElement("div");
      chassis.className = "ruin-mini-chassis";
      chassis.setAttribute("aria-hidden", "true");
      shell.appendChild(chassis);
    }

    // Remove every legacy fracture layer left by older cached versions.
    chassis.querySelectorAll(
      ".ruin-mini-authored-fractures, .ruin-mini-clean-frame, .ruin-mini-coords"
    ).forEach(function (node) {
      node.remove();
    });

    var coords = document.createElement("div");
    coords.className = "ruin-mini-coords";
    coords.textContent = "31°49′50″◉ 113°8′34″◉";

    var frame = document.createElement("div");
    frame.className = "ruin-mini-clean-frame";

    chassis.appendChild(coords);
    chassis.appendChild(frame);

    return frame;
  }

  function render(shell) {
    var host = shell.querySelector(".ruin-mini-clean-frame");
    if (!host) host = architecture(shell);

    var rect = shell.getBoundingClientRect();
    var w = rect.width;
    var h = rect.height;
    if (w < 80 || h < 80) return;

    host.innerHTML = "";

    var legacySide = parsePct(shell, "--ruin-mini-frame-side", 0.069);
    var leftPct = parsePct(shell, "--ruin-mini-frame-left", legacySide);
    var rightPct = parsePct(shell, "--ruin-mini-frame-right", legacySide);
    var topPct = parsePct(shell, "--ruin-mini-frame-top", 0.036);
    var bottomPct = parsePct(shell, "--ruin-mini-frame-bottom", 0.0624);

    var il = w * leftPct;
    var ir = w * (1 - rightPct);
    var it = h * topPct;
    var ib = h * (1 - bottomPct);

    var svg = svgEl("svg");
    svg.setAttribute("class", "ruin-mini-frame-svg");
    svg.setAttribute("viewBox", "0 0 " + w + " " + h);
    svg.setAttribute("preserveAspectRatio", "none");
    svg.setAttribute("aria-hidden", "true");

    // Outer perimeter.
    addPath(
      svg,
      "M 0.5 0.5 H " + (w - 0.5).toFixed(2) +
      " V " + (h - 0.5).toFixed(2) +
      " H 0.5 Z"
    );

    // Inner perimeter / map opening.
    addPath(
      svg,
      "M " + il.toFixed(2) + " " + it.toFixed(2) +
      " H " + ir.toFixed(2) +
      " V " + ib.toFixed(2) +
      " H " + il.toFixed(2) + " Z"
    );

    // Four clean perspective joins.
    addPath(svg, "M 0.5 0.5 L " + il.toFixed(2) + " " + it.toFixed(2));
    addPath(svg, "M " + (w - 0.5).toFixed(2) + " 0.5 L " + ir.toFixed(2) + " " + it.toFixed(2));
    addPath(svg, "M " + (w - 0.5).toFixed(2) + " " + (h - 0.5).toFixed(2) + " L " + ir.toFixed(2) + " " + ib.toFixed(2));
    addPath(svg, "M 0.5 " + (h - 0.5).toFixed(2) + " L " + il.toFixed(2) + " " + ib.toFixed(2));

    host.appendChild(svg);
  }

  function enhance() {
    var shell = document.querySelector('.room-view[data-room="ruin-atlas"] .ruin-mini-shell');
    if (!shell) return;

    if (shell.dataset.cleanFrameV43 !== "1") {
      shell.dataset.cleanFrameV43 = "1";
      architecture(shell);
    }

    requestAnimationFrame(function () {
      if (shell.isConnected) render(shell);
    });
  }

  function schedule() {
    cancelAnimationFrame(resizeRaf);
    resizeRaf = requestAnimationFrame(function () {
      resizeRaf = 0;
      var shell = document.querySelector('.room-view[data-room="ruin-atlas"] .ruin-mini-shell');
      if (!shell) return;
      render(shell);
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
