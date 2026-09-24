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
      zh: "一张由城市、废墟与断裂共同构成的文明地表。",
      en: "A surface of civilisation composed of cities, ruins and fractures.",
      ja: "都市、廃墟、断裂によって構成された文明の地表。"
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
          zh: "ruin-map · urban traces / recorded ruins",
          en: "ruin-map · urban traces / recorded ruins",
          ja: "ruin-map · urban traces / recorded ruins"
        }
      }
    ],
    notes: [
      {
        title: { zh: "文明灯火", en: "lights of civilisation", ja: "文明の灯火" },
        body: {
          zh: "地图上的黑点并不是虚构出来的星群。它们来自真实世界中 urban areas 的尺度与范围，再经过估算，被投放到地形地图之上。当国界、道路、地名与行政区这些解释性的图层被拿走，剩下的便近乎只是纯粹的文明灯火。我们从宇宙中回望自身时，会想到那颗“暗淡蓝点”——存在如此微小、短暂而偶然；但若把视线再次翻转，密集扩张的文明也可以像自然表面生长出的疮孔。我的废墟记录同样以“点”出现。它们没有被从城市中单独抬高出来，而是融入这个 massive collection：坐落在城市的角落、边缘和缝隙里，或干脆再次被城市吞没。现代废墟往往正是这样的存在——仍然是文明的产物，却又尚未真正回到纯粹的自然之中。",
          en: "The black points on the map are not an invented constellation. Their scale and spread are estimated from real urban areas and laid over a terrain map. Once borders, roads, place names and administrative layers are removed, what remains is almost nothing but the lights of civilisation. Seen from the cosmos, our existence recalls the “Pale Blue Dot”: faint, brief and contingent. Turn the view around, however, and civilisation can also resemble lesions opening across the surface of nature. My records of ruins are expressed as points too. They are not lifted out of the city as exceptional objects, but absorbed into this massive collection—hidden in corners, edges and gaps, or submerged again by the city itself. This is often the condition of the modern ruin: still a product of civilisation, yet not returned to a purely natural state.",
          ja: "地図上の黒い点は、架空の星座ではない。実在する urban areas の大きさと広がりをもとに推定され、地形図の上へ置かれている。国境、道路、地名、行政区といった解釈のレイヤーを取り去ると、そこに残るのはほとんど純粋な文明の灯火だけになる。宇宙から自分たちを見返すとき、私たちは「Pale Blue Dot」を思い出す――存在はそれほど微かで、短く、偶然だ。しかし視線を反転させれば、拡張する文明は自然の表面に開いていく瘡孔のようにも見える。私が記録する廃墟もまた「点」として表される。それらは都市から特別な対象として持ち上げられるのではなく、この massive collection の中へ溶け込む。都市の隅、縁、隙間に潜み、ときには都市そのものに再び呑み込まれていく。現代の廃墟とはしばしばそのようなものだ。なお文明の産物でありながら、まだ純粋な自然へ帰りきってはいない。"
        }
      },
      {
        title: { zh: "每一次裂纹", en: "each fracture", ja: "ひとつひとつの亀裂" },
        body: {
          zh: "网站中的裂纹不是一张固定的装饰图。每一次进入时，断裂都会重新生成，因此没有两次完全相同。裂口的方向、位置与组合不断改变，像真实废墟中的坍塌一样：一次材料失效、一次天气变化、一次受力偏移，都会把结构推向另一种结果。废墟从来不是一个静止的形象，而是混沌作用留下的瞬时截面。网页不断改变自己的裂纹，是为了让这个界面也保留同样的不确定性。",
          en: "The fractures on the site are not a fixed decorative image. They are generated anew each time the site is entered, so no two breaks are exactly the same. Direction, position and combination keep changing, much like collapse in a real ruin: one material failure, one shift in weather, one change in load can send a structure toward a different outcome. A ruin is never a static image; it is a temporary cross-section of chaotic processes. The interface regenerates its cracks so that it carries the same uncertainty.",
          ja: "サイト上の亀裂は、固定された装飾画像ではない。訪れるたびに断裂は生成し直され、まったく同じものは二度と現れない。裂け目の方向、位置、組み合わせは絶えず変わる。それは実際の廃墟の崩壊に似ている。素材のひとつの失敗、天候の変化、荷重のずれが、構造を別の結果へ押し出す。廃墟は静止したイメージではなく、混沌とした作用が残した一瞬の断面である。ウェブページが自らの亀裂を生成し直すのは、この界面にも同じ不確定性を残すためだ。"
        }
      },
      {
        title: { zh: "残破画框", en: "the broken frame", ja: "壊れた額縁" },
        body: {
          zh: "整个网站的界面被处理得像一副残破的画框。这来自《墟构师宣言》中关于“画框”的理解：文明原本就是我们观看世界的框架，它划定内部与外部、用途与无用、秩序与自然；而当这个框架自身坍塌，留下来的便是被称作“废墟”的残破画框。透过那些断裂的边缘，我们不再只是观看框中的风景，也第一次意识到支撑观看本身的系统会溃败、会失效，也同样脆弱。于是视线开始转向构筑我们观察方式的“文明碎片”。它们像可以被读取的残片，重新拼成另一种理解世界的方法。因此，废墟地图被放在这副破碎画框的中央：不是为了重新确认文明与自然之间清楚的边界，而是借由残片重新观察两者如何交叠、侵入、退却，并在彼此之间维持一种始终暧昧的关系。",
          en: "The whole interface is treated as a broken picture frame. This grows from the idea of the frame in the Manifesto of the Ruinwright: civilisation is itself a framework through which we see the world, separating inside from outside, use from uselessness, order from nature. When that framework collapses, what remains is the damaged frame we call a ruin. Through its broken edges we no longer merely look at the scenery inside; we also become aware that the system supporting the act of seeing can fail, collapse and prove fragile. Attention then turns toward the “fragments of civilisation” that construct our way of looking. Read like remnants, they can be recomposed into another way of understanding the world. The ruin map therefore sits at the centre of this broken frame—not to restore a clean boundary between civilisation and nature, but to use the fragments to observe how they overlap, invade, recede, and remain unresolved within one another.",
          ja: "サイト全体の界面は、壊れた額縁のように扱われている。これは『墟構師宣言』における「額縁」の考え方から来ている。文明そのものが、私たちが世界を見るための枠組みであり、内と外、用途と無用、秩序と自然を分けてきた。しかしその枠組み自体が崩壊すると、残るのは「廃墟」と呼ばれる破損した額縁である。その断裂した縁を通して、私たちは額の内側の風景だけを見るのではなく、見るという行為を支えていたシステムそのものも崩れ、失効し、脆いのだと気づく。そこで視線は、私たちの見方を組み立ててきた「文明の断片」へ向かい始める。断片は読み取られ、別の世界理解の方法として再構成される。だから廃墟地図は、この壊れた額縁の中央に置かれている。文明と自然のあいだに明快な境界を引き直すためではなく、断片を通して、両者がどのように重なり、侵入し、退き、互いの中で曖昧な関係を保ち続けるかを見るために。"
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
    title: { zh: "芬芳厅", en: "Hall of Fragrance", ja: "芬芳室" },
    intro: {
      zh: "《芬芳厅》收集那些被时间、用途与时代甩在身后的场景：已经离开使用时间的场地、因时代而被抛弃的建物，以及投入了大量人力去完成、最后却无人问津的地方。它们不是为了证明“废墟很美”，而是想观察：当人与人之间的共鸣在建造、使用与遗弃的链条里逐渐断裂以后，空间会如何显露出一种未经设计、近乎荒诞的美。",
      en: "Hall of Fragrance gathers places left behind by time, use and historical change: sites outside their period of use, buildings abandoned by an era, and environments completed through enormous labour only to be left largely unattended. It is not an attempt to prove that ruins are beautiful, but to observe what kind of unplanned, almost absurd beauty appears when resonance between people gradually breaks down across the chain of building, using and abandoning a place.",
      ja: "《芬芳室》は、時間・用途・時代の変化から取り残された場所を集める。使用の時間を終えた敷地、時代によって捨てられた建物、多大な労力を費やして完成したにもかかわらず、ほとんど顧みられない空間である。ここで「廃墟は美しい」と証明したいわけではない。建設、使用、放棄へと続く過程のなかで、人と人との共鳴が少しずつ途切れたとき、空間がどのような、設計されていない、ほとんど不条理な美を露わにするのかを見ている。"
    },
    images: [],
    notes: [
      {
        title: { zh: "未驯化的空间", en: "untrained spaces", ja: "飼い慣らされていない空間" },
        body: {
          zh: [
            "凝视这些“未驯化”的空间时，我很难再把它们和某个人的意图、某套社会规则或某种明确用途联系起来。原本能够解释空间的能指链像是突然断掉了：空洞的空间因此变得像深渊一样，反过来凝视着站在其中的人。",
            "我无法理解它所承受过的全部痛苦，它也无法理解我为什么站在这里看它。我们之间没有共识，也没有可供翻译的共同语言。于是问题不再是“它为何如此”，而是“不知道究竟哪一方更荒诞”。在这种互相无法理解的距离里，焦虑随之出现。"
          ],
          en: [
            "When I look at these “untrained” spaces, it becomes difficult to connect them to one person’s intention, a social rule or a clearly defined use. The chain of signifiers that once made the space legible seems to break. Emptiness deepens into something like an abyss, and the space appears to look back at the person standing before it.",
            "I cannot understand the full extent of what it has endured, and it cannot understand why I am here looking at it. There is no shared agreement and no common language through which either side can be translated. The question is no longer simply why the place looks this way, but which side is more absurd. Anxiety emerges from this distance of mutual incomprehension."
          ],
          ja: [
            "こうした「飼い慣らされていない」空間を見つめていると、それを誰かの意図、社会の規則、明確な用途へ結びつけることが難しくなる。かつて空間を説明していたシニフィアンの連鎖が突然切れたように、空洞は深淵のような深さを持ち、見る者を逆に見返してくる。",
            "私はその場所が引き受けてきた痛みの全体を理解できないし、場所の側も、なぜ私がここでそれを見ているのかを理解できない。共有された合意も、翻訳のための共通言語もない。すると問いは「なぜこうなったのか」ではなく、「どちらのほうがより不条理なのか分からない」というものに変わる。相互に理解できない距離から、不安が立ち上がる。"
          ]
        }
      },
      {
        title: { zh: "一段引文", en: "a passage", ja: "ある一節" },
        quote: {
          zh: "“塞维利亚·摩尔人国王宫殿——这是一座按照幻想的原始冲动建成的建筑物，没有任何实用方面的考虑能阻止这一幻想。那高高在上的房间只是为梦想和庆典建造的，房间里成为主题的除了跳舞就是沉寂，因为一切人的活动都被房间纹饰里那没有声息的嘈杂吸收了。”",
          en: "“The Palace of the Moorish Kings in Seville — a building erected according to a primitive impulse of fantasy, where no practical consideration could restrain imagination. Its elevated rooms were made only for dreams and festivities; nothing takes place there but dancing or silence, for all human activity is absorbed by the noiseless clamour of the ornament.”",
          ja: "「セビリアのムーア人王宮――幻想の原始的な衝動に従って建てられ、実用上の考慮がその幻想を妨げることのない建築。高みにある部屋は夢と祝祭のためだけにつくられ、そこにある主題は踊りか沈黙しかない。人間のあらゆる活動は、室内装飾の無音の喧騒に吸収されてしまう。」"
        },
        attribution: { zh: "— 噩梦审核员", en: "— Nightmare Auditor", ja: "— 『噩夢審査員』" }
      },
      {
        title: { zh: "共鸣的缺失", en: "a failure of resonance", ja: "共鳴の欠如" },
        body: {
          zh: [
            "这些场景常常出现在那些被描述为“新自由主义时期发展得太快，而新的美学来不及跟上”的地方。真正吸引我的并不是一句简单的“审美落后”，而是它背后那条漫长的生产链：大量人力与时间被投入其中，但当要求在不同阶段层层传递时，共鸣不断减少，价值不断被妥协和淡化，最后仍被准确地落实。",
            "于是一些空间像是“得罪了风水师，并且真的照着施工图建完了”。它们的荒诞并不一定来自某个设计者强烈的主观意图，反而可能来自每一个参与者都能够暂时把自己从要求中抽离，再依赖某种无端传承的经验，把前一环留下的东西继续做下去。制造仍然高效地发生，却没有谁真正靠近最终使用者的需要。",
            "我并不要求身边的一切都拥有大自然那样看似无可置疑的合理性。人也没有蜜蜂筑巢般单一而稳定的社会使命。城市本来就是人类搭建出的另一种自然。但在这些记录里，我看到的是人与人之间共鸣的缺失如何沉积成一种荒诞的美学：空间仍然属于人类构筑的自然，却与其中的人失去了联系。",
            "而我自己也不是站在外面的审判者。我同样是失去共鸣的一环。我之所以会从这些环境中看见本不该被透露出来的诡异，也同时看见一种未经设计的美，恰恰说明我和它之间也存在着无法互相理解的距离。"
          ],
          en: [
            "These scenes often appear in places described as having developed too quickly during the neoliberal period for any new aesthetic language to keep pace. What interests me is not a simple claim that taste has lagged behind, but the long production chain underneath: enormous labour and time are invested, while resonance is gradually lost as requirements pass from one stage to another, values are compromised and diluted, and the result is nevertheless implemented with remarkable precision.",
            "Some places end up looking as though someone had offended a feng-shui master and then faithfully built the offending plan. Their absurdity does not necessarily come from a designer with an emphatic personal vision. It may emerge because each participant can detach from a possibly unreasonable demand, rely on inherited experience, and efficiently continue what the previous stage has handed over. Making proceeds, yet no one comes especially close to the actual needs of the eventual audience.",
            "I do not expect everything around me to possess the apparent rationality of nature. Humans do not have the singular social mission of bees building a hive. A city is already another kind of nature made by humans. What these records reveal to me is how a lack of resonance between people can sediment into an absurd aesthetic: the environment still belongs to this human-made nature, while losing its connection to the humans within it.",
            "Nor am I an outside judge. I am also part of that loss of resonance. The fact that I see an uncanniness the environment was never meant to disclose, and at the same time an undesigned beauty, is evidence of the same distance of incomprehension between it and me."
          ],
          ja: [
            "これらの風景はしばしば、「新自由主義の時代に発展が速すぎ、新しい美学が変化に追いつかなかった」と語られる場所に現れる。しかし私が惹かれるのは、単純な「美意識の遅れ」ではなく、その背後にある長い生産の連鎖である。膨大な労働と時間が投入されながら、要求が段階ごとに伝達されるたびに共鳴は失われ、価値は妥協され、薄まり、それでも最終的には正確に実装されていく。",
            "その結果、ときに空間は「風水師を怒らせ、そのまま施工図どおりに完成させた」かのように見える。その不条理は、必ずしも強い主観を持つ設計者から生まれるのではない。むしろ各段階の担い手が、おそらく不合理ですらある要求から一時的に自分を切り離し、根拠の分からないまま受け継がれた経験によって、前の工程から渡されたものを効率よく続けていくことで生まれる。製造は進むが、最終的な利用者の必要へ近づく者はいない。",
            "私は、身の回りのすべてに自然のような疑いようのない合理性を求めているわけではない。人間には、蜂が巣をつくるような単一で安定した社会的使命はない。都市はそもそも、人間が組み立てたもうひとつの自然である。私がこれらの記録に見るのは、人と人との共鳴の欠如が、どのように不条理な美学として堆積していくかということだ。空間はなお人間がつくった自然に属しながら、その内部の人間との関係を失っている。",
            "そして私は、その外側に立つ審判者ではない。私自身も、共鳴を失った連鎖の一部である。本来は露出するはずのなかった不気味さをそこに見つけ、それと同時に設計されていない美しさを見るということ自体が、私とその空間のあいだにも相互理解できない距離があることを示している。"
          ]
        }
      },
      {
        title: { zh: "秘密基地", en: "the secret base", ja: "秘密基地" },
        body: {
          zh: [
            "孩子为什么会把无人的角落做成秘密基地？有些地方似乎从诞生起就在自动筛选自己的光顾者。它不是为孩童设计的儿童乐园，也不是成人替孩童搭好的童真故事。相反，它更像小时候偶然发现的“秘密基地”：只欢迎那些愿意弯下腰、暂时放弃成人体型和成人尺度的人。",
            "对秘密基地的好奇很难一直保存到成年。长大的过程，也是成人与孩童彼此失去理解的过程：我们不再像小时候那样珍视微不足道的东西，不再轻易被一个简单的新发现震动，也越来越不愿承认，那些没有用途的幻想曾经真的提供过安全感和幸福感。",
            "于是成人离开了孩童的视角，又带着明确而功利的目的，创造出一些最终无人愿意光顾的场所。它们在社会的角落里逐渐摇摇欲坠。原本许诺幸福的乌托邦，也因为彼此理解的缺失，被撕开一道异常瘆人的裂口——像共鸣平原中突然出现的一大片深渊。"
          ],
          en: [
            "Why do children turn unattended corners into secret bases? Some places seem to select their visitors by themselves. They are neither playgrounds designed for children nor adult constructions of a ready-made childhood fantasy. They are closer to the secret bases discovered in childhood, welcoming only those willing to bend down, temporarily abandon adult scale, and enter a child’s field of view once more.",
            "Curiosity about a secret base rarely survives intact into adulthood. Growing up is also a process in which adults and children become less able to understand one another: we cease to treasure insignificant things in the same way, are less easily shaken by a small new discovery, and become reluctant to admit that purposeless fantasies once genuinely offered safety and happiness.",
            "Adults leave the child’s point of view and then, with explicit and practical aims, create places that eventually no one wishes to visit. These corners of society begin to sway and deteriorate. Utopias that once promised happiness are torn open by the same absence of mutual understanding, leaving an unsettling rupture — a sudden abyss across a plain of resonance."
          ],
          ja: [
            "なぜ子どもは、人のいない隅を秘密基地にするのだろう。ある場所は、生まれたときから自分の訪問者を選別しているように見える。それは子どものためにつくられた遊園地でも、大人が子どもに用意した「童心」の物語でもない。むしろ幼い頃に偶然見つけた秘密基地に近く、腰をかがめ、大人の体格と尺度を一時的に手放し、もう一度子どもの視野へ入ろうとする者だけを迎え入れる。",
            "秘密基地への好奇心は、成人までそのまま残りにくい。成長とは、大人と子どもが互いを理解できなくなっていく過程でもある。些細なものをかつてのように大切にできず、単純な発見に簡単には驚かなくなり、役に立たない幻想が本当に安心や幸福を与えていたことさえ、認めにくくなる。",
            "そして大人は子どもの視点を離れ、明確で功利的な目的をもって、結局は誰も訪れたがらない場所をつくる。そうした社会の隅は次第に崩れかけていく。幸福を約束していたはずのユートピアも、相互理解の欠如によって不気味な裂け目を開き、共鳴の平原に突然現れた巨大な深淵のようになる。"
          ]
        }
      }
    ]
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
      "</section>";

  images.forEach(function(image, index) {
    html += '<figure class="room-image' + (image.fit === "contain" ? " is-contain" : "") + '">' +
      '<img src="' + image.src + '" alt="" ' + (index ? 'loading="lazy"' : "") + " />" +
      '<figcaption>' + escapeHtml(localised(image.caption)) + "</figcaption>" +
    "</figure>";
  });

  if (Array.isArray(item.notes) && item.notes.length) {
    html += '<section class="room-notes">';
    item.notes.forEach(function(note) {
      var body = localised(note.body);
      var bodyHtml = "";
      if (Array.isArray(body)) {
        bodyHtml = body.map(function(paragraph) {
          return '<p class="room-note-body">' + escapeHtml(paragraph) + "</p>";
        }).join("");
      } else if (body) {
        bodyHtml = '<p class="room-note-body">' + escapeHtml(body) + "</p>";
      }

      var quoteHtml = "";
      if (note.quote) {
        quoteHtml = '<blockquote class="room-note-quote">' +
          '<p>' + escapeHtml(localised(note.quote)) + "</p>" +
          (note.attribution ? '<cite>' + escapeHtml(localised(note.attribution)) + "</cite>" : "") +
        "</blockquote>";
      }

      html += '<article class="room-note">' +
        '<p class="room-note-title">' + escapeHtml(localised(note.title)) + "</p>" +
        '<div class="room-note-copy">' + bodyHtml + quoteHtml + "</div>" +
      "</article>";
    });
    html += "</section>";
  }

  if (item.visit) {
    html += '<div class="room-visit-wrap"><a class="room-visit" href="' + item.visit + '" target="_blank" rel="noreferrer">' +
      escapeHtml(localised(item.visitLabel)) + '<span aria-hidden="true"> ↗</span></a></div>';
  }

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
