from pathlib import Path

style_path = Path('style.css')
css = style_path.read_text(encoding='utf-8')

start_marker = '''/*
  Collection editorial stage
  --------------------------
'''
end_marker = '@media (prefers-reduced-motion: reduce) {'
start = css.find(start_marker)
if start < 0:
    raise SystemExit('collection editorial stage block not found')
end = css.find(end_marker, start)
if end < 0:
    raise SystemExit('reduced-motion marker not found')

replacement = '''/*
  Collection image-proportional stage
  -----------------------------------
  The grey field is derived from the displayed artwork rather than the viewport:
  stage height = image height × 1.50;
  stage width  = image width × 1.70 (150% base + an extra 10% on each side).
  JS supplies the exact pixel values after each image has loaded.
*/
.room-view[data-group="collection"] .room-image {
  width: var(--stage-width, min(72vw, 1120px));
  height: var(--stage-height, min(64svh, 680px));
  min-height: 0;
  margin: clamp(9vh, 11vh, 120px) auto clamp(18vh, 22vh, 220px);
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 0 1px rgba(23, 24, 19, 0.075);
}

.room-view[data-group="collection"] .room-image img,
.room-view[data-group="collection"] .room-image.is-contain img {
  width: var(--image-width, auto);
  height: var(--image-height, auto);
  max-width: none;
  max-height: none;
  flex: 0 0 auto;
}

.room-view[data-group="collection"] .room-image figcaption {
  position: absolute;
  z-index: 4;
  left: 50%;
  bottom: 14px;
  width: var(--image-width, 88%);
  margin: 0;
  transform: translateX(-50%);
  color: rgba(23, 24, 19, 0.40);
  font-size: 8px;
  letter-spacing: 0.055em;
}

@media (max-width: 760px) {
  .room-view[data-group="collection"] .room-image {
    width: var(--stage-width, calc(100vw - 30px));
    height: var(--stage-height, min(58svh, 540px));
    min-height: 0;
    margin: 7vh auto 16vh;
    padding: 0;
    box-shadow: 0 0 0 1px rgba(23, 24, 19, 0.07);
  }

  .room-view[data-group="collection"] .room-image img,
  .room-view[data-group="collection"] .room-image.is-contain img {
    width: var(--image-width, auto);
    height: var(--image-height, auto);
    max-width: none;
    max-height: none;
  }

  .room-view[data-group="collection"] .room-image figcaption {
    width: var(--image-width, 92%);
    bottom: 10px;
  }
}

'''
css = css[:start] + replacement + css[end:]
style_path.write_text(css, encoding='utf-8')

script_path = Path('script.js')
js = script_path.read_text(encoding='utf-8')

refine_marker = '  function refineCurrentView() {'
idx = js.find(refine_marker)
if idx < 0:
    raise SystemExit('refineCurrentView marker not found')

sizing_code = r'''  var collectionStageResizeFrame = 0;

  function sizeCollectionStages(item) {
    if (!item || item.group !== "collection") return;

    var stages = document.querySelectorAll('.room-view[data-group="collection"] .room-image');
    if (!stages.length) return;

    var viewportWidth = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
    var viewportHeight = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
    var mobile = viewportWidth <= 760;

    stages.forEach(function (stage) {
      var img = stage.querySelector("img");
      if (!img) return;

      function applyStageSize() {
        if (!stage.isConnected || !img.naturalWidth || !img.naturalHeight) return;

        var imageWidth = img.naturalWidth;
        var imageHeight = img.naturalHeight;

        /*
          User-defined proportions:
          - start with a field that is 150% of the artwork in both dimensions;
          - then add another 10% of artwork width to both the left and right sides.
          Result: field width = artwork × 1.70; field height = artwork × 1.50.
        */
        var stageWidthRatio = 1.70;
        var stageHeightRatio = 1.50;

        /* Viewport limits only scale the whole construction; they never change its ratio. */
        var maxStageWidth = mobile
          ? Math.max(260, viewportWidth - 30)
          : Math.min(viewportWidth * 0.76, 1160);
        var maxStageHeight = mobile
          ? Math.min(viewportHeight * 0.62, 560)
          : Math.min(viewportHeight * 0.72, 740);

        var scale = Math.min(
          maxStageWidth / (imageWidth * stageWidthRatio),
          maxStageHeight / (imageHeight * stageHeightRatio)
        );
        scale = Math.max(scale, 0.01);

        var displayedImageWidth = Math.round(imageWidth * scale * 10) / 10;
        var displayedImageHeight = Math.round(imageHeight * scale * 10) / 10;
        var stageWidth = Math.round(displayedImageWidth * stageWidthRatio * 10) / 10;
        var stageHeight = Math.round(displayedImageHeight * stageHeightRatio * 10) / 10;

        stage.style.setProperty("--image-width", displayedImageWidth + "px");
        stage.style.setProperty("--image-height", displayedImageHeight + "px");
        stage.style.setProperty("--stage-width", stageWidth + "px");
        stage.style.setProperty("--stage-height", stageHeight + "px");
      }

      if (img.complete && img.naturalWidth) {
        applyStageSize();
      } else if (img.dataset.collectionStageSizingBound !== "true") {
        img.dataset.collectionStageSizingBound = "true";
        img.addEventListener("load", applyStageSize, { once: true });
      }
    });
  }

  function scheduleCollectionStageSizing() {
    if (collectionStageResizeFrame) cancelAnimationFrame(collectionStageResizeFrame);
    collectionStageResizeFrame = requestAnimationFrame(function () {
      collectionStageResizeFrame = 0;
      sizeCollectionStages(parseRoute());
    });
  }

'''
js = js[:idx] + sizing_code + js[idx:]

old_refine = '''    roomView.dataset.room = item.slug;
    roomView.dataset.group = item.group;
    updateFooterNavigation(item);
    mountSeawaterCaustics(item);
'''
new_refine = '''    roomView.dataset.room = item.slug;
    roomView.dataset.group = item.group;
    updateFooterNavigation(item);
    sizeCollectionStages(item);
    mountSeawaterCaustics(item);
'''
if old_refine not in js:
    raise SystemExit('refineCurrentView body not found')
js = js.replace(old_refine, new_refine, 1)

listener_marker = '''  document.addEventListener("pointerdown", resumeMediaAfterGesture, { passive: true, capture: true });
'''
if listener_marker not in js:
    raise SystemExit('gesture listener marker not found')
js = js.replace(listener_marker, '''  window.addEventListener("resize", scheduleCollectionStageSizing, { passive: true });
  window.addEventListener("orientationchange", scheduleCollectionStageSizing, { passive: true });
  if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", scheduleCollectionStageSizing, { passive: true });
  }

''' + listener_marker, 1)

script_path.write_text(js, encoding='utf-8')
print('image-proportional collection stage applied')
