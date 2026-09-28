from pathlib import Path

script_path = Path('script.js')
style_path = Path('style.css')
js = script_path.read_text(encoding='utf-8')
css = style_path.read_text(encoding='utf-8')


def replace_once(text, old, new, label):
    if old not in text:
        raise SystemExit(f'missing marker: {label}')
    return text.replace(old, new, 1)

# 1) Raise procedural buffer resolution substantially to remove visible pixel stepping.
js = replace_once(
    js,
    '      lowWidth = mobile ? 160 : 240;\n',
    '      lowWidth = mobile\n        ? Math.min(260, Math.max(220, Math.round(width * 0.58)))\n        : Math.min(560, Math.max(420, Math.round(width * 0.33)));\n',
    'lowWidth'
)

# 2) Move at a speed closer to real reflected water instead of slow ambient drift.
js = replace_once(
    js,
    '      var phase = scroll.scrollTop * 0.00135 + (reduceMotion ? 0 : now * 0.00022);\n',
    '      var phase = scroll.scrollTop * 0.00135 + (reduceMotion ? 0 : now * 0.00125);\n',
    'phase speed'
)

# 3) Keep a continuous, crisp ridge instead of dotted ultra-thin samples; reduce broad haze.
js = replace_once(
    js,
    '          var core = Math.pow(ridge, 11.5);\n          var halo = Math.pow(Math.max(0, 1 - Math.abs(f) * 0.94), 2.25) * 0.31;\n',
    '          var core = Math.pow(ridge, 9.0) * 1.08;\n          var halo = Math.pow(Math.max(0, 1 - Math.abs(f) * 0.98), 2.45) * 0.16;\n',
    'core halo'
)

js = replace_once(
    js,
    '          var crossing = Math.pow(Math.max(0, 1 - Math.abs(f2) * 1.34), 9.0) * 0.38;\n',
    '          var crossing = Math.pow(Math.max(0, 1 - Math.abs(f2) * 1.38), 8.0) * 0.30;\n',
    'crossing'
)

js = replace_once(
    js,
    '          var shimmer = 0.74 + 0.26 * (0.5 + 0.5 * Math.sin(qx * 0.72 - qy * 0.58 + phase * 0.92));\n',
    '          var shimmer = 0.82 + 0.18 * (0.5 + 0.5 * Math.sin(qx * 0.72 - qy * 0.58 + phase * 0.92));\n',
    'shimmer'
)

js = replace_once(
    js,
    '          var alpha = Math.round(value * 220);\n',
    '          var alpha = Math.round(value * 238);\n',
    'alpha'
)

# 4) Ask the browser for high-quality interpolation when scaling the procedural buffer.
js = replace_once(
    js,
    '      ctx.imageSmoothingEnabled = true;\n      ctx.drawImage(low, 0, 0, width, height);\n',
    '      ctx.imageSmoothingEnabled = true;\n      if ("imageSmoothingQuality" in ctx) ctx.imageSmoothingQuality = "high";\n      ctx.drawImage(low, 0, 0, width, height);\n',
    'image smoothing quality'
)

# 5) Remove almost all whole-canvas blur. The procedural field now carries its own soft halo.
css = replace_once(
    css,
    '''.room-view[data-room="seawater"] .seawater-world-light {\n  filter: blur(1.25px);\n  transform: translateZ(0);\n}\n\n@media (max-width: 760px) {\n  .room-view[data-room="seawater"] .seawater-world-light {\n    filter: blur(1px);\n  }\n}\n''',
    '''.room-view[data-room="seawater"] .seawater-world-light {\n  filter: blur(0.35px);\n  transform: translateZ(0);\n}\n\n@media (max-width: 760px) {\n  .room-view[data-room="seawater"] .seawater-world-light {\n    filter: blur(0.25px);\n  }\n}\n''',
    'world blur'
)

script_path.write_text(js, encoding='utf-8')
style_path.write_text(css, encoding='utf-8')
print('seawater resolution/speed v4 applied')
