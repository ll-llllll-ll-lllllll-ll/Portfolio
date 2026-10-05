from pathlib import Path

ROOT = Path(__file__).resolve().parent
script_path = ROOT / "script.js"
style_path = ROOT / "style.css"
index_path = ROOT / "index.html"

script = script_path.read_text(encoding="utf-8")
style = style_path.read_text(encoding="utf-8")
index = index_path.read_text(encoding="utf-8")


def replace_once(text, old, new, label):
    if old not in text:
        raise SystemExit(f"missing anchor: {label}")
    return text.replace(old, new, 1)

# 1. Browser title and cache busting.
index = index.replace("<title>LQY</title>", "<title>sky-sea-lake-cloud</title>")
index = index.replace("style.css?v=20261004-0348", "style.css?v=20261006-writings1")
index = index.replace("script.js?v=20261004-0348", "script.js?v=20261006-writings1")

# 2. Add writings label in all languages.
label_anchor = '    collection: "collection",\n    back:'
if script.count(label_anchor) < 3:
    raise SystemExit("expected three label anchors")
script = script.replace(label_anchor, '    collection: "collection",\n    writings: "writings",\n    back:', 3)

# 3. Rename the archive collection.
script = replace_once(
    script,
    '    title: { zh: "废墟地图", en: "Ruin Atlas", ja: "廃墟地図" },',
    '    title: { zh: "墟域图·遗构馆", en: "Ruin Archive", ja: "墟域図・遺構館" },',
    "ruin archive title",
)

# 4. Add the writings data group, using the same ten chapter drawings as manifesto.html.
rooms_anchor = "\nconst rooms = works.concat(collections);\n"
writing_block = r'''

const writings = [
  {
    slug: "ruinwright-manifesto",
    group: "writing",
    title: { zh: "墟构师宣言", en: "Ruinwright Manifesto", ja: "墟構師宣言" },
    intro: {
      zh: [
        "《墟构师宣言》是我对废墟长期观察、研究与实践的一次整理。它记录了我理解废墟的方式，也建立起一套与之相应的理论框架，讨论我如何观看废墟、如何理解这个时代不断出现的现代废墟，以及这些认识如何进一步进入审美与创作。",
        "随着研究逐渐进入实践，“墟构师”也从一种称谓变成了我在废墟中工作的角色。我以这一身份进入废墟进行创作，并将“墟构”发展为属于自身实践的方法，用于《废墟园林》系列作品的建造。",
        "最终，我将对废墟的理解、由此形成的理论，以及在实践中逐渐建立的墟构方法整理在一起，构成《墟构师宣言》。它既是一份个人陈述，也是一套仍在持续修订的工作体系，并作为我面对这个时代“现代废墟”的一部个人法典。"
      ],
      en: [
        "Ruinwright Manifesto is a consolidation of my long-term observation, study, and practice around ruins. It records the way I understand ruins and gathers the theoretical framework that has grown alongside that understanding, including how I look at ruins, how I understand the modern ruins continually appearing in this era, and how those understandings enter aesthetics and artistic practice.",
        "As research gradually entered practice, “Ruinwright” shifted from a name into the role through which I work inside ruins. In that role I enter ruins to make work, and have developed “Ruinwork” as a method belonging to my own practice, used in the construction of the Folly Series.",
        "I eventually brought these understandings of ruins, the theories that emerged from them, and the methods of Ruinwork developed through practice together as the Ruinwright Manifesto. It is both a personal statement and a working system that remains open to revision: a personal code for confronting the “modern ruins” of this era."
      ],
      ja: [
        "『墟構師宣言』は、廃墟について長期にわたり行ってきた観察・研究・実践を整理したものである。そこには、私が廃墟をどのように理解してきたか、その理解とともに形づくられた理論的な枠組み、そして廃墟をどのように見るか、この時代に絶えず現れる現代の廃墟をどう理解するか、それらの認識が美学と制作へどう入っていくかが記されている。",
        "研究が次第に実践へ入っていくにつれ、「墟構師」は一つの呼称から、私が廃墟の中で仕事をするための役割へと変わった。私はこの立場で廃墟へ入り制作を行い、「墟構」を自らの実践に属する方法として育て、『フォリー』シリーズの制作に用いている。",
        "最終的に、廃墟についての理解、そこから生まれた理論、そして実践の中で築いてきた墟構の方法を一つに編み直し、『墟構師宣言』とした。それは個人的なステートメントであると同時に、なお更新され続ける作業体系であり、この時代の「現代の廃墟」に向き合うための私自身の法典でもある。"
      ]
    },
    visit: "https://ruin-archive.site/manifesto.html",
    visitLabel: {
      zh: "阅读《墟构师宣言》",
      en: "read the Ruinwright Manifesto",
      ja: "『墟構師宣言』を読む"
    },
    tenetImages: [
      "https://ruin-archive.site/manifesto-assets/tenets/chapters/01.png",
      "https://ruin-archive.site/manifesto-assets/tenets/chapters/02.png",
      "https://ruin-archive.site/manifesto-assets/tenets/chapters/03.png",
      "https://ruin-archive.site/manifesto-assets/tenets/chapters/04.png",
      "https://ruin-archive.site/manifesto-assets/tenets/chapters/05.png",
      "https://ruin-archive.site/manifesto-assets/tenets/chapters/06.png",
      "https://ruin-archive.site/manifesto-assets/tenets/chapters/07.png",
      "https://ruin-archive.site/manifesto-assets/tenets/chapters/08.png",
      "https://ruin-archive.site/manifesto-assets/tenets/chapters/09.png",
      "https://ruin-archive.site/manifesto-assets/tenets/chapters/10.png"
    ],
    images: []
  }
];

const rooms = works.concat(collections, writings);
'''
script = replace_once(script, rooms_anchor, writing_block, "rooms list")

