from pathlib import Path

script_path = Path('script.js')
index_path = Path('index.html')

js = script_path.read_text(encoding='utf-8')
html = index_path.read_text(encoding='utf-8')

# Critical WebGL bug: the shader source was joined with the literal characters "\\n"
# instead of actual newline characters. That makes GLSL compilation fail and the
# caustics/shadow canvases are removed immediately by the existing catch block.
bad = '].join("\\\\n");'
good = '].join("\\n");'
count = js.count(bad)
if count < 2:
    raise SystemExit(f'expected at least 2 broken shader joins, found {count}')
js = js.replace(bad, good)

# Make the optical field readable on the restored warm-white page: light grey field,
# near-white caustic ridges. This is still intentionally restrained.
js = js.replace(
    '  vec3 base = vec3(0.905, 0.905, 0.885);',
    '  vec3 base = vec3(0.815, 0.815, 0.795);'
)
js = js.replace(
    '  float alpha = field * (0.54 + caustic * 0.34);',
    '  float alpha = field * (0.58 + caustic * 0.36);'
)

# Add a tiny diagnostic marker so a failed shader is inspectable without changing UI.
js = js.replace(
    '    gl.useProgram(program);\n\n    var positionLocation',
    '    gl.useProgram(program);\n    document.documentElement.dataset.seawaterRenderer = "webgl";\n\n    var positionLocation',
    1
)
js = js.replace(
    '    } catch (_) {\n      lightCanvas.remove();\n      shadowCanvas.remove();\n      return;\n    }\n\n    gl.useProgram(program);',
    '    } catch (_) {\n      document.documentElement.dataset.seawaterRenderer = "shader-error";\n      lightCanvas.remove();\n      shadowCanvas.remove();\n      return;\n    }\n\n    gl.useProgram(program);',
    1
)

# Force browsers to fetch the new CSS/JS instead of keeping a stale GitHub Pages cache.
html = html.replace('href="./style.css"', 'href="./style.css?v=20260929-0242"')
html = html.replace('src="./calendar/library.js"', 'src="./calendar/library.js?v=20260929-0242"')
html = html.replace('src="./script.js"', 'src="./script.js?v=20260929-0242"')

script_path.write_text(js, encoding='utf-8')
index_path.write_text(html, encoding='utf-8')

print('fixed shader newlines, increased light-field contrast, and cache-busted assets')
