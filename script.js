"use strict";

const LANGS = ["zh", "en", "ja"];

const labels = {
  zh: { index: "索引", close: "收起", language: "语言", next: "下一处", revision: "正文修订中", placeholder: "版式预览；正文待迁入" },
  en: { index: "index", close: "close", language: "language", next: "next", revision: "text under revision", placeholder: "layout preview; full text forthcoming" },
  ja: { index: "索引", close: "閉じる", language: "言語", next: "次へ", revision: "本文改稿中", placeholder: "組版プレビュー・本文移行前" }
};

const series = [
  {
    slug: "ruin-garden",
    title: { zh: "废墟园林", en: "Ruin Garden", ja: "廃墟庭園" },
    intro: {
      zh: "《废墟园林》将废墟视作一种仍在发生的建筑状态。材料、植物、风化与重力共同接手作者的位置；“墟构师”只作为这个世界中一闪而过的名字。",
      en: "Ruin Garden treats the ruin as an architectural state still in progress. Matter, plants, weathering and gravity gradually take the author’s place; “Ruinwright” appears only as a passing name within this world.",
      ja: "《廃墟庭園》は、廃墟をいまも進行する建築の状態として捉える。素材、植物、風化、重力が作者の位置を引き継ぎ、「墟構師」はこの世界を横切る名として一度だけ現れる。"
    },
    reader: "manifesto",
    works: [
      {
        image: "./img1-blur.jpg",
        title: { zh: "现场记录 01", en: "Site record 01", ja: "現場記録 01" },
        meta: { zh: "装置 · 水 · 生长", en: "installation · water · growth", ja: "装置 · 水 · 生長" },
        alt: { zh: "植物围绕的一座小型废墟装置", en: "A small ruin-like structure surrounded by plants", ja: "植物に囲まれた小さな廃墟状の装置" }
      },
      {
        image: "./img2-blur.jpg",
        title: { zh: "现场记录 02", en: "Site record 02", ja: "現場記録 02" },
        meta: { zh: "张拉 · 荒地 · 将倒未倒", en: "tension · wasteland · almost falling", ja: "張力 · 荒地 · 倒れかけ" },
        alt: { zh: "荒地中的张拉结构与螺旋形构件", en: "A tensioned structure and spiral form in a wasteland", ja: "荒地に置かれた張力構造と螺旋状の部材" }
      }
    ]
  },
  {
    slug: "the-instrument",
    title: { zh: "The Instrument", en: "The Instrument", ja: "The Instrument" },
    intro: {
      zh: "一组介于实验器械、声音装置与私人宇宙学之间的工作。它们借用科学的外壳，却不假装提供结论；仪器在此成为直觉暂时获得形状的方法。",
      en: "A family of works between experimental apparatus, sound installation and private cosmology. They borrow the shell of science without pretending to conclude; an instrument is a way for intuition to briefly acquire form.",
      ja: "実験器械、音響装置、私的宇宙論のあいだにある作品群。科学の外殻を借りながら結論を装わず、器械は直観が一時的に形を得るための方法となる。"
    },
    reader: "paper",
    works: [
      {
        image: "./img3-blur.jpg",
        title: { zh: "仪器试作 01", en: "Instrument study 01", ja: "器械試作 01" },
        meta: { zh: "接收 · 转译 · 微弱信号", en: "reception · translation · faint signals", ja: "受信 · 翻訳 · 微弱信号" },
        alt: { zh: "The Instrument 系列的装置现场", en: "An installation from The Instrument series", ja: "The Instrument シリーズの装置風景" }
      },
      {
        image: "./img4-blur.jpg",
        title: { zh: "仪器试作 02", en: "Instrument study 02", ja: "器械試作 02" },
        meta: { zh: "声音 · 机械 · 感知", en: "sound · mechanism · perception", ja: "音 · 機械 · 知覚" },
        alt: { zh: "The Instrument 系列的机械与声音装置", en: "A mechanical and sound apparatus from The Instrument", ja: "The Instrument の機械・音響装置" }
      }
    ]
  },
  {
    slug: "fictional-topography",
    title: { zh: "虚构地形学", en: "Fictional Topography", ja: "架空地形学" },
    intro: {
      zh: "这里的地图不负责复原世界，而负责收留遗漏之物。地点被发现、命名、记录，再以图像、声音与文本进入《墟域图·遗构馆》，成为一片不断改写自身的地理。",
      en: "These maps do not restore the world; they shelter what it leaves out. Sites are found, named and recorded, then enter the Atlas of Ruins through image, sound and text—an unfinished geography rewriting itself.",
      ja: "この地図は世界を復元するためではなく、こぼれ落ちたものを収めるためにある。場所は発見され、名づけられ、記録され、像・音・言葉として《墟域図・遺構館》へ入り、自らを書き換え続ける地理となる。"
    },
    archive: "https://ruin-archive.site/",
    works: [
      {
        image: "./img5-blur.jpg",
        title: { zh: "地表记录 01", en: "Terrain record 01", ja: "地表記録 01" },
        meta: { zh: "迁移 · 渗透 · 遗留", en: "migration · seepage · remains", ja: "移動 · 浸透 · 遺留" },
        alt: { zh: "虚构地形学系列的田野记录", en: "A field record from Fictional Topography", ja: "架空地形学シリーズのフィールド記録" }
      },
      {
        image: "./img6-blur.jpg",
        title: { zh: "地表记录 02", en: "Terrain record 02", ja: "地表記録 02" },
        meta: { zh: "命名 · 测绘 · 档案", en: "naming · mapping · archive", ja: "命名 · 測量 · 記録" },
        alt: { zh: "虚构地形学系列的遗构图像", en: "An image of a remnant from Fictional Topography", ja: "架空地形学シリーズの遺構画像" }
      }
    ]
  }
];

