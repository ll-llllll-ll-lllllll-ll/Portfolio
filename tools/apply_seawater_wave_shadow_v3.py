from pathlib import Path

script_path = Path('script.js')
style_path = Path('style.css')
js = script_path.read_text(encoding='utf-8')
css = style_path.read_text(encoding='utf-8')


def replace_once(text, old, new, label):
    if old not in text:
        raise SystemExit(f'missing marker: {label}')
    return text.replace(old, new, 1)

# Faster, smoother procedural motion while keeping scroll as the dominant driver.
js = replace_once(
    js,
    '      var phase = scroll.scrollTop * 0.0010 + (reduceMotion ? 0 : now * 0.00005);\n',
    '      var phase = scroll.scrollTop * 0.00135 + (reduceMotion ? 0 : now * 0.00022);\n',
    'phase speed'
)

old_field = r'''          /* Finer cells and weaker perspective growth than the previous full-screen version. */
          var perspective = 1 + distance / (width <= 760 ? 980 : 1280);
          var u = vx / (46 * perspective);
          var v = vy / (46 * perspective);
          var qx = u + 0.20 * Math.sin(v * 1.28 + phase * 0.28) +
            0.08 * Math.sin(v * 2.05 - phase * 0.12 + 1.2);
          var qy = v + 0.20 * Math.cos(u * 1.18 - phase * 0.22) +
            0.08 * Math.cos(u * 1.92 + phase * 0.11);
          var a = Math.sin(qx * 2.05 + Math.sin(qy * 1.48 + phase * 0.20));
          var b = Math.cos(qy * 2.00 + Math.sin(qx * 1.34 - phase * 0.16));
          var c = Math.sin((qx + qy) * 1.18 + Math.cos((qx - qy) * 1.28 + phase * 0.12));
          var f = (a + b + c) / 3;
          var line = Math.max(0, 1 - Math.abs(f) * 1.45);
          var sharpness = 6.4 - 2.2 * clamp(distance / 1400, 0, 1);
          line = Math.pow(line, sharpness);
          var falloff = 0.88 - 0.24 * clamp(distance / 1500, 0, 1);
          var value = clamp(line * cone * corridorMask * falloff, 0, 1);
          var alpha = Math.round(value * 185);
'''

new_field = r'''          /*
            Water-caustic field: a thin bright ridge sits inside a much softer halo.
            Two warped interference families cross each other, which produces the
            branching / web-like highlights of real reflected water rather than a
            single inflated contour line. The sharp core and soft halo deliberately
            have much higher contrast than the previous version.
          */
          var perspective = 1 + distance / (width <= 760 ? 1040 : 1360);
          var u = vx / (40 * perspective);
          var v = vy / (40 * perspective);
          var qx = u + 0.26 * Math.sin(v * 1.30 + phase * 0.62) +
            0.11 * Math.sin(v * 2.20 - phase * 0.38 + 1.2);
          var qy = v + 0.26 * Math.cos(u * 1.18 - phase * 0.54) +
            0.11 * Math.cos(u * 2.00 + phase * 0.34);

          var a = Math.sin(qx * 2.10 + Math.sin(qy * 1.52 + phase * 0.42));
          var b = Math.cos(qy * 2.06 + Math.sin(qx * 1.38 - phase * 0.36));
          var c = Math.sin((qx + qy) * 1.24 + Math.cos((qx - qy) * 1.34 + phase * 0.30));
          var d = Math.cos((qx - qy) * 1.56 + Math.sin(qy * 1.08 - phase * 0.26));
          var f = (a + b + c + d) * 0.25;

          var ridge = Math.max(0, 1 - Math.abs(f) * 1.62);
          var core = Math.pow(ridge, 11.5);
          var halo = Math.pow(Math.max(0, 1 - Math.abs(f) * 0.94), 2.25) * 0.31;

          var f2 = Math.sin(qx * 1.46 + Math.sin(qy * 2.12 + phase * 0.28)) * 0.55 +
            Math.cos(qy * 1.60 + Math.sin(qx * 1.82 - phase * 0.31)) * 0.45;
          var crossing = Math.pow(Math.max(0, 1 - Math.abs(f2) * 1.34), 9.0) * 0.38;

          /* Uneven shimmer keeps the network organic instead of uniformly luminous. */
          var shimmer = 0.74 + 0.26 * (0.5 + 0.5 * Math.sin(qx * 0.72 - qy * 0.58 + phase * 0.92));
          var falloff = 0.92 - 0.24 * clamp(distance / 1550, 0, 1);
          var value = clamp((core + halo + crossing) * shimmer * cone * corridorMask * falloff, 0, 1);
          var alpha = Math.round(value * 220);
'''
js = replace_once(js, old_field, new_field, 'caustic field')

