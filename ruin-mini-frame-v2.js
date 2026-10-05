"use strict";

/*
  Ruin Archive miniature frame
  ----------------------------
  A compact port of the authored RuinFractureSystem used by ruin-archive.site.
  The Leaflet map remains the real interactive layer; this module only rebuilds
  the outer architecture: inner viewport, perspective transfers, collapsed
  index-drawer shell and the same named fracture families used on the main site.
*/
(function () {
  var SVG_NS = "http://www.w3.org/2000/svg";
  var observer = null;
  var resizeRaf = 0;

  function hashString(str) {
    var h = 2166136261 >>> 0;
    for (var i = 0; i < str.length; i += 1) {
      h ^= str.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  function mulberry32(seed) {
    var a = seed >>> 0;
    return function () {
      a |= 0;
      a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function getSessionSeed(shell) {
    if (shell.dataset.ruinFrameSeed) return Number(shell.dataset.ruinFrameSeed) >>> 0;
    var seed;
    try {
      seed = crypto.getRandomValues(new Uint32Array(1))[0] >>> 0;
    } catch (_) {
      seed = ((Date.now() ^ Math.floor(Math.random() * 0xffffffff)) >>> 0);
    }
    shell.dataset.ruinFrameSeed = String(seed);
    return seed;
  }

  function rngFor(shell, label) {
    return mulberry32((getSessionSeed(shell) ^ hashString(label)) >>> 0);
  }

  function lerp(a, b, t) { return a + (b - a) * t; }
  function pointAt(a, b, t) { return { x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) }; }
  function vec(a, b) {
    var dx = b.x - a.x;
    var dy = b.y - a.y;
    var len = Math.hypot(dx, dy) || 1;
    return { dx: dx, dy: dy, len: len, ux: dx / len, uy: dy / len };
  }
  function leftNormal(a, b) {
    var v = vec(a, b);
    return { x: -v.uy, y: v.ux };
  }
  function extendPast(point, fromPoint, distance) {
    var v = vec(fromPoint, point);
    return { x: point.x + v.ux * distance, y: point.y + v.uy * distance };
  }

  function makeSvg(className, w, h) {
    var svg = document.createElementNS(SVG_NS, "svg");
    svg.setAttribute("class", "ruin-mini-authored-svg " + className);
    svg.setAttribute("viewBox", "0 0 " + Math.max(1, w) + " " + Math.max(1, h));
    svg.setAttribute("preserveAspectRatio", "none");
    svg.setAttribute("aria-hidden", "true");
    return svg;
  }

  function makePath(d, className, opacity) {
    var p = document.createElementNS(SVG_NS, "path");
    p.setAttribute("d", d);
    p.setAttribute("class", className);
    if (opacity != null) p.style.opacity = String(opacity);
    return p;
  }

  function polylineD(points) {
    return points.map(function (p, i) {
      return (i ? "L " : "M ") + p.x.toFixed(2) + " " + p.y.toFixed(2);
    }).join(" ");
  }

  function addPolyline(svg, points, className, opacity) {
    svg.appendChild(makePath(polylineD(points), className, opacity));
  }

  function organicPoints(start, end, rng, amplitude, segments) {
    var v = vec(start, end);
    var normal = { x: -v.uy, y: v.ux };
    var pts = [start];
    for (var i = 1; i < segments; i += 1) {
      var t = i / segments;
      var base = pointAt(start, end, t);
      var weight = Math.sin(Math.PI * t);
      var offset = (rng() - 0.5) * 2 * amplitude * weight;
      pts.push({ x: base.x + normal.x * offset, y: base.y + normal.y * offset });
    }
    pts.push(end);
    return pts;
  }

  function ceramicCrackPoints(start, end, rng, opts) {
    opts = opts || {};
    var v = vec(start, end);
    if (v.len < 2) return [start, end];
    var normal = { x: -v.uy, y: v.ux };
    var tangent = { x: v.ux, y: v.uy };
    var segments = Math.max(4, opts.segments || 5);
    var amplitude = opts.amplitude == null ? 8 : opts.amplitude;
    var curveDir = opts.curveDir == null ? (rng() < 0.5 ? -1 : 1) : opts.curveDir;
    var curveAmount = (opts.curveAmount == null ? amplitude * (0.42 + rng() * 0.30) : opts.curveAmount) * curveDir;
    var detailScale = opts.detailScale == null ? 0.11 : opts.detailScale;
    var stoneBias = opts.stoneBias == null ? 0.22 : opts.stoneBias;
    var tangentScale = opts.tangentScale == null ? 0.055 : opts.tangentScale;
    var pts = [start];
    var mineralDrift = 0;
    for (var i = 1; i < segments; i += 1) {
      var t = i / segments;
      var base = pointAt(start, end, t);
      var weight = Math.sin(Math.PI * t);
      var eased = Math.pow(weight, 0.92);
      var bow = curveAmount * eased;
      var glazeNoise = curveDir * amplitude * (0.018 + rng() * detailScale) * eased;
      if (rng() < stoneBias) mineralDrift += (rng() - 0.48) * amplitude * (0.10 + rng() * 0.10);
      else mineralDrift *= 0.52;
      mineralDrift = Math.max(-amplitude * 0.26, Math.min(amplitude * 0.26, mineralDrift));
      var tangentJitter = (rng() - 0.5) * amplitude * tangentScale * eased;
      pts.push({
        x: base.x + normal.x * (bow + glazeNoise + mineralDrift) + tangent.x * tangentJitter,
        y: base.y + normal.y * (bow + glazeNoise + mineralDrift) + tangent.y * tangentJitter
      });
    }
    pts.push(end);
    return pts;
  }

  function addStoneCeramicCrack(svg, start, end, rng, opts) {
    opts = opts || {};
    var amplitude = opts.amplitude == null ? 8 : opts.amplitude;
    var points = ceramicCrackPoints(start, end, rng, Object.assign({}, opts, {
      segments: Math.max(4, opts.segments || 5),
      curveAmount: opts.curveAmount == null ? amplitude * (0.20 + rng() * 0.10) : opts.curveAmount,
      detailScale: opts.detailScale == null ? 0.15 : opts.detailScale,
      stoneBias: opts.stoneBias == null ? 0.34 : opts.stoneBias,
      tangentScale: opts.tangentScale == null ? 0.048 : opts.tangentScale
    }));
    addPolyline(svg, points, opts.className || "ruin-fracture-crack ruin-fracture-edge-stone", opts.opacity == null ? 0.42 : opts.opacity);
    return points;
  }

  function stoneEdgeCrackPoints(start, end, rng, opts) {
    opts = opts || {};
    var v = vec(start, end);
    if (v.len < 2) return [start, end];
    var normal = { x: -v.uy, y: v.ux };
    var tangent = { x: v.ux, y: v.uy };
    var segments = Math.max(3, opts.segments || 4);
    var amplitude = opts.amplitude == null ? 3.1 : opts.amplitude;
    var curveDir = opts.curveDir == null ? (rng() < 0.5 ? -1 : 1) : opts.curveDir;
    var quant = opts.quant == null ? 4.2 : opts.quant;
    var pts = [start];
    var drift = (rng() - 0.5) * amplitude * 0.30;
    for (var i = 1; i < segments; i += 1) {
      var t = i / segments;
      var base = pointAt(start, end, t);
      var edgeWeight = Math.pow(1 - t, 0.48);
      var bow = curveDir * amplitude * 0.18 * Math.sin(Math.PI * Math.min(1, t * 0.92));
      if (rng() < 0.74) drift += (rng() - 0.46) * amplitude * (0.36 + edgeWeight * 0.22);
      else drift *= 0.58;
      drift = Math.max(-amplitude * 0.95, Math.min(amplitude * 0.95, drift));
      var faceted = Math.round((bow + drift) * quant) / quant;
      var tangentJitter = (rng() - 0.5) * amplitude * 0.14 * edgeWeight;
      pts.push({ x: base.x + normal.x * faceted + tangent.x * tangentJitter, y: base.y + normal.y * faceted + tangent.y * tangentJitter });
    }
    pts.push(end);
    return pts;
  }

  function addOutwardStoneRun(svg, points, rng, className, opacity, amplitude) {
    var merged = [points[0]];
    for (var i = 0; i < points.length - 1; i += 1) {
      var segment = stoneEdgeCrackPoints(points[i], points[i + 1], rng, {
        amplitude: amplitude || 1.25,
        segments: 4,
        curveDir: i % 2 ? -1 : 1,
        quant: 4.8
      });
      merged = merged.concat(segment.slice(1));
    }
    addPolyline(svg, merged, className, opacity);
  }

  function addNaturalChipSegment(svg, a, b, rng, opts) {
    opts = opts || {};
    var v = vec(a, b);
    if (v.len < 12) { addPolyline(svg, [a, b], opts.className || "ruin-fracture-border", opts.opacity || 0.86); return null; }
    var n = leftNormal(a, b);
    var sign = opts.normalSign == null ? 1 : opts.normalSign;
    var width = Math.min(opts.width == null ? 46 : opts.width, v.len * 0.42);
    var halfT = width * 0.5 / v.len;
    var t = Math.max(0.18, Math.min(0.82, opts.t == null ? 0.30 + rng() * 0.40 : opts.t));
    var depth = opts.depth == null ? 4.8 : opts.depth;
    var p1 = pointAt(a, b, t - halfT);
    var p2 = pointAt(a, b, t + halfT);
    var tangent = { x: v.ux, y: v.uy };
    var facets = [];
    var count = 7 + Math.floor(rng() * 3);
    for (var i = 1; i < count; i += 1) {
      var u = i / count;
      var base = pointAt(p1, p2, u);
      var plateau = 0.62 + 0.14 * Math.sin(Math.PI * u);
      var localDepth = Math.max(depth * 0.34, depth * plateau * (0.90 + (rng() - 0.5) * 0.20) + (rng() - 0.5) * depth * 0.14);
      facets.push({
        x: base.x + tangent.x * ((rng() - 0.5) * width * 0.012) + n.x * sign * localDepth,
        y: base.y + tangent.y * ((rng() - 0.5) * width * 0.012) + n.y * sign * localDepth
      });
    }
    var edgePoints = [a, p1].concat(facets, [p2, b]);
    addPolyline(svg, edgePoints, opts.className || "ruin-fracture-border", opts.opacity == null ? 0.86 : opts.opacity);
    if (opts.addReturnLine) {
      var inset = opts.returnInset == null ? Math.max(1, depth * 0.22) : opts.returnInset;
      var c1 = { x: p1.x + tangent.x * width * 0.26 + n.x * sign * inset, y: p1.y + tangent.y * width * 0.26 + n.y * sign * inset };
      var c2 = { x: p1.x + tangent.x * width * 0.74 + n.x * sign * inset, y: p1.y + tangent.y * width * 0.74 + n.y * sign * inset };
      svg.appendChild(makePath("M " + p1.x.toFixed(2) + " " + p1.y.toFixed(2) + " C " + c1.x.toFixed(2) + " " + c1.y.toFixed(2) + ", " + c2.x.toFixed(2) + " " + c2.y.toFixed(2) + ", " + p2.x.toFixed(2) + " " + p2.y.toFixed(2), opts.returnClassName || "ruin-fracture-crack ruin-fracture-chip-return", opts.returnOpacity == null ? 0.70 : opts.returnOpacity));
    }
    return { p1: p1, p2: p2, facets: facets, edgePoints: edgePoints };
  }

  function addTopOuterChip(svg, a, b, rng, opts) {
    opts = opts || {};
    var v = vec(a, b);
    var side = opts.side || (rng() < 0.5 ? "left" : "right");
    var t = opts.t == null ? (side === "left" ? 0.18 + rng() * 0.14 : 0.68 + rng() * 0.14) : opts.t;
    var width = Math.min(opts.width || 30, v.len * 0.15);
    var depth = opts.depth || 8;
    var halfT = width * 0.5 / v.len;
    var p1 = pointAt(a, b, Math.max(0.05, t - halfT));
    var p2 = pointAt(a, b, Math.min(0.95, t + halfT));
    var tangent = { x: v.ux, y: v.uy };
    var towardSide = side === "left" ? -1 : 1;
    var rootT = side === "left" ? 0.42 + rng() * 0.05 : 0.58 + rng() * 0.05;
    var root = { x: p1.x + tangent.x * width * rootT, y: p1.y - depth * (1 + rng() * 0.12) };
    var pts = [a, p1,
      { x: p1.x + tangent.x * width * 0.18, y: p1.y - 0.8 },
      { x: p1.x + tangent.x * width * 0.31, y: p1.y - 2.5 },
      { x: p1.x + tangent.x * width * Math.max(0.34, rootT - 0.06), y: p1.y - depth * 0.68 },
      root,
      { x: p1.x + tangent.x * width * Math.min(0.82, rootT + 0.13), y: p1.y - depth * 0.58 },
      { x: p1.x + tangent.x * width * 0.84, y: p1.y - 1.8 },
      p2, b
    ];
    addPolyline(svg, pts, opts.className || "ruin-fracture-border", opts.opacity == null ? 0.90 : opts.opacity);
    if (opts.addReturnLine) {
      svg.appendChild(makePath("M " + p1.x.toFixed(2) + " " + p1.y.toFixed(2) + " C " + (p1.x + tangent.x * width * 0.30).toFixed(2) + " " + (p1.y - 0.8).toFixed(2) + ", " + (p1.x + tangent.x * width * 0.70).toFixed(2) + " " + (p1.y - 0.8).toFixed(2) + ", " + p2.x.toFixed(2) + " " + p2.y.toFixed(2), opts.returnClassName || "ruin-fracture-crack ruin-fracture-title-notch-return", opts.returnOpacity == null ? 0.72 : opts.returnOpacity));
    }
    root.side = side; root.towardSide = towardSide; root.p1 = p1; root.p2 = p2;
    return root;
  }

  function ensureArchitecture(shell) {
    var old = shell.querySelector(".ruin-mini-chassis");
    if (old) return old;
    var chassis = document.createElement("div");
    chassis.className = "ruin-mini-chassis";
    chassis.setAttribute("aria-hidden", "true");
    chassis.innerHTML =
      '<div class="ruin-mini-inner-frame"></div>' +
      '<div class="ruin-mini-coords">31°49′50″◉ 113°8′34″◉</div>' +
      '<div class="ruin-mini-index-drawer">' +
        '<div class="ruin-mini-index-fill"></div>' +
        '<div class="ruin-mini-index-labels"><span>遗构录・卷</span><span class="ruin-mini-index-center">遗构馆</span><span>⁙废墟园林・编</span></div>' +
      '</div>' +
      '<div class="ruin-mini-authored-fractures"></div>';
    shell.appendChild(chassis);
    return chassis;
  }

  function buildIndexDrawerShellEdge(a, b, pit) {
    if (!pit) return [a, b];
    var dx = b.x - a.x, dy = b.y - a.y;
    var len = Math.hypot(dx, dy) || 1;
    var nx = -dy / len, ny = dx / len;
    var centerT = Math.max(0.10, Math.min(0.90, pit.centerT));
    var halfT = Math.max(0.025, Math.min(0.18, pit.halfT));
    var depth = Math.max(1.4, pit.depth);
    var profile = [[-1.28,0],[-0.92,.13],[-0.56,.48],[-0.22,.82],[0,1],[.28,.72],[.62,.36],[.96,.10],[1.28,0]];
    var pts = profile.map(function(pair) {
      var t = Math.max(0, Math.min(1, centerT + pair[0] * halfT));
      var bx = a.x + dx * t, by = a.y + dy * t;
      return { x: bx + nx * depth * pair[1], y: by + ny * depth * pair[1] };
    });
    return [a].concat(pts, [b]);
  }

  function renderDrawer(shell, drawer, w, h, geo) {
    var rng = rngFor(shell, "index-drawer-visible-shell-pits-v291-opt30");
    var frameLeft = geo.left;
    var frameRight = w - geo.right;
    var topY = geo.drawerTop;
    var bottomY = h - 0.5;
    var leftStart = { x: 0.5, y: bottomY };
    var leftTop = { x: frameLeft, y: topY };
    var rightTop = { x: frameRight, y: topY };
    var rightEnd = { x: w - 0.5, y: bottomY };
    var ranges = { left:[[.22,.43],[.56,.74]], top:[[.10,.28],[.33,.44],[.58,.70],[.76,.90]], right:[[.24,.45],[.57,.76]] };
    function makePit(segment) {
      var pool = ranges[segment], range = pool[Math.floor(rng()*pool.length)] || pool[0], isTop = segment === "top";
      return { segment:segment, centerT:range[0]+rng()*(range[1]-range[0]), halfT:isTop?.042+rng()*.032:.078+rng()*.038, depth:isTop?3+rng()*2:3.2+rng()*2.1 };
    }
    var primaryRoll = rng();
    var primary = primaryRoll < .56 ? "top" : (primaryRoll < .78 ? "left" : "right");
    var plan = [makePit(primary)];
    if (rng() < .48) {
      var candidates = ["left","top","right"].filter(function(x){ return x !== primary; });
      plan.push(makePit(candidates[Math.floor(rng()*candidates.length)] || candidates[0]));
    }
    function pitFor(name) { return plan.find(function(p){return p.segment===name;}) || null; }
    var leftEdge = buildIndexDrawerShellEdge(leftStart, leftTop, pitFor("left"));
    var topEdge = buildIndexDrawerShellEdge(leftTop, rightTop, pitFor("top"));
    var rightEdge = buildIndexDrawerShellEdge(rightTop, rightEnd, pitFor("right"));
    var points = leftEdge.concat(topEdge.slice(1), rightEdge.slice(1));
    addPolyline(drawer, points.concat([leftStart]), "ruin-fracture-border ruin-mini-index-outline", .88);
    var clip = "polygon(" + points.map(function(p){return (p.x/w*100).toFixed(3)+"% "+(p.y/h*100).toFixed(3)+"%";}).join(",") + ")";
    var drawerEl = shell.querySelector(".ruin-mini-index-drawer");
    if (drawerEl) drawerEl.style.clipPath = clip;
  }

  function renderFrame(shell) {
    if (!shell || !shell.isConnected) return;
    ensureArchitecture(shell);
    var host = shell.querySelector(".ruin-mini-authored-fractures");
    if (!host) return;
    host.innerHTML = "";
    var rect = shell.getBoundingClientRect();
    var w = rect.width, h = rect.height;
    if (w < 120 || h < 120) return;

    var top = h * .060;
    var bottom = h * .104;
    var left = w * .115;
    var right = w * .115;
    var innerLeft = left, innerRight = w-right, innerTop = top, innerBottom = h-bottom;
    var drawerTop = innerBottom;
    var geo = {left:left,right:right,top:top,bottom:bottom,drawerTop:drawerTop};

    var svg = makeSvg("ruin-fracture-main-frame", w, h);
    var perspective = makeSvg("ruin-fracture-global", w, h);
    var drawerSvg = makeSvg("ruin-fracture-index-drawer-mini", w, h);

    var tl = {x:innerLeft+.5,y:innerTop+.5}, tr={x:innerRight-.5,y:innerTop+.5};
    var br={x:innerRight-.5,y:innerBottom-.5}, bl={x:innerLeft+.5,y:innerBottom-.5};

    /* main-frame-top-notch / title-notch-return / title-notch-crack */
    var topRng = rngFor(shell, "main-frame-top-notch-v124");
    var titleSide = topRng() < .5 ? "left" : "right";
    var topNotchT = titleSide === "left" ? .10+topRng()*.24 : .66+topRng()*.20;
    var notchTip = addTopOuterChip(svg, tl, tr, rngFor(shell,"main-frame-top-notch-v124-"+titleSide), {
      side:titleSide,t:topNotchT,width:22+topRng()*18,depth:7.2+topRng()*5.6,opacity:.90,addReturnLine:true,
      returnClassName:"ruin-fracture-crack ruin-fracture-chip-return ruin-fracture-title-notch-return"
    });
    var crackRng = rngFor(shell,"main-frame-top-notch-crack-v124-"+titleSide);
    addStoneCeramicCrack(svg, notchTip, {x:notchTip.x+(notchTip.towardSide||-1)*(10+crackRng()*13), y:Math.max(1, notchTip.y-(28+crackRng()*26))}, crackRng, {
      amplitude:3,segments:4,curveDir:notchTip.towardSide||-1,curveAmount:.70+crackRng()*.26,detailScale:.13,stoneBias:.56,tangentScale:.032,opacity:.60,
      className:"ruin-fracture-crack ruin-fracture-title-notch-crack ruin-fracture-edge-stone"
    });

    /* right upper attached pit v167 */
    var upperRng = rngFor(shell,"main-frame-right-upper-attached-crack-v167");
    var upperY = innerTop + (innerBottom-innerTop) * (.12 + upperRng()*.10);
    var upperHalf = 18 + upperRng()*9;
    var bulge = 13 + upperRng()*7;
    var upperPts = [tr,
      {x:innerRight,y:upperY-upperHalf},
      {x:innerRight+bulge*.18,y:upperY-upperHalf*.88},
      {x:innerRight+bulge*.48,y:upperY-upperHalf*.42},
      {x:innerRight+bulge*.96,y:upperY+upperHalf*.10},
      {x:innerRight+bulge*.82,y:upperY+upperHalf*.52},
      {x:innerRight+bulge*.40,y:upperY+upperHalf*.88},
      {x:innerRight,y:upperY+upperHalf}
    ];
    addPolyline(svg, upperPts, "ruin-fracture-border ruin-fracture-upper-attached-pit", .92);
    svg.appendChild(makePath("M "+innerRight+" "+(upperY-upperHalf)+" C "+(innerRight+1.2)+" "+(upperY-upperHalf*.55)+", "+(innerRight+1.7)+" "+upperY+", "+innerRight+" "+(upperY+upperHalf), "ruin-fracture-crack ruin-fracture-upper-attached-return", .70));

    /* right lower notch v174 and outward tree v148 */
    var rightRng = rngFor(shell,"main-frame-right-lower-notch-v174");
    var rightY = innerTop + (innerBottom-innerTop) * (.64 + rightRng()*.15);
    var totalH = 38 + rightRng()*28;
    var depth = 6 + rightRng()*7;
    var rnTop={x:innerRight,y:rightY-totalH*.5};
    var rnRoot={x:innerRight+depth,y:rightY+(rightRng()-.5)*5};
    var rnBottom={x:innerRight,y:rightY+totalH*.5};
    var notchPts=[rnTop,
      {x:innerRight+depth*.22,y:rightY-totalH*.38},
      {x:innerRight+depth*.55,y:rightY-totalH*.26},
      {x:innerRight+depth*.82,y:rightY-totalH*.12},
      rnRoot,
      {x:innerRight+depth*.80,y:rightY+totalH*.15},
      {x:innerRight+depth*.48,y:rightY+totalH*.31},rnBottom];
    addPolyline(svg, [upperPts[upperPts.length-1]].concat(notchPts), "ruin-fracture-border ruin-fracture-damaged", .92);
    svg.appendChild(makePath("M "+rnTop.x+" "+rnTop.y+" C "+(innerRight+1)+" "+(rightY-totalH*.20)+", "+(innerRight+1.1)+" "+(rightY+totalH*.20)+", "+rnBottom.x+" "+rnBottom.y, "ruin-fracture-crack ruin-fracture-chip-return ruin-fracture-lower-right-return", .70));
    addPolyline(svg,[rnBottom,br],"ruin-fracture-border",.86);
    addPolyline(svg,[br,bl],"ruin-fracture-border",.70);

    var outRng=rngFor(shell,"main-frame-right-outward-tree-v148");
    var junction={x:rnRoot.x+44+outRng()*22,y:rnRoot.y+8+outRng()*9};
    addOutwardStoneRun(svg,[rnRoot,{x:rnRoot.x+16,y:rnRoot.y+2},junction],outRng,"ruin-fracture-crack ruin-fracture-outward-stem",.52,1.22);
    addOutwardStoneRun(svg,[junction,{x:junction.x+28,y:junction.y-8},{x:Math.min(w-4,junction.x+100),y:junction.y-4}],outRng,"ruin-fracture-crack ruin-fracture-outward-branch",.46,1.12);
    addOutwardStoneRun(svg,[junction,{x:junction.x+22,y:junction.y+22},{x:Math.min(w-5,junction.x+82),y:junction.y+52}],outRng,"ruin-fracture-crack ruin-fracture-outward-branch",.44,1.34);
    if(outRng()<.68) addOutwardStoneRun(svg,[pointAt(junction,{x:junction.x+82,y:junction.y+52},.44),{x:Math.min(w-5,junction.x+66),y:junction.y+68}],outRng,"ruin-fracture-crack ruin-fracture-outward-branch-minor",.30,.92);

    /* left stone pit v211 */
    var leftRng=rngFor(shell,"main-frame-left-stone-pit-v211");
    var pitY=innerTop+(innerBottom-innerTop)*(.34+leftRng()*.42);
    var pitH=Math.min(70,Math.max(34,(innerBottom-innerTop)*(.06+leftRng()*.045)));
    var pitD=5+leftRng()*6.5;
    var lpTop={x:innerLeft,y:pitY-pitH*.5}, lpBottom={x:innerLeft,y:pitY+pitH*.5};
    var leftPts=[lpTop,{x:innerLeft-pitD*.25,y:pitY-pitH*.35},{x:innerLeft-pitD*.72,y:pitY-pitH*.12},{x:innerLeft-pitD,y:pitY+pitH*.04},{x:innerLeft-pitD*.58,y:pitY+pitH*.29},lpBottom];
    addPolyline(svg,[bl,lpBottom],"ruin-fracture-border",.86);
    addPolyline(svg,leftPts.slice().reverse(),"ruin-fracture-border ruin-fracture-damaged ruin-fracture-left-pit",.88);
    addPolyline(svg,[lpTop,tl],"ruin-fracture-border",.86);

    /* Perspective top-left v194 + transferred Y fracture v198 */
    var leftStart={x:.5,y:.5}, leftEnd={x:innerLeft,y:innerTop};
    var prng=rngFor(shell,"perspective-top-left-v194");
    var slantedChip=addNaturalChipSegment(perspective,leftStart,leftEnd,prng,{width:36+prng()*15,depth:3.2+prng()*2.2,normalSign:1,t:.50+prng()*.18,opacity:.84,addReturnLine:true,returnInset:1,returnOpacity:.70,
      className:"ruin-fracture-border ruin-fracture-damaged ruin-fracture-corner-spall-chip ruin-fracture-spall-major",
      returnClassName:"ruin-fracture-crack ruin-fracture-chip-return ruin-fracture-spall-seam"});
    addPolyline(perspective,[{x:w-.5,y:.5},tr],"ruin-fracture-border",.84);

    var transfer=rngFor(shell,"perspective-top-left-transfer-v198");
    var attachA=slantedChip && slantedChip.facets.length ? slantedChip.facets[Math.floor(slantedChip.facets.length*.55)] : pointAt(leftStart,leftEnd,.62);
    var attachB=slantedChip && slantedChip.p2 ? pointAt(slantedChip.p2,leftEnd,.45) : pointAt(leftStart,leftEnd,.78);
    var leftEdge={x:.5,y:h*(.28+transfer()*.17)};
    var attachMid={x:(attachA.x+attachB.x)*.5,y:(attachA.y+attachB.y)*.5};
    var junction2=pointAt(leftEdge,attachMid,.75+transfer()*.05);
    var stemTransition=pointAt(leftEdge,junction2,.38), stemKink=pointAt(leftEdge,junction2,.73);
    addStoneCeramicCrack(perspective,leftEdge,stemTransition,transfer,{amplitude:6.3,segments:5,curveDir:1,opacity:.42,className:"ruin-fracture-crack ruin-fracture-edge-stone ruin-fracture-corner-stem"});
    addStoneCeramicCrack(perspective,stemTransition,stemKink,transfer,{amplitude:5.4,segments:4,curveDir:1,opacity:.46,className:"ruin-fracture-crack ruin-fracture-corner-stem"});
    addStoneCeramicCrack(perspective,stemKink,junction2,transfer,{amplitude:5.8,segments:5,curveDir:-1,opacity:.50,className:"ruin-fracture-crack ruin-fracture-corner-stem"});
    addStoneCeramicCrack(perspective,junction2,extendPast(attachA,junction2,1.2),transfer,{amplitude:3.8,segments:4,curveDir:-1,opacity:.42,className:"ruin-fracture-crack ruin-fracture-corner-branch"});
    addStoneCeramicCrack(perspective,junction2,extendPast(attachB,junction2,1.2),transfer,{amplitude:3.5,segments:4,curveDir:1,opacity:.38,className:"ruin-fracture-crack ruin-fracture-corner-branch"});

    /* separate secondary flake / spall-secondary */
    var flakeA=pointAt(leftStart,leftEnd,.24), flakeB=pointAt(leftStart,leftEnd,.38);
    addNaturalChipSegment(perspective,flakeA,flakeB,transfer,{width:13+transfer()*7,depth:1.4+transfer()*1.5,normalSign:1,t:.5,opacity:.84,addReturnLine:true,returnInset:.92,returnOpacity:.68,
      className:"ruin-fracture-border ruin-fracture-damaged ruin-fracture-corner-spall-chip ruin-fracture-spall-secondary",
      returnClassName:"ruin-fracture-crack ruin-fracture-chip-return ruin-fracture-spall-seam"});

    renderDrawer(shell,drawerSvg,w,h,geo);
    host.appendChild(perspective);
    host.appendChild(svg);
    host.appendChild(drawerSvg);
    shell.dataset.fractureReady="true";
  }

  function enhance() {
    var shell = document.querySelector('.room-view[data-room="ruin-atlas"] .ruin-mini-shell');
    if (!shell) return;
    ensureArchitecture(shell);
    if (shell.dataset.faithfulFrameBound !== "1") {
      shell.dataset.faithfulFrameBound = "1";
      requestAnimationFrame(function(){ renderFrame(shell); });
    }
  }

  function schedule() {
    cancelAnimationFrame(resizeRaf);
    resizeRaf=requestAnimationFrame(function(){ resizeRaf=0; enhance(); var shell=document.querySelector('.room-view[data-room="ruin-atlas"] .ruin-mini-shell'); if(shell) renderFrame(shell); });
  }

  var app=document.getElementById("app");
  if(app && "MutationObserver" in window){
    observer=new MutationObserver(function(){ requestAnimationFrame(enhance); });
    observer.observe(app,{childList:true,subtree:true});
  }
  window.addEventListener("resize",schedule,{passive:true});
  window.addEventListener("orientationchange",schedule,{passive:true});
  requestAnimationFrame(enhance);
})();
