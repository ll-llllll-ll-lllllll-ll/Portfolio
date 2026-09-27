"use strict";

/*
  Small site-level refinements that sit on top of the main renderer.
  - keeps works and collections in separate navigation loops
  - points the old root work images to their new /works/ folders
  - restores Fictional Topography as the third work
  - adds the very soft ripple hallucination behind room by the lake
*/

(function () {
  function findBySlug(list, slug) {
    return list.find(function (item) { return item.slug === slug; });
  }

  var folly = findBySlug(works, "ruin-garden");
  if (folly) {
    folly.images = [
      {
        src: "./works/ruin-garden/img1-blur.jpg",
        caption: { zh: "现场记录 01", en: "site record 01", ja: "現場記録 01" }
      },
      {
        src: "./works/ruin-garden/img2-blur.jpg",
        caption: { zh: "现场记录 02", en: "site record 02", ja: "現場記録 02" }
      }
    ];
  }

  var instrument = findBySlug(works, "the-instrument");
  if (instrument) {
    instrument.images = [
      {
        src: "./works/the-instrument/img3-blur.jpg",
        caption: { zh: "仪器试作 01", en: "instrument study 01", ja: "器械試作 01" }
      },
      {
        src: "./works/the-instrument/img4-blur.jpg",
        caption: { zh: "仪器试作 02", en: "instrument study 02", ja: "器械試作 02" }
      }
    ];
  }

  if (!findBySlug(works, "fictional-topography")) {
    var fictionalTopography = {
      slug: "fictional-topography",
      group: "work",
      title: {
        zh: "虚构地形学",
        en: "Fictional Topography",
        ja: "架空地形学"
      },
      intro: {
        zh: "这里的地图不负责复原世界，而负责收留遗漏之物。地点被发现、命名、记录，再以图像、声音与文本进入《墟域图·遗构馆》，成为一片不断改写自身的地理。",
        en: "These maps do not restore the world; they shelter what it leaves out. Sites are found, named and recorded, then enter the Atlas of Ruins through image, sound and text—an unfinished geography rewriting itself.",
        ja: "この地図は世界を復元するためではなく、こぼれ落ちたものを収めるためにある。場所は発見され、名づけられ、記録され、像・音・言葉として《墟域図・遺構館》へ入り、自らを書き換え続ける地理となる。"
      },
      images: [
        {
          src: "./works/fictional-topography/img5-blur.jpg",
          caption: { zh: "地形记录 01", en: "terrain record 01", ja: "地形記録 01" }
        },
        {
          src: "./works/fictional-topography/img6-blur.jpg",
          caption: { zh: "地形记录 02", en: "terrain record 02", ja: "地形記録 02" }
        }
      ]
    };

    works.push(fictionalTopography);
    rooms.splice(2, 0, fictionalTopography);
  }

  function nextWithinGroup(item) {
    var list = item && item.group === "collection" ? collections : works;
    if (!list.length) return null;
    var index = list.findIndex(function (candidate) { return candidate.slug === item.slug; });
    if (index < 0) return list[0];
    return list[(index + 1) % list.length];
  }

  function updateFooterNavigation(item) {
    var footerButton = document.querySelector(".room-footer [data-action='route']");
    var next = nextWithinGroup(item);
    if (!footerButton || !next) return;

    footerButton.dataset.route = next.slug;

    if (footerButton.dataset.groupNext !== next.slug) {
      footerButton.dataset.groupNext = next.slug;
      footerButton.innerHTML = escapeHtml(localised(next.title)) + '<span aria-hidden="true"> →</span>';
    }
  }

  function addRippleHallucination(item) {
    if (!item || item.slug !== "room-by-the-lake") return;

    var firstFrame = document.querySelector(".room-image");
    if (!firstFrame || firstFrame.querySelector(".room-image-ripple")) return;

    firstFrame.classList.add("has-ripple-hallucination");

    var reduceMotion = false;
    try {
      reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    } catch (_) {}

    var video = document.createElement("video");
    video.className = "room-image-ripple";
    video.autoplay = !reduceMotion;
    video.defaultMuted = true;
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.controls = false;
    video.preload = "auto";
    video.disablePictureInPicture = true;
    video.setAttribute("muted", "");
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "");
    video.setAttribute("disablepictureinpicture", "");
    video.setAttribute("aria-hidden", "true");
    video.setAttribute("tabindex", "-1");

    /*
      Pexels 5678004: dark ocean water with gentle ripples.
      Try the smaller rendition first; UHD remains as a fallback source.
    */
    var sources = [
      "https://videos.pexels.com/video-files/5678004/5678004-sd_640_360_30fps.mp4",
      "https://videos.pexels.com/video-files/5678004/5678004-uhd_4096_2160_30fps.mp4"
    ];

    sources.forEach(function (src) {
      var source = document.createElement("source");
      source.src = src;
      source.type = "video/mp4";
      video.appendChild(source);
    });

    var veil = document.createElement("span");
    veil.className = "room-image-ripple-veil";
    veil.setAttribute("aria-hidden", "true");

    firstFrame.insertBefore(video, firstFrame.firstChild);
    firstFrame.insertBefore(veil, firstFrame.querySelector("img"));

    function markPlaying() {
      firstFrame.classList.add("is-ripple-playing");
      firstFrame.classList.remove("is-ripple-blocked");
    }

    function markBlocked() {
      if (!video.paused) return;
      firstFrame.classList.add("is-ripple-blocked");
    }

    function tryPlay() {
      if (reduceMotion || !document.documentElement.contains(video)) return;
      video.muted = true;
      var promise;
      try {
        promise = video.play();
      } catch (_) {
        markBlocked();
        return;
      }
      if (promise && typeof promise.catch === "function") {
        promise.catch(markBlocked);
      }
    }

    video.addEventListener("playing", markPlaying);
    video.addEventListener("loadeddata", function () {
      if (!reduceMotion) tryPlay();
    });
    video.addEventListener("error", markBlocked);
    video.addEventListener("stalled", markBlocked);

    if ("IntersectionObserver" in window) {
      var visibilityObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting && entry.intersectionRatio > 0.05) {
            tryPlay();
          } else if (!video.paused) {
            video.pause();
          }
        });
      }, { threshold: [0, 0.05, 0.25] });
      visibilityObserver.observe(firstFrame);
    } else {
      tryPlay();
    }

    /*
      iOS may refuse autoplay while Low Power Mode is active. Any later user gesture
      is a valid opportunity to retry, while the CSS light field stays visible before it.
    */
    function resumeAfterGesture() {
      if (video.paused) tryPlay();
    }

    document.addEventListener("pointerdown", resumeAfterGesture, { once: true, passive: true, capture: true });
    document.addEventListener("touchstart", resumeAfterGesture, { once: true, passive: true, capture: true });
  }

  function refineCurrentRoom() {
    var item = parseRoute();
    var roomView = document.querySelector(".room-view");
    if (!item || !roomView) return;

    roomView.dataset.room = item.slug;
    roomView.dataset.group = item.group;
    updateFooterNavigation(item);
    addRippleHallucination(item);
  }

  var appNode = document.querySelector("#app");
  if (appNode && "MutationObserver" in window) {
    var queued = false;
    var observer = new MutationObserver(function () {
      if (queued) return;
      queued = true;
      requestAnimationFrame(function () {
        queued = false;
        refineCurrentRoom();
      });
    });
    observer.observe(appNode, { childList: true, subtree: true });
  }

  render();
  requestAnimationFrame(refineCurrentRoom);
})();