# Broader / deeper shadow geometry.
js = replace_once(
    js,
    '''        var elevation = clamp(\n          rect.width * (index === 0 ? 0.31 : 0.27),\n          mobile ? 66 : 88,\n          mobile ? 126 : 176\n        );\n''',
    '''        var elevation = clamp(\n          rect.width * (index === 0 ? 0.40 : 0.35),\n          mobile ? 72 : 96,\n          mobile ? 150 : 220\n        );\n''',
    'shadow elevation'
)

js = replace_once(
    js,
    '''        var contactHull = convexHull(\n          geom.base.concat(geom.base.map(function (p, idx) {\n            return lerpPoint(p, geom.projected[idx], 0.16);\n          }))\n        );\n        fillHullBlur(contactHull, 0.58, 0);\n''',
    '''        /* A broad low-density penumbra establishes the full shadow footprint first. */\n        var broadHull = convexHull(geom.base.concat(geom.projected));\n        fillHullBlur(broadHull, mobile ? 0.12 : 0.14, mobile ? 24 : 34);\n\n        var contactHull = convexHull(\n          geom.base.concat(geom.base.map(function (p, idx) {\n            return lerpPoint(p, geom.projected[idx], 0.22);\n          }))\n        );\n        fillHullBlur(contactHull, 0.76, 0);\n''',
    'contact shadow'
)

old_bands = r'''        var bands = mobile ? 8 : 10;
        for (var i = 0; i < bands; i += 1) {
          var t0 = 0.10 + (i / bands) * 0.90;
          var t1 = 0.10 + ((i + 1) / bands) * 0.90;
          var near = geom.base.map(function (p, idx) {
            return lerpPoint(p, geom.projected[idx], t0);
          });
          var far = geom.base.map(function (p, idx) {
            return lerpPoint(p, geom.projected[idx], t1);
          });
          var bandHull = convexHull(near.concat(far));
          var blurPx = mobile ? (0.8 + i * 1.7) : (1.0 + i * 2.2);
          var alpha = mobile ? (0.25 - i * 0.020) : (0.23 - i * 0.017);
          fillHullBlur(bandHull, Math.max(alpha, 0.055), blurPx);
        }
'''
new_bands = r'''        var bands = mobile ? 9 : 12;
        for (var i = 0; i < bands; i += 1) {
          var t0 = 0.08 + (i / bands) * 0.98;
          var t1 = 0.08 + ((i + 1) / bands) * 0.98;
          var near = geom.base.map(function (p, idx) {
            return lerpPoint(p, geom.projected[idx], t0);
          });
          var far = geom.base.map(function (p, idx) {
            return lerpPoint(p, geom.projected[idx], t1);
          });
          var bandHull = convexHull(near.concat(far));
          var blurPx = mobile ? (0.7 + i * 2.0) : (0.8 + i * 2.6);
          var alpha = mobile ? (0.34 - i * 0.025) : (0.32 - i * 0.021);
          fillHullBlur(bandHull, Math.max(alpha, 0.075), blurPx);
        }
'''
js = replace_once(js, old_bands, new_bands, 'shadow bands')

# Faster redraw cadence so the quicker caustic motion still feels smooth.
js = replace_once(
    js,
    '      var fieldInterval = width <= 760 ? 58 : 46;\n',
    '      var fieldInterval = width <= 760 ? 40 : 32;\n',
    'field interval'
)
js = replace_once(
    js,
    '      var interval = width <= 760 ? 72 : 58;\n',
    '      var interval = width <= 760 ? 44 : 34;\n',
    'idle interval'
)

# Preserve a sharper caustic core while retaining enough smoothing to hide upscaling.
css = replace_once(
    css,
    '''.room-view[data-room="seawater"] .seawater-world-light {\n  filter: blur(2.5px);\n  transform: translateZ(0);\n}\n\n@media (max-width: 760px) {\n  .room-view[data-room="seawater"] .seawater-world-light {\n    filter: blur(2px);\n  }\n}\n''',
    '''.room-view[data-room="seawater"] .seawater-world-light {\n  filter: blur(1.25px);\n  transform: translateZ(0);\n}\n\n@media (max-width: 760px) {\n  .room-view[data-room="seawater"] .seawater-world-light {\n    filter: blur(1px);\n  }\n}\n''',
    'world blur'
)

script_path.write_text(js, encoding='utf-8')
style_path.write_text(css, encoding='utf-8')
print('seawater wave/shadow v3 applied')