const documents = {
  manifesto: {
    title: { zh: "墟构师宣言", en: "Manifesto of the Ruinwright", ja: "墟構師宣言" },
    sections: [
      {
        title: { zh: "序言：在建筑之后", en: "Prelude: After Architecture", ja: "序：建築のあとで" },
        paragraphs: {
          zh: ["我们拒绝永恒的伪饰。在被“第二自然”规训的世界里，废墟沿着秩序的裂纹显影。它并非死亡的终点，而是过程重新取得主权之处。", "我们从裂隙与角落中出现。墟构从建筑之后开始。"],
          en: ["We refuse the disguise of permanence. In a world disciplined by a second nature, ruins appear along the cracks of order—not as an endpoint, but where process regains its agency.", "We emerge from fissures and corners. Ruinwrighting begins after architecture."],
          ja: ["私たちは永遠という偽装を退ける。「第二の自然」に規律化された世界で、廃墟は秩序の亀裂に沿って姿を現す。終点ではなく、過程が再び主導権を得る場所として。", "私たちは裂け目と隅から現れる。墟構は建築のあとから始まる。"]
        }
      },
      {
        title: { zh: "01　凝视崩解", en: "01  The Gaze Dissolves", ja: "01　凝視の崩解" },
        paragraphs: {
          zh: ["如画美曾在废墟周围划出一道画框，使观看者仍站在秩序一侧。然而时间、重力与自然持续作用，终会冲破这层审美边界。", "门不再指向入口，走廊不再保证抵达，屋顶也停止承诺庇护。观看由安全的距离滑向崇高：一种冷静而无法退避的绝望。"],
          en: ["The picturesque once drew a frame around the ruin and kept the viewer on the side of order. Time, gravity and nature eventually break that aesthetic boundary.", "A door no longer guarantees entry, a corridor no longer promises arrival, and a roof ceases to offer shelter. Looking slips from safe distance toward the sublime."],
          ja: ["ピクチャレスクは廃墟の周囲に額縁を引き、見る者を秩序の側に留めてきた。だが時間、重力、自然の作用は、その美的境界をやがて破る。", "扉は入口を、廊下は到達を、屋根は庇護を保証しなくなる。眼差しは安全な距離から崇高へと滑っていく。"]
        }
      },
      {
        title: { zh: "02　剥离规训", en: "02  Unlearning Discipline", ja: "02　規律を剥ぐ" },
        paragraphs: {
          zh: ["当功能撤离，支撑日常经验的内部秩序开始松动。墟构师不急于修复这份失序，而先悬置用途，让材料重新显露自身的重量、裂纹与迟缓。", "愚者的姿态并非无知，而是在既定道路之外迈出一步：让尚未被承认的关系获得发生的机会。"],
          en: ["When function withdraws, the inner order supporting everyday experience loosens. The Ruinwright suspends use long enough for weight, fissure and slowness to appear again.", "The fool’s gesture is not ignorance but a step beyond the sanctioned path, allowing unrecognised relations to occur."],
          ja: ["機能が退くと、日常経験を支えていた内部秩序が緩み始める。墟構師はすぐに修復せず、用途を宙づりにし、素材の重さ、亀裂、遅さを再び露わにする。", "愚者の身振りは無知ではない。定められた道の外へ一歩踏み出し、まだ承認されていない関係に生起の機会を与える。"]
        }
      },
      {
        title: { zh: "03　自毁的剧场", en: "03  Theatre of Self-Ruin", ja: "03　自壊の劇場" },
        paragraphs: {
          zh: ["墟构预先安排崩解，却不垄断崩解的结果。张力、腐蚀、天气与偶然在同一结构中牵丝相连，作品的完成被推迟到作者退场之后。", "这里的高潮常常反高潮：长久的劳动只为抵达一个短暂、不可逆、甚至近乎徒劳的时刻。"],
          en: ["Ruinwrighting prepares collapse without owning its outcome. Tension, corrosion, weather and chance remain linked, delaying completion until after the author has stepped away.", "Its climax is often anti-climactic: prolonged labour arriving at one brief, irreversible and nearly futile moment."],
          ja: ["墟構は崩解をあらかじめ組み込むが、その結果を独占しない。張力、腐食、天候、偶然がひとつの構造で結ばれ、完成は作者の退場後まで延期される。", "そのクライマックスはしばしば反クライマックスである。長い労働が、短く不可逆で、ほとんど徒労にも見える瞬間へ届く。"]
        }
      },
      {
        title: { zh: "04　绝响", en: "04  Final Resonance", ja: "04　絶響" },
        paragraphs: {
          zh: ["当意义、叙事与功能相继耗散，剩下的声音不再说明什么。摩擦、断裂、回声与沉默把人带回绝对当下。", "我们为不完美的毁灭赋予美的过程，并在过程能够自行维持时退场。"],
          en: ["As meaning, narrative and function dissipate, the remaining sound explains nothing. Friction, fracture, echo and silence return us to the absolute present.", "We give imperfect destruction a beautiful process, and withdraw when that process can sustain itself."],
          ja: ["意味、物語、機能が散逸したあと、残る音は何も説明しない。摩擦、断裂、反響、沈黙が人を絶対的な現在へ戻す。", "私たちは不完全な破壊に美しい過程を与え、その過程が自ら続くとき退場する。"]
        }
      },
      {
        title: { zh: "墟构师建造十则", en: "Tenets of the Ruinwright", ja: "墟構師の建造十則" },
        paragraphs: {
          zh: ["十则不是样式清单，而是一组使作品保持开放的操作原则。"],
          en: ["These tenets are not a style guide but operational principles that keep a work open."],
          ja: ["十則は様式の一覧ではなく、作品を開かれたままにするための操作原理である。"]
        },
        tenets: {
          zh: ["悬置", "去功能", "凋零", "预构崩解", "后戏剧布置", "牵丝因果", "借墟", "粗野物性", "耗散成声", "毁于一击"],
          en: ["Suspension", "De-functionalise", "Withering", "Prefigured Collapse", "Post-dramatic Placement", "Threaded Causality", "Borrow the Ruin", "Raw Materiality", "Dissipation into Sound", "Destroyed in One Blow"],
          ja: ["宙吊り", "脱機能", "凋落", "崩解の予構", "ポストドラマ的配置", "牽糸因果", "廃墟を借りる", "粗野な物性", "散逸して音となる", "一撃に毀つ"]
        }
      }
    ]
  },
  paper: {
    title: { zh: "在殿堂与荒原之间——民科", en: "Between the Hall and the Wasteland", ja: "殿堂と荒野のあいだ——民科" },
    sections: [
      {
        title: { zh: "摘要", en: "Abstract", ja: "要旨" },
        paragraphs: {
          zh: ["本文的位置在知识的殿堂与经验的荒原之间。这里暂时放入论文的核心问题作为版式占位：未经授权的知识如何制造自己的仪器，又如何面对验证、失败与误认。"],
          en: ["This text sits between the hall of authorised knowledge and the wasteland of experience. For now, its central question acts as a layout placeholder: how does unsanctioned knowledge build instruments and face verification, failure and misrecognition?"],
          ja: ["この文章は、知の殿堂と経験の荒野のあいだに位置する。ここでは構成確認のため、非公認の知がいかに器械をつくり、検証・失敗・誤認に向き合うかという問いを仮置きする。"]
        }
      },
      {
        title: { zh: "01　殿堂：被授权的知识", en: "01  The Hall: Authorised Knowledge", ja: "01　殿堂：認可された知" },
        paragraphs: {
          zh: ["殿堂以制度、方法与可重复性建立边界。它提供公共的尺度，也决定哪些经验能够被命名为知识。此处将容纳论文关于科学权威与方法纪律的正式章节。"],
          en: ["The hall establishes its boundary through institutions, method and repeatability. It offers a public measure while deciding which experiences may be named knowledge. The original chapter will replace this passage."],
          ja: ["殿堂は制度、方法、再現性によって境界をつくる。公共の尺度を与える一方、どの経験が知と呼ばれるかを決める。ここには原論文の正式な章が入る。"]
        }
      },
      {
        title: { zh: "02　荒原：未经许可的仪器", en: "02  The Wasteland: Unsanctioned Instruments", ja: "02　荒野：許可なき器械" },
        paragraphs: {
          zh: ["荒原并不自动等同自由。它同时容纳直觉、执念、发明与错误。民科制造的仪器常常既是测量工具，也是愿望的物质模型。此处将放入对具体案例的讨论。"],
          en: ["The wasteland is not automatically freedom; it holds intuition, obsession, invention and error together. Its instruments can be measuring devices and material models of desire at once."],
          ja: ["荒野は自動的に自由を意味しない。直観、執念、発明、誤りを同時に抱える。その器械は測定具であると同時に、願望の物質的な模型にもなりうる。"]
        }
      },
      {
        title: { zh: "03　之间：理性直觉化", en: "03  Between: Rationalising Intuition", ja: "03　あいだ：理性の直観化" },
        paragraphs: {
          zh: ["The Instrument 不替民科辩护，也不从殿堂对它进行嘲讽。它把两者之间的裂隙当作工作场：使理性重新获得可触的直觉，也使玄学接受功能与失败的检验。", "原论文迁入后，边注、引文与图版会留在阅读栏两侧，正文仍保持单一、缓慢的纵向路线。"],
          en: ["The Instrument neither defends fringe science nor mocks it from the hall. It works within the fissure: returning tactile intuition to reason while exposing metaphysics to function and failure.", "When the paper is imported, notes, citations and plates will occupy the margins while the body keeps one slow vertical path."],
          ja: ["The Instrument は民科を擁護せず、殿堂から嘲笑もしない。その亀裂を作業場とし、理性に触覚的な直観を返しながら、形而上のものを機能と失敗の検証にさらす。", "原稿移行後、注・引用・図版は本文の両側に置かれ、本文自体は一本のゆっくりした縦の道を保つ。"]
        }
      }
    ]
  }
};

