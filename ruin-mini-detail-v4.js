"use strict";

/* Ruin Archive miniature detail pass v5.0
   - keep the five reading-environment controls detached beneath the map
   - add the Ruin Archive mobile Index Drawer to the lower frame
   - use the original siteTagsMapping for AND-filtering map markers
*/
(function () {
  var mutationRaf = 0;
  var MOBILE_QUERY = "(max-width: 760px)";

  var INDEX_GROUPS = [
    {
      key: "land",
      zh: "土地", en: "LAND", ja: "土地",
      tags: [
        ["mountain","山"],["slope","坡"],["shore","岸"],["bay","湾"],
        ["port","埠"],["plateau","塬"],["valley","谷"],["cliff","崖"]
      ]
    },
    {
      key: "architecture",
      zh: "建筑", en: "STRUCTURE", ja: "建築",
      tags: [
        ["corridor","廊"],["stair","阶"],["room","厅"],["dwelling","居"],
        ["wall","垣"],["fort","堡"],["hall","殿"],["sacred","圣"],
        ["tower","塔"],["tunnel","甬"],["column","柱"],["aperture","孔"],
        ["factory","厂"],["vessel","舰"],["rail","辙"],["courtyard","庭"],
        ["dam","坝"],["chamber","室"],["monument","碑"]
      ]
    },
    {
      key: "status",
      zh: "状态", en: "STATE", ja: "状態",
      tags: [
        ["ruin","残"],["remains","骸"],["desolate","荒"],["sunken","沉"],
        ["scorched","焦"],["crack","裂"],["eroded","蚀"],["relocated","迁"],
        ["compressed","压"],["seepage","渗"],["contaminated","染"],
        ["placed","置"],["interstitial","间"]
      ]
    },
    {
      key: "nature",
      zh: "自然", en: "NATURE", ja: "自然",
      tags: [
        ["vine","蔓"],["moss","苔"],["tree","木"],["grass","草"],
        ["spike","棘"],["ash","灰"],["membrane","膜"],["water","水"],
        ["wave","波"],["magnetic","磁"],["soil","土"],["sand","沙"]
      ]
    }
  ];

  var COPY = {
    zh: {
      handle: "遗构馆",
      title: "— 墟语学索引 —",
      intro: "「墟语学」将现场征候转化为语素，并连接具有共同征候的遗构。",
      reset: "全部",
      results: "处遗构"
    },
    en: {
      handle: "ARCHIVE",
      title: "— RUIN LEXICOLOGY —",
      intro: "Field signs become morphemes, linking ruins that share the same conditions.",
      reset: "ALL",
      results: "sites"
    },
    ja: {
      handle: "遺構館",
      title: "— 墟語学索引 —",
      intro: "現場の徴候を語素へ変え、共通する徴候を持つ遺構を結びます。",
      reset: "すべて",
      results: "遺構"
    }
  };

  function langKey() {
    var raw = String(document.documentElement.lang || "zh").toLowerCase();
    if (raw.indexOf("en") === 0) return "en";
    if (raw.indexOf("ja") === 0) return "ja";
    return "zh";
  }

  function detachTone(shell) {
    var tone = shell.querySelector(".ruin-mini-tone-control");
    if (!tone) return;
    if (tone.parentElement !== shell) shell.appendChild(tone);
    tone.classList.remove("leaflet-bar", "leaflet-control");
    tone.classList.add("ruin-mini-tone-detached");
    tone.style.removeProperty("margin");
  }

  function siteTags(site) {
    return String(
      window.siteTagsMapping && site && window.siteTagsMapping[site.name] || ""
    ).split(",").map(function(tag) { return tag.trim(); }).filter(Boolean);
  }

  function activeTags(drawer) {
    return Array.from(drawer.querySelectorAll(".ruin-mini-mobile-index-tag.is-active"))
      .map(function(button) { return button.dataset.tag; })
      .filter(Boolean);
  }

  function dispatchFilter(shell, tags) {
    shell.dispatchEvent(new CustomEvent("ruin-mini-index-filter", {
      detail: { tags: tags.slice() }
    }));
  }

  function updateFilterState(shell, drawer) {
    var selected = activeTags(drawer);
    var sites = Array.isArray(window.sites) ? window.sites : [];
    var matchingSites = sites.filter(function(site) {
      var tags = siteTags(site);
      return selected.every(function(tag) { return tags.indexOf(tag) !== -1; });
    });

    drawer.querySelectorAll(".ruin-mini-mobile-index-tag").forEach(function(button) {
      var candidate = button.dataset.tag;
      if (button.classList.contains("is-active") || selected.length === 0) {
        button.classList.remove("is-disabled");
        button.disabled = false;
        return;
      }

      var possible = sites.some(function(site) {
        var tags = siteTags(site);
        return selected.concat(candidate).every(function(tag) {
          return tags.indexOf(tag) !== -1;
        });
      });

      button.classList.toggle("is-disabled", !possible);
      button.disabled = !possible;
    });

    var reset = drawer.querySelector(".ruin-mini-mobile-index-reset");
    if (reset) reset.disabled = selected.length === 0;

    var count = drawer.querySelector(".ruin-mini-mobile-index-count");
    if (count) {
      var copy = COPY[langKey()] || COPY.zh;
      count.textContent = String(matchingSites.length || (selected.length ? 0 : sites.length)) + " " + copy.results;
    }

    dispatchFilter(shell, selected);
  }

  function syncDrawerLanguage(drawer) {
    if (!drawer) return;
    var key = langKey();
    var copy = COPY[key] || COPY.zh;

    var handle = drawer.querySelector(".ruin-mini-mobile-index-label");
    var title = drawer.querySelector(".ruin-mini-mobile-index-title");
    var intro = drawer.querySelector(".ruin-mini-mobile-index-intro");
    var reset = drawer.querySelector(".ruin-mini-mobile-index-reset");

    if (handle) handle.textContent = copy.handle;
    if (title) title.textContent = copy.title;
    if (intro) intro.textContent = copy.intro;
    if (reset) reset.textContent = copy.reset;

    drawer.querySelectorAll(".ruin-mini-mobile-index-category").forEach(function(node) {
      var group = INDEX_GROUPS.find(function(item) { return item.key === node.dataset.group; });
      if (group) node.textContent = group[key] || group.zh;
    });

    var shell = drawer.closest(".ruin-mini-shell");
    if (shell) updateFilterState(shell, drawer);
  }

  function drawerMarkup() {
    return (
      '<button type="button" class="ruin-mini-mobile-index-handle" aria-expanded="false">' +
        '<span class="ruin-mini-mobile-index-label">遗构馆</span>' +
        '<span class="ruin-mini-mobile-index-chevron" aria-hidden="true">⌃</span>' +
      '</button>' +
      '<div class="ruin-mini-mobile-index-body">' +
        '<div class="ruin-mini-mobile-index-head">' +
          '<h3 class="ruin-mini-mobile-index-title">— 墟语学索引 —</h3>' +
          '<p class="ruin-mini-mobile-index-intro"></p>' +
          '<button type="button" class="ruin-mini-mobile-index-reset">全部</button>' +
        '</div>' +
        '<div class="ruin-mini-mobile-index-system">' +
          INDEX_GROUPS.map(function(group) {
            return (
              '<div class="ruin-mini-mobile-index-row">' +
                '<div class="ruin-mini-mobile-index-category" data-group="' + group.key + '">' + group.zh + '</div>' +
                '<div class="ruin-mini-mobile-index-separator" aria-hidden="true"></div>' +
                '<div class="ruin-mini-mobile-index-tags">' +
                  group.tags.map(function(pair) {
                    return '<button type="button" class="ruin-mini-mobile-index-tag" data-tag="' +
                      pair[0] + '">' + pair[1] + '</button>';
                  }).join("") +
                '</div>' +
              '</div>'
            );
          }).join("") +
        '</div>' +
        '<p class="ruin-mini-mobile-index-count"></p>' +
      '</div>'
    );
  }

  function createDrawer(shell) {
    var existing = shell.querySelector(".ruin-mini-mobile-index-drawer");
    if (existing) {
      syncDrawerLanguage(existing);
      return existing;
    }

    var drawer = document.createElement("div");
    drawer.className = "ruin-mini-mobile-index-drawer";
    drawer.innerHTML = drawerMarkup();
    shell.appendChild(drawer);

    var handle = drawer.querySelector(".ruin-mini-mobile-index-handle");
    var reset = drawer.querySelector(".ruin-mini-mobile-index-reset");

    handle.addEventListener("click", function(event) {
      event.preventDefault();
      event.stopPropagation();
      var open = !drawer.classList.contains("is-open");
      drawer.classList.toggle("is-open", open);
      handle.setAttribute("aria-expanded", open ? "true" : "false");
    });

    drawer.querySelectorAll(".ruin-mini-mobile-index-tag").forEach(function(button) {
      button.addEventListener("click", function(event) {
        event.preventDefault();
        event.stopPropagation();
        if (button.disabled) return;
        button.classList.toggle("is-active");
        updateFilterState(shell, drawer);
      });
    });

    reset.addEventListener("click", function(event) {
      event.preventDefault();
      event.stopPropagation();
      drawer.querySelectorAll(".ruin-mini-mobile-index-tag.is-active")
        .forEach(function(button) { button.classList.remove("is-active"); });
      updateFilterState(shell, drawer);
    });

    syncDrawerLanguage(drawer);
    return drawer;
  }

  function syncViewport(shell) {
    var mobile = window.matchMedia ? window.matchMedia(MOBILE_QUERY).matches : window.innerWidth <= 760;
    var drawer = shell.querySelector(".ruin-mini-mobile-index-drawer");

    if (!mobile) {
      if (drawer) {
        dispatchFilter(shell, []);
        drawer.remove();
      }
      return;
    }

    createDrawer(shell);
  }

  function scan() {
    var shell = document.querySelector('.room-view[data-room="ruin-atlas"] .ruin-mini-shell');
    if (!shell) return;
    detachTone(shell);
    syncViewport(shell);
  }

  function scheduleScan() {
    if (mutationRaf) return;
    mutationRaf = requestAnimationFrame(function () {
      mutationRaf = 0;
      scan();
    });
  }

  /* Tap outside an opened miniature drawer to close it, matching the full
     site's mobile drawer interaction. */
  document.addEventListener("pointerdown", function(event) {
    var drawer = document.querySelector(
      '.room-view[data-room="ruin-atlas"] .ruin-mini-mobile-index-drawer.is-open'
    );
    if (!drawer || drawer.contains(event.target)) return;
    drawer.classList.remove("is-open");
    var handle = drawer.querySelector(".ruin-mini-mobile-index-handle");
    if (handle) handle.setAttribute("aria-expanded", "false");
  }, true);

  var langObserver = new MutationObserver(function() {
    var drawer = document.querySelector(
      '.room-view[data-room="ruin-atlas"] .ruin-mini-mobile-index-drawer'
    );
    syncDrawerLanguage(drawer);
  });
  langObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["lang"]
  });

  var observer = new MutationObserver(function(records) {
    var relevant = records.some(function(record) {
      return Array.from(record.addedNodes || []).some(function(node) {
        return node.nodeType === 1 &&
          (node.matches?.('.room-view[data-room="ruin-atlas"], .ruin-mini-shell, .ruin-mini-tone-control') ||
           node.querySelector?.('.room-view[data-room="ruin-atlas"] .ruin-mini-shell, .ruin-mini-shell, .ruin-mini-tone-control'));
      });
    });
    if (relevant) scheduleScan();
  });

  observer.observe(document.documentElement, { childList: true, subtree: true });
  window.addEventListener("resize", scheduleScan, { passive: true });
  window.addEventListener("orientationchange", scheduleScan, { passive: true });
  window.addEventListener("hashchange", scheduleScan);
  window.addEventListener("pageshow", scheduleScan, { passive: true });
  document.addEventListener("DOMContentLoaded", scheduleScan, { once: true });
  scheduleScan();
})();
