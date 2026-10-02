from pathlib import Path
import re

script_path = Path('script.js')
index_path = Path('index.html')

js = script_path.read_text(encoding='utf-8')
html = index_path.read_text(encoding='utf-8')

# Safari/iOS does not reliably support CanvasRenderingContext2D.filter. Replace
# the depth-band blur with a cross-browser blur pyramid + continuous masks.
canvas_block = '''    var low = document.createElement("canvas");
    var lowCtx = low.getContext("2d", { alpha: true, willReadFrequently: false });
    var soft = document.createElement("canvas");
    var softCtx = soft.getContext("2d", { alpha: true });
    if (!lowCtx || !softCtx) {
      canvas.remove();
      return;
    }
'''
canvas_replacement = '''    var low = document.createElement("canvas");
    var lowCtx = low.getContext("2d", { alpha: true, willReadFrequently: false });
    var mid = document.createElement("canvas");
    var midCtx = mid.getContext("2d", { alpha: true });
    var far = document.createElement("canvas");
    var farCtx = far.getContext("2d", { alpha: true });
    var soft = document.createElement("canvas");
    var softCtx = soft.getContext("2d", { alpha: true });
    var layer = document.createElement("canvas");
    var layerCtx = layer.getContext("2d", { alpha: true });
    var mask = document.createElement("canvas");
    var maskCtx = mask.getContext("2d", { alpha: true });
    if (!lowCtx || !midCtx || !farCtx || !softCtx || !layerCtx || !maskCtx) {
      canvas.remove();
      return;
    }
'''
if canvas_block not in js:
    raise SystemExit('canvas block not found')
js = js.replace(canvas_block, canvas_replacement, 1)

# Center the background-darkness peak exactly where the midpoint between the two
# artworks reaches the center of the scrolling viewport.
old_bg = r'''    function backgroundLevelForScroll(progress) {
      var scaled = clamp(progress, 0, 1) * (seawaterBackgroundLevels.length - 1);
      var index = Math.min(seawaterBackgroundLevels.length - 2, Math.floor(scaled));
      var local = smoothstep01(scaled - index);
      return lerp(seawaterBackgroundLevels[index], seawaterBackgroundLevels[index + 1], local);
    }

    function updateSeawaterBackground() {
      var level = backgroundLevelForScroll(scrollProgress());
'''
new_bg = r'''    function interpolateBackgroundStops(stops, progress) {
      var scaled = clamp(progress, 0, 1) * (stops.length - 1);
      var index = Math.min(stops.length - 2, Math.floor(scaled));
      var local = smoothstep01(scaled - index);
      return lerp(stops[index], stops[index + 1], local);
    }

    function artworkMidpointTargetScroll() {
      var maxScroll = Math.max(1, scroll.scrollHeight - scroll.clientHeight);
      var images = Array.prototype.slice.call(scroll.querySelectorAll(".room-image img")).slice(0, 2);
      if (images.length < 2) return maxScroll * 0.5;

      var scrollRect = scroll.getBoundingClientRect();
      var centers = images.map(function (image) {
        var rect = image.getBoundingClientRect();
        return (rect.top - scrollRect.top) + scroll.scrollTop + rect.height * 0.5;
      });
      var contentMidpoint = (centers[0] + centers[1]) * 0.5;
      return clamp(contentMidpoint - scroll.clientHeight * 0.5, 0, maxScroll);
    }

    function backgroundLevelForScroll() {
      var maxScroll = Math.max(1, scroll.scrollHeight - scroll.clientHeight);
      var current = clamp(scroll.scrollTop, 0, maxScroll);
      var target = artworkMidpointTargetScroll();

      if (current <= target) {
        var before = target > 0 ? current / target : 1;
        return interpolateBackgroundStops([0, 20, 30, 40], before);
      }

      var afterRange = Math.max(1, maxScroll - target);
      var after = (current - target) / afterRange;
      return interpolateBackgroundStops([40, 30, 20, 10, 0], after);
    }

    function updateSeawaterBackground() {
      var level = backgroundLevelForScroll();
'''
if old_bg not in js:
    raise SystemExit('background block not found')
js = js.replace(old_bg, new_bg, 1)

