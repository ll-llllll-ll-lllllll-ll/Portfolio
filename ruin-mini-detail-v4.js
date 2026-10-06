"use strict";

/* Ruin Archive miniature detail pass v4.3
   Index drawer removed. Keep only the detached reading-environment controls. */
(function () {
  var mutationRaf = 0;

  function detachTone(shell) {
    var tone = shell.querySelector(".ruin-mini-tone-control");
    if (!tone) return;
    if (tone.parentElement !== shell) shell.appendChild(tone);
    tone.classList.remove("leaflet-bar", "leaflet-control");
    tone.classList.add("ruin-mini-tone-detached");
    tone.style.removeProperty("margin");
  }

  function cleanDrawerRemnants(shell) {
    shell.querySelectorAll(
      ".ruin-mini-index-drawer, .ruin-mini-index-fill, .ruin-mini-index-labels, " +
      ".ruin-mini-mobile-stele-layer, .ruin-mini-stele-layer"
    ).forEach(function (node) { node.remove(); });
  }

  function scan() {
    var shell = document.querySelector('.room-view[data-room="ruin-atlas"] .ruin-mini-shell');
    if (!shell) return;
    cleanDrawerRemnants(shell);
    detachTone(shell);
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
          (node.matches?.('.room-view[data-room="ruin-atlas"], .ruin-mini-shell, .ruin-mini-tone-control') ||
           node.querySelector?.('.room-view[data-room="ruin-atlas"] .ruin-mini-shell, .ruin-mini-shell, .ruin-mini-tone-control'));
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
