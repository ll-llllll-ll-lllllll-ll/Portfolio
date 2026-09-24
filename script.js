"use strict";

const LANGS = ["zh", "en", "ja"];
const AMBIENT_TYPES = ["sea", "cloud", "lake", "sky"];
const AMBIENT_LIBRARY = window.AMBIENT_LIBRARY || { sea: [], cloud: [], lake: [], sky: [] };

const labels = {
  zh: {
    index: "index",
    close: "收起",
    calendar: "calendar",
    today: "今天",
    returnToday: "回到今天",
    works: "works",
    collection: "collection",
    back: "返回",
    next: "下一处",
    weekdays: ["一", "二", "三", "四", "五", "六", "日"],
    monthSuffix: "月",
    viewing: "正在回看"
  },
  en: {
    index: "index",
    close: "close",
    calendar: "calendar",
    today: "today",
    returnToday: "return to today",
    works: "works",
    collection: "collection",
    back: "back",
    next: "next",
    weekdays: ["M", "T", "W", "T", "F", "S", "S"],
    monthSuffix: "",
    viewing: "viewing"
  },
  ja: {
    index: "index",
    close: "閉じる",
    calendar: "calendar",
    today: "今日",
    returnToday: "今日へ戻る",
    works: "works",
    collection: "collection",
    back: "戻る",
    next: "次へ",
    weekdays: ["月", "火", "水", "木", "金", "土", "日"],
    monthSuffix: "月",
    viewing: "振り返り"
  }
};

const ambientMeta = {
  sea: {
    day: { zh: "海之日", en: "day of the sea", ja: "海の日" },
    short: { zh: "海", en: "sea", ja: "海" },
    fallback: { zh: "海面记录", en: "sea record", ja: "海面の記録" },
    image: "./img1-blur.jpg"
  },
  cloud: {
    day: { zh: "云之日", en: "day of clouds", ja: "雲の日" },
    short: { zh: "云", en: "cloud", ja: "雲" },
    fallback: { zh: "云层记录", en: "cloud record", ja: "雲の記録" },
    image: "./img3-blur.jpg"
  },
  lake: {
    day: { zh: "湖之日", en: "day of the lake", ja: "湖の日" },
    short: { zh: "湖", en: "lake", ja: "湖" },
    fallback: { zh: "湖面记录", en: "lake record", ja: "湖面の記録" },
    image: "./img5-blur.jpg"
  },
  sky: {
    day: { zh: "天之日", en: "day of the sky", ja: "空の日" },
    short: { zh: "天", en: "sky", ja: "空" },
    fallback: { zh: "高空记录", en: "sky record", ja: "空の記録" },
    image: "./img6-blur.jpg"
  }
};

const calendarIntro = {
  zh: [
    "这个日历不记录行程，只记录天空、水面与天气。",
    "“海之日”“云之日”“湖之日”“天之日”并不是节日。它们只是把某一天轻轻交给一种景象。每天进入这里，首页只保留一段大约二十秒的风景：湖边的风、海面、云层，或从高处望见的天。",
    "这些影像不承担介绍作品的任务，也不要求观看者抵达某个结论。它们来自平日里偶然发现的美。看过作品之后，也可以回到这里——像漫长的探索最终又回到火堆旁。这个网站因此不只是一排作品，更是一处可以停留、放松，并重新抬头看一眼世界的地方。"
  ],
  en: [
    "This calendar does not keep appointments. It keeps sky, water and weather.",
    "A day of the sea, clouds, lake or sky is not a holiday. It simply gives one day to one kind of view. Each visit begins with a short field film: wind by a lake, the surface of the sea, a bank of clouds, or the sky seen from high above.",
    "These images do not introduce the work or ask for a conclusion. They come from ordinary moments of beauty. After wandering through the work, one can return here as one returns to a small fire after a long exploration: not a shelf of things to consume, but a place to stay for a while and look up again."
  ],
  ja: [
    "このカレンダーは予定ではなく、空、水面、天気を記録する。",
    "「海の日」「雲の日」「湖の日」「空の日」は祝日ではない。ただ一日を、ひとつの景色にそっと渡すための名前だ。ここを訪れるたび、湖畔の風、海面、雲、高い場所から見た空など、短いフィールド映像が流れる。",
    "これらの映像は作品を説明するためのものではなく、結論へ導くものでもない。日常の中で偶然見つけた美しさを置いておく。作品のあいだを歩いたあと、長い探索の果てに焚き火へ戻るように、またここへ戻ってこられる。ここは作品を並べる棚ではなく、少し留まり、息をほどき、もう一度世界を見上げるための場所でありたい。"
  ]
};

