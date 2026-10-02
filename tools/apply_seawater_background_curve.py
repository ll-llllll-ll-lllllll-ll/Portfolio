from pathlib import Path

script_path = Path('script.js')
style_path = Path('style.css')
index_path = Path('index.html')

js = script_path.read_text(encoding='utf-8')
css = style_path.read_text(encoding='utf-8')
html = index_path.read_text(encoding='utf-8')

# 1) Remove the flat grey optical-volume fill that appears behind the caustic field.
grey_block = '''      /* Neutral optical density only; no colored blend modes or contrast filters. */
      softCtx.save();
      pathQuad(softCtx, whole);
      softCtx.fillStyle = "rgba(126,126,126,0.085)";
      softCtx.fill();
      softCtx.restore();

'''
if grey_block not in js:
    raise SystemExit('grey optical-volume block not found')
js = js.replace(
    grey_block,
    '''      /* Keep the projected volume fully transparent: only Water Caustics are rendered here. */\n\n''',
    1,
)

# 2) Add the requested 0-20-30-40-30-20-10-0 scroll-linked background curve.
scroll_block = '''    function scrollProgress() {
      var maxScroll = Math.max(1, scroll.scrollHeight - scroll.clientHeight);
      return clamp(scroll.scrollTop / maxScroll, 0, 1);
    }
'''
if scroll_block not in js:
    raise SystemExit('scrollProgress block not found')

background_helpers = scroll_block + '''

    /*
      Seawater page background exposure curve
      ---------------------------------------
      From top to bottom the page follows the requested darkness sequence:
      0 -> 20 -> 30 -> 40 -> 30 -> 20 -> 10 -> 0.
      Level 0 is the site's warm paper (#f4f3ee); level 40 is sampled from the
      user's ideal-effect reference (#928c80). Each interval uses smoothstep so
      the change reads as a slow exposure shift rather than discrete bands.
    */
    var seawaterBackgroundLevels = [0, 20, 30, 40, 30, 20, 10, 0];
    var seawaterPaperRgb = [244, 243, 238];
    var seawaterDeepRgb = [146, 140, 128];
    var lastSeawaterBackground = "";

    function smoothstep01(value) {
      var t = clamp(value, 0, 1);
      return t * t * (3 - 2 * t);
    }

    function backgroundLevelForScroll(progress) {
      var scaled = clamp(progress, 0, 1) * (seawaterBackgroundLevels.length - 1);
      var index = Math.min(seawaterBackgroundLevels.length - 2, Math.floor(scaled));
      var local = smoothstep01(scaled - index);
      return lerp(seawaterBackgroundLevels[index], seawaterBackgroundLevels[index + 1], local);
    }

    function updateSeawaterBackground() {
      var level = backgroundLevelForScroll(scrollProgress());
      var mix = clamp(level / 40, 0, 1);
      var r = Math.round(lerp(seawaterPaperRgb[0], seawaterDeepRgb[0], mix));
      var g = Math.round(lerp(seawaterPaperRgb[1], seawaterDeepRgb[1], mix));
      var b = Math.round(lerp(seawaterPaperRgb[2], seawaterDeepRgb[2], mix));
      var value = "rgb(" + r + ", " + g + ", " + b + ")";
      if (value !== lastSeawaterBackground) {
        lastSeawaterBackground = value;
        room.style.backgroundColor = value;
        room.style.setProperty("--seawater-scroll-background", value);
      }
      document.documentElement.dataset.seawaterBackgroundLevel = String(Math.round(level));
    }
'''
js = js.replace(scroll_block, background_helpers, 1)

# 3) Update the background at render cadence and immediately after setup.
render_anchor = '''        var canvasRect = canvas.getBoundingClientRect();
        var images = Array.prototype.slice.call(scroll.querySelectorAll(".room-image img")).slice(0, 2);
        var light = lightForFrame();
        var anyVisible = false;
'''
if render_anchor not in js:
    raise SystemExit('render anchor not found')
js = js.replace(
    render_anchor,
    '''        updateSeawaterBackground();\n\n''' + render_anchor,
    1,
)

init_anchor = '''    resizeWorld();
    requestAnimationFrame(render);
  }
'''
if init_anchor not in js:
    raise SystemExit('mount init anchor not found')
js = js.replace(
    init_anchor,
    '''    resizeWorld();\n    updateSeawaterBackground();\n    requestAnimationFrame(render);\n  }\n''',
    1,
)

# 4) Small CSS safety net: only the seawater room background shifts; the scrolling
# content remains transparent so the caustic canvas stays visible.
marker = '/* ===== Seawater scroll-linked background exposure ===== */'
if marker not in css:
    css += '''\n\n/* ===== Seawater scroll-linked background exposure ===== */\n.room-view[data-room="seawater"] {\n  background-color: var(--seawater-scroll-background, #f4f3ee);\n  transition: background-color 120ms linear;\n}\n\n.room-view[data-room="seawater"] .room-scroll {\n  background: transparent !important;\n}\n'''

# 5) Bust Pages/browser caches.
for old in ['20261003-0312', '20261002-1625', '20261002-1550']:
    html = html.replace(old, '20261003-0320')

script_path.write_text(js, encoding='utf-8')
style_path.write_text(css, encoding='utf-8')
index_path.write_text(html, encoding='utf-8')
