from pathlib import Path

script_path = Path('script.js')
style_path = Path('style.css')
index_path = Path('index.html')

js = script_path.read_text(encoding='utf-8')
css = style_path.read_text(encoding='utf-8')
html = index_path.read_text(encoding='utf-8')

# 1) Replace the synthetic striped wake with the same Water Caustics field used by
# the ambient renderer, but refracted / focused through each artwork rectangle.
start = js.find('      "float refractedWake(vec2 uv, vec4 rect, vec2 light, float t, float aspect) {",')
end = js.find('      "void main() {",', start)
if start < 0 or end < 0:
    raise SystemExit('refractedWake shader block not found')

new_refracted = r'''      "float refractedCaustic(vec2 uv, vec4 rect, vec2 light, float t, float aspect) {",
      "  if (rect.z <= rect.x || rect.w <= rect.y) return 0.0;",
      "  vec2 center = (rect.xy + rect.zw) * 0.5;",
      "  vec2 halfSize = (rect.zw - rect.xy) * 0.5;",
      "  vec2 lightA = vec2(light.x * aspect, light.y);",
      "  vec2 centerA = vec2(center.x * aspect, center.y);",
      "  vec2 dir = normalize(centerA - lightA + vec2(0.0001));",
      "  vec2 perp = vec2(-dir.y, dir.x);",
      "  vec2 rel = uv - center;",
      "  rel.x *= aspect;",
      "  float along = dot(rel, dir);",
      "  float across = dot(rel, perp);",
      "  float halfAlong = abs(dir.x) * halfSize.x * aspect + abs(dir.y) * halfSize.y;",
      "  float halfAcross = abs(perp.x) * halfSize.x * aspect + abs(perp.y) * halfSize.y;",
      "  float dist = along - halfAlong;",
      "  float start = smoothstep(-0.012, 0.020, dist);",
      "  float tail = 1.0 - smoothstep(0.10, 0.56, dist);",
      "  float spread = halfAcross * 0.84 + max(dist, 0.0) * 0.24;",
      "  float lateral = 1.0 - smoothstep(0.70, 1.05, abs(across) / max(spread, 0.001));",
      "  float mask = start * tail * lateral;",
      "",
      "  float downstream = max(dist, 0.0);",
      "  float decay = smoothstep(0.0, 0.52, downstream);",
      "  float bendAmount = mix(0.030, 0.010, decay);",
      "  vec2 bendA = perp * sin(downstream * 18.0 - t * 1.65 + across * 8.0) * bendAmount;",
      "  vec2 bendB = perp * cos(downstream * 12.0 + t * 1.18 - across * 5.5) * bendAmount * 0.55;",
      "  bendA.x /= max(aspect, 0.001);",
      "  bendB.x /= max(aspect, 0.001);",
      "",
      "  vec2 sampleUV = uv - dir * downstream * 0.055 + bendA + bendB;",
      "  vec2 lightShift = perp * 0.018;",
      "  lightShift.x /= max(aspect, 0.001);",
      "  float c1 = ambientCaustic(sampleUV, light + lightShift, t * 1.08 + 0.55, aspect);",
      "  float c2 = ambientCaustic(sampleUV + bendA * 0.42, light - lightShift * 0.65, t * 0.94 + 1.75, aspect);",
      "  float c3 = ambientCaustic(sampleUV - bendB * 0.55, light + lightShift * 0.28, t * 1.16 + 3.10, aspect);",
      "  float focused = max(c1, max(c2 * 0.82, c3 * 0.68));",
      "  float nearFocus = mix(1.28, 0.72, decay);",
      "  return sat(focused * mask * nearFocus);",
      "}",
      "",
'''
js = js[:start] + new_refracted + js[end:]

# 2) Remove the opaque grey optical panel. The canvas is fully transparent except
# for Water Caustics; the stronger caustic field occupies the former shadow zone.
main_start = js.find('      "  float t = u_time * 1.55;",', js.find('      "void main() {",', start))
main_end_marker = '      "  gl_FragColor = vec4(color, alpha);",'
main_end = js.find(main_end_marker, main_start)
if main_start < 0 or main_end < 0:
    raise SystemExit('shader main output block not found')
main_end += len(main_end_marker)

new_main = r'''      "  float t = u_time * 1.55;",
      "  float baseCaustic = ambientCaustic(uv, u_light, t, u_aspect) * cone;",
      "  float refracted = 0.0;",
      "  if (u_rectCount > 0.5) refracted = max(refracted, refractedCaustic(uv, u_rect1, u_light, t, u_aspect));",
      "  if (u_rectCount > 1.5) refracted = max(refracted, refractedCaustic(uv, u_rect2, u_light, t * 1.04 + 0.7, u_aspect));",
      "  float field = corridor * (0.72 + 0.28 * cone);",
      "  float ambientLines = baseCaustic * field * 0.48;",
      "  float refractedLines = refracted * 1.22;",
      "  float lines = sat(max(ambientLines, refractedLines));",
      "  vec3 causticInk = vec3(0.64, 0.665, 0.67);",
      "  float alpha = sat(ambientLines * 0.18 + refractedLines * 0.42);",
      "  gl_FragColor = vec4(causticInk, alpha);",'''
js = js[:main_start] + new_main + js[main_end:]

js = js.replace('document.documentElement.dataset.seawaterRenderer = "webgl-refracted-ripples";',
                'document.documentElement.dataset.seawaterRenderer = "webgl-water-caustics-refraction";', 1)
js = js.replace('refracted ripple trails behind the two artworks. There is no projected',
                'Water Caustics refracted behind the two artworks. There is no projected', 1)
js = js.replace('travelling light field and leaves a widening ripple wake downstream.',
                'travelling caustic field and leaves a refracted caustic zone downstream.', 1)

# 3) Final CSS override: no solid panel, no legacy shadow canvas, no rounded/stage fill.
css += r'''

/* ===== Seawater Water Caustics correction ===== */
.room-view[data-room="seawater"] .seawater-world-light {
  background: transparent !important;
  filter: none !important;
  mix-blend-mode: multiply;
}

.room-view[data-room="seawater"] .seawater-world-shadow {
  display: none !important;
}

.room-view[data-room="seawater"] .room-image,
.room-view[data-room="seawater"] .room-image.is-contain {
  background: transparent !important;
  border-radius: 0 !important;
  box-shadow: none !important;
}
'''

# 4) Cache bust so Pages/browser cannot keep the broken rounded-panel shader.
for old in ['20261002-1600', '20260929-0242']:
    html = html.replace(old, '20261002-1610')
if '20261002-1610' not in html:
    html = html.replace('./style.css"', './style.css?v=20261002-1610"')
    html = html.replace('./calendar/library.js"', './calendar/library.js?v=20261002-1610"')
    html = html.replace('./script.js"', './script.js?v=20261002-1610"')

script_path.write_text(js, encoding='utf-8')
style_path.write_text(css, encoding='utf-8')
index_path.write_text(html, encoding='utf-8')
print('restored Water Caustics refraction and removed opaque optical panel')