# 5. Render a real three-paragraph introduction for writing pages.
room_fn_anchor = '''function roomIndex(item) {
  return rooms.findIndex(function(candidate) { return candidate.slug === item.slug; });
}

function renderRoom(item) {'''
room_fn_replacement = '''function roomIndex(item) {
  return rooms.findIndex(function(candidate) { return candidate.slug === item.slug; });
}

function renderRoomIntro(item) {
  var intro = localised(item.intro);
  if (!Array.isArray(intro)) {
    return '<p class="room-intro">' + escapeHtml(intro || "") + '</p>';
  }

  return '<div class="room-intro-stack">' + intro.map(function(paragraph, index) {
    var safe = escapeHtml(paragraph || "");
    if (item.group === "writing" && index === 0) {
      var title = escapeHtml(localised(item.title));
      if (safe.indexOf(title) === 0) {
        safe = '<strong class="writing-intro-name">' + title + '</strong>' + safe.slice(title.length);
      }
    }
    return '<p class="room-intro">' + safe + '</p>';
  }).join("") + '</div>';
}

function renderRoom(item) {'''
script = replace_once(script, room_fn_anchor, room_fn_replacement, "room intro helper")

script = replace_once(
    script,
    '  var groupLabel = item.group === "collection" ? labels[state.lang].collection : labels[state.lang].works;',
    '  var groupLabel = item.group === "collection" ? labels[state.lang].collection : item.group === "writing" ? labels[state.lang].writings : labels[state.lang].works;',
    "room group label",
)

script = replace_once(
    script,
    "  var html = '<section class=\"room-view\">' +",
    "  var html = '<section class=\"room-view' + (item.group === \"writing\" ? \" writing-room\" : \"\") + '\">' +",
    "writing room class",
)

script = replace_once(
    script,
    "        '<p class=\"room-intro\">' + escapeHtml(localised(item.intro)) + \"</p>\" +",
    "        renderRoomIntro(item) +",
    "room intro render",
)

