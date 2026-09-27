"use strict";

/*
  Ambient colour hooks
  --------------------
  Applies a day-type class to the homepage and inserts two non-interactive
  colour layers. The main calendar remains the source of truth for which day
  type is active, so calendar browsing and today's view always stay in sync.
*/

(function () {
  var DAY_TYPES = ["sea", "cloud", "lake", "sky"];
  var appNode = document.querySelector("#app");
  var themeMeta = document.querySelector('meta[name="theme-color"]');

  var themeColors = {
    sea: "#06172a",
    cloud: "#111b26",
    lake: "#0a1a22",
    sky: "#0b1b30"
  };

  function getCurrentAmbientType() {
    try {
      return ambientTypeForDate(selectedDate());
    } catch (_) {
      return null;
    }
  }

  function clearDayClasses(node) {
    DAY_TYPES.forEach(function (type) {
      node.classList.remove("ambient-day-" + type);
      document.body.classList.remove("ambient-day-" + type);
    });
  }

  function ensureLayer(field, className, beforeNode) {
    var layer = field.querySelector("." + className);
    if (layer) return layer;

    layer = document.createElement("span");
    layer.className = className;
    layer.setAttribute("aria-hidden", "true");
    field.insertBefore(layer, beforeNode || null);
    return layer;
  }

  function applyAmbientColour() {
    var home = document.querySelector(".home-view");

    if (!home) {
      DAY_TYPES.forEach(function (type) {
        document.body.classList.remove("ambient-day-" + type);
      });
      if (themeMeta) themeMeta.setAttribute("content", "#080a09");
      return;
    }

    var type = getCurrentAmbientType();
    if (!type || DAY_TYPES.indexOf(type) < 0) type = "sky";

    clearDayClasses(home);
    home.classList.add("ambient-day-" + type);
    document.body.classList.add("ambient-day-" + type);

    var field = home.querySelector(".ambient-field");
    if (field) {
      field.dataset.ambientType = type;

      var veil = field.querySelector(".ambient-veil");
      var colorwash = ensureLayer(field, "ambient-colorwash", veil);
      ensureLayer(field, "ambient-cyan", veil);

      /* Keep the intended paint order: video → colour bath → cyan light → veil → grain. */
      if (veil && colorwash.nextSibling !== veil) {
        var cyan = field.querySelector(".ambient-cyan");
        field.insertBefore(colorwash, veil);
        if (cyan) field.insertBefore(cyan, veil);
      }
    }

    if (themeMeta) themeMeta.setAttribute("content", themeColors[type] || "#080a09");
  }

  if (appNode && "MutationObserver" in window) {
    var scheduled = false;
    var observer = new MutationObserver(function () {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(function () {
        scheduled = false;
        applyAmbientColour();
      });
    });

    observer.observe(appNode, { childList: true, subtree: true });
  }

  applyAmbientColour();
})();