const works = [
  {
    slug: "ruin-garden",
    group: "work",
    title: { zh: "废墟园林", en: "Folly", ja: "フォリー" },
    intro: {
      zh: "废墟不是一件已经结束的东西。材料、风、植物、重力与时间继续工作，我只在其中安排一次短暂的相遇。",
      en: "A ruin is not something already finished. Matter, wind, plants, gravity and time continue the work; I only arrange a brief encounter among them.",
      ja: "廃墟は、すでに終わったものではない。素材、風、植物、重力、時間が仕事を続け、私はそのあいだに短い出会いを置く。"
    },
    images: [
      { src: "./img1-blur.jpg", caption: { zh: "现场记录 01", en: "site record 01", ja: "現場記録 01" } },
      { src: "./img2-blur.jpg", caption: { zh: "现场记录 02", en: "site record 02", ja: "現場記録 02" } }
    ]
  },
  {
    slug: "the-instrument",
    group: "work",
    title: { zh: "The Instrument", en: "The Instrument", ja: "The Instrument" },
    intro: {
      zh: "一些介于实验器械、声音、机械与私人宇宙学之间的装置。仪器在这里不是为了给出答案，而是让微弱的直觉暂时获得形状。",
      en: "Objects between experimental apparatus, sound, mechanism and private cosmology. Here an instrument does not provide an answer; it lets a faint intuition briefly take shape.",
      ja: "実験器械、音、機構、私的宇宙論のあいだにある装置群。ここで器械は答えを出すためではなく、かすかな直観に一時的な形を与えるためにある。"
    },
    images: [
      { src: "./img3-blur.jpg", caption: { zh: "仪器试作 01", en: "instrument study 01", ja: "器械試作 01" } },
      { src: "./img4-blur.jpg", caption: { zh: "仪器试作 02", en: "instrument study 02", ja: "器械試作 02" } }
    ]
  }
];