const state = {
  lang: readLanguage(),
  menuOpen: false
};

const app = document.querySelector("#app");

function readLanguage() {
  try {
    const saved = localStorage.getItem("lqy-language");
    return LANGS.includes(saved) ? saved : "zh";
  } catch (_) {
    return "zh";
  }
}

function saveLanguage(lang) {
  try { localStorage.setItem("lqy-language", lang); } catch (_) { /* storage may be unavailable */ }
}

function text(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#039;"
  })[character]);
}

function localised(value) {
  return value[state.lang];
}

function parseRoute() {
  const parts = location.hash.replace(/^#\/?/, "").split("/").filter(Boolean);
  const seriesIndex = series.findIndex((item) => item.slug === parts[0]);
  if (seriesIndex < 0) return { seriesIndex: null, reader: null };

  const candidate = parts[1];
  const reader = candidate && series[seriesIndex].reader === candidate ? candidate : null;
  return { seriesIndex, reader };
}

function languageSwitch() {
  return `
    <nav class="language" aria-label="${text(labels[state.lang].language)}">
      ${LANGS.map((lang) => `
        <button
          type="button"
          data-action="language"
          data-lang="${lang}"
          class="${state.lang === lang ? "is-active" : ""}"
          aria-current="${state.lang === lang ? "true" : "false"}"
        >${lang === "ja" ? "JP" : lang.toUpperCase()}</button>
      `).join("")}
    </nav>
  `;
}

function indexRoom() {
  return `
    <aside class="index-room" role="dialog" aria-modal="true" aria-label="${text(labels[state.lang].index)}" ${state.menuOpen ? "" : "hidden"}>
      <button class="index-backdrop" type="button" data-action="close-index" aria-label="${text(labels[state.lang].close)}"></button>
      <nav class="index-list" aria-label="${text(labels[state.lang].index)}">
        <div>
          ${series.map((item) => `
            <button type="button" data-action="route" data-route="${item.slug}">${text(localised(item.title))}</button>
          `).join("")}
        </div>
        <div class="index-writing">
          <button type="button" data-action="route" data-route="ruin-garden/manifesto">${text(localised(documents.manifesto.title))}</button>
          <button type="button" data-action="route" data-route="the-instrument/paper">${text(localised(documents.paper.title))}</button>
          <a href="https://ruin-archive.site/" target="_blank" rel="noreferrer">墟域图·遗构馆 ↗</a>
        </div>
      </nav>
    </aside>
  `;
}

function renderHome() {
  const copy = labels[state.lang];
  return `
    <section class="home-view" aria-label="LQY">
      <div class="ambient-field" aria-hidden="true">
        ${series.map((item, index) => `
          <img class="ambient-image ambient-image-${index + 1}" src="${item.works[1].image}" alt="" />
        `).join("")}
        <span class="ambient-veil"></span>
      </div>

      <header class="home-bar">
        <button type="button" class="home-mark" data-action="close-index">LQY</button>
        ${languageSwitch()}
      </header>

      <button class="index-toggle" type="button" data-action="toggle-index" aria-expanded="${state.menuOpen}">
        ${text(state.menuOpen ? copy.close : copy.index)}
      </button>

      ${indexRoom()}
    </section>
  `;
}

function roomBar(title, end, endAction, endRoute = "") {
  return `
    <header class="room-bar">
      <button type="button" data-action="home">LQY</button>
      <p>${text(title)}</p>
      <button type="button" data-action="${endAction}" ${endRoute ? `data-route="${endRoute}"` : ""}>${text(end)}</button>
    </header>
    <div class="progress-line" aria-hidden="true"><i></i></div>
  `;
}

function renderProject(seriesIndex) {
  const item = series[seriesIndex];
  const lead = item.works[0];
  const next = series[(seriesIndex + 1) % series.length];

  return `
    <section class="project-view" aria-label="${text(localised(item.title))}">
      ${roomBar(localised(item.title), labels[state.lang].index, "home")}

      <div class="project-scroll" tabindex="0">
        <figure class="project-lead">
          <img src="${lead.image}" alt="${text(localised(lead.alt))}" />
          <figcaption>
            <span>${text(localised(lead.title))}</span>
            <span>${text(localised(lead.meta))}</span>
          </figcaption>
        </figure>

        <section class="project-copy">
          <p>${text(localised(item.intro))}</p>
          <div class="project-links">
            ${item.reader ? `
              <button type="button" data-action="route" data-route="${item.slug}/${item.reader}">${text(localised(documents[item.reader].title))}</button>
            ` : ""}
            ${item.archive ? `<a href="${item.archive}" target="_blank" rel="noreferrer">墟域图·遗构馆 ↗</a>` : ""}
          </div>
        </section>

        <div class="project-gallery">
          ${item.works.slice(1).map((work) => `
            <figure>
              <img src="${work.image}" alt="${text(localised(work.alt))}" loading="lazy" />
              <figcaption>
                <span>${text(localised(work.title))}</span>
                <span>${text(localised(work.meta))}</span>
              </figcaption>
            </figure>
          `).join("")}
        </div>

        <footer class="project-footer">
          <button type="button" data-action="route" data-route="${next.slug}" aria-label="${text(labels[state.lang].next)}: ${text(localised(next.title))}">
            ${text(localised(next.title))} <span aria-hidden="true">→</span>
          </button>
        </footer>
      </div>
    </section>
  `;
}

function renderReader(seriesIndex, readerKey) {
  const parent = series[seriesIndex];
  const documentData = documents[readerKey];
  const note = readerKey === "paper" ? labels[state.lang].placeholder : labels[state.lang].revision;

  return `
    <section class="reader-view" aria-label="${text(localised(documentData.title))}">
      ${roomBar(localised(documentData.title), localised(parent.title), "route", parent.slug)}

      <div class="reader-scroll" tabindex="0">
        <article class="essay">
          <header class="essay-head">
            <h1>${text(localised(documentData.title))}</h1>
            <p>${text(note)}</p>
          </header>

          ${documentData.sections.map((section) => `
            <section class="essay-section">
              <h2>${text(localised(section.title))}</h2>
              ${section.paragraphs[state.lang].map((paragraph) => `<p>${text(paragraph)}</p>`).join("")}
              ${section.tenets ? `
                <ol>${section.tenets[state.lang].map((tenet) => `<li>${text(tenet)}</li>`).join("")}</ol>
              ` : ""}
            </section>
          `).join("")}
        </article>
      </div>
    </section>
  `;
}

function bindProgress() {
  const scroller = document.querySelector(".project-scroll, .reader-scroll");
  const line = document.querySelector(".progress-line i");
  if (!scroller || !line) return;

  const update = () => {
    const maximum = scroller.scrollHeight - scroller.clientHeight;
    const progress = maximum > 0 ? scroller.scrollTop / maximum : 0;
    line.style.transform = `scaleX(${progress})`;
  };

  scroller.addEventListener("scroll", update, { passive: true });
  update();
}

function render() {
  const route = parseRoute();
  document.documentElement.lang = state.lang === "zh" ? "zh-Hant" : state.lang;

  if (route.seriesIndex === null) {
    document.title = "LQY";
    app.innerHTML = `<main class="site-root">${renderHome()}</main>`;
  } else if (route.reader) {
    state.menuOpen = false;
    document.title = `${localised(documents[route.reader].title)} — LQY`;
    app.innerHTML = `<main class="site-root">${renderReader(route.seriesIndex, route.reader)}</main>`;
  } else {
    state.menuOpen = false;
    document.title = `${localised(series[route.seriesIndex].title)} — LQY`;
    app.innerHTML = `<main class="site-root">${renderProject(route.seriesIndex)}</main>`;
  }

  bindProgress();
}

function setIndex(open) {
  state.menuOpen = open;
  const room = document.querySelector(".index-room");
  const toggle = document.querySelector(".index-toggle");
  if (!room || !toggle) return;

  room.hidden = !open;
  toggle.setAttribute("aria-expanded", String(open));
  toggle.textContent = open ? labels[state.lang].close : labels[state.lang].index;
}

function goHome() {
  state.menuOpen = false;
  history.pushState(null, "", `${location.pathname}${location.search}`);
  render();
}

function goRoute(route) {
  state.menuOpen = false;
  const nextHash = `#${route}`;
  if (location.hash === nextHash) render();
  else location.hash = route;
}

app.addEventListener("click", (event) => {
  const target = event.target.closest("[data-action]");
  if (!target) return;

  const action = target.dataset.action;
  if (action === "toggle-index") setIndex(!state.menuOpen);
  if (action === "close-index") setIndex(false);
  if (action === "home") goHome();
  if (action === "route") goRoute(target.dataset.route);
  if (action === "language") {
    const lang = target.dataset.lang;
    if (!LANGS.includes(lang)) return;
    state.lang = lang;
    saveLanguage(lang);
    render();
  }
});

window.addEventListener("hashchange", render);
window.addEventListener("popstate", render);

window.addEventListener("keydown", (event) => {
  if (event.key !== "Escape") return;
  const route = parseRoute();

  if (state.menuOpen) setIndex(false);
  else if (route.reader && route.seriesIndex !== null) goRoute(series[route.seriesIndex].slug);
  else if (route.seriesIndex !== null) goHome();
});

render();
