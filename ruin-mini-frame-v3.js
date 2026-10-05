"use strict";

/* Compact, syntax-safe port of the production RuinFractureSystem. */
(function () {
  var NS = "http://www.w3.org/2000/svg";
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

  function sessionSeed(shell) {
    var old = Number(shell.dataset.ruinFrameSeed || "");
    if (Number.isFinite(old) && old > 0) return old >>> 0;
    var seed;
    try { seed = crypto.getRandomValues(new Uint32Array(1))[0] >>> 0; }
    catch (_) { seed = ((Date.now() ^ Math.floor(Math.random() * 0xffffffff)) >>> 0); }
    shell.dataset.ruinFrameSeed = String(seed);
    return seed;
  }

  function rngFor(shell, label) {
    return mulberry32((sessionSeed(shell) ^ hashString(label)) >>> 0);
  }

  function lerp(a, b, t) { return a + (b - a) * t; }
  function pt(a, b, t) { return { x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) }; }
  function vector(a, b) {
    var dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy) || 1;
    return { dx: dx, dy: dy, len: len, ux: dx / len, uy: dy / len };
  }

  function svgFor(className, w, h) {
    var svg = document.createElementNS(NS, "svg");
    svg.setAttribute("class", "ruin-mini-authored-svg " + className);
    svg.setAttribute("viewBox", "0 0 " + Math.max(1, w) + " " + Math.max(1, h));
    svg.setAttribute("preserveAspectRatio", "none");
    svg.setAttribute("aria-hidden", "true");
    return svg;
  }

  function path(svg, d, cls, opacity) {
    var p = document.createElementNS(NS, "path");
    p.setAttribute("d", d);
    p.setAttribute("class", cls);
    if (opacity != null) p.style.opacity = String(opacity);
    svg.appendChild(p);
    return p;
  }

  function lineD(points) {
    return points.map(function (p, i) {
      return (i === 0 ? "M " : "L ") + p.x.toFixed(2) + " " + p.y.toFixed(2);
    }).join(" ");
  }

  function poly(svg, points, cls, opacity) { return path(svg, lineD(points), cls, opacity); }

  function normal(a, b) {
    var v = vector(a, b);
    return { x: -v.uy, y: v.ux };
  }

  function organicCrack(svg, a, b, rng, cls, opacity, amplitude, segments) {
    var v = vector(a, b), n = { x: -v.uy, y: v.ux };
    var pts = [a], drift = 0;
    segments = Math.max(3, segments || 5);
    amplitude = amplitude == null ? 4 : amplitude;
    for (var i = 1; i < segments; i += 1) {
      var t = i / segments;
      var base = pt(a, b, t);
      var weight = Math.sin(Math.PI * t);
      drift = drift * 0.42 + (rng() - 0.5) * amplitude * 0.58;
      pts.push({ x: base.x + n.x * drift * weight, y: base.y + n.y * drift * weight });
    }
    pts.push(b);
    poly(svg, pts, cls, opacity);
    return pts;
  }

  /* Same broad, faceted stone bite profile used by production addNaturalChipSegment. */
  function naturalChip(svg, a, b, rng, opts) {
    opts = opts || {};
    var v = vector(a, b), n = normal(a, b);
    var sign = opts.normalSign == null ? 1 : opts.normalSign;
    var width = Math.min(opts.width == null ? 36 : opts.width, v.len * 0.42);
    var centerT = Math.max(0.18, Math.min(0.82, opts.t == null ? 0.5 : opts.t));
    var halfT = width * 0.5 / v.len;
    var p1 = pt(a, b, centerT - halfT), p2 = pt(a, b, centerT + halfT);
    var depth = opts.depth == null ? 4 : opts.depth;
    var tangent = { x: v.ux, y: v.uy };
    var facets = [], count = 7 + Math.floor(rng() * 3);
    for (var i = 1; i < count; i += 1) {
      var u = i / count, base = pt(p1, p2, u);
      var plateau = 0.62 + 0.14 * Math.sin(Math.PI * u);
      var dep = Math.max(depth * 0.34, depth * plateau * (0.90 + (rng() - 0.5) * 0.20));
      facets.push({
        x: base.x + tangent.x * ((rng() - 0.5) * width * 0.012) + n.x * sign * dep,
        y: base.y + tangent.y * ((rng() - 0.5) * width * 0.012) + n.y * sign * dep
      });
    }
    var edge = [a, p1].concat(facets, [p2, b]);
    poly(svg, edge, opts.className || "ruin-fracture-border", opts.opacity == null ? 0.86 : opts.opacity);
    if (opts.returnClassName) {
      var inset = opts.returnInset == null ? 1 : opts.returnInset;
      var c1 = { x: p1.x + tangent.x * width * 0.26 + n.x * sign * inset, y: p1.y + tangent.y * width * 0.26 + n.y * sign * inset };
      var c2 = { x: p1.x + tangent.x * width * 0.74 + n.x * sign * inset, y: p1.y + tangent.y * width * 0.74 + n.y * sign * inset };
      path(svg, "M " + p1.x.toFixed(2) + " " + p1.y.toFixed(2) + " C " + c1.x.toFixed(2) + " " + c1.y.toFixed(2) + ", " + c2.x.toFixed(2) + " " + c2.y.toFixed(2) + ", " + p2.x.toFixed(2) + " " + p2.y.toFixed(2), opts.returnClassName, opts.returnOpacity == null ? 0.70 : opts.returnOpacity);
    }
    return { p1: p1, p2: p2, facets: facets };
  }

  function architecture(shell) {
    var found = shell.querySelector(".ruin-mini-chassis");
    if (found) return found;
    var c = document.createElement("div");
    c.className = "ruin-mini-chassis";
    c.setAttribute("aria-hidden", "true");
    c.innerHTML =
      '<div class="ruin-mini-inner-frame"></div>' +
      '<div class="ruin-mini-coords">31°49′50″◉ 113°8′34″◉</div>' +
      '<div class="ruin-mini-index-drawer">' +
        '<div class="ruin-mini-index-fill"></div>' +
        '<div class="ruin-mini-index-labels"><span>遗构录・卷</span><span class="ruin-mini-index-center">遗构馆</span><span>⁙废墟园林・编</span></div>' +
      '</div>' +
      '<div class="ruin-mini-authored-fractures"></div>';
    shell.appendChild(c);
    return c;
  }

  function shellEdge(a, b, pit) {
    if (!pit) return [a, b];
    var dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy) || 1;
    var nx = -dy / len, ny = dx / len;
    var profile = [[-1.28,0],[-.92,.13],[-.56,.48],[-.22,.82],[0,1],[.28,.72],[.62,.36],[.96,.10],[1.28,0]];
    var pts = profile.map(function (entry) {
      var t = Math.max(0, Math.min(1, pit.centerT + entry[0] * pit.halfT));
      return { x: a.x + dx * t + nx * pit.depth * entry[1], y: a.y + dy * t + ny * pit.depth * entry[1] };
    });
    return [a].concat(pts, [b]);
  }

  function indexDrawer(shell, svg, w, h, left, right, y) {
    var rng = rngFor(shell, "index-drawer-visible-shell-pits-v291-opt30");
    var ranges = { left:[[.22,.43],[.56,.74]], top:[[.10,.28],[.33,.44],[.58,.70],[.76,.90]], right:[[.24,.45],[.57,.76]] };
    function makePit(segment) {
      var pool = ranges[segment], range = pool[Math.floor(rng() * pool.length)] || pool[0];
      var isTop = segment === "top";
      return {
        segment: segment,
        centerT: range[0] + rng() * (range[1] - range[0]),
        halfT: isTop ? (0.042 + rng() * 0.032) : (0.078 + rng() * 0.038),
        depth: isTop ? (3.0 + rng() * 2.0) : (3.2 + rng() * 2.1)
      };
    }
    var roll = rng(), primary = roll < .56 ? "top" : (roll < .78 ? "left" : "right");
    var plan = [makePit(primary)];
    if (rng() < .48) {
      var others = ["left","top","right"].filter(function (name) { return name !== primary; });
      plan.push(makePit(others[Math.floor(rng() * others.length)] || others[0]));
    }
    function pit(name) { return plan.find(function (p) { return p.segment === name; }) || null; }
    var a={x:.5,y:h-.5}, b={x:left,y:y}, c={x:w-right,y:y}, d={x:w-.5,y:h-.5};
    var points = shellEdge(a,b,pit("left")).concat(shellEdge(b,c,pit("top")).slice(1), shellEdge(c,d,pit("right")).slice(1));
    poly(svg, points.concat([a]), "ruin-fracture-border ruin-mini-index-outline", .88);
    var drawer = shell.querySelector(".ruin-mini-index-drawer");
    if (drawer) {
      drawer.style.clipPath = "polygon(" + points.map(function (p) {
        return (p.x / w * 100).toFixed(3) + "% " + (p.y / h * 100).toFixed(3) + "%";
      }).join(",") + ")";
      drawer.style.webkitClipPath = drawer.style.clipPath;
    }
  }

  function render(shell) {
    architecture(shell);
    var host = shell.querySelector(".ruin-mini-authored-fractures");
    if (!host) return;
    var r = shell.getBoundingClientRect(), w = r.width, h = r.height;
    if (w < 140 || h < 140) return;
    host.innerHTML = "";

    var left=w*.115, right=w*.115, top=h*.060, bottom=h*.104;
    var il=left, ir=w-right, it=top, ib=h-bottom;
    var tl={x:il+.5,y:it+.5}, tr={x:ir-.5,y:it+.5}, br={x:ir-.5,y:ib-.5}, bl={x:il+.5,y:ib-.5};
    var main=svgFor("ruin-fracture-main-frame",w,h);
    var perspective=svgFor("ruin-fracture-global",w,h);
    var drawer=svgFor("ruin-fracture-index-drawer-mini",w,h);

    /* main-frame-top-notch + title-notch-return + title-notch-crack */
    var titleRng=rngFor(shell,"main-frame-top-notch-v124"), titleSide=titleRng()<.5?"left":"right";
    var t=titleSide==="left" ? .14+titleRng()*.18 : .68+titleRng()*.17;
    var topV=vector(tl,tr), notchWidth=22+titleRng()*18, half=notchWidth*.5/topV.len;
    var n1=pt(tl,tr,t-half), n2=pt(tl,tr,t+half), root={x:pt(tl,tr,t).x,y:it-(7+titleRng()*6)};
    poly(main,[tl,n1,{x:n1.x+notchWidth*.25,y:it-2.1},root,{x:n2.x-notchWidth*.18,y:it-1.5},n2,tr],"ruin-fracture-border",.90);
    path(main,"M "+n1.x+" "+n1.y+" Q "+root.x+" "+(it-1)+" "+n2.x+" "+n2.y,"ruin-fracture-crack ruin-fracture-title-notch-return",.72);
    var titleCrackRng=rngFor(shell,"main-frame-top-notch-crack-v124-"+titleSide), dir=titleSide==="left"?-1:1;
    organicCrack(main,root,{x:root.x+dir*(11+titleCrackRng()*12),y:Math.max(1,root.y-(23+titleCrackRng()*20))},titleCrackRng,"ruin-fracture-crack ruin-fracture-title-notch-crack ruin-fracture-edge-stone",.60,3,4);

    /* main-frame-right-upper-attached-crack-v167 */
    var upperRng=rngFor(shell,"main-frame-right-upper-attached-crack-v167"), uy=it+(ib-it)*(.14+upperRng()*.09), uh=17+upperRng()*10, ub=13+upperRng()*8;
    var upStart={x:ir,y:uy-uh}, upEnd={x:ir,y:uy+uh};
    poly(main,[tr,upStart,{x:ir+ub*.18,y:uy-uh*.82},{x:ir+ub*.55,y:uy-uh*.34},{x:ir+ub,y:uy+uh*.10},{x:ir+ub*.74,y:uy+uh*.58},{x:ir+ub*.34,y:uy+uh*.88},upEnd],"ruin-fracture-border ruin-fracture-upper-attached-pit",.92);
    path(main,"M "+upStart.x+" "+upStart.y+" C "+(ir+1)+" "+(uy-uh*.55)+", "+(ir+1.6)+" "+uy+", "+upEnd.x+" "+upEnd.y,"ruin-fracture-crack ruin-fracture-upper-attached-return",.70);

    /* main-frame-right-lower-notch-v174 */
    var lowerRng=rngFor(shell,"main-frame-right-lower-notch-v174"), ly=it+(ib-it)*(.68+lowerRng()*.12), lh=36+lowerRng()*26, ld=6+lowerRng()*7;
    var loStart={x:ir,y:ly-lh*.5}, loRoot={x:ir+ld,y:ly+(lowerRng()-.5)*5}, loEnd={x:ir,y:ly+lh*.5};
    poly(main,[upEnd,loStart,{x:ir+ld*.20,y:ly-lh*.36},{x:ir+ld*.62,y:ly-lh*.20},loRoot,{x:ir+ld*.74,y:ly+lh*.16},{x:ir+ld*.40,y:ly+lh*.33},loEnd,br],"ruin-fracture-border ruin-fracture-damaged",.92);
    path(main,"M "+loStart.x+" "+loStart.y+" C "+(ir+1)+" "+(ly-lh*.18)+", "+(ir+1.1)+" "+(ly+lh*.18)+", "+loEnd.x+" "+loEnd.y,"ruin-fracture-crack ruin-fracture-lower-right-return",.70);
    poly(main,[br,bl],"ruin-fracture-border",.70);

    /* main-frame-left-stone-pit-v211 / ruin-fracture-left-pit */
    var leftRng=rngFor(shell,"main-frame-left-stone-pit-v211"), py=it+(ib-it)*(.35+leftRng()*.38), ph=Math.min(70,Math.max(34,(ib-it)*(.06+leftRng()*.04))), pd=5+leftRng()*6;
    var pTop={x:il,y:py-ph*.5}, pBottom={x:il,y:py+ph*.5};
    poly(main,[bl,pBottom],"ruin-fracture-border",.86);
    poly(main,[pBottom,{x:il-pd*.28,y:py+ph*.35},{x:il-pd*.72,y:py+ph*.15},{x:il-pd,y:py-ph*.03},{x:il-pd*.55,y:py-ph*.28},pTop],"ruin-fracture-border ruin-fracture-left-pit ruin-fracture-damaged",.88);
    poly(main,[pTop,tl],"ruin-fracture-border",.86);

    /* main-frame-right-outward-tree-v148 */
    var outRng=rngFor(shell,"main-frame-right-outward-tree-v148"), junction={x:loRoot.x+44+outRng()*20,y:loRoot.y+8+outRng()*9};
    organicCrack(main,loRoot,junction,outRng,"ruin-fracture-crack ruin-fracture-outward-stem",.52,2,5);
    organicCrack(main,junction,{x:Math.min(w-4,junction.x+94),y:junction.y-(4+outRng()*8)},outRng,"ruin-fracture-crack ruin-fracture-outward-branch",.46,2,5);
    var downEnd={x:Math.min(w-5,junction.x+78),y:junction.y+48+outRng()*18};
    organicCrack(main,junction,downEnd,outRng,"ruin-fracture-crack ruin-fracture-outward-branch",.44,2.4,5);
    if(outRng()<.68) organicCrack(main,pt(junction,downEnd,.45),{x:Math.min(w-5,junction.x+65),y:junction.y+66},outRng,"ruin-fracture-crack ruin-fracture-outward-branch-minor",.30,1.5,3);

    /* perspective-top-left-v194 + spall-major */
    var outerTL={x:.5,y:.5}, innerTL={x:il,y:it}, prng=rngFor(shell,"perspective-top-left-v194");
    var chip=naturalChip(perspective,outerTL,innerTL,prng,{
      width:38+prng()*15,depth:3.3+prng()*2.2,normalSign:1,t:.50+prng()*.18,opacity:.84,returnInset:1,
      className:"ruin-fracture-border ruin-fracture-corner-spall-chip ruin-fracture-spall-major",
      returnClassName:"ruin-fracture-crack ruin-fracture-spall-seam",returnOpacity:.70
    });
    poly(perspective,[{x:w-.5,y:.5},tr],"ruin-fracture-border",.84);

    /* perspective-top-left-transfer-v198 / corner-stem / corner-branch */
    var transfer=rngFor(shell,"perspective-top-left-transfer-v198");
    var attachA=chip.facets[Math.max(0,Math.floor(chip.facets.length*.55))] || pt(outerTL,innerTL,.62);
    var attachB=pt(chip.p2,innerTL,.44);
    var leftEdge={x:.5,y:h*(.28+transfer()*.17)}, mid={x:(attachA.x+attachB.x)*.5,y:(attachA.y+attachB.y)*.5}, fork=pt(leftEdge,mid,.76);
    var s1=pt(leftEdge,fork,.38), s2=pt(leftEdge,fork,.73);
    organicCrack(perspective,leftEdge,s1,transfer,"ruin-fracture-crack ruin-fracture-corner-stem",.42,4.8,5);
    organicCrack(perspective,s1,s2,transfer,"ruin-fracture-crack ruin-fracture-corner-stem",.46,4.2,4);
    organicCrack(perspective,s2,fork,transfer,"ruin-fracture-crack ruin-fracture-corner-stem",.50,4.5,5);
    organicCrack(perspective,fork,attachA,transfer,"ruin-fracture-crack ruin-fracture-corner-branch",.42,3,4);
    organicCrack(perspective,fork,attachB,transfer,"ruin-fracture-crack ruin-fracture-corner-branch",.38,2.8,4);

    /* spall-secondary */
    naturalChip(perspective,pt(outerTL,innerTL,.20),pt(outerTL,innerTL,.36),transfer,{
      width:13+transfer()*7,depth:1.5+transfer()*1.4,normalSign:1,t:.5,opacity:.84,returnInset:.92,
      className:"ruin-fracture-border ruin-fracture-corner-spall-chip ruin-fracture-spall-secondary",
      returnClassName:"ruin-fracture-crack ruin-fracture-spall-seam",returnOpacity:.68
    });

    indexDrawer(shell,drawer,w,h,left,right,ib);
    host.appendChild(perspective);
    host.appendChild(main);
    host.appendChild(drawer);
    shell.dataset.fractureReady="true";
  }

  function enhance() {
    var shell=document.querySelector('.room-view[data-room="ruin-atlas"] .ruin-mini-shell');
    if(!shell) return;
    architecture(shell);
    if(shell.dataset.faithfulFrameV3!=="1"){
      shell.dataset.faithfulFrameV3="1";
      requestAnimationFrame(function(){render(shell);});
    }
  }

  function schedule(){
    cancelAnimationFrame(resizeRaf);
    resizeRaf=requestAnimationFrame(function(){
      resizeRaf=0;
      enhance();
      var shell=document.querySelector('.room-view[data-room="ruin-atlas"] .ruin-mini-shell');
      if(shell) render(shell);
    });
  }

  var app=document.getElementById("app");
  if(app && window.MutationObserver){
    new MutationObserver(function(){requestAnimationFrame(enhance);}).observe(app,{childList:true,subtree:true});
  }
  window.addEventListener("resize",schedule,{passive:true});
  window.addEventListener("orientationchange",schedule,{passive:true});
  requestAnimationFrame(enhance);
})();