const collections = [
  {
    slug: "ruin-atlas",
    group: "collection",
    title: { zh: "废墟地图", en: "Ruin Atlas", ja: "廃墟地図" },
    intro: {
      zh: "一张持续生长的废墟地图。那些在路途中偶然遇见、被记录、被命名的遗构，被重新放回同一片地表。它既像档案，也像一张永远没有完成的地图：地点不断加入，分类不断松动，地理也随着记录者的移动被重新书写。",
      en: "An evolving atlas of ruins. Remnants encountered by chance, recorded and named along the way are placed back onto a shared surface. It is part archive and part unfinished map: new sites keep entering, categories remain loose, and geography is rewritten by the movement of those who record it.",
      ja: "成長し続ける廃墟の地図。移動の途中で偶然出会い、記録され、名づけられた遺構を、もう一度ひとつの地表へ戻していく。アーカイブであると同時に、決して完成しない地図でもある。場所は増え続け、分類は揺らぎ、記録する人の移動によって地理そのものが書き換えられていく。"
    },
    visit: "https://ruin-archive.site/",
    visitLabel: {
      zh: "进入完整地图",
      en: "enter the full atlas",
      ja: "地図全体を見る"
    },
    images: [
      {
        src: "https://ruin-archive.site/assets/ruin-map.svg",
        fit: "contain",
        caption: {
          zh: "地表图层 · 墟域图",
          en: "terrain layer · Ruin Atlas",
          ja: "地表レイヤー · 廃墟地図"
        }
      },
      {
        src: "https://ruin-archive.site/attachments/aether-scorched-earth/photo-1.jpg",
        caption: {
          zh: "电台路焦土 · 上海",
          en: "Aether Scorched-earth · Shanghai",
          ja: "Aether Scorched-earth · 上海"
        }
      },
      {
        src: "https://ruin-archive.site/attachments/suspended-homeland/photo-1.jpg",
        caption: {
          zh: "隐染悬里 · 双叶町",
          en: "Suspended Homeland · Futaba",
          ja: "Suspended Homeland · 双葉町"
        }
      },
      {
        src: "https://ruin-archive.site/attachments/cliff-granary/photo-1.jpg",
        caption: {
          zh: "悬崖遗构 · 四川",
          en: "cliff remnant · Sichuan",
          ja: "崖際の遺構 · 四川"
        }
      }
    ]
  },
  {
    slug: "room-by-the-lake",
    group: "collection",
    title: { zh: "room by the lake, 2020", en: "room by the lake, 2020", ja: "room by the lake, 2020" },
    intro: {
      zh: "布面油画 · 60 × 91 cm · 密西根湖",
      en: "Oil on canvas · 60 × 91 cm · Lake Michigan",
      ja: "キャンバスに油彩 · 60 × 91 cm · ミシガン湖"
    },
    images: [
      {
        src: "./collections/room-by-the-lake/room-by-the-lake-detail.webp",
        caption: {
          zh: "room by the lake, 2020 · 布面油画 · 60 × 91 cm · 密西根湖",
          en: "room by the lake, 2020 · oil on canvas · 60 × 91 cm · Lake Michigan",
          ja: "room by the lake, 2020 · キャンバスに油彩 · 60 × 91 cm · ミシガン湖"
        }
      },
      {
        src: "./collections/room-by-the-lake/room-by-the-lake-installation.webp",
        caption: { zh: "展览现场", en: "installation view", ja: "展示風景" }
      }
    ]
  },
  {
    slug: "seawater",
    group: "collection",
    title: { zh: "海水收集", en: "Seawater Collection", ja: "海水採集" },
    intro: {
      zh: "从不同海岸留下少量海水。地点、日期、容器与水本身一起构成记录；它们并不试图证明什么，只保存曾经抵达过的一小部分海。",
      en: "Small amounts of seawater kept from different coasts. Place, date, vessel and water form the record together; they prove nothing, but keep a small part of a sea once reached.",
      ja: "異なる海岸から少量の海水を残す。場所、日付、容器、水そのものが一つの記録になる。何かを証明するためではなく、かつて辿り着いた海の小さな一部を保存する。"
    },
    images: []
  },
  {
    slug: "fragrance-hall",
    group: "collection",
    title: { zh: "芬芳厅", en: "Hall of Fragrance", ja: "芬芳庁" },
    intro: {
      zh: "一个收留奇怪景观的房间。它们可能过于人工，也可能过于自然；可能庄严、荒唐、甜美或令人不安。暂时不分类，只让它们彼此靠近。",
      en: "A room for strange landscapes: too artificial or too natural, solemn, absurd, sweet or uneasy. For now they remain unclassified, simply allowed to sit beside one another.",
      ja: "奇妙な景観を置いておく部屋。人工的すぎたり、自然すぎたり、荘厳だったり、滑稽だったり、甘美だったり、不穏だったりする。いまは分類せず、ただ互いの近くに置いておく。"
    },
    images: []
  }
];

const rooms = works.concat(collections);

const state = {
  lang: readLanguage(),
  indexOpen: false,
  calendarOpen: false,
  previewDate: null,
  calendarCursor: startOfMonth(new Date())
};

const app = document.querySelector("#app");

function readLanguage() {
  try {
    var saved = localStorage.getItem("lqy-language");
    return LANGS.indexOf(saved) >= 0 ? saved : "zh";
  } catch (_) {
    return "zh";
  }
}

function saveLanguage(lang) {
  try { localStorage.setItem("lqy-language", lang); } catch (_) {}
}

function localised(value) {
  return value && value[state.lang] ? value[state.lang] : "";
}

function escapeHtml(value) {
  return String(value == null ? "" : value).replace(/[&<>"']/g, function(character) {
    return {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      "\"": "&quot;",
      "'": "&#039;"
    }[character];
  });
}

function pad(number) {
  return String(number).padStart(2, "0");
}

function dateKey(date) {
  return date.getFullYear() + "-" + pad(date.getMonth() + 1) + "-" + pad(date.getDate());
}

function parseDateKey(key) {
  var parts = key.split("-").map(Number);
  return new Date(parts[0], parts[1] - 1, parts[2], 12, 0, 0, 0);
}

function todayAtNoon() {
  var now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0, 0, 0);
}

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1, 12, 0, 0, 0);
}