# 6. Insert the ten drawings immediately after the generic image loop.
image_loop = '''  images.forEach(function(image, index) {
    html += '<figure class="room-image' + (image.fit === "contain" ? " is-contain" : "") + '">' +
      '<img src="' + image.src + '" alt="" ' + (index ? 'loading="lazy"' : "") + " />" +
      '<figcaption>' + escapeHtml(localised(image.caption)) + "</figcaption>" +
    "</figure>";
  });
'''
image_loop_plus = image_loop + '''
  if (item.group === "writing" && Array.isArray(item.tenetImages)) {
    html += '<section class="writing-tenets" aria-label="Ruinwright ten tenets">';
    item.tenetImages.forEach(function(src, index) {
      html += '<a class="writing-tenet-card" href="' + item.visit + '" target="_blank" rel="noreferrer" aria-label="' + escapeHtml(localised(item.title)) + ' · ' + String(index + 1).padStart(2, "0") + '">' +
        '<span class="writing-tenet-tile"><img src="' + src + '" alt="" loading="lazy" /></span>' +
        '<span class="writing-tenet-number">' + String(index + 1).padStart(2, "0") + '</span>' +
      '</a>';
    });
    html += '</section>';
  }
'''
script = replace_once(script, image_loop, image_loop_plus, "tenet image strip")

# 7. Add writings as the third index group.
index_group_anchor = '''  collections.forEach(function(item) {
    html += '<button type="button" class="index-link" data-action="route" data-route="' + item.slug + '">' +
      escapeHtml(localised(item.title)) + "</button>";
  });

  html += "</section></div></aside>";'''
index_group_replacement = '''  collections.forEach(function(item) {
    html += '<button type="button" class="index-link" data-action="route" data-route="' + item.slug + '">' +
      escapeHtml(localised(item.title)) + "</button>";
  });

  html += '</section><section class="index-group"><p class="index-heading">' + labels[state.lang].writings + "</p>";
  writings.forEach(function(item) {
    html += '<button type="button" class="index-link" data-action="route" data-route="' + item.slug + '">' +
      escapeHtml(localised(item.title)) + "</button>";
  });

  html += "</section></div></aside>";'''
script = replace_once(script, index_group_anchor, index_group_replacement, "index writings group")

# 8. Keep footer navigation inside the current group.
script = replace_once(
    script,
    '    var list = item && item.group === "collection" ? collections : works;',
    '    var list = item && item.group === "collection" ? collections : item && item.group === "writing" ? writings : works;',
    "group footer navigation",
)

# 9. Portfolio-specific presentation for the new writing room and 10-tile directory.
marker = "/* ===== Writings / Ruinwright Manifesto ===== */"
if marker in style:
    raise SystemExit("writings styles already present")