# Allocate Safari-safe blur-pyramid canvases and full-size compositing buffers.
old_resize = '''      low.width = lowWidth;
      low.height = lowHeight;
      lowCtx.imageSmoothingEnabled = true;
      lowCtx.imageSmoothingQuality = "high";
      lowImageData = lowCtx.createImageData(lowWidth, lowHeight);
      lastFieldFrame = -1;
'''
new_resize = '''      low.width = lowWidth;
      low.height = lowHeight;
      lowCtx.imageSmoothingEnabled = true;
      lowCtx.imageSmoothingQuality = "high";
      lowImageData = lowCtx.createImageData(lowWidth, lowHeight);

      mid.width = Math.max(48, Math.round(lowWidth * 0.56));
      mid.height = Math.max(36, Math.round(lowHeight * 0.56));
      far.width = Math.max(28, Math.round(lowWidth * 0.28));
      far.height = Math.max(22, Math.round(lowHeight * 0.28));
      midCtx.imageSmoothingEnabled = true;
      midCtx.imageSmoothingQuality = "high";
      farCtx.imageSmoothingEnabled = true;
      farCtx.imageSmoothingQuality = "high";

      layer.width = soft.width;
      layer.height = soft.height;
      mask.width = soft.width;
      mask.height = soft.height;
      layerCtx.imageSmoothingEnabled = true;
      layerCtx.imageSmoothingQuality = "high";
      maskCtx.imageSmoothingEnabled = true;
      maskCtx.imageSmoothingQuality = "high";
      lastFieldFrame = -1;
'''
if old_resize not in js:
    raise SystemExit('resize block not found')
js = js.replace(old_resize, new_resize, 1)

old_field_tail = '''      lowCtx.putImageData(lowImageData, 0, 0);
    }
'''
new_field_tail = '''      lowCtx.putImageData(lowImageData, 0, 0);

      /*
        Cross-browser blur pyramid. Instead of ctx.filter="blur(...)" (which is
        unreliable on iPhone Safari), progressively downsample the same caustic
        field. Upscaling these smaller buffers with high-quality interpolation
        produces a genuine soft-focus version with no rectangular band seams.
      */
      midCtx.setTransform(1, 0, 0, 1, 0, 0);
      midCtx.clearRect(0, 0, mid.width, mid.height);
      midCtx.drawImage(low, 0, 0, mid.width, mid.height);

      farCtx.setTransform(1, 0, 0, 1, 0, 0);
      farCtx.clearRect(0, 0, far.width, far.height);
      farCtx.drawImage(mid, 0, 0, far.width, far.height);
    }
'''
if old_field_tail not in js:
    raise SystemExit('field tail not found')
js = js.replace(old_field_tail, new_field_tail, 1)

pattern = re.compile(r'''    function drawProjectedCaustic\(rect, index, light, canvasRect\) \{.*?\n    \}\n\n    function render\(now\) \{''', re.S)
match = pattern.search(js)
if not match:
    raise SystemExit('drawProjectedCaustic function not found')