function addMonths(date, amount) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1, 12, 0, 0, 0);
}

function hashString(value) {
  var hash = 2166136261;
  for (var i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function ambientTypeForDate(date) {
  var seed = hashString(dateKey(date) + ":quiet-calendar-v1");
  return AMBIENT_TYPES[seed % AMBIENT_TYPES.length];
}

function ambientEntryForDate(date, type) {
  var pool = Array.isArray(AMBIENT_LIBRARY[type]) ? AMBIENT_LIBRARY[type] : [];
  if (!pool.length) return null;
  return pool[hashString(dateKey(date) + ":" + type) % pool.length];
}

function selectedDate() {
  return state.previewDate ? parseDateKey(state.previewDate) : todayAtNoon();
}

function ambientTitle(entry, type) {
  if (entry && entry.title) {
    if (typeof entry.title === "string") return entry.title;
    if (entry.title[state.lang]) return entry.title[state.lang];
  }
  return localised(ambientMeta[type].fallback);
}

function ambientPlace(entry) {
  if (!entry || !entry.place) return "";
  if (typeof entry.place === "string") return entry.place;
  return entry.place[state.lang] || "";
}

function formatDate(date) {
  if (state.lang === "en") {
    return date.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  }
  if (state.lang === "ja") {
    return date.getFullYear() + "." + pad(date.getMonth() + 1) + "." + pad(date.getDate());
  }
  return date.getFullYear() + "." + pad(date.getMonth() + 1) + "." + pad(date.getDate());
}

function formatMonth(date) {
  if (state.lang === "en") {
    return date.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
  }
  return date.getFullYear() + " / " + (date.getMonth() + 1) + labels[state.lang].monthSuffix;
}

function languageSwitch() {
  var html = '<nav class="language" aria-label="language">';
  LANGS.forEach(function(lang) {
    var title = lang === "ja" ? "JP" : lang.toUpperCase();
    html += '<button type="button" data-action="language" data-lang="' + lang + '" class="' +
      (state.lang === lang ? "is-active" : "") + '">' + title + "</button>";
  });
  html += "</nav>";
  return html;
}

function ambientMedia(date, type, entry) {
  if (entry && entry.src) {
    var poster = entry.poster ? ' poster="' + escapeHtml(entry.poster) + '"' : "";
    return '<video class="ambient-video" autoplay muted playsinline loop preload="metadata"' + poster +
      ' src="' + escapeHtml(entry.src) + '"></video>';
  }
  return '<div class="ambient-empty ambient-empty-' + type + '" aria-hidden="true"></div>';
}

function calendarGrid() {
  var cursor = state.calendarCursor;
  var year = cursor.getFullYear();
  var month = cursor.getMonth();
  var first = new Date(year, month, 1, 12);
  var mondayOffset = (first.getDay() + 6) % 7;
  var daysInMonth = new Date(year, month + 1, 0).getDate();
  var todayKey = dateKey(todayAtNoon());
  var selectedKey = dateKey(selectedDate());
  var html = "";

  labels[state.lang].weekdays.forEach(function(day) {
    html += '<span class="calendar-weekday">' + day + "</span>";
  });

  for (var blank = 0; blank < mondayOffset; blank += 1) {
    html += '<span class="calendar-blank"></span>';
  }

  for (var day = 1; day <= daysInMonth; day += 1) {
    var date = new Date(year, month, day, 12);
    var key = dateKey(date);
    var type = ambientTypeForDate(date);
    var classes = "calendar-day";
    if (key === todayKey) classes += " is-today";
    if (key === selectedKey) classes += " is-selected";

    html += '<button type="button" class="' + classes + '" data-action="choose-date" data-date="' + key + '">' +
      '<span class="calendar-number">' + day + "</span>" +
      '<span class="calendar-type">' + escapeHtml(localised(ambientMeta[type].short)) + "</span>" +
      "</button>";
  }

  return html;
}

function calendarPanel() {
  var current = selectedDate();
  var currentType = ambientTypeForDate(current);
  var todayKey = dateKey(todayAtNoon());
  var selectedKey = dateKey(current);

  return '<section class="calendar-layer" ' + (state.calendarOpen ? "" : "hidden") + ' aria-label="calendar">' +
    '<button class="calendar-backdrop" type="button" data-action="close-calendar" aria-label="close"></button>' +
    '<div class="calendar-panel">' +
      '<header class="calendar-head">' +
        '<div>' +
          '<p class="calendar-kicker">calendar</p>' +
          '<p class="calendar-current">' + escapeHtml(formatDate(current)) + ' · ' + escapeHtml(localised(ambientMeta[currentType].day)) + "</p>" +
        "</div>" +
        '<div class="calendar-controls">' +
          '<button type="button" data-action="month-prev" aria-label="previous month">←</button>' +
          '<span>' + escapeHtml(formatMonth(state.calendarCursor)) + "</span>" +
          '<button type="button" data-action="month-next" aria-label="next month">→</button>' +
        "</div>" +
      "</header>" +
      '<div class="calendar-grid">' + calendarGrid() + "</div>" +
      (selectedKey !== todayKey
        ? '<button class="calendar-today" type="button" data-action="today">' + escapeHtml(labels[state.lang].returnToday) + "</button>"
        : "") +
      '<div class="calendar-intro">' +
        calendarIntro[state.lang].map(function(paragraph) {
          return "<p>" + escapeHtml(paragraph) + "</p>";
        }).join("") +
      "</div>" +
    "</div>" +
  "</section>";
}

function indexPanel() {
  var html = '<aside class="index-layer" ' + (state.indexOpen ? "" : "hidden") + ' aria-label="index">' +
    '<button class="index-backdrop" type="button" data-action="close-index" aria-label="close"></button>' +
    '<div class="index-panel">' +
      '<section class="index-group"><p class="index-heading">' + labels[state.lang].works + "</p>";

  works.forEach(function(item) {
    html += '<button type="button" class="index-link" data-action="route" data-route="' + item.slug + '">' +
      escapeHtml(localised(item.title)) + "</button>";
  });

  html += '</section><section class="index-group"><p class="index-heading">' + labels[state.lang].collection + "</p>";

  collections.forEach(function(item) {
    html += '<button type="button" class="index-link" data-action="route" data-route="' + item.slug + '">' +
      escapeHtml(localised(item.title)) + "</button>";
  });

  html += "</section></div></aside>";
  return html;
}

function homeHeader(date, type, entry) {
  var isToday = dateKey(date) === dateKey(todayAtNoon());
  var place = ambientPlace(entry);
  var caption = localised(ambientMeta[type].day) + " · " + ambientTitle(entry, type);
  if (place) caption += " · " + place;

  return '<header class="home-head">' +
    '<button class="calendar-toggle" type="button" data-action="toggle-calendar">' +
      '<span>calendar</span><span class="calendar-day-name">' + escapeHtml(localised(ambientMeta[type].day)) + "</span>" +
    "</button>" +
    '<p class="ambient-caption">' +
      (!isToday ? escapeHtml(labels[state.lang].viewing) + " · " + escapeHtml(formatDate(date)) + " · " : "") +
      escapeHtml(caption) +
    "</p>" +
    languageSwitch() +
  "</header>";
}

function renderHome() {
  var date = selectedDate();
  var type = ambientTypeForDate(date);
  var entry = ambientEntryForDate(date, type);

  return '<section class="home-view">' +
    '<div class="ambient-field" aria-hidden="true">' +
      ambientMedia(date, type, entry) +
      '<span class="ambient-veil"></span>' +
      '<span class="ambient-grain"></span>' +
    "</div>" +
    homeHeader(date, type, entry) +
    '<button class="index-toggle" type="button" data-action="toggle-index">index</button>' +
    (state.previewDate
      ? '<button class="home-today" type="button" data-action="today">' + escapeHtml(labels[state.lang].returnToday) + "</button>"
      : "") +
    calendarPanel() +
    indexPanel() +
  "</section>";
}

function parseRoute() {
  var slug = location.hash.replace(/^#\/?/, "").split("/")[0];
  if (!slug) return null;
  return rooms.find(function(item) { return item.slug === slug; }) || null;
}

function roomIndex(item) {
  return rooms.findIndex(function(candidate) { return candidate.slug === item.slug; });
}

function renderRoom(item) {
  var images = item.images || [];
  var next = rooms[(roomIndex(item) + 1) % rooms.length];
  var groupLabel = item.group === "collection" ? labels[state.lang].collection : labels[state.lang].works;
  var html = '<section class="room-view">' +
    '<header class="room-head">' +
      '<button type="button" data-action="home" class="room-back">← ' + escapeHtml(labels[state.lang].back) + "</button>" +
      '<p>' + escapeHtml(groupLabel) + " / " + escapeHtml(localised(item.title)) + "</p>" +
      languageSwitch() +
    "</header>" +
    '<div class="room-scroll">' +
      '<section class="room-lead">' +
        '<p class="room-group">' + escapeHtml(groupLabel) + "</p>" +
        '<h1>' + escapeHtml(localised(item.title)) + "</h1>" +
        '<p class="room-intro">' + escapeHtml(localised(item.intro)) + "</p>" +
        (item.visit ? '<a class="room-visit" href="' + item.visit + '" target="_blank" rel="noreferrer">' +
          escapeHtml(localised(item.visitLabel)) + '<span aria-hidden="true"> ↗</span></a>' : "") +
      "</section>";

  images.forEach(function(image, index) {
    html += '<figure class="room-image' + (image.fit === "contain" ? " is-contain" : "") + '">' +
      '<img src="' + image.src + '" alt="" ' + (index ? 'loading="lazy"' : "") + " />" +
      '<figcaption>' + escapeHtml(localised(image.caption)) + "</figcaption>" +
    "</figure>";
  });

  html += '<footer class="room-footer">' +
    '<button type="button" data-action="route" data-route="' + next.slug + '">' +
      escapeHtml(localised(next.title)) + '<span aria-hidden="true"> →</span>' +
    "</button>" +
  "</footer></div></section>";

  return html;
}

function render() {
  var room = parseRoute();
  document.documentElement.lang = state.lang === "zh" ? "zh-Hans" : state.lang;

  if (room) {
    state.indexOpen = false;
    state.calendarOpen = false;
    document.title = localised(room.title) + " — LQY";
    app.innerHTML = '<main class="site-root">' + renderRoom(room) + "</main>";
  } else {
    document.title = "LQY";
    app.innerHTML = '<main class="site-root">' + renderHome() + "</main>";
  }
}

function goHome() {
  history.pushState(null, "", location.pathname + location.search);
  state.indexOpen = false;
  state.calendarOpen = false;
  render();
}

function goRoute(route) {
  state.indexOpen = false;
  state.calendarOpen = false;
  location.hash = route;
}

function openIndex(open) {
  state.indexOpen = open;
  if (open) state.calendarOpen = false;
  render();
}

function openCalendar(open) {
  state.calendarOpen = open;
  if (open) {
    state.indexOpen = false;
    state.calendarCursor = startOfMonth(selectedDate());
  }
  render();
}

function chooseDate(key) {
  state.previewDate = key === dateKey(todayAtNoon()) ? null : key;
  state.calendarOpen = false;
  render();
}

app.addEventListener("click", function(event) {
  var target = event.target.closest("[data-action]");
  if (!target) return;

  var action = target.dataset.action;

  if (action === "toggle-index") openIndex(!state.indexOpen);
  if (action === "close-index") openIndex(false);
  if (action === "toggle-calendar") openCalendar(!state.calendarOpen);
  if (action === "close-calendar") openCalendar(false);
  if (action === "month-prev") {
    state.calendarCursor = addMonths(state.calendarCursor, -1);
    render();
  }
  if (action === "month-next") {
    state.calendarCursor = addMonths(state.calendarCursor, 1);
    render();
  }
  if (action === "choose-date") chooseDate(target.dataset.date);
  if (action === "today") {
    state.previewDate = null;
    state.calendarCursor = startOfMonth(todayAtNoon());
    state.calendarOpen = false;
    render();
  }
  if (action === "home") goHome();
  if (action === "route") goRoute(target.dataset.route);
  if (action === "language") {
    var lang = target.dataset.lang;
    if (LANGS.indexOf(lang) < 0) return;
    state.lang = lang;
    saveLanguage(lang);
    render();
  }
});

window.addEventListener("hashchange", render);
window.addEventListener("popstate", render);

window.addEventListener("keydown", function(event) {
  if (event.key !== "Escape") return;
  if (state.calendarOpen) openCalendar(false);
  else if (state.indexOpen) openIndex(false);
  else if (parseRoute()) goHome();
});

render();