style += r'''

/* ===== Writings / Ruinwright Manifesto ===== */
.index-panel {
  grid-template-columns: repeat(3, minmax(150px, 1fr));
  width: min(850px, calc(100vw - 64px));
}

.writing-room {
  background: #f4f3ee;
  color: #24251f;
}

.writing-room .room-scroll {
  background: #f4f3ee;
}

.writing-room .room-head {
  border-bottom-color: rgba(26, 27, 23, 0.12);
  background: rgba(244, 243, 238, 0.92);
  color: rgba(26, 27, 23, 0.64);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.writing-room .room-head .language button {
  color: rgba(26, 27, 23, 0.34);
}

.writing-room .room-head .language button:hover,
.writing-room .room-head .language button.is-active {
  color: rgba(26, 27, 23, 0.9);
}

.writing-room .room-lead {
  min-height: auto;
  align-content: start;
  padding: clamp(92px, 12vh, 142px) 4vw 48px;
}

.writing-room .room-group {
  color: rgba(26, 27, 23, 0.38);
}

.writing-room .room-lead h1 {
  margin-bottom: 44px;
  color: rgba(26, 27, 23, 0.92);
  font-size: clamp(38px, 4.8vw, 68px);
}

.room-intro-stack {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: clamp(28px, 3.4vw, 58px);
  width: 100%;
}

.writing-room .room-intro {
  width: auto;
  max-width: none;
  margin: 0;
  color: rgba(26, 27, 23, 0.72);
  font-family: var(--sans);
  font-size: 14px;
  font-weight: 300;
  line-height: 1.95;
  letter-spacing: 0.006em;
}

.writing-intro-name {
  margin-right: 0.45em;
  color: rgba(26, 27, 23, 0.94);
  font-family: var(--serif);
  font-size: 1.18em;
  font-weight: 400;
  white-space: nowrap;
}

.writing-tenets {
  display: grid;
  grid-template-columns: repeat(10, minmax(0, 1fr));
  align-items: end;
  gap: clamp(12px, 1.25vw, 24px);
  width: 100%;
  padding: 28px 18px 72px;
}

.writing-tenet-card {
  display: block;
  min-width: 0;
  color: rgba(26, 27, 23, 0.48);
  text-align: center;
  text-decoration: none;
}

.writing-tenet-tile {
  position: relative;
  display: grid;
  place-items: center;
  width: 100%;
  aspect-ratio: 1 / 1;
  padding: clamp(10px, 1vw, 18px);
  overflow: hidden;
  border: 1px solid rgba(26, 27, 23, 0.13);
  background: #f1efe8;
  box-shadow:
    inset 5px 5px 0 rgba(255, 255, 255, 0.72),
    inset -5px -5px 0 rgba(32, 31, 26, 0.06);
  transition: transform 180ms var(--ease), background 180ms ease;
}

.writing-tenet-tile img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: contain;
  opacity: 0.92;
}

.writing-tenet-number {
  display: block;
  margin-top: 9px;
  font-size: 8px;
  letter-spacing: 0.12em;
}

.writing-tenet-card:hover .writing-tenet-tile,
.writing-tenet-card:focus-visible .writing-tenet-tile {
  transform: translateY(-2px);
  background: #f7f5ef;
}

.writing-room .room-visit-wrap,
.writing-room .room-footer {
  position: relative;
  z-index: 2;
}

.writing-room .room-visit {
  color: rgba(26, 27, 23, 0.72);
  border-color: rgba(26, 27, 23, 0.18);
}

@media (max-width: 1100px) and (min-width: 761px) {
  .writing-tenets {
    grid-template-columns: repeat(5, minmax(0, 1fr));
    gap: 24px 18px;
    padding: 24px 26px 64px;
  }

  .room-intro-stack {
    grid-template-columns: 1fr;
    gap: 18px;
  }
}

@media (max-width: 760px) {
  .index-panel {
    grid-template-columns: 1fr;
    gap: 28px;
    width: min(420px, calc(100vw - 36px));
    max-height: calc(100svh - 110px);
    overflow-y: auto;
  }

  .writing-room .room-lead {
    padding: 84px 20px 28px;
  }

  .writing-room .room-lead h1 {
    margin-bottom: 28px;
  }

  .room-intro-stack {
    grid-template-columns: 1fr;
    gap: 19px;
  }

  .writing-room .room-intro {
    font-size: 14px;
    line-height: 1.88;
  }

  .writing-tenets {
    grid-auto-flow: column;
    grid-template-columns: none;
    grid-template-rows: 1fr;
    grid-auto-columns: minmax(122px, 42vw);
    gap: 14px;
    overflow-x: auto;
    padding: 18px 18px 48px;
    scroll-snap-type: x proximity;
    -webkit-overflow-scrolling: touch;
  }

  .writing-tenet-card {
    scroll-snap-align: start;
  }
}
'''

index_path.write_text(index, encoding="utf-8")
script_path.write_text(script, encoding="utf-8")
style_path.write_text(style, encoding="utf-8")
print("Applied writings group, manifesto entry, tenet tiles, title, and archive rename.")