replacement = r'''    function volumeAxis(volume) {
      return {
        near: {
          x: (volume.base[0].x + volume.base[2].x) * 0.5,
          y: (volume.base[0].y + volume.base[2].y) * 0.5
        },
        far: {
          x: (volume.far[0].x + volume.far[2].x) * 0.5,
          y: (volume.far[0].y + volume.far[2].y) * 0.5
        }
      };
    }

    function buildLayerMask(volume, stops, edgeBlur) {
      var whole = volumeQuad(volume);
      var axis = volumeAxis(volume);
      maskCtx.setTransform(1, 0, 0, 1, 0, 0);
      maskCtx.clearRect(0, 0, width, height);
      maskCtx.globalCompositeOperation = "source-over";

      /* Safari supports shadowBlur consistently. It softens both long side edges
         continuously from the image outward, unlike the old clipped bands. */
      maskCtx.save();
      maskCtx.shadowColor = "rgba(255,255,255,0.95)";
      maskCtx.shadowBlur = edgeBlur;
      maskCtx.fillStyle = "rgba(255,255,255,0.96)";
      pathQuad(maskCtx, whole);
      maskCtx.fill();
      maskCtx.restore();

      var gradient = maskCtx.createLinearGradient(axis.near.x, axis.near.y, axis.far.x, axis.far.y);
      stops.forEach(function (stop) {
        gradient.addColorStop(stop[0], "rgba(255,255,255," + stop[1] + ")");
      });
      maskCtx.globalCompositeOperation = "destination-in";
      maskCtx.fillStyle = gradient;
      maskCtx.fillRect(0, 0, width, height);
      maskCtx.globalCompositeOperation = "source-over";
    }

    function drawCausticLayer(source, volume, bounds, stops, edgeBlur, alpha) {
      layerCtx.setTransform(1, 0, 0, 1, 0, 0);
      layerCtx.clearRect(0, 0, width, height);
      layerCtx.globalCompositeOperation = "source-over";
      layerCtx.globalAlpha = alpha;
      layerCtx.imageSmoothingEnabled = true;
      layerCtx.imageSmoothingQuality = "high";

      var pad = 42;
      layerCtx.drawImage(
        source,
        bounds.minX - pad,
        bounds.minY - pad,
        (bounds.maxX - bounds.minX) + pad * 2,
        (bounds.maxY - bounds.minY) + pad * 2
      );

      buildLayerMask(volume, stops, edgeBlur);
      layerCtx.globalCompositeOperation = "destination-in";
      layerCtx.globalAlpha = 1;
      layerCtx.drawImage(mask, 0, 0);
      layerCtx.globalCompositeOperation = "source-over";

      softCtx.save();
      softCtx.globalCompositeOperation = "source-over";
      softCtx.globalAlpha = 1;
      softCtx.drawImage(layer, 0, 0);
      softCtx.restore();
    }

    function drawProjectedCaustic(rect, index, light, canvasRect) {
      if (rect.width < 2 || rect.height < 2) return;
      var mobile = width <= 760;
      var volume = buildWeakProjectedVolume(rect, index, light, canvasRect);
      var wholeBounds = boundsOf(volume.base.concat(volume.far));
      var baseAlpha = index === 0 ? 0.92 : 0.88;

      /*
        Continuous depth-of-field blend:
        sharp near the image -> medium focus -> broad far focus.
        No per-band clipping and no Canvas2D filter, so iOS Safari cannot reveal
        the old stack of rectangular blur strips.
      */
      drawCausticLayer(
        low,
        volume,
        wholeBounds,
        [[0, 1], [0.20, 0.94], [0.43, 0.70], [0.66, 0.10], [0.78, 0]],
        mobile ? 5 : 6,
        baseAlpha
      );
      drawCausticLayer(
        mid,
        volume,
        wholeBounds,
        [[0, 0.10], [0.22, 0.30], [0.48, 0.60], [0.72, 0.50], [0.90, 0.12], [1, 0]],
        mobile ? 8 : 10,
        baseAlpha * 0.92
      );
      drawCausticLayer(
        far,
        volume,
        wholeBounds,
        [[0, 0], [0.36, 0.08], [0.58, 0.28], [0.78, 0.50], [1, 0.34]],
        mobile ? 12 : 15,
        baseAlpha * 0.84
      );
    }

    function render(now) {'''
js = js[:match.start()] + replacement + js[match.end():]

# Do not use ctx.filter for the final pass either; Safari's implementation is the
# source of the stepped boxes in the user's screenshot.
old_final = '''        ctx.globalCompositeOperation = "source-over";
        ctx.globalAlpha = 1;
        /* Base blur keeps the two long side edges soft from the image outward, while band blur adds distance falloff. */
        ctx.filter = mobile ? "blur(1.55px)" : "blur(2.15px)";
        ctx.drawImage(soft, 0, 0, width, height);
        ctx.filter = "none";
'''
new_final = '''        ctx.globalCompositeOperation = "source-over";
        ctx.globalAlpha = 1;
        ctx.drawImage(soft, 0, 0, width, height);
'''
if old_final not in js:
    raise SystemExit('final filter block not found')
js = js.replace(old_final, new_final, 1)

# Cache bust so iPhone Safari fetches the fixed renderer immediately.
html = html.replace('20261003-0320', '20261003-0400')

script_path.write_text(js, encoding='utf-8')
index_path.write_text(html, encoding='utf-8')
