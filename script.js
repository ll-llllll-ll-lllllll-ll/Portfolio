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
    writings: "writings",
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
    writings: "writings",
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
    writings: "writings",
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
    "一册记录无法被安排之物的日历：天空、水、天气与光。它不把时间切成星期，也不记录约会，只把每一天交给海、湖、云或天空；有时同一种景象会连续停留几日，像天气本身一样，不平均，也不解释。首页每天只留下约二十秒的风景，作为信息与判断之间的一枚纯净锚点——明天再来，眼前也许已经换了一面。"
  ],
  en: [
    "A calendar for things that cannot be scheduled: sky, water, weather and light. It does not divide time into weeks or keep appointments; it simply gives each day to the sea, lake, clouds or sky. Sometimes one view lingers for several days, like weather itself—uneven and unexplained. Each day the homepage keeps only about twenty seconds of landscape, a quiet anchor among information and judgement. Come back tomorrow and the view may already have changed."
  ],
  ja: [
    "予定できないもののためのカレンダー——空、水、天気、光。時間を一週間ごとに切り分けず、予定も記さず、ただ一日を海、湖、雲、空のどれかへ渡していく。同じ景色が数日続くこともある。天気そのもののように、均等でもなく、説明もされない。ホームには毎日およそ二十秒の風景だけが残り、情報や判断のあいだに小さな純粋な錨を下ろす。明日また来れば、目の前の景色はもう変わっているかもしれない。"
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
    title: { zh: "墟域图·遗构馆", en: "Ruin Archive", ja: "墟域図・遺構館" },
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
    images: [],
    notes: [
      {
        titleHtml: {
          zh: "<strong>墟域图·</strong>——文明墨迹图",
          en: "<strong>Ruin Atlas ·</strong>—Civilisation Ink Map",
          ja: "<strong>墟域図·</strong>——文明の墨跡図"
        },
        bodyHtml: {
          zh: [
            "地图上的黑点来自真实世界中的都市区域。我参考了 <a href='https://www.naturalearthdata.com/downloads/10m-cultural-vectors/10m-urban-area/' target='_blank' rel='noreferrer'>Natural Earth 的 Urban Areas 数据</a>，将原本精确的城市轮廓大幅简化，再根据它们各自的面积估算成大小不同的点状物，最终以近似“墨斑”的样貌，沾染在一张经过修改的地形地图之上。地图的底图同样来自 <a href='https://www.naturalearthdata.com/downloads/50m-raster-data/50m-gray-earth/' target='_blank' rel='noreferrer'>Natural Earth 的 Gray Earth 数据</a>。",
            "遗构录中的废墟记录也以“点”的形式出现。它们坐落在城市的角落、边缘和缝隙里，或干脆再次被城市吞没。现代废墟往往正是这样的存在——仍然是文明的产物，却又尚未真正回到纯粹的自然之中。",
            "随着漫游和记录继续发生，这些遗构的标记也会越来越多。它们不断落入城市留下的墨迹之间，这张图谱也因此逐渐扩张，成为一张仍在生长的墟域图。"
          ],
          en: [
            "The black points on the map come from urban areas in the real world. I referred to <a href='https://www.naturalearthdata.com/downloads/10m-cultural-vectors/10m-urban-area/' target='_blank' rel='noreferrer'>Natural Earth’s Urban Areas data</a>, greatly simplifying the precise outlines of cities and estimating them as point-like forms of different sizes according to their area. They finally stain a modified terrain map like ink blots. The underlying map is likewise derived from <a href='https://www.naturalearthdata.com/downloads/50m-raster-data/50m-gray-earth/' target='_blank' rel='noreferrer'>Natural Earth’s Gray Earth data</a>.",
            "The ruin records in the archive appear as points as well. They sit in the corners, edges and gaps of cities, or are simply swallowed by the city once again. Modern ruins often exist in precisely this condition—still products of civilisation, yet not fully returned to a purely natural state.",
            "As wandering and recording continue, the number of these marks keeps growing. They settle among the traces left by cities, and the atlas expands with them, becoming a Ruin Atlas that is still in the process of growing."
          ],
          ja: [
            "地図上の黒い点は、現実世界の都市域から来ている。<a href='https://www.naturalearthdata.com/downloads/10m-cultural-vectors/10m-urban-area/' target='_blank' rel='noreferrer'>Natural Earth の Urban Areas データ</a>を参照し、もともと精密だった都市の輪郭を大きく簡略化したうえで、それぞれの面積から大きさの異なる点状のかたちへ置き換えた。最終的にそれらは「墨の染み」に近い姿で、加工した地形図の上へ付着している。下地となる地図も同じく <a href='https://www.naturalearthdata.com/downloads/50m-raster-data/50m-gray-earth/' target='_blank' rel='noreferrer'>Natural Earth の Gray Earth データ</a>をもとにしている。",
            "遺構録に収めた廃墟の記録もまた、「点」として現れる。それらは都市の隅、縁、隙間に位置し、ときには再び都市そのものに呑み込まれていく。現代の廃墟とはしばしばそのような存在である——なお文明の産物でありながら、まだ純粋な自然へ完全には戻っていない。",
            "漫遊と記録が続くにつれて、遺構の印も少しずつ増えていく。それらは都市が残した墨跡のあいだへ落ち、この図譜もまた広がり続け、いまなお成長の途中にある一枚の墟域図となっていく。"
          ]
        }
      },
      {
        titleHtml: {
          zh: "<strong>·遗构馆</strong>——残破画框",
          en: "<strong>· Archive</strong>—The Broken Frame",
          ja: "<strong>·遺構館</strong>——壊れた額縁"
        },
        bodyHtml: {
          zh: [
            "整个网站的界面被处理得像一副残破的画框。这个设计借用了<a href='https://ruin-archive.site/manifesto.html#section-02' target='_blank' rel='noreferrer'>《墟构师宣言》中关于“残破画框”的理解</a>：透过那些断裂的边缘，我们不再只把注意力放在框中的景象上，框架自身留下的碎片，也开始成为可以被读取的残片。我把废墟地点的记录放进这些断裂的角落；随着记录逐渐积累，残片不断堆叠，这个集合也慢慢成为了“遗构馆”。",
            "框中的景象与框架的残片彼此对照，一边仍指向我们正在观看的世界，一边暴露出原本支撑这种观看的结构。两者重新拼接在一起，也逐渐形成另一种理解世界的方法。"
          ],
          en: [
            "The whole site interface is treated like a damaged picture frame. The design draws on <a href='https://ruin-archive.site/manifesto.html#section-02' target='_blank' rel='noreferrer'>the idea of the “broken frame” in the Manifesto of the Ruinwright</a>: through those fractured edges, attention no longer rests only on the scene within the frame; the fragments left by the frame itself also begin to become remnants that can be read. I place records of ruined sites into these broken corners; as the records accumulate, the fragments gather into a layered collection that gradually becomes the “Archive”.",
            "The scene inside the frame and the fragments of the frame are set against one another. One still points toward the world being seen; the other exposes the structure that had supported that act of seeing. Rejoined, the two gradually form another way of understanding the world."
          ],
          ja: [
            "サイト全体の界面は、一枚の壊れた額縁のように扱われている。このデザインは、<a href='https://ruin-archive.site/manifesto.html#section-02' target='_blank' rel='noreferrer'>『墟構師宣言』における「破碎画框」の理解</a>を借りている。断裂した縁を通して、私たちは額の内側の景色だけに目を向けるのではなく、枠そのものが残した断片も、読み取ることのできる残片として見始める。私はその断裂した角へ廃墟地点の記録を置いていく。記録が少しずつ積み重なるにつれ、残片の集積はやがてひとつの「遺構館」になっていく。",
            "額の内側の景色と、枠から残された断片は互いに照らし合う。一方はなお私たちが見ている世界を指し、もう一方はその見方を支えていた構造を露わにする。二つを再びつなぎ合わせることで、そこから別の世界理解の方法が少しずつ組み上がっていく。"
          ]
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
      zh: "《芬芳厅》收集那些在日常环境里悄悄脱离控制的美学：怪诞的雕塑、失去语境的设施、被习惯性忽略却突然显得诡异的生活场景与物品。它们未必宏大，也未必被设计成“作品”；真正吸引我的，是那些原本只是环境纹饰的东西，如何在失去明确用途、品味和秩序的约束以后，开始反过来凝视生活在其中的人。",
      en: "Hall of Fragrance gathers aesthetics that quietly slip beyond control in everyday environments: grotesque sculptures, facilities detached from their context, and ordinary scenes or objects that become uncanny once habitual attention falls away. They need not be monumental or intentionally made as “works.” What interests me is how things once treated as mere ornament can, once released from clear use, taste and order, begin to look back at the people living among them.",
      ja: "《芬芳室》は、日常の環境のなかで静かに制御から外れていく美学を集める。奇妙な彫刻、文脈を失った設備、普段は見過ごされているのにふと不気味に見える生活風景や物である。それらは必ずしも壮大でも、意図的に「作品」としてつくられたものでもない。私が惹かれるのは、もともと環境の装飾にすぎなかったものが、明確な用途、趣味、秩序の拘束を離れたとき、そこに暮らす人間を逆に見返し始める瞬間である。"
    },
    images: [],
    notes: [
      {
        title: { zh: "反向凝视", en: "the returning gaze", ja: "逆向きの視線" },
        body: {
          zh: [
            "我拍摄的主体通常不是一整座建筑，而是其中那些很容易被忽略的局部：一尊不知道为何存在的雕塑、一段过度装饰的护栏、一组已经失去明确用途的设施、一个因为比例、材质或摆放方式稍微偏离常识而显得诡异的日常场景。它们原本只是背景的一部分，却在某个瞬间突然从背景里浮出来。",
            "我常想到“塞维利亚·摩尔人国王宫殿”那段描述：房间里的人的活动，被纹饰中“没有声息的嘈杂”吸收。对我来说，《芬芳厅》里的场景也有类似的力量。那些纹饰并不只是被我们观看的对象；当它们脱离了设计者原本的控制、用途与解释以后，反而开始组织我们的感受，甚至像是在画面之外反向凝视我们自己。",
            "这种凝视最让我不安的地方，是它没有明确的主体。没有谁真正站在背后“想要表达”这种诡异，可它偏偏出现了。它像是一种从集体制造、习惯、妥协与审美惯性中自行长出来的表情。我们以为自己在塑造环境，最后却被这些环境中失控的纹饰重新塑造了观看方式。"
          ],
          en: [
            "The subjects I photograph are usually not whole buildings but easily overlooked fragments within them: a sculpture whose reason for being is unclear, an over-decorated railing, a facility that has lost its obvious function, or an ordinary scene made uncanny by a slight disturbance of proportion, material or placement. They begin as background and then, for a moment, detach themselves from it.",
            "I often return to the description of the Palace of the Moorish Kings in Seville, where human activity is absorbed by the “noiseless clamour” of ornament. The scenes in Hall of Fragrance have a similar force for me. Ornament is not merely something we look at. Once it slips beyond the designer’s original control, use and explanation, it begins to organise our feeling in return, almost looking back at us from outside the image.",
            "What unsettles me most about this gaze is that it has no clear author. No one necessarily intended to produce this uncanniness, yet it appears. It is like an expression generated by collective making, habit, compromise and aesthetic inertia. We imagine that we shape our environment, only to find that these uncontrolled ornaments have begun to reshape the way we see."
          ],
          ja: [
            "私が撮る主体は建物全体ではなく、そのなかで見落とされやすい局部であることが多い。なぜそこにあるのか分からない彫刻、装飾過剰な手すり、明確な用途を失った設備、比率や素材、置かれ方がほんの少し常識からずれたことで不気味に見える日常風景。もともとは背景の一部だったものが、ある瞬間に背景から浮かび上がってくる。",
            "私はしばしば「セビリアのムーア人王宮」の記述を思い出す。そこでは人間の活動が、装飾のなかの「無音の喧騒」に吸収される。《芬芳室》の風景にも、私にとって似た力がある。装飾は単に私たちが見る対象ではない。設計者の本来の制御、用途、説明から外れたとき、それは逆に私たちの感覚を組織し始め、まるで画面の外側から私たち自身を見返してくる。",
            "この視線の最も不穏なところは、明確な主体がないことだ。誰かが意図的にこの不気味さを「表現」したわけではないのに、それは現れる。集団的な製造、習慣、妥協、美的慣性から自生した表情のようなものだ。私たちは環境を形づくっているつもりで、最後には制御を離れた装飾によって見る方法そのものを形づくられている。"
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
        title: { zh: "弱化的相机", en: "a weakened camera", ja: "弱められたカメラ" },
        body: {
          zh: [
            "为了让这种“纹饰的反向凝视”更强，我刻意使用一台被弱化的相机——一种接近玩具相机状态的胶片相机。它不追求锋利、准确和完全可控的再现，也不会把观察者的技术能力持续摆在画面前面。失焦、颗粒、曝光的不确定、边缘的松动，都让摄影不再像一次强势的捕捉。",
            "我希望自己的观察者身份在这里退后一点。不是我用一台精密设备去审视一个奇怪的对象，而是让相机变得迟钝、脆弱、甚至有一点不可靠，使我和场景之间的权力关系被削弱。当作者的控制感降低以后，画面中的设施、雕塑、纹饰和生活残留反而更容易获得一种独立的存在感。",
            "于是最重要的东西不一定出现在画面中央。它更像留在画面之外的一种情绪：那些东西仿佛并不需要我去解释，也不等待我的判断。它们只是继续存在，并以一种我无法完全掌控的方式，把视线重新投向我。"
          ],
          en: [
            "To intensify this returning gaze of ornament, I deliberately use a weakened camera: a film camera closer in spirit to a toy camera. It does not pursue sharpness, accuracy or fully controlled representation, and it avoids continually placing the observer’s technical mastery in front of the image. Soft focus, grain, uncertain exposure and loosened edges make photography feel less like an act of capture.",
            "I want my position as observer to retreat. Rather than examining a strange object through a precise instrument, I allow the camera to become slow, fragile and slightly unreliable, weakening the hierarchy between myself and the scene. As the author’s sense of control recedes, facilities, sculptures, ornament and traces of everyday life can acquire a more independent presence.",
            "The most important thing therefore may not sit at the centre of the frame. It survives more as an emotion outside the image: these things do not seem to need my explanation or wait for my judgement. They simply continue to exist, returning the gaze toward me in a way I cannot fully control."
          ],
          ja: [
            "この「装飾の逆向きの視線」を強めるために、私は意図的に弱められたカメラを使う。玩具カメラに近い感覚を持つフィルムカメラである。鋭さ、正確さ、完全に制御された再現を目指さず、観察者の技術的な支配を画面の前面に出さない。ピントの甘さ、粒子、不確かな露出、周縁のゆるみが、写真を強い捕獲の行為から遠ざける。",
            "ここでは、自分の観察者としての立場を少し後退させたい。精密な機械で奇妙な対象を検査するのではなく、カメラそのものを鈍く、脆く、少し頼りなくすることで、私と場面との権力関係を弱める。作者の制御感が下がるほど、設備、彫刻、装飾、生活の痕跡は、より独立した存在感を持ちやすくなる。",
            "だから最も重要なものは、必ずしも画面の中央にあるとは限らない。それはむしろ、画面の外側に残る感情に近い。それらは私の説明を必要とせず、判断を待ってもいない。ただ存在し続け、私が完全には制御できない仕方で、視線をこちらへ返してくる。"
          ]
        }
      },
      {
        title: { zh: "共鸣的缺失", en: "a failure of resonance", ja: "共鳴の欠如" },
        body: {
          zh: [
            "这些场景常常来自被快速制造出来的城市环境。真正吸引我的，并不是简单地判断它们“好看”或“不好看”，而是那些美学决定如何在漫长的生产链里被不断转译：要求层层传递，共鸣逐渐减少，价值不断被妥协和淡化，最后却仍然被非常具体地落实成一个雕塑、一组设施、一种装饰语言或一处空间细节。",
            "有时结果像是“得罪了风水师，并且真的照着施工图建完了”。荒诞并不一定来自某个设计者强烈的个人趣味，反而可能来自每一个参与者都能把自己暂时抽离于要求，只依据无端传承的经验，继续完成前一环留下的任务。没有人真正想制造那种诡异，可诡异仍然被制造出来。",
            "我并不要求环境必须像自然那样显得合理。人也没有蜜蜂筑巢般单一而稳定的社会使命。真正让我感兴趣的是，当人与人之间缺少共鸣时，某种无法归属于任何单一作者的美学会如何自行出现。它既属于人类制造的环境，又像已经脱离了人的意图。",
            "而我自己也不是站在外面的审判者。我同样是失去共鸣的一环。正因为我无法真正进入这些场景原本的意义，我才会从其中看见本不该透露出的诡异，也同时看见一种未经设计的美。"
          ],
          en: [
            "These scenes often come from rapidly produced urban environments. What interests me is not a simple judgement of whether they are beautiful or ugly, but how aesthetic decisions are repeatedly translated across a long chain of production: requirements pass from one stage to another, resonance diminishes, values are compromised and diluted, yet the result is still materialised very concretely as a sculpture, a facility, a decorative language or a spatial detail.",
            "At times the result looks as though someone had offended a feng-shui master and then faithfully completed the construction drawings. The absurdity does not necessarily come from a designer with a forceful personal taste. It may instead arise because every participant can temporarily detach from the demand itself, rely on inherited experience, and continue the task passed on from the previous stage. No one truly intends to create the uncanny, yet the uncanny is still produced.",
            "I do not require environments to possess the apparent rationality of nature. Humans do not have the singular social mission of bees building a hive. What interests me is how, when resonance between people is absent, an aesthetic belonging to no single author can begin to emerge on its own. It is made by humans, yet seems to have slipped free of human intention.",
            "Nor am I an outside judge. I am part of this failure of resonance too. Precisely because I cannot fully enter the original meaning of these scenes, I begin to see an uncanniness they were never meant to disclose, and at the same time an undesigned beauty."
          ],
          ja: [
            "これらの場面は、急速につくられた都市環境から現れることが多い。私が惹かれるのは、それらを単純に「美しい」「醜い」と判断することではなく、美的な決定が長い生産の連鎖のなかでどのように何度も翻訳されるかということだ。要求は段階ごとに伝えられ、共鳴は減り、価値は妥協され薄められていく。それでも最終的には、彫刻、設備、装飾言語、空間の細部として非常に具体的に実装される。",
            "結果がときに「風水師を怒らせ、そのまま施工図どおり完成させた」ように見えることがある。不条理は必ずしも、強烈な個人趣味を持つ設計者から生まれるのではない。各参加者が要求そのものから一時的に自分を切り離し、根拠の分からないまま受け継がれた経験に頼り、前の工程から渡された仕事を続けることで生まれることがある。誰も不気味さをつくろうとしていないのに、不気味さはつくられてしまう。",
            "私は、環境が自然のように合理的に見えることを求めているわけではない。人間には、蜂が巣をつくるような単一で安定した社会的使命はない。私が関心を持つのは、人と人との共鳴が欠けたとき、誰一人の作者にも帰属しない美学がどのように自律的に現れるかということだ。それは人間がつくった環境に属しながら、人間の意図から離れてしまったように見える。",
            "そして私は、その外側に立つ審判者ではない。私自身も、この共鳴の欠如の一部である。これらの場面が本来持っていた意味へ完全には入れないからこそ、私はそこに本来露出するはずのなかった不気味さと、同時に設計されていない美しさを見る。"
          ]
        }
      },
      {
        title: { zh: "秘密基地", en: "the secret base", ja: "秘密基地" },
        body: {
          zh: [
            "孩子为什么会把无人的角落做成秘密基地？有些地方似乎一直在自动筛选自己的光顾者。它不是为孩童设计的儿童乐园，也不是成人替孩童搭好的童真故事。它更像小时候偶然发现的“秘密基地”：只欢迎那些愿意弯下腰、暂时放弃成人尺度，并愿意再经历一次孩童视角的人。",
            "成年以后，我们越来越难像孩童那样珍视微不足道之物，也不再轻易被简单的新发现震动。可也正是在这些不起眼、没有被认真观看的地方，某些设施、装饰和物品开始获得一种奇怪的独立生命。",
            "因此我拍摄它们，并不是为了把它们重新整理成一个合理世界。恰恰相反，我更愿意保留那种无法完全解释的距离：像进入一个并不真正属于我的秘密基地，短暂地允许那些被忽略的纹饰先看见我。"
          ],
          en: [
            "Why do children turn unattended corners into secret bases? Some places seem to select their visitors by themselves. They are neither playgrounds designed for children nor adult constructions of a ready-made childhood fantasy. They are closer to the secret bases discovered by chance in childhood, welcoming those willing to bend down, temporarily abandon adult scale, and experience a child’s point of view once more.",
            "As adults, we become less able to treasure insignificant things as children do, and less easily shaken by a simple new discovery. Yet it is precisely in these overlooked and insufficiently observed places that certain facilities, decorations and objects begin to acquire a strange independent life.",
            "I photograph them not in order to reorganise them into a rational world. On the contrary, I prefer to preserve the distance that cannot be fully explained: as though entering a secret base that does not truly belong to me, and briefly allowing its neglected ornaments to see me first."
          ],
          ja: [
            "なぜ子どもは、人のいない隅を秘密基地にするのだろう。ある場所は、自分の訪問者を自動的に選んでいるように見える。それは子どものためにつくられた遊園地でも、大人が用意した「童心」の物語でもない。幼い頃に偶然見つけた秘密基地に近く、腰をかがめ、大人の尺度を一時的に手放し、もう一度子どもの視野を経験しようとする者を迎え入れる。",
            "大人になると、子どものように取るに足らないものを大切にすることが難しくなり、単純な発見にも簡単には驚かなくなる。だが、まさにそうした目立たず、十分に見られていない場所で、設備、装飾、物は奇妙な独立した生命を持ち始める。",
            "私がそれらを撮るのは、合理的な世界へ整理し直すためではない。むしろ完全には説明できない距離を残したい。自分のものではない秘密基地へ入り、しばらくのあいだ、見過ごされてきた装飾のほうに先に私を見つけさせるように。"
          ]
        }
      }
    ]
  }];


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
    var saved = localStorage.getItem("sky-sea-lake-cloud-language");
    return LANGS.indexOf(saved) >= 0 ? saved : "zh";
  } catch (_) {
    return "zh";
  }
}

function saveLanguage(lang) {
  try { localStorage.setItem("sky-sea-lake-cloud-language", lang); } catch (_) {}
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

var ambientYearCache = {};

function ambientSeededRandom(seed) {
  var value = seed >>> 0;
  return function() {
    value = (value + 0x6D2B79F5) | 0;
    var t = value;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function ambientWeightedChoice(types, weights, random) {
  var total = weights.reduce(function(sum, weight) { return sum + weight; }, 0);
  if (total <= 0) return types[0];

  var cursor = random() * total;
  for (var i = 0; i < types.length; i += 1) {
    cursor -= weights[i];
    if (cursor <= 0) return types[i];
  }
  return types[types.length - 1];
}

function ambientRunLength(random) {
  var roll = random();
  if (roll < 0.46) return 1;
  if (roll < 0.75) return 2;
  if (roll < 0.90) return 3;
  if (roll < 0.97) return 4;
  return 5;
}

function ambientLibraryCount(type) {
  return Array.isArray(AMBIENT_LIBRARY[type]) ? AMBIENT_LIBRARY[type].length : 0;
}

function ambientLibrarySignature() {
  return AMBIENT_TYPES.map(function(type) {
    return type + ":" + ambientLibraryCount(type);
  }).join("|");
}

function ambientShuffleIndices(length, random, avoidFirst) {
  var values = [];
  for (var i = 0; i < length; i += 1) values.push(i);

  for (var j = values.length - 1; j > 0; j -= 1) {
    var swapIndex = Math.floor(random() * (j + 1));
    var tmp = values[j];
    values[j] = values[swapIndex];
    values[swapIndex] = tmp;
  }

  /* When a bag is refilled, do not let its first clip equal the clip that
     ended the previous bag. This means a category cycles through all of its
     available material before repeating, with no immediate duplicate at the
     cycle boundary. */
  if (values.length > 1 && Number.isInteger(avoidFirst) && values[0] === avoidFirst) {
    var replacementIndex = 1 + Math.floor(random() * (values.length - 1));
    var held = values[0];
    values[0] = values[replacementIndex];
    values[replacementIndex] = held;
  }

  return values;
}

function ambientNextEntryIndex(type, bags, lastEntry, random) {
  var count = ambientLibraryCount(type);
  if (!count) return -1;

  if (!Array.isArray(bags[type]) || bags[type].length === 0) {
    bags[type] = ambientShuffleIndices(count, random, lastEntry[type]);
  }

  var next = bags[type].shift();
  lastEntry[type] = next;
  return next;
}

function ambientBuildYearSchedule(year) {
  var signature = ambientLibrarySignature();
  var cacheKey = String(year) + "|" + signature;
  if (ambientYearCache[cacheKey]) return ambientYearCache[cacheKey];

  var random = ambientSeededRandom(hashString(cacheKey + ":quiet-calendar-v4"));
  var assignments = {};
  var bags = {};
  var lastEntry = {};
  var previousType = null;

  for (var month = 0; month < 12; month += 1) {
    var daysInMonth = new Date(year, month + 1, 0).getDate();

    /* Inventory is the primary probability. A folder with ten clips receives
       roughly ten times the base weight of a folder with one. The modest
       month-specific multiplier keeps each month irregular without overturning
       that stock-based hierarchy. */
    var availableTypes = AMBIENT_TYPES.filter(function(type) {
      return ambientLibraryCount(type) > 0;
    });

    var monthWeights = availableTypes.map(function(type) {
      var inventory = ambientLibraryCount(type);
      return inventory * (0.82 + random() * 0.36);
    });

    var day = 1;
    while (day <= daysInMonth) {
      var choiceWeights = monthWeights.slice();

      /* A one-clip category (currently cloud) can never form back-to-back
         runs, because that would necessarily repeat the exact same video on
         consecutive days. */
      if (previousType && ambientLibraryCount(previousType) <= 1) {
        var previousIndex = availableTypes.indexOf(previousType);
        if (previousIndex >= 0 && availableTypes.length > 1) {
          choiceWeights[previousIndex] = 0;
        }
      }

      var type = ambientWeightedChoice(availableTypes, choiceWeights, random);
      var inventoryCount = ambientLibraryCount(type);

      /* Consecutive landscape days remain possible, but a run cannot be longer
         than the number of unique clips in that category. Thus sea may run for
         up to three days with three different clips; cloud stays one day; lake
         and sky can linger longer without repeating footage. */
      var run = Math.min(ambientRunLength(random), Math.max(1, inventoryCount));

      for (var offset = 0; offset < run && day <= daysInMonth; offset += 1, day += 1) {
        var date = new Date(year, month, day, 12);
        assignments[dateKey(date)] = {
          type: type,
          entryIndex: ambientNextEntryIndex(type, bags, lastEntry, random)
        };
      }

      previousType = type;
    }
  }

  ambientYearCache[cacheKey] = assignments;
  return assignments;
}

function ambientAssignmentForDate(date) {
  var schedule = ambientBuildYearSchedule(date.getFullYear());
  var assignment = schedule[dateKey(date)];
  if (assignment) return assignment;

  var fallbackType = AMBIENT_TYPES.find(function(type) {
    return ambientLibraryCount(type) > 0;
  }) || AMBIENT_TYPES[0];

  return { type: fallbackType, entryIndex: 0 };
}

function ambientTypeForDate(date) {
  return ambientAssignmentForDate(date).type;
}

function ambientEntryForDate(date, type) {
  var assignment = ambientAssignmentForDate(date);
  var resolvedType = assignment.type;
  var pool = Array.isArray(AMBIENT_LIBRARY[resolvedType]) ? AMBIENT_LIBRARY[resolvedType] : [];
  if (!pool.length) return null;

  var index = assignment.entryIndex;
  if (!Number.isInteger(index) || index < 0 || index >= pool.length) index = 0;

  /* type is retained in the function signature for existing callers; the
     assignment itself is authoritative so the media always matches the day. */
  return pool[index];
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
  var daysInMonth = new Date(year, month + 1, 0).getDate();
  var todayKey = dateKey(todayAtNoon());
  var selectedKey = dateKey(selectedDate());

  /* The calendar has no weeks. Time is sorted into four landscape tracks
     instead: sky / sea / lake / cloud. */
  var trackOrder = ["sky", "sea", "lake", "cloud"];
  var tracks = { sky: [], sea: [], lake: [], cloud: [] };

  for (var day = 1; day <= daysInMonth; day += 1) {
    var date = new Date(year, month, day, 12);
    var key = dateKey(date);
    var type = ambientTypeForDate(date);
    var classes = "calendar-day";
    if (key === todayKey) classes += " is-today";
    if (key === selectedKey) classes += " is-selected";

    var spacing = hashString(key + ":calendar-track-spacing") % 3;
    classes += " calendar-space-" + spacing;

    tracks[type].push(
      '<button type="button" class="' + classes + '" data-action="choose-date" data-date="' + key + '"' +
        ' aria-label="' + escapeHtml(formatDate(date) + " · " + localised(ambientMeta[type].day)) + '">' +
        '<span class="calendar-number">' + String(day).padStart(2, "0") + "</span>" +
      "</button>"
    );
  }

  return trackOrder.map(function(type) {
    return '<section class="calendar-track calendar-track-' + type + '">' +
      '<header class="calendar-track-head">' +
        '<span class="calendar-track-name">' + escapeHtml(localised(ambientMeta[type].short)) + "</span>" +
        '<span class="calendar-track-count">' + String(tracks[type].length).padStart(2, "0") + "</span>" +
      "</header>" +
      '<div class="calendar-track-days">' + tracks[type].join("") + "</div>" +
    "</section>";
  }).join("");
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

  html += '</section><section class="index-group"><p class="index-heading">' + labels[state.lang].writings + "</p>";
  writings.forEach(function(item) {
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


function renderRuinAtlasPreview() {
  var updatedCopy = {
    zh: "地点更新于 [2026 10 3]",
    en: "sites updated [2026 10 3]",
    ja: "地点更新 [2026 10 3]"
  };
  var sourceCopy = {
    zh: { before: "地图取自 ", label: "《墟域图·遗构馆》", after: " 网站。" },
    en: { before: "Map from ", label: "Ruin Archive", after: "." },
    ja: { before: "地図は ", label: "『墟域図・遺構館』", after: " より。" }
  };
  var ariaCopy = {
    zh: "墟域图·遗构馆 互动地图",
    en: "Ruin Archive interactive map",
    ja: "墟域図・遺構館 インタラクティブ地図"
  };
  var source = sourceCopy[state.lang] || sourceCopy.en;

  return '<section class="ruin-mini-section">' +
    '<div class="ruin-mini-shell" data-tone="22">' +
      '<div id="ruin-mini-map" class="ruin-mini-map" role="region" aria-label="' + escapeHtml(ariaCopy[state.lang] || ariaCopy.en) + '"></div>' +
      '<div class="ruin-mini-fracture-host" aria-hidden="true"></div>' +
    '</div>' +
    '<p class="ruin-mini-source">' +
      escapeHtml(source.before) +
      '<a href="https://ruin-archive.site/" target="_blank" rel="noreferrer">' + escapeHtml(source.label) + '</a>' +
      escapeHtml(source.after) +
    '</p>' +
    '<p class="ruin-mini-updated">' + escapeHtml(updatedCopy[state.lang] || updatedCopy.en) + '</p>' +
  '</section>';
}

function renderRuinArchiveCabinetPreview() {
  var sourceCopy = {
    zh: { before: "档案界面取自 ", label: "《墟域图·遗构馆》", after: " 网站。" },
    en: { before: "Archive interface from ", label: "Ruin Archive", after: "." },
    ja: { before: "档案界面は ", label: "『墟域図・遺構館』", after: " より。" }
  };
  var ariaCopy = {
    zh: "遗构馆 archive-doc 与 index-drawer 缩小系统",
    en: "Scaled Ruin Archive archive-doc and index-drawer system",
    ja: "遺構館 archive-doc / index-drawer 縮小システム"
  };
  var drawerCopy = {
    zh: {
      record: "遗构录・卷",
      center: "遗构馆",
      garden: "⁙废墟园林・编",
      intro: "《墟域图・遗构馆》收录漫游世界时所遇见的人造残构、荒地与被遗忘的地景，并持续建构一个不断扩张的废墟世界。",
      p1: "每一处遗构，都保存着稍纵即逝的「如画美」，也孕育着另一场崩解的开始。这些残构由此成为墟构师创作《废墟园林》的土壤。",
      p2: "所有影像、声音与遗物重新汇入《遗构馆》，成为持续更新的废墟档案，并散落于同一张仍未完成的《墟域图》之中。",
      title: "— 墟语学索引 —",
      lex: "「墟语学」将现场征候转化为语素，并连接具有共同征候的遗构。",
      cats: ["土地","建筑","状态","自然"]
    },
    en: {
      record: "RECORDS · VOL.",
      center: "ARCHIVE",
      garden: "⁙FOLLY · SERIES",
      intro: "Ruin Archive gathers artificial remnants, wastelands, and forgotten landscapes encountered while roaming the world.",
      p1: "Each record preserves a fleeting picturesque condition while carrying the beginning of another collapse.",
      p2: "Images, sounds, and relics return to the Archive as an expanding atlas of ruins.",
      title: "— RUIN LEXICOLOGY —",
      lex: "Field signs become lexical units that connect ruins sharing the same symptoms.",
      cats: ["LAND","ARCHITECTURE","STATE","NATURE"]
    },
    ja: {
      record: "遺構録・巻",
      center: "遺構館",
      garden: "⁙フォリー・編",
      intro: "『墟域図・遺構館』は、世界を歩くなかで出会った人工の残構、荒地、忘れられた景観を収録する。",
      p1: "それぞれの遺構は一瞬の「如画美」を保存しながら、次の崩壊の始まりを孕んでいる。",
      p2: "映像、音、遺物は再び『遺構館』へ集まり、更新され続ける墟域図の断片となる。",
      title: "— 墟語学索引 —",
      lex: "現場の徴候を語素へ変換し、共通する徴候を持つ遺構を接続する。",
      cats: ["土地","建築","状態","自然"]
    }
  };

  var indexGroups = [
    ["mountain","山","slope","坡","shore","岸","bay","湾","port","埠","plateau","塬","valley","谷","cliff","崖"],
    ["corridor","廊","stair","阶","room","厅","dwelling","居","wall","垣","fort","堡","hall","殿","sacred","圣","tower","塔","tunnel","甬","column","柱","aperture","孔","factory","厂","vessel","舰","rail","辙","courtyard","庭","dam","坝","chamber","室","monument","碑"],
    ["ruin","残","remains","骸","desolate","荒","sunken","沉","scorched","焦","crack","裂","eroded","蚀","relocated","迁","compressed","压","seepage","渗","contaminated","染","placed","置","interstitial","间"],
    ["vine","蔓","moss","苔","tree","木","grass","草","spike","棘","ash","灰","membrane","膜","water","水","wave","波","magnetic","磁","soil","土","sand","沙"]
  ];

  var source = sourceCopy[state.lang] || sourceCopy.en;
  var drawer = drawerCopy[state.lang] || drawerCopy.zh;
  var fractureCopy = {
    zh: { button: "再碎裂", note: "瞬息万变的废墟，没有固定的模样。" },
    en: { button: "fracture again", note: "A ruin in constant change has no fixed appearance." },
    ja: { button: "もう一度砕く", note: "移ろい続ける廃墟に、定まった姿はない。" }
  };
  var fracture = fractureCopy[state.lang] || fractureCopy.zh;
  var steleCopy = {
    zh: {
      lead: "断裂石碑—碑文拓片",
      body: "这个效果模拟了断裂石碑的碑文拓片，文字也在断裂处断掉。"
    },
    en: {
      lead: "Fractured stele — inscription rubbing",
      body: "This effect simulates a rubbing taken from a broken stele; the inscription breaks wherever the stone breaks."
    },
    ja: {
      lead: "断裂石碑—碑文拓本",
      body: "この効果は、割れた石碑から採った碑文の拓本を模している。文字も石の断裂した箇所で途切れる。"
    }
  };
  var stele = steleCopy[state.lang] || steleCopy.zh;

  function indexRows() {
    return indexGroups.map(function(group, groupIndex) {
      var tags = "";
      for (var i = 0; i < group.length; i += 2) {
        tags += '<button type="button" class="ruin-mini-index-tag" data-tag="' +
          escapeHtml(group[i]) + '">' + escapeHtml(group[i + 1]) + '</button>';
      }
      return '<div class="ruin-mini-index-row">' +
        '<div class="ruin-mini-index-category">' + escapeHtml(drawer.cats[groupIndex]) + '</div>' +
        '<div class="ruin-mini-index-separator">|</div>' +
        '<div class="ruin-mini-index-tags">' + tags + '</div>' +
      '</div>';
    }).join("");
  }

  return '<section class="ruin-mini-section ruin-mini-cabinet-section" aria-label="' +
    escapeHtml(ariaCopy[state.lang] || ariaCopy.en) + '">' +
    '<div class="ruin-mini-shell ruin-mini-cabinet-shell">' +
      '<div id="ruin-mini-archive-system" class="ruin-mini-archive-system">' +
        '<div id="ruin-mini-stack-record" class="ruin-mini-file-stack ruin-mini-position-left" aria-hidden="true"></div>' +
        '<div id="ruin-mini-stack-garden" class="ruin-mini-file-stack ruin-mini-position-right" aria-hidden="true"></div>' +
      '</div>' +
      '<div class="ruin-mini-cabinet-frame" aria-hidden="true">' +
        '<svg viewBox="0 0 1000 820" preserveAspectRatio="none">' +
          '<g class="ruin-mini-cabinet-frame-lines">' +
            '<path d="M1 1H999V819H1Z"/>' +
            '<path d="M195 64H885V725H195Z"/>' +
            '<path d="M1 1L195 64 M999 1L885 64 M999 819L885 725 M1 819L195 725"/>' +
          '</g>' +
        '</svg>' +
      '</div>' +
      '<div id="ruin-mini-index-drawer" class="ruin-mini-index-drawer">' +
        '<div id="ruin-mini-index-stone-layer" class="ruin-mini-index-stone-layer" aria-hidden="true"></div>' +
        '<div id="ruin-mini-index-handle" class="ruin-mini-index-handle">' +
          '<button type="button" class="ruin-mini-index-surface-trigger" aria-expanded="false" aria-label="' + escapeHtml(drawer.center) + '"></button>' +
        '</div>' +
        '<div class="ruin-mini-index-content">' +
          '<div class="ruin-mini-stele-copy" data-stele-lang="' + escapeHtml(state.lang) + '">' +
            '<span class="ruin-mini-stele-lead">' + escapeHtml(stele.lead) + '</span>' +
            '<span class="ruin-mini-stele-separator">：</span>' +
            '<span class="ruin-mini-stele-body">' + escapeHtml(stele.body) + '</span>' +
          '</div>' +
        '</div>' +
      '</div>' +
    '</div>' +
    '<div class="ruin-mini-refracture-control">' +
      '<button type="button" class="ruin-mini-refracture-button">' + escapeHtml(fracture.button) + '</button>' +
      '<p class="ruin-mini-refracture-note">' + escapeHtml(fracture.note) + '</p>' +
    '</div>' +
    '<p class="ruin-mini-source ruin-mini-cabinet-source">' +
      escapeHtml(source.before) +
      '<a href="https://ruin-archive.site/" target="_blank" rel="noreferrer">' + escapeHtml(source.label) + '</a>' +
      escapeHtml(source.after) +
    '</p>' +
  '</section>';
}

function renderRoom(item) {
  var images = item.images || [];
  var next = rooms[(roomIndex(item) + 1) % rooms.length];
  var groupLabel = item.group === "collection" ? labels[state.lang].collection : item.group === "writing" ? labels[state.lang].writings : labels[state.lang].works;
  var html = '<section class="room-view' + (item.group === "writing" ? " writing-room" : "") + '">' +
    '<header class="room-head">' +
      '<button type="button" data-action="home" class="room-back">← ' + escapeHtml(labels[state.lang].back) + "</button>" +
      '<p>' + escapeHtml(groupLabel) + " / " + escapeHtml(localised(item.title)) + "</p>" +
      languageSwitch() +
    "</header>" +
    '<div class="room-scroll">' +
      '<section class="room-lead">' +
        '<p class="room-group">' + escapeHtml(groupLabel) + "</p>" +
        '<h1>' + escapeHtml(localised(item.title)) + "</h1>" +
        renderRoomIntro(item) +
      "</section>";

  if (item.slug === "ruin-atlas") {
    html += renderRuinAtlasPreview();
  }

  images.forEach(function(image, index) {
    html += '<figure class="room-image' + (image.fit === "contain" ? " is-contain" : "") + '">' +
      '<img src="' + image.src + '" alt="" ' + (index ? 'loading="lazy"' : "") + " />" +
      '<figcaption>' + escapeHtml(localised(image.caption)) + "</figcaption>" +
    "</figure>";
  });

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

  if (Array.isArray(item.notes) && item.notes.length) {
    html += '<section class="room-notes">';
    item.notes.forEach(function(note, noteIndex) {
      if (item.slug === "ruin-atlas" && noteIndex === 1) {
        html += renderRuinArchiveCabinetPreview();
      }

      var richBody = note.bodyHtml ? localised(note.bodyHtml) : null;
      var body = localised(note.body);
      var bodyHtml = "";
      if (Array.isArray(richBody)) {
        bodyHtml = richBody.map(function(paragraph) {
          return '<p class="room-note-body">' + paragraph + "</p>";
        }).join("");
      } else if (richBody) {
        bodyHtml = '<p class="room-note-body">' + richBody + "</p>";
      } else if (Array.isArray(body)) {
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

      var noteTitleHtml = note.titleHtml
        ? localised(note.titleHtml)
        : escapeHtml(localised(note.title));

      html += '<article class="room-note">' +
        '<p class="room-note-title">' + noteTitleHtml + "</p>" +
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
    document.title = localised(room.title) + " — sky-sea-lake-cloud";
    app.innerHTML = '<main class="site-root">' + renderRoom(room) + "</main>";
  } else {
    document.title = "sky-sea-lake-cloud";
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


/* ===== Collection pages ===== */

"use strict";

/*
  Collection page extensions.
  Keeps the main portfolio script small while letting image-heavy collections
  use their own viewing rhythm.
*/

(function () {
  var fragranceThemes = [
    {
      key: "sky",
      label: { zh: "天空", en: "sky", ja: "空" },
      files: [
        "01.jpg",
        "02.jpg",
        "03.jpg",
        "04.jpg",
        "05.jpg",
        "06.jpg",
        "07.jpg",
        "08.jpg",
        "09.jpg"
      ]
    },
    {
      key: "cosmos",
      label: { zh: "宇宙", en: "cosmos", ja: "宇宙" },
      files: [
        "01.jpg",
        "02.jpg",
        "03.jpg"
      ]
    },
    {
      key: "organs",
      label: { zh: "肢体", en: "body", ja: "身体" },
      files: [
        "01.jpg",
        "02.jpg",
        "03.jpg",
        "04.jpg",
        "05.jpg",
        "06.jpg",
        "07.jpg"
      ]
    },
    {
      key: "gallery",
      label: { zh: "画廊", en: "gallery", ja: "ギャラリー" },
      files: [
        "01.jpg",
        "02.jpg",
        "03.jpg",
        "04.jpg"
      ]
    },
    {
      key: "eyes",
      label: { zh: "眼睛", en: "eyes", ja: "眼" },
      files: [
        "01.jpg",
        "02.jpg",
        "03.jpg",
        "04.jpg",
        "05.jpg"
      ]
    }
  ];

  fragranceThemes.forEach(function (theme) {
    theme.images = theme.files.map(function (file) {
      return "./collection/fragrance/" + theme.key + "/" + encodeURIComponent(file);
    });
  });

  var fragranceState = {
    theme: "sky",
    slides: { sky: 0, cosmos: 0, organs: 0, gallery: 0, eyes: 0 }
  };

  function findCollection(slug) {
    return collections.find(function (item) { return item.slug === slug; });
  }

  var fragrance = findCollection("fragrance-hall");
  if (fragrance) fragrance.galleryThemes = fragranceThemes;

  var lakeRoom = findCollection("room-by-the-lake");
  if (lakeRoom) {
    lakeRoom.images = [
      {
        src: "./collection/room-by-the-lake/room-by-the-lake.jpg",
        fit: "contain",
        caption: {
          zh: "room by the lake, 2020 · 布面油画 · 60 × 91 cm · 密西根湖",
          en: "room by the lake, 2020 · oil on canvas · 60 × 91 cm · Lake Michigan",
          ja: "room by the lake, 2020 · キャンバスに油彩 · 60 × 91 cm · ミシガン湖"
        }
      },
      {
        src: "./collection/room-by-the-lake/painting-on-site.jpg",
        caption: { zh: "展示空间", en: "painting on site", ja: "展示空間" }
      }
    ];
  }

  var seawater = findCollection("seawater");
  if (seawater) {
    seawater.title = {
      zh: "海水收集",
      en: "collection of (all) oceans and seas",
      ja: "すべての海の採集"
    };
    seawater.intro = {
      zh: "起点是一段悬置在真实与虚构之间的童年记忆：大约十一岁时，我记得在一座美术馆的角落看见一个正在漏水的 tote tank，并听见一句“55个海洋的海水”。多年后再回头查询，我找不到任何相关记录。于是这段无法被证实的记忆，慢慢变成了一项持续至今的海水收集。",
      en: "The collection begins with a childhood memory suspended between fact and fiction. At about eleven, I remember a leaking tote tank in the corner of a museum and the phrase “water from 55 oceans.” Years later I could find no record of it. That unverifiable fragment gradually became an ongoing collection of seawater.",
      ja: "このコレクションの起点は、現実と虚構のあいだに宙づりになった幼少期の記憶である。十一歳頃、美術館の隅で水の漏れる tote tank を見て、「55の海の海水」という言葉を聞いた記憶がある。何年も後に調べ直しても、関連する記録は何も見つからなかった。その確かめようのない断片が、現在まで続く海水採集へと少しずつ変わっていった。"
    };
    seawater.images = [
      {
        src: "./collection/oceans-and-seas/memory.jpeg",
        fit: "contain",
        caption: {
          zh: "《角落里漏着“55个海洋的海水”》 · 30 × 40 cm · 布面油画 · 2019",
          en: "Water from ‘55 Oceans’ Leaking in the Corner · 30 × 40 cm · oil on canvas · 2019",
          ja: "《隅で漏れている「55の海の海水」》 · 30 × 40 cm · キャンバスに油彩 · 2019"
        }
      },
      {
        src: "./collection/oceans-and-seas/totetank.jpg",
        fit: "contain",
        caption: {
          zh: "collection of (all) oceans and seas · H: — · D: — · 2023/2— ·（坐标、坐标、坐标……）",
          en: "collection of (all) oceans and seas · H: — · D: — · 2023/2— · (coordinates, coordinates, coordinates …)",
          ja: "collection of (all) oceans and seas · H: — · D: — · 2023/2— ·（座標、座標、座標……）"
        }
      }
    ];
    seawater.notes = [
      {
        title: { zh: "55个海洋", en: "55 oceans", ja: "55の海" },
        body: {
          zh: [
            "我不知道这段记忆究竟真实发生过，还是在漫长的回想中被重新拼接出来。也许当时真的有这样一件作品；也许只是路过的人对一缸水的过度解读，被十一岁的我无意听见；也可能还有别的来源。奇怪的是，当它多年后突然重新回到脑海里，我越想确认它，它反而越显得不真实。",
            "它因此变成了一场关于媒介的恐惧：一边担心原始记忆会随着时间彻底消失，一边又担心任何试图把它画下来、做出来、命名出来的动作，都会替换掉那段记忆本身。重要的东西不再只是“它到底有没有发生过”，而是记忆一旦需要媒介才能继续存在，就不可避免地开始被媒介改变。"
          ],
          en: [
            "I do not know whether the memory actually happened or was gradually reassembled through years of recollection. Perhaps such a work existed; perhaps I overheard a passer-by over-interpreting an ordinary tank of water; perhaps there was another source entirely. The stranger part is that the more I tried to verify the memory after it returned years later, the less real it began to feel.",
            "It became a form of media anxiety: fear that the original memory might disappear with time, paired with fear that every attempt to paint, build or name it would replace the memory itself. The question is no longer only whether it happened. Once memory needs a medium in order to persist, the medium inevitably begins to alter it."
          ],
          ja: [
            "この記憶が本当に起きたことなのか、それとも長い回想のなかで少しずつ組み替えられたものなのか、私には分からない。本当にそのような作品があったのかもしれないし、通りすがりの誰かが一槽の水を過剰に解釈した言葉を、十一歳の私が偶然聞いただけなのかもしれない。別の可能性もある。奇妙なのは、何年も後に記憶が突然戻ってきて、確かめようとすればするほど、それが現実から遠ざかって見えたことだった。",
            "それはやがて、メディアに対する二重の不安になった。原初の記憶が時間とともに完全に消えることへの恐れと、それを描き、つくり、名づけようとする行為そのものが記憶を置き換えてしまうことへの恐れである。問題はもはや「本当に起きたか」だけではない。記憶が存続するために媒体を必要とした瞬間、媒体は必ず記憶を変え始める。"
          ]
        }
      },
      {
        title: { zh: "物质化", en: "materialisation", ja: "物質化" },
        body: {
          zh: [
            "于是我没有试图制作一个完美的复制品。材料在手工过程中留下的偏差、接缝与不完整，更接近我对记忆本身的认识：记忆从来不是无损保存的文件，而是一件每次被取出时都会重新生成的东西。瑕疵不是为了制造怀旧，而是承认重述本身就会带来变形。",
            "从2019年开始，我把在不同地方遇见的海水一点点留下。那些真实的水样和那句无法证实的“55个海洋”形成一种镜像关系——它们不是对童年记忆的复制，而是一种迟到的回应。"
          ],
          en: [
            "I therefore did not try to manufacture a perfect replica. Deviations, seams and incompleteness left by making are closer to how I understand memory itself: not a lossless file, but something regenerated each time it is retrieved. Imperfection is not used to simulate nostalgia; it acknowledges that retelling always produces distortion.",
            "Since 2019 I have kept small samples of seawater from different places. These actual waters form a mirror relation with the unverifiable phrase “55 oceans.” They do not reproduce the childhood memory; they answer it belatedly."
          ],
          ja: [
            "だから私は、完全な複製をつくろうとはしなかった。手作業の過程で残るずれ、継ぎ目、不完全さのほうが、記憶そのものについての私の理解に近い。記憶は劣化せず保存されるファイルではなく、取り出されるたびに生成し直されるものだ。瑕疵はノスタルジーを演出するためではなく、語り直すこと自体が変形を生むと認めるためにある。",
            "2019年から、私は異なる土地で出会った海水を少しずつ残してきた。それらの実在する水と、確かめることのできない「55の海」という言葉は鏡像のような関係を結ぶ。童年の記憶を複製するのではなく、遅れて返す応答である。"
          ]
        }
      },
      {
        title: { zh: "愚人船号", en: "Ship of Fools", ja: "愚人船号" },
        body: {
          zh: [
            "“愚人船号”把这种无法被证实的记忆继续推向真实世界。在构想中，它携带自2019年以来收集的各地海水，让这些样本随着洋流继续移动。中世纪的愚人船载着无法被理解的人驶向未知；这里的船则载着一段无法被证明的记忆，进入同样没有明确终点的航行。",
            "到这里，真实性反而不再是唯一的重点。更重要的是，一段记忆如何因为不断被回想、怀疑、绘画、收集和重述而获得新的生命。它没有被“还原”，而是在时间里持续生成。"
          ],
          en: [
            "The Ship of Fools extends this unverifiable memory back into the physical world. In the proposal, it carries seawater gathered since 2019 and lets the samples continue moving with ocean currents. The medieval ship of fools carried those who could not be understood toward the unknown; this vessel carries an unprovable memory into a journey without a necessary destination.",
            "At that point authenticity is no longer the only question. What matters is how a memory acquires another life through recollection, doubt, painting, collecting and retelling. It is not restored. It keeps being generated through time."
          ],
          ja: [
            "「愚人船号」は、この証明できない記憶をもう一度物理的な世界へ押し出す構想である。2019年以降に集めた各地の海水を載せ、サンプルを海流とともに移動させる。中世の愚人船が理解されない者たちを未知へ運んだのなら、ここでの船は証明できないひとつの記憶を、同じように明確な終点を必要としない航海へ運ぶ。",
            "ここでは、真実性だけが中心ではなくなる。重要なのは、記憶が回想され、疑われ、描かれ、採集され、語り直されることで、どのように別の生命を得るかということだ。それは「復元」されるのではなく、時間のなかで生成され続ける。"
          ]
        }
      }
    ];
  }

  function renderNotes(item) {
    if (!Array.isArray(item.notes) || !item.notes.length) return "";

    var html = '<section class="room-notes">';
    item.notes.forEach(function (note) {
      var body = localised(note.body);
      var bodyHtml = "";

      if (Array.isArray(body)) {
        bodyHtml = body.map(function (paragraph) {
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
    return html + "</section>";
  }

  function currentFragranceTheme() {
    return fragranceThemes.find(function (theme) {
      return theme.key === fragranceState.theme;
    }) || fragranceThemes[0];
  }

  function renderFragranceGallery() {
    var theme = currentFragranceTheme();
    var index = fragranceState.slides[theme.key] || 0;
    var image = theme.images[index];

    var tabs = fragranceThemes.map(function (entry, themeIndex) {
      var active = entry.key === theme.key ? " is-active" : "";
      return '<button type="button" class="fragrance-theme' + active + '" data-fragrance-theme="' + entry.key + '">' +
        '<span class="fragrance-theme-index">0' + (themeIndex + 1) + "</span>" +
        '<span>' + escapeHtml(localised(entry.label)) + "</span>" +
        '<span class="fragrance-theme-count">' + String(entry.images.length).padStart(2, "0") + "</span>" +
      "</button>";
    }).join("");

    var thumbs = theme.images.map(function (src, thumbIndex) {
      return '<button type="button" class="fragrance-thumb' + (thumbIndex === index ? " is-active" : "") + '" data-fragrance-slide="' + thumbIndex + '" aria-label="' + (thumbIndex + 1) + '">' +
        '<img src="' + src + '" alt="" loading="lazy" />' +
      "</button>";
    }).join("");

    return '<section class="fragrance-gallery" data-fragrance-gallery>' +
      '<nav class="fragrance-theme-nav" aria-label="photo themes">' + tabs + "</nav>" +
      '<div class="fragrance-stage">' +
        '<button type="button" class="fragrance-arrow fragrance-arrow-prev" data-fragrance-step="-1" aria-label="previous image">←</button>' +
        '<figure class="fragrance-frame">' +
          '<img src="' + image + '" alt="' + escapeHtml(localised(theme.label)) + '" />' +
          '<figcaption><span>' + escapeHtml(localised(theme.label)) + '</span><span>' + String(index + 1).padStart(2, "0") + " / " + String(theme.images.length).padStart(2, "0") + "</span></figcaption>" +
        "</figure>" +
        '<button type="button" class="fragrance-arrow fragrance-arrow-next" data-fragrance-step="1" aria-label="next image">→</button>' +
      "</div>" +
      '<div class="fragrance-filmstrip" aria-label="contact sheet">' + thumbs + "</div>" +
    "</section>";
  }

  function renderFragranceRoom(item) {
    var next = rooms[(roomIndex(item) + 1) % rooms.length];
    var groupLabel = labels[state.lang].collection;

    return '<section class="room-view fragrance-room">' +
      '<header class="room-head">' +
        '<button type="button" data-action="home" class="room-back">← ' + escapeHtml(labels[state.lang].back) + "</button>" +
        '<p>' + escapeHtml(groupLabel) + " / " + escapeHtml(localised(item.title)) + "</p>" +
        languageSwitch() +
      "</header>" +
      '<div class="room-scroll">' +
        '<section class="room-lead fragrance-lead">' +
          '<p class="room-group">' + escapeHtml(groupLabel) + "</p>" +
          '<h1>' + escapeHtml(localised(item.title)) + "</h1>" +
          '<p class="room-intro">' + escapeHtml(localised(item.intro)) + "</p>" +
        "</section>" +
        renderFragranceGallery() +
        renderNotes(item) +
        '<footer class="room-footer">' +
          '<button type="button" data-action="route" data-route="' + next.slug + '">' +
            escapeHtml(localised(next.title)) + '<span aria-hidden="true"> →</span>' +
          "</button>" +
        "</footer>" +
      "</div>" +
    "</section>";
  }

  var baseRenderRoom = renderRoom;
  renderRoom = function (item) {
    if (item && item.slug === "fragrance-hall") return renderFragranceRoom(item);
    return baseRenderRoom(item);
  };

  function replaceFragranceGallery() {
    var gallery = document.querySelector("[data-fragrance-gallery]");
    if (!gallery) return;
    gallery.outerHTML = renderFragranceGallery();

    var activeThumb = document.querySelector(".fragrance-thumb.is-active");
    if (activeThumb && typeof activeThumb.scrollIntoView === "function") {
      activeThumb.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
    }
  }

  document.addEventListener("click", function (event) {
    var themeButton = event.target.closest("[data-fragrance-theme]");
    if (themeButton) {
      fragranceState.theme = themeButton.dataset.fragranceTheme;
      replaceFragranceGallery();
      return;
    }

    var slideButton = event.target.closest("[data-fragrance-slide]");
    if (slideButton) {
      var theme = currentFragranceTheme();
      fragranceState.slides[theme.key] = Number(slideButton.dataset.fragranceSlide) || 0;
      replaceFragranceGallery();
      return;
    }

    var stepButton = event.target.closest("[data-fragrance-step]");
    if (stepButton) {
      var current = currentFragranceTheme();
      var step = Number(stepButton.dataset.fragranceStep) || 0;
      var oldIndex = fragranceState.slides[current.key] || 0;
      fragranceState.slides[current.key] = (oldIndex + step + current.images.length) % current.images.length;
      replaceFragranceGallery();
    }
  });

  window.addEventListener("keydown", function (event) {
    if (!document.querySelector(".fragrance-room")) return;
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;

    var theme = currentFragranceTheme();
    var step = event.key === "ArrowLeft" ? -1 : 1;
    var oldIndex = fragranceState.slides[theme.key] || 0;
    fragranceState.slides[theme.key] = (oldIndex + step + theme.images.length) % theme.images.length;
    replaceFragranceGallery();
  });

  // The main script rendered once before this extension loaded. Render again so
  // the uploaded collection assets and custom fragrance gallery appear at once.
  render();
})();


/* ===== Ambient colour hooks ===== */

"use strict";

/*
  Ambient colour hooks — filter-only edition
  ------------------------------------------
  The calendar decides the current day type. This script only applies the matching
  class to the homepage so CSS can grade the original uploaded video differently
  for sea / cloud / lake / sky. It never replaces or duplicates the source video.
*/

(function () {
  var DAY_TYPES = ["sea", "cloud", "lake", "sky"];
  var appNode = document.querySelector("#app");
  var themeMeta = document.querySelector('meta[name="theme-color"]');

  var themeColors = {
    sea: "#06172a",
    cloud: "#111b26",
    lake: "#0a1a22",
    sky: "#0b1b30"
  };

  function getCurrentAmbientType() {
    try {
      return ambientTypeForDate(selectedDate());
    } catch (_) {
      return null;
    }
  }

  function clearDayClasses(node) {
    DAY_TYPES.forEach(function (type) {
      if (node) node.classList.remove("ambient-day-" + type);
      document.body.classList.remove("ambient-day-" + type);
    });
  }

  function applyAmbientColour() {
    var home = document.querySelector(".home-view");

    if (!home) {
      clearDayClasses(null);
      if (themeMeta) themeMeta.setAttribute("content", "#f4f3ee");
      return;
    }

    var type = getCurrentAmbientType();
    if (!type || DAY_TYPES.indexOf(type) < 0) type = "sky";

    clearDayClasses(home);
    home.classList.add("ambient-day-" + type);
    document.body.classList.add("ambient-day-" + type);

    var field = home.querySelector(".ambient-field");
    if (field) field.dataset.ambientType = type;

    if (themeMeta) themeMeta.setAttribute("content", themeColors[type] || "#080a09");
  }

  if (appNode && "MutationObserver" in window) {
    var scheduled = false;
    var observer = new MutationObserver(function () {
      if (scheduled) return;
      scheduled = true;
      requestAnimationFrame(function () {
        scheduled = false;
        applyAmbientColour();
      });
    });

    observer.observe(appNode, { childList: true, subtree: true });
  }

  applyAmbientColour();
})();


/* ===== Mobile video compatibility ===== */

"use strict";

/*
  Calendar video compatibility
  ----------------------------
  iOS Safari is much more reliable with H.264 MP4 than arbitrary WebM encodes.
  The repository keeps the original WebM files untouched; a GitHub Action creates
  same-name .mp4 fallbacks. iPhone / iPad prefer the MP4, while other browsers can
  continue to use the original WebM first.
*/

(function () {
  var ua = navigator.userAgent || "";
  var isIOS = /iPad|iPhone|iPod/.test(ua) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

  /* Replace the renderer used by script.js before site-patches.js re-renders. */
  ambientMedia = function (date, type, entry) {
    if (!entry || !entry.src) {
      return '<div class="ambient-empty ambient-empty-' + type + '" aria-hidden="true"></div>';
    }

    var webm = entry.src;
    var mp4 = entry.mp4 || webm.replace(/\.webm(?:\?.*)?$/i, ".mp4");
    var poster = entry.poster ? ' poster="' + escapeHtml(entry.poster) + '"' : "";
    var sources = isIOS
      ? '<source src="' + escapeHtml(mp4) + '" type="video/mp4">' +
        '<source src="' + escapeHtml(webm) + '" type="video/webm">'
      : '<source src="' + escapeHtml(webm) + '" type="video/webm">' +
        '<source src="' + escapeHtml(mp4) + '" type="video/mp4">';

    return '<video class="ambient-video" autoplay muted playsinline webkit-playsinline loop preload="auto"' + poster + '>' +
      sources +
    '</video>';
  };

  function prepare(video) {
    if (!video || video.dataset.mobilePrepared === "1") return;
    video.dataset.mobilePrepared = "1";
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.setAttribute("muted", "");
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "");

    var tryPlay = function () {
      if (!video.isConnected) return;
      var promise = video.play();
      if (promise && typeof promise.catch === "function") promise.catch(function () {});
    };

    if (video.readyState >= 2) tryPlay();
    video.addEventListener("loadeddata", tryPlay, { once: true });
    video.addEventListener("canplay", tryPlay, { once: true });

    /* Safari sometimes needs playback retried after the first real page gesture. */
    ["touchstart", "pointerdown", "click"].forEach(function (name) {
      document.addEventListener(name, tryPlay, { once: true, passive: true });
    });
  }

  function prepareAll() {
    document.querySelectorAll(".ambient-video").forEach(prepare);
  }

  var app = document.querySelector("#app");
  if (app && "MutationObserver" in window) {
    new MutationObserver(function () {
      requestAnimationFrame(prepareAll);
    }).observe(app, { childList: true, subtree: true });
  }

  window.addEventListener("pageshow", prepareAll);
  document.addEventListener("visibilitychange", function () {
    if (!document.hidden) prepareAll();
  });

  requestAnimationFrame(prepareAll);
})();


/* ===== Site refinements ===== */

"use strict";

/*
  Small site-level refinements that sit on top of the main renderer.
  - keeps works and collections in separate navigation loops
  - points the old root work images to their new /works/ folders
  - restores Fictional Topography as the third work
  - repairs iOS calendar playback with Safari-safe H.264 MP4 fallbacks
  - keeps every collection on the same generated after-image field
*/

(function () {
  function findBySlug(list, slug) {
    return list.find(function (item) { return item.slug === slug; });
  }

  var folly = findBySlug(works, "ruin-garden");
  if (folly) {
    folly.images = [
      {
        src: "./works/ruin-garden/img1-blur.jpg",
        caption: { zh: "现场记录 01", en: "site record 01", ja: "現場記録 01" }
      },
      {
        src: "./works/ruin-garden/img2-blur.jpg",
        caption: { zh: "现场记录 02", en: "site record 02", ja: "現場記録 02" }
      }
    ];
  }

  var instrument = findBySlug(works, "the-instrument");
  if (instrument) {
    instrument.images = [
      {
        src: "./works/the-instrument/img3-blur.jpg",
        caption: { zh: "仪器试作 01", en: "instrument study 01", ja: "器械試作 01" }
      },
      {
        src: "./works/the-instrument/img4-blur.jpg",
        caption: { zh: "仪器试作 02", en: "instrument study 02", ja: "器械試作 02" }
      }
    ];
  }

  if (!findBySlug(works, "fictional-topography")) {
    var fictionalTopography = {
      slug: "fictional-topography",
      group: "work",
      title: {
        zh: "虚构地形学",
        en: "Fictional Topography",
        ja: "架空地形学"
      },
      intro: {
        zh: "这里的地图不负责复原世界，而负责收留遗漏之物。地点被发现、命名、记录，再以图像、声音与文本进入《墟域图·遗构馆》，成为一片不断改写自身的地理。",
        en: "These maps do not restore the world; they shelter what it leaves out. Sites are found, named and recorded, then enter the Atlas of Ruins through image, sound and text—an unfinished geography rewriting itself.",
        ja: "この地図は世界を復元するためではなく、こぼれ落ちたものを収めるためにある。場所は発見され、名づけられ、記録され、像・音・言葉として《墟域図・遺構館》へ入り、自らを書き換え続ける地理となる。"
      },
      images: [
        {
          src: "./works/fictional-topography/img5-blur.jpg",
          caption: { zh: "地形记录 01", en: "terrain record 01", ja: "地形記録 01" }
        },
        {
          src: "./works/fictional-topography/img6-blur.jpg",
          caption: { zh: "地形记录 02", en: "terrain record 02", ja: "地形記録 02" }
        }
      ]
    };

    works.push(fictionalTopography);
    rooms.splice(2, 0, fictionalTopography);
  }

  function nextWithinGroup(item) {
    var list = item && item.group === "collection" ? collections : item && item.group === "writing" ? writings : works;
    if (!list.length) return null;
    var index = list.findIndex(function (candidate) { return candidate.slug === item.slug; });
    if (index < 0) return list[0];
    return list[(index + 1) % list.length];
  }

  function updateFooterNavigation(item) {
    var footerButton = document.querySelector(".room-footer [data-action='route']");
    var next = nextWithinGroup(item);
    if (!footerButton || !next) return;

    footerButton.dataset.route = next.slug;

    if (footerButton.dataset.groupNext !== next.slug) {
      footerButton.dataset.groupNext = next.slug;
      footerButton.innerHTML = escapeHtml(localised(next.title)) + '<span aria-hidden="true"> →</span>';
    }
  }

  function isIOSLike() {
    var ua = navigator.userAgent || "";
    var classicIOS = /iPad|iPhone|iPod/.test(ua);
    var touchIPad = navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
    return classicIOS || touchIPad;
  }

  function tryPlayVideo(video) {
    if (!video || !document.documentElement.contains(video)) return;
    video.defaultMuted = true;
    video.muted = true;
    video.playsInline = true;
    video.autoplay = true;
    video.loop = true;
    video.setAttribute("muted", "");
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "");

    var promise;
    try {
      promise = video.play();
    } catch (_) {
      return;
    }
    if (promise && typeof promise.catch === "function") {
      promise.catch(function () {});
    }
  }

  function repairAmbientCalendarVideo() {
    var video = document.querySelector(".home-view .ambient-video");
    if (!video) return;

    var source = video.dataset.originalWebm || video.getAttribute("src") || "";
    if (!source) return;

    if (!video.dataset.originalWebm) video.dataset.originalWebm = source;

    /*
      Diagnostic result: the uploaded WebM is VP9 Profile 2, 10-bit yuv420p10le.
      iPhone Safari can expose WebM support while still failing on this profile.
      On iOS we therefore bypass WebM completely and request the matched H.264 MP4.
    */
    if (isIOSLike() && /\.webm(?:$|\?)/i.test(source)) {
      var mp4 = source.replace(/\.webm(?:\?.*)?$/i, ".mp4");
      if (video.dataset.mobileMp4 !== mp4) {
        video.dataset.mobileMp4 = mp4;
        video.pause();
        video.removeAttribute("src");
        video.src = mp4;
        video.preload = "auto";
        video.load();
      }
    }

    if (video.dataset.playbackWired !== "1") {
      video.dataset.playbackWired = "1";

      video.addEventListener("loadeddata", function () {
        video.classList.add("is-ready");
        tryPlayVideo(video);
      });
      video.addEventListener("canplay", function () {
        video.classList.add("is-ready");
        tryPlayVideo(video);
      });
      video.addEventListener("playing", function () {
        video.classList.add("is-playing");
        document.documentElement.dataset.ambientVideo = "playing";
      });
      video.addEventListener("error", function () {
        document.documentElement.dataset.ambientVideo = "error";
      });
    }

    tryPlayVideo(video);
  }


  var ruinMiniLeafletPromise = null;
  var ruinMiniSitesPromise = null;
  var ruinMiniMapInstance = null;
  var ruinMiniMountToken = 0;
  var ruinMiniParallaxCleanup = null;
  var ruinMiniIndexFilterCleanup = null;

  var RUIN_MINI_TONE_STEPS = [0, 22, 45, 60, 100];
  var RUIN_MINI_TONE_KEY = "ruin-reader-tone";
  var RUIN_MINI_WARM_POINT = 45;
  var RUIN_MINI_PALETTES = {
    paper: {
      bg: [255, 255, 251], paper: [255, 255, 251], text: [28, 28, 26],
      muted: [103, 103, 97], line: [205, 205, 197], lineStrong: [102, 102, 96], marker: [17, 17, 17]
    },
    warm: {
      bg: [235, 227, 209], paper: [243, 235, 218], text: [50, 47, 42],
      muted: [103, 96, 84], line: [193, 183, 161], lineStrong: [112, 105, 91], marker: [57, 52, 44]
    },
    night: {
      bg: [25, 26, 24], paper: [31, 32, 30], text: [204, 201, 191],
      muted: [143, 141, 133], line: [66, 67, 62], lineStrong: [121, 120, 112], marker: [202, 199, 188]
    }
  };

  var RUIN_MINI_FALLBACK_SITES = [
    { name: "瘟猪坝沉墟", lat: 30.454417, lng: 104.047667, archiveDate: "2025.04", type: "garden" },
    { name: "电台路焦土", lat: 31.225833, lng: 121.618333, archiveDate: "2026.03", type: "garden" },
    { name: "山葬灰脉", lat: 32.04174, lng: 119.83912, archiveDate: "2017.08", type: "record" },
    { name: "硅脉遗厂", lat: 31.1936472, lng: 121.6131444, archiveDate: "2018.05", type: "record" },
    { name: "裂翼坪", lat: 41.860278, lng: -87.606111, archiveDate: "2021.08", type: "record" },
    { name: "钟寂残堂", lat: 41.7874631760, lng: -87.6333067890, archiveDate: "2022.11", type: "record" },
    { name: "池骸湾", lat: 37.78060, lng: -122.51370, archiveDate: "2023.08", type: "record" },
    { name: "褶层湾", lat: 47.1808, lng: -122.5537, archiveDate: "2023.12", type: "record" },
    { name: "隐染悬里", lat: 37.4543556, lng: 141.0370611, archiveDate: "2024.01", type: "record" }
  ];

  function ruinMiniClamp(value, min, max) {
    return Math.max(min, Math.min(max, Number(value) || 0));
  }

  function ruinMiniMix(a, b, t) {
    return a + (b - a) * t;
  }

  function ruinMiniMixArray(a, b, t) {
    return a.map(function(value, index) { return ruinMiniMix(value, b[index], t); });
  }

  function ruinMiniInterpolateTone(value, key) {
    var tone = ruinMiniClamp(value, 0, 100);
    if (tone <= RUIN_MINI_WARM_POINT) {
      return ruinMiniMixArray(RUIN_MINI_PALETTES.paper[key], RUIN_MINI_PALETTES.warm[key], tone / RUIN_MINI_WARM_POINT);
    }
    return ruinMiniMixArray(
      RUIN_MINI_PALETTES.warm[key],
      RUIN_MINI_PALETTES.night[key],
      (tone - RUIN_MINI_WARM_POINT) / (100 - RUIN_MINI_WARM_POINT)
    );
  }

  function ruinMiniRgb(values) {
    return "rgb(" + values.slice(0, 3).map(function(value) { return Math.round(value); }).join(", ") + ")";
  }

  function readRuinMiniTone() {
    try {
      var saved = localStorage.getItem(RUIN_MINI_TONE_KEY);
      if (saved !== null && saved !== "") return ruinMiniClamp(saved, 0, 100);
    } catch (_) {}
    return 22;
  }

  function saveRuinMiniTone(value) {
    try { localStorage.setItem(RUIN_MINI_TONE_KEY, String(Math.round(ruinMiniClamp(value, 0, 100)))); } catch (_) {}
  }

  function ensureRuinMiniLeaflet() {
    if (window.L && window.L.map) return Promise.resolve(window.L);
    if (ruinMiniLeafletPromise) return ruinMiniLeafletPromise;

    ruinMiniLeafletPromise = new Promise(function(resolve, reject) {
      if (!document.getElementById("ruin-mini-leaflet-css")) {
        var link = document.createElement("link");
        link.id = "ruin-mini-leaflet-css";
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
      }

      var existing = document.getElementById("ruin-mini-leaflet-js");
      if (existing) {
        existing.addEventListener("load", function() { resolve(window.L); }, { once: true });
        existing.addEventListener("error", reject, { once: true });
        if (window.L && window.L.map) resolve(window.L);
        return;
      }

      var scriptEl = document.createElement("script");
      scriptEl.id = "ruin-mini-leaflet-js";
      scriptEl.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      scriptEl.onload = function() { resolve(window.L); };
      scriptEl.onerror = reject;
      document.head.appendChild(scriptEl);
    });

    return ruinMiniLeafletPromise;
  }

  function ensureRuinMiniSites() {
    if (Array.isArray(window.sites) && window.sites.length) return Promise.resolve(window.sites);
    if (ruinMiniSitesPromise) return ruinMiniSitesPromise;

    ruinMiniSitesPromise = new Promise(function(resolve) {
      var existing = document.getElementById("ruin-mini-site-data");
      var finish = function() {
        resolve(Array.isArray(window.sites) && window.sites.length ? window.sites : RUIN_MINI_FALLBACK_SITES);
      };

      if (existing) {
        existing.addEventListener("load", finish, { once: true });
        existing.addEventListener("error", finish, { once: true });
        window.setTimeout(finish, 1200);
        return;
      }

      var scriptEl = document.createElement("script");
      scriptEl.id = "ruin-mini-site-data";
      scriptEl.src = "https://ruin-archive.site/data/site-data.js?v=20261003";
      scriptEl.onload = finish;
      scriptEl.onerror = finish;
      document.head.appendChild(scriptEl);
    });

    return ruinMiniSitesPromise;
  }

  function ruinMiniGeoToSvg(lat, lng) {
    var shiftedLng = Number(lng) + 180;
    if (shiftedLng > 180) shiftedLng -= 360;
    var x = (shiftedLng + 180) / 360;
    var y = (Number(lat) + 90) / 180;
    return [y * 3000, x * 4000];
  }

  function ruinMiniEscape(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;");
  }

  function ruinMiniMembraneState(map, tone) {
    var zoom = map.getZoom();
    var ratio = ruinMiniClamp((zoom + 0.20) / 3.15, 0, 1);
    var warmT = Math.min(1, tone / RUIN_MINI_WARM_POINT);
    var nightT = tone <= RUIN_MINI_WARM_POINT ? 0 : Math.min(1, (tone - RUIN_MINI_WARM_POINT) / (100 - RUIN_MINI_WARM_POINT));

    var dynamicBlur = 0.40 + ratio * 2.3;
    var zoomContrast = 1.8 - ratio * 0.8;
    var dynamicContrast = zoomContrast * ruinMiniMix(1, 0.96, warmT) * ruinMiniMix(1, 0.91, nightT);
    var zoomBrightness = 1.02 + ratio * 0.7;
    var dynamicBrightness = zoomBrightness * ruinMiniMix(1, 0.92, warmT) * ruinMiniMix(1, 0.84, nightT);
    var warmSepia = ruinMiniMix(0.33, 0.50, warmT);
    var dynamicSepia = ruinMiniMix(warmSepia, 0.08, nightT);
    var nightInvert = ruinMiniMix(0, 0.88, nightT);
    var zoomInvert = ratio * 0.15;
    var dynamicInvert = nightInvert + ((1 - nightInvert) * zoomInvert);
    var opacity = (1 - ratio * 0.45) * ruinMiniMix(1, 0.94, warmT);

    return {
      filter: "blur(" + dynamicBlur.toFixed(3) + "px) contrast(" + dynamicContrast.toFixed(3) + ") brightness(" + dynamicBrightness.toFixed(3) + ") sepia(" + dynamicSepia.toFixed(3) + ") invert(" + dynamicInvert.toFixed(3) + ")",
      opacity: opacity,
      blend: nightT > 0.12 ? "normal" : ((ratio > 0 || tone > 3) ? "multiply" : "normal")
    };
  }

  function applyRuinMiniTone(shell, map, worldPane, value, persist) {
    var tone = ruinMiniClamp(value, 0, 100);
    var paper = ruinMiniInterpolateTone(tone, "paper");
    var bg = ruinMiniInterpolateTone(tone, "bg");
    var text = ruinMiniInterpolateTone(tone, "text");
    var muted = ruinMiniInterpolateTone(tone, "muted");
    var line = ruinMiniInterpolateTone(tone, "line");
    var lineStrong = ruinMiniInterpolateTone(tone, "lineStrong");
    var marker = ruinMiniInterpolateTone(tone, "marker");

    shell.dataset.tone = String(Math.round(tone));
    shell.style.setProperty("--ruin-mini-bg", ruinMiniRgb(bg));
    shell.style.setProperty("--ruin-mini-paper", ruinMiniRgb(paper));
    shell.style.setProperty("--ruin-mini-text", ruinMiniRgb(text));
    shell.style.setProperty("--ruin-mini-muted", ruinMiniRgb(muted));
    shell.style.setProperty("--ruin-mini-line", ruinMiniRgb(line));
    shell.style.setProperty("--ruin-mini-line-strong", ruinMiniRgb(lineStrong));
    var markerRgb = ruinMiniRgb(marker);
    shell.style.setProperty("--ruin-mini-marker", markerRgb);
    shell.style.setProperty(
      "--ruin-mini-marker-shadow",
      tone >= 60 ? "rgba(255,255,255,.16)" : "rgba(0,0,0,.25)"
    );

    /* Marker dots live in their own unfiltered Leaflet pane. Re-assert the
       resolved colour on every tone change as well: tiny 5–6px divIcons can
       otherwise be lost by mobile Safari during compositing changes. */
    shell.querySelectorAll(".ruin-mini-marker-icon .garden-dot, .ruin-mini-marker-icon .record-dot")
      .forEach(function(dot) {
        dot.style.setProperty("background-color", markerRgb, "important");
        dot.style.setProperty("opacity", "1", "important");
        dot.style.setProperty("filter", "none", "important");
        dot.style.setProperty("mix-blend-mode", "normal", "important");
      });

    if (map && map.getContainer()) map.getContainer().style.background = ruinMiniRgb(paper);
    if (map && worldPane) {
      var membrane = ruinMiniMembraneState(map, tone);
      worldPane.style.filter = membrane.filter;
      worldPane.style.opacity = String(membrane.opacity);
      worldPane.style.mixBlendMode = membrane.blend;
    }

    shell.querySelectorAll(".ruin-mini-tone-button").forEach(function(button) {
      var active = Number(button.dataset.tone) === Number(RUIN_MINI_TONE_STEPS.reduce(function(best, step) {
        return Math.abs(step - tone) < Math.abs(best - tone) ? step : best;
      }, RUIN_MINI_TONE_STEPS[0]));
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-checked", active ? "true" : "false");
    });

    if (persist) saveRuinMiniTone(tone);
  }

  function makeRuinMiniToneControl(L, shell, map, worldPane) {
    var labelsByTone = {
      0: "original",
      22: "soft eye-care",
      45: "eye-care",
      60: "dark",
      100: "night"
    };
    var ToneControl = L.Control.extend({
      options: { position: "topright" },
      onAdd: function() {
        var box = L.DomUtil.create("div", "ruin-mini-tone-control leaflet-bar");
        box.setAttribute("role", "radiogroup");
        box.setAttribute("aria-label", "reading environment");
        RUIN_MINI_TONE_STEPS.forEach(function(tone, index) {
          var button = document.createElement("button");
          button.type = "button";
          button.className = "ruin-mini-tone-button";
          button.dataset.tone = String(tone);
          button.setAttribute("role", "radio");
          button.setAttribute("aria-label", labelsByTone[tone]);
          button.title = labelsByTone[tone];
          button.innerHTML = '<span class="ruin-mini-eclipse ruin-mini-eclipse-' + index + '" aria-hidden="true"></span>';
          button.addEventListener("click", function(event) {
            event.preventDefault();
            event.stopPropagation();
            applyRuinMiniTone(shell, map, worldPane, tone, true);
          });
          box.appendChild(button);
        });
        L.DomEvent.disableClickPropagation(box);
        L.DomEvent.disableScrollPropagation(box);
        return box;
      }
    });
    new ToneControl().addTo(map);
  }

  function renderRuinMiniFractureFrame(shell) {
    var host = shell.querySelector(".ruin-mini-fracture-host");
    var mapEl = shell.querySelector(".ruin-mini-map");
    if (!host || !mapEl) return;
    host.innerHTML = "";

    var rect = mapEl.getBoundingClientRect();
    var shellRect = shell.getBoundingClientRect();
    var x0 = rect.left - shellRect.left;
    var y0 = rect.top - shellRect.top;
    var w = rect.width;
    var h = rect.height;
    if (w < 80 || h < 80) return;

    var svgNS = "http://www.w3.org/2000/svg";
    var svg = document.createElementNS(svgNS, "svg");
    svg.setAttribute("class", "ruin-mini-fracture-svg");
    svg.setAttribute("viewBox", "0 0 " + shellRect.width + " " + shellRect.height);

    function path(d, className, opacity) {
      var el = document.createElementNS(svgNS, "path");
      el.setAttribute("d", d);
      el.setAttribute("class", className || "ruin-mini-fracture-line");
      if (opacity != null) el.setAttribute("opacity", String(opacity));
      svg.appendChild(el);
      return el;
    }

    var rand = Math.random;
    var topSide = rand() < 0.5 ? "left" : "right";
    var topT = topSide === "left" ? 0.12 + rand() * 0.20 : 0.68 + rand() * 0.16;
    var topW = 24 + rand() * 28;
    var topD = 7 + rand() * 8;
    var tx = x0 + w * topT;
    var rightY = y0 + h * (0.58 + rand() * 0.24);
    var rightH = 32 + rand() * 34;
    var rightD = 7 + rand() * 8;
    var leftY = y0 + h * (0.30 + rand() * 0.28);
    var leftH = 18 + rand() * 22;
    var leftD = 3 + rand() * 5;

    var border = [
      "M", x0 + 0.5, y0 + 0.5,
      "L", tx - topW * 0.50, y0 + 0.5,
      "L", tx - topW * 0.18, y0 + topD * 0.30,
      "L", tx + topW * 0.04, y0 + topD,
      "L", tx + topW * 0.23, y0 + topD * 0.44,
      "L", tx + topW * 0.50, y0 + 0.5,
      "L", x0 + w - 0.5, y0 + 0.5,
      "L", x0 + w - 0.5, rightY - rightH * 0.50,
      "L", x0 + w - rightD * 0.35, rightY - rightH * 0.21,
      "L", x0 + w - rightD, rightY + rightH * 0.04,
      "L", x0 + w - rightD * 0.42, rightY + rightH * 0.24,
      "L", x0 + w - 0.5, rightY + rightH * 0.50,
      "L", x0 + w - 0.5, y0 + h - 0.5,
      "L", x0 + 0.5, y0 + h - 0.5,
      "L", x0 + 0.5, leftY + leftH * 0.50,
      "L", x0 + leftD * 0.35, leftY + leftH * 0.15,
      "L", x0 + leftD, leftY - leftH * 0.05,
      "L", x0 + leftD * 0.26, leftY - leftH * 0.30,
      "L", x0 + 0.5, leftY - leftH * 0.50,
      "Z"
    ].join(" ");
    path(border, "ruin-mini-fracture-border", 0.94);

    var topTipX = tx + topW * 0.04;
    var topTipY = y0 + topD;
    var topDir = topSide === "left" ? -1 : 1;
    path(
      "M " + topTipX + " " + topTipY +
      " C " + (topTipX + topDir * (18 + rand() * 12)) + " " + (topTipY + 12 + rand() * 7) +
      ", " + (topTipX + topDir * (32 + rand() * 18)) + " " + (topTipY + 25 + rand() * 10) +
      ", " + (topTipX + topDir * (50 + rand() * 24)) + " " + (topTipY + 43 + rand() * 15),
      "ruin-mini-fracture-crack", 0.84
    );
    path(
      "M " + (topTipX + topDir * 31) + " " + (topTipY + 26) +
      " Q " + (topTipX + topDir * 44) + " " + (topTipY + 18) +
      " " + (topTipX + topDir * 58) + " " + (topTipY + 22),
      "ruin-mini-fracture-branch", 0.62
    );

    var rightTipX = x0 + w - rightD;
    var rightTipY = rightY + rightH * 0.04;
    path(
      "M " + rightTipX + " " + rightTipY +
      " C " + (rightTipX - 18 - rand() * 12) + " " + (rightTipY + 7 + rand() * 9) +
      ", " + (rightTipX - 38 - rand() * 18) + " " + (rightTipY + 18 + rand() * 12) +
      ", " + (rightTipX - 66 - rand() * 28) + " " + (rightTipY + 42 + rand() * 20),
      "ruin-mini-fracture-crack", 0.78
    );
    path(
      "M " + (rightTipX - 37) + " " + (rightTipY + 19) +
      " Q " + (rightTipX - 44) + " " + (rightTipY + 38) +
      " " + (rightTipX - 61) + " " + (rightTipY + 49),
      "ruin-mini-fracture-branch", 0.58
    );

    host.appendChild(svg);

    // The map itself loses small edge bites, so the frame is truly broken rather
    // than a decorative crack merely drawn above a rectangular grey card.
    var topA = ((tx - topW * 0.50 - x0) / w * 100).toFixed(2);
    var topB = ((tx + topW * 0.50 - x0) / w * 100).toFixed(2);
    var topMid = ((tx - x0) / w * 100).toFixed(2);
    var rightA = ((rightY - rightH * 0.50 - y0) / h * 100).toFixed(2);
    var rightB = ((rightY + rightH * 0.50 - y0) / h * 100).toFixed(2);
    var rightMid = ((rightY - y0) / h * 100).toFixed(2);
    mapEl.style.clipPath = "polygon(0 0, " + topA + "% 0, " + topMid + "% 1.35%, " + topB + "% 0, 100% 0, 100% " + rightA + "%, 98.7% " + rightMid + "%, 100% " + rightB + "%, 100% 100%, 0 100%)";
  }

  function destroyRuinAtlasMiniMap() {
    ruinMiniMountToken += 1;
    if (ruinMiniParallaxCleanup) {
      ruinMiniParallaxCleanup();
      ruinMiniParallaxCleanup = null;
    }
    if (ruinMiniIndexFilterCleanup) {
      ruinMiniIndexFilterCleanup();
      ruinMiniIndexFilterCleanup = null;
    }
    if (ruinMiniMapInstance) {
      try { ruinMiniMapInstance.remove(); } catch (_) {}
      ruinMiniMapInstance = null;
    }
  }

  function mountRuinAtlasMiniMap(item) {
    if (!item || item.slug !== "ruin-atlas") {
      destroyRuinAtlasMiniMap();
      return;
    }

    var container = document.getElementById("ruin-mini-map");
    var shell = document.querySelector(".ruin-mini-shell");
    if (!container || !shell || container.dataset.mounted === "true") return;
    container.dataset.mounted = "true";
    var token = ++ruinMiniMountToken;

    Promise.all([ensureRuinMiniLeaflet(), ensureRuinMiniSites()]).then(function(results) {
      if (token !== ruinMiniMountToken || !container.isConnected || !shell.isConnected) return;
      var L = results[0];
      var sites = Array.isArray(results[1]) && results[1].length ? results[1] : RUIN_MINI_FALLBACK_SITES;
      if (!L || !L.map) return;

      if (ruinMiniMapInstance) {
        try { ruinMiniMapInstance.remove(); } catch (_) {}
      }

      var map = L.map(container, {
        crs: L.CRS.Simple,
        minZoom: -2.2,
        maxZoom: 3,
        zoomControl: false,
        attributionControl: false,
        zoomSnap: 0.25,
        zoomDelta: 0.5,
        wheelPxPerZoomLevel: 90,
        scrollWheelZoom: false,
        inertia: true,
        maxBoundsViscosity: 0.54
      });
      ruinMiniMapInstance = map;

      var bounds = [[0, 0], [3000, 4000]];
      map.createPane("ruinMiniWorldPane");
      var worldPane = map.getPane("ruinMiniWorldPane");
      worldPane.style.zIndex = "210";
      worldPane.style.pointerEvents = "none";

      /* Markers intentionally stay on Leaflet's native markerPane, exactly as
         on ruin-archive.site. The atlas SVG alone lives in the filtered world
         pane, so marker coordinates and transforms remain Leaflet-native. */
      L.imageOverlay(
        "https://ruin-archive.site/assets/ruin-map.svg?v=20261003",
        bounds,
        { pane: "ruinMiniWorldPane", interactive: false }
      ).addTo(map);

      var miniMarkerEntries = [];

      sites.forEach(function(site) {
        if (!site || !Number.isFinite(Number(site.lat)) || !Number.isFinite(Number(site.lng))) return;

        var isGarden = site.type === "garden";
        var size = isGarden ? 10 : 6;
        var dotClass = isGarden ? "garden-dot" : "record-dot";
        var icon = L.divIcon({
          className: "ruin-mini-marker-icon ruin-marker" + (isGarden ? "" : " ruin-marker-record"),
          html: '<span class="' + dotClass + '"></span>',
          iconSize: [size, size],
          iconAnchor: [size / 2, size / 2]
        });

        var marker = L.marker(
          ruinMiniGeoToSvg(site.lat, site.lng),
          {
            icon: icon,
            keyboard: false
          }
        ).addTo(map);

        marker.bindTooltip(
          '<span class="ruin-mini-tooltip-name">' + ruinMiniEscape(site.name) + '</span>' +
          (site.archiveDate ? '<span class="ruin-mini-tooltip-date">' + ruinMiniEscape(site.archiveDate) + '</span>' : ''),
          { direction: "top", offset: [0, -7], opacity: 1, className: "ruin-mini-tooltip" }
        );

        var tags = String(
          window.siteTagsMapping && window.siteTagsMapping[site.name] || ""
        ).split(",").map(function(tag) { return tag.trim(); }).filter(Boolean);

        miniMarkerEntries.push({ marker: marker, site: site, tags: tags });
      });

      function applyMiniIndexFilter(event) {
        var activeTags = Array.isArray(event && event.detail && event.detail.tags)
          ? event.detail.tags.map(String).map(function(tag) { return tag.trim(); }).filter(Boolean)
          : [];

        miniMarkerEntries.forEach(function(entry) {
          var visible = activeTags.length === 0 ||
            activeTags.every(function(tag) { return entry.tags.indexOf(tag) !== -1; });

          entry.marker.setOpacity(visible ? 1 : 0);
          var markerEl = entry.marker.getElement();
          if (markerEl) {
            markerEl.style.display = visible ? "" : "none";
            markerEl.style.pointerEvents = visible ? "" : "none";
          }
        });
      }

      shell.addEventListener("ruin-mini-index-filter", applyMiniIndexFilter);
      ruinMiniIndexFilterCleanup = function() {
        shell.removeEventListener("ruin-mini-index-filter", applyMiniIndexFilter);
      };

      /* Mirror ruin-archive.site exactly: once zoom passes 0, all markers
         progressively fade as the view magnifies, reaching 30% opacity at
         maxZoom 3. This is applied to Leaflet's native markerPane so every
         marker fades together without changing its individual position or
         index-filter state. */
      var markerOpacityRaf = 0;

      function updateRuinMiniMarkerOpacity() {
        if (markerOpacityRaf) return;

        markerOpacityRaf = requestAnimationFrame(function() {
          markerOpacityRaf = 0;
          if (!shell.isConnected || token !== ruinMiniMountToken) return;

          var currentZoom = map.getZoom();
          var triggerZoom = 0;
          var maxZoom = 3;
          var targetOpacity = 1;

          if (currentZoom > triggerZoom) {
            var ratio = (currentZoom - triggerZoom) / (maxZoom - triggerZoom);
            targetOpacity = 1 - (ratio * 0.7);
          }

          targetOpacity = Math.max(0.3, targetOpacity);

          var markerPane = map.getPane("markerPane");
          if (markerPane) {
            var nextOpacity = String(targetOpacity);
            if (markerPane.style.opacity !== nextOpacity) {
              markerPane.style.opacity = nextOpacity;
            }
          }
        });
      }

      map.on("zoom", updateRuinMiniMarkerOpacity);
      updateRuinMiniMarkerOpacity();

      var initialTone = readRuinMiniTone();
      makeRuinMiniToneControl(L, shell, map, worldPane);
      applyRuinMiniTone(shell, map, worldPane, initialTone, false);

      map.on("zoomend", function() {
        applyRuinMiniTone(shell, map, worldPane, Number(shell.dataset.tone || initialTone), false);
      });
      map.on("movestart", function() { shell.classList.add("is-navigating"); });
      map.on("moveend", function() { shell.classList.remove("is-navigating"); });

      map.fitBounds(bounds, { padding: [20, 20], animate: false });
      map.setMaxBounds([[-520, -800], [3520, 4800]]);
      applyRuinMiniTone(shell, map, worldPane, initialTone, false);

      if (ruinMiniParallaxCleanup) {
        ruinMiniParallaxCleanup();
        ruinMiniParallaxCleanup = null;
      }

      var roomScroll = shell.closest(".room-scroll");
      var parallaxRaf = 0;
      var parallaxApplied = 0;
      var startupFlyActive = false;
      var reducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      function applyRuinMiniParallax() {
        parallaxRaf = 0;
        if (!roomScroll || !shell.isConnected || token !== ruinMiniMountToken || startupFlyActive) return;

        var shellRect = shell.getBoundingClientRect();
        var scrollRect = roomScroll.getBoundingClientRect();
        var contentCenter = shellRect.top - scrollRect.top + roomScroll.scrollTop + shellRect.height * 0.5;
        var centerScroll = contentCenter - roomScroll.clientHeight * 0.5;

        /* The map behaves like a distant landscape behind the moving frame.
           This is deliberately stronger than the earlier pass so the reverse
           drift remains legible even after the miniature itself is reduced. */
        var target = ruinMiniClamp((roomScroll.scrollTop - centerScroll) * 0.22, -155, 155);
        var delta = target - parallaxApplied;

        if (Math.abs(delta) > 0.02) {
          map.panBy([0, -delta], { animate: false });
          parallaxApplied = target;
        }
      }

      function scheduleRuinMiniParallax() {
        if (parallaxRaf) return;
        parallaxRaf = requestAnimationFrame(applyRuinMiniParallax);
      }

      if (roomScroll && !reducedMotion) {
        roomScroll.addEventListener("scroll", scheduleRuinMiniParallax, { passive: true });
        ruinMiniParallaxCleanup = function() {
          roomScroll.removeEventListener("scroll", scheduleRuinMiniParallax);
          if (parallaxRaf) cancelAnimationFrame(parallaxRaf);
          parallaxRaf = 0;
        };
      }

      /* Port the authored startup movement from ruin-archive.site:
         fit the complete 4000×3000 atlas first, then fly 377 units upward and
         410 units left, adding only +0.65 zoom on desktop (+0.35 compact)
         over five seconds. This replaces the previous static +2 zoom. */
      var startupCenter = map.getCenter();
      var startupZoomDelta = window.innerWidth <= 760 ? 0.35 : 0.65;
      var startupTarget = [
        startupCenter.lat + 377,
        startupCenter.lng - 410
      ];
      var startupTargetZoom = Math.min(map.getMaxZoom(), map.getZoom() + startupZoomDelta);

      if (reducedMotion) {
        map.setView(startupTarget, startupTargetZoom, { animate: false });
      } else {
        startupFlyActive = true;
        var startupFlyFinished = false;

        function finishStartupFly() {
          if (startupFlyFinished) return;
          startupFlyFinished = true;
          startupFlyActive = false;
          try { map.off("moveend", finishStartupFly); } catch (_) {}
          parallaxApplied = 0;
          requestAnimationFrame(applyRuinMiniParallax);
        }

        map.on("moveend", finishStartupFly);
        requestAnimationFrame(function() {
          if (!shell.isConnected || token !== ruinMiniMountToken) return;
          map.flyTo(startupTarget, startupTargetZoom, {
            animate: true,
            duration: 5
          });
        });
        window.setTimeout(finishStartupFly, 5400);
      }

      if (roomScroll && !reducedMotion) {
        requestAnimationFrame(function() {
          if (!startupFlyActive) applyRuinMiniParallax();
        });
      }

      requestAnimationFrame(function() {
        if (!container.isConnected) return;
        map.invalidateSize(false);
        renderRuinMiniFractureFrame(shell);
      });

      var resizeTimer = 0;
      var onResize = function() {
        window.clearTimeout(resizeTimer);
        resizeTimer = window.setTimeout(function() {
          if (!shell.isConnected || token !== ruinMiniMountToken) {
            window.removeEventListener("resize", onResize);
            return;
          }
          map.invalidateSize(false);
          renderRuinMiniFractureFrame(shell);
        }, 100);
      };
      window.addEventListener("resize", onResize, { passive: true });
    }).catch(function() {
      container.dataset.mounted = "error";
      container.innerHTML = '<p class="ruin-mini-load-error">map temporarily unavailable</p>';
      renderRuinMiniFractureFrame(shell);
    });
  }



  /* ==========================================================================
     Mini Ruin Archive · archive-doc subsystem
     --------------------------------------------------------------------------
     This is a scoped, scaled port of the uploaded ruin-archive archive-doc
     system: real document elements, the 23-sheet sliding record fan, compressed
     top/bottom records, the right Folly stack, sparse paper misregistration,
     clipped/cut sheet contours, extraction, and smooth retraction.
     ========================================================================== */
  var ruinMiniArchiveCleanup = null;
  var ruinMiniArchiveMountToken = 0;

  var RUIN_MINI_ARCHIVE_COMBINED_GROUPS = [
    { id: "monastic-retreat-pair", memberNames: ["山融灶垣", "崖隐蚀垣"] },
    { id: "fukushima-solastalgia-pair", memberNames: ["隐染悬里", "雾蚀空庐"] }
  ];

  var RUIN_MINI_ARCHIVE_THUMBNAILS = {
    "瘟猪坝沉墟": "effluent-sedimentation.webp",
    "电台路焦土": "aether-scorched-earth.webp",
    "山葬灰脉": "yellow-mountain.webp",
    "硅脉遗厂": "silicon-vein-works.webp",
    "琉棘庭": "walled-gallery.webp",
    "裂翼坪": "fallen-wing-field.webp",
    "轨畔孤构": "rail-side.webp",
    "残柱林": "concrete-pole.webp",
    "钟寂残堂": "bell-silent-church.webp",
    "池骸湾": "bath-crack.webp",
    "毒烬轮冢": "toxic-tire-pyre.webp",
    "褶层湾": "quarry-bay-stairway.webp",
    "隐染悬里": "suspended-homeland.webp",
    "雾蚀空庐": "mist-eroded-hut.webp",
    "锈祷圣堂": "rust-prayer-sanctuary.webp",
    "釉骸拓壁": "membrane.webp",
    "叠骸构阵": "fish-mouth.webp",
    "苔网塬": "gloss-veil.webp",
    "陆坞舰骸": "brick-battleship.webp",
    "墟响厅": "mirror.webp",
    "波蚀脊堤": "wave-eroded-structure.webp",
    "曜原驿": "solar.webp",
    "溶境遗廊": "aquarium-bunker.webp",
    "荒娱敖包": "mountain-signal.webp",
    "彩壳堡": "castle.webp",
    "削岩残居": "roof.webp",
    "隐阶空墅": "hidden-stair-villa.webp",
    "暮辉骸殿": "afterglow-palace.webp",
    "迁痕空埠": "dock.webp",
    "山骸窟殿": "phospho.webp",
    "山融灶垣": "earthwall.webp",
    "崖隐蚀垣": "cliff-granary.webp",
    "褶脊胚庭": "compressed-courtyard.webp",
    "草间稚居": "grass-child-dwelling.webp"
  };

  function ruinMiniArchiveBuildRecordEntries(recordSites) {
    var byName = new Map(recordSites.map(function(site) { return [site.name, site]; }));
    var grouped = new Set();
    var groupByName = new Map();

    RUIN_MINI_ARCHIVE_COMBINED_GROUPS.forEach(function(group) {
      group.memberNames.forEach(function(name) { groupByName.set(name, group); });
    });

    var entries = [];
    recordSites.forEach(function(site) {
      if (!site || grouped.has(site.name)) return;
      var group = groupByName.get(site.name);
      if (group) {
        var members = group.memberNames.map(function(name) { return byName.get(name); }).filter(Boolean);
        if (members.length > 1) {
          entries.push({ isGroup: true, group: group, sites: members });
          members.forEach(function(member) { grouped.add(member.name); });
          return;
        }
      }
      entries.push({ isGroup: false, group: null, sites: [site] });
      grouped.add(site.name);
    });
    return entries;
  }

  function ruinMiniArchiveSparseJitter(total, magnitudes, probability) {
    var values = Array(total).fill(0);
    if (!total) return values;
    var target = Math.min(total, Math.max(1, Math.round(total * probability)));
    var pool = Array.from({ length: total }, function(_, i) { return i; });
    for (var i = pool.length - 1; i > 0; i -= 1) {
      var j = Math.floor(Math.random() * (i + 1));
      var held = pool[i]; pool[i] = pool[j]; pool[j] = held;
    }

    var chosen = [];
    pool.forEach(function(index) {
      if (chosen.length >= target) return;
      if (chosen.some(function(other) { return Math.abs(other - index) <= 1; })) return;
      chosen.push(index);
    });
    pool.forEach(function(index) {
      if (chosen.length < target && chosen.indexOf(index) === -1) chosen.push(index);
    });

    chosen.forEach(function(index, order) {
      var mag = magnitudes[(order + Math.floor(Math.random() * magnitudes.length)) % magnitudes.length];
      var sign = Math.random() < 0.58 ? -1 : 1;
      values[index] = Number((sign * mag).toFixed(1));
    });
    return values;
  }

  function ruinMiniArchiveDms(value, positive, negative) {
    var n = Number(value) || 0;
    var abs = Math.abs(n);
    var deg = Math.floor(abs);
    var minutesFloat = (abs - deg) * 60;
    var min = Math.floor(minutesFloat);
    var sec = ((minutesFloat - min) * 60).toFixed(1);
    return deg + "°" + String(min).padStart(2, "0") + "′" + String(sec).padStart(4, "0") + "″" + (n >= 0 ? positive : negative);
  }

  function ruinMiniArchiveCoord(site) {
    return ruinMiniArchiveDms(site.lat, "N", "S") + " " + ruinMiniArchiveDms(site.lng, "E", "W");
  }

  function ruinMiniArchiveCopy() {
    var lang = state.lang;
    if (lang === "en") {
      return { record: "Record", garden: "Folly", archive: "archive", recorder: "Recorder", creator: "Ruinwright", nav: "OPEN ORIGINAL ⌖" };
    }
    if (lang === "ja") {
      return { record: "遺構録", garden: "フォリー", archive: "記録", recorder: "記録者", creator: "墟構師", nav: "原版を開く ⌖" };
    }
    return { record: "遗构录", garden: "废墟园林", archive: "归档", recorder: "记录者", creator: "墟构师", nav: "打开原站 ⌖" };
  }

  function destroyRuinArchiveMiniSystem() {
    ruinMiniArchiveMountToken += 1;
    if (typeof ruinMiniArchiveCleanup === "function") {
      try { ruinMiniArchiveCleanup(); } catch (_) {}
    }
    ruinMiniArchiveCleanup = null;
  }

  function mountRuinArchiveMiniSystem(item) {
    if (!item || item.slug !== "ruin-atlas") {
      destroyRuinArchiveMiniSystem();
      return;
    }

    var system = document.getElementById("ruin-mini-archive-system");
    var recordStack = document.getElementById("ruin-mini-stack-record");
    var gardenStack = document.getElementById("ruin-mini-stack-garden");
    var indexDrawer = document.getElementById("ruin-mini-index-drawer");
    if (!system || !recordStack || !gardenStack || !indexDrawer || system.dataset.mounted === "true") return;

    destroyRuinArchiveMiniSystem();
    system.dataset.mounted = "true";
    var token = ++ruinMiniArchiveMountToken;

    ensureRuinMiniSites().then(function(loadedSites) {
      if (token !== ruinMiniArchiveMountToken || !system.isConnected) return;

      var sites = Array.isArray(loadedSites) && loadedSites.length ? loadedSites : RUIN_MINI_FALLBACK_SITES;
      var allGarden = sites.filter(function(site) { return site && site.type === "garden"; });
      var allRecordEntries = ruinMiniArchiveBuildRecordEntries(
        sites.filter(function(site) { return site && site.type !== "garden"; })
      );

      function sampleEvenly(list, count, repeat) {
        if (!list.length) return [];
        if (list.length >= count) {
          if (count === 1) return [list[0]];
          return Array.from({ length: count }, function(_, i) {
            var idx = Math.round(i * (list.length - 1) / (count - 1));
            return list[idx];
          });
        }
        if (!repeat) return list.slice();
        return Array.from({ length: count }, function(_, i) { return list[i % list.length]; });
      }

      // Exactly the reduced visual population requested for this portfolio miniature.
      var recordEntries = sampleEvenly(allRecordEntries, 9, false);
      var gardenSites = sampleEvenly(allGarden, 5, true);

      var scale = 1;
      var selectedTags = new Set();
      var cleanupTimers = [];
      var fractureIteration = (Date.now() ^ Math.floor(Math.random() * 0x7fffffff)) >>> 0;
      var archiveDamagePlan = { record: new Map(), garden: new Map() };

      function currentScale() {
        return Math.max(0.26, Math.min(0.84, system.clientHeight / 900));
      }

      function setGeometryVariables() {
        scale = currentScale();
        var systemWidth = Math.max(1, system.clientWidth);
        var leftRailWidth = systemWidth * 0.195;
        var rightRailWidth = systemWidth * 0.115;

        system.style.setProperty("--mini-archive-scale", scale.toFixed(4));
        system.style.setProperty("--mini-record-doc-w", Math.max(42, leftRailWidth * 0.96).toFixed(2) + "px");
        system.style.setProperty("--mini-garden-doc-w", Math.max(36, rightRailWidth * 0.97).toFixed(2) + "px");
        system.style.setProperty("--mini-record-doc-h", (640 * scale).toFixed(2) + "px");
        system.style.setProperty("--mini-garden-doc-h", (505 * scale).toFixed(2) + "px");
        system.style.setProperty("--mini-record-stack-w", leftRailWidth.toFixed(2) + "px");
        system.style.setProperty("--mini-garden-stack-w", rightRailWidth.toFixed(2) + "px");
        system.style.setProperty("--mini-record-left", "0px");
        system.style.setProperty("--mini-garden-right", "0px");
        system.style.setProperty("--mini-garden-bottom", (355 * scale).toFixed(2) + "px");
        system.style.setProperty("--mini-record-extract-x", (190 * scale).toFixed(2) + "px");
        system.style.setProperty("--mini-garden-extract-x", (-205 * scale).toFixed(2) + "px");
        system.style.setProperty("--mini-garden-extract-top", (-255 * scale).toFixed(2) + "px");
        system.style.setProperty("--mini-record-extract-top", (300 * scale).toFixed(2) + "px");
      }

      function tagsForSites(entrySites) {
        var tags = new Set();
        entrySites.forEach(function(site) {
          String(window.siteTagsMapping && window.siteTagsMapping[site.name] || "")
            .split(",")
            .map(function(tag) { return tag.trim(); })
            .filter(Boolean)
            .forEach(function(tag) { tags.add(tag); });
        });
        return Array.from(tags);
      }

      function makeDoc(entry, visualIndex, isGarden) {
        var entrySites = isGarden ? [entry] : entry.sites;
        var doc = document.createElement("div");
        doc.className = "ruin-mini-archive-doc archive-doc archive-cut-doc" + (isGarden ? " garden-archive-doc" : "");
        doc.dataset.isGarden = isGarden ? "1" : "0";
        doc.dataset.visualIndex = String(visualIndex);
        doc.dataset.tags = tagsForSites(entrySites).join(",");
        doc.setAttribute("aria-hidden", "true");
        return doc;
      }

      function seededRandom(seed) {
        var x = seed >>> 0;
        return function() {
          x += 0x6D2B79F5;
          var t = x;
          t = Math.imul(t ^ (t >>> 15), t | 1);
          t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
          return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
      }


      function syncMiniSourceStoneMask(geom) {
        if (!geom || !Array.isArray(geom.cells) || !geom.cells.length || !indexDrawer.isConnected) return;

        var drawerRect=indexDrawer.getBoundingClientRect();
        if(drawerRect.width<20||drawerRect.height<20) return;
        if(Math.abs((Number(geom.width)||0)-drawerRect.width)>4) return;

        var polygons=geom.cells.map(function(cell){
          var pts=(cell.points||[]).map(function(p){
            return Number(p.x).toFixed(2)+","+Number(p.y).toFixed(2);
          }).join(" ");
          return '<polygon points="'+pts+'" fill="white"/>';
        }).join("");

        var svg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 '+
          Number(geom.width).toFixed(2)+' '+Number(geom.height).toFixed(2)+
          '" preserveAspectRatio="none">'+polygons+'</svg>';
        var maskUrl='url("data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg)+'")';
        indexDrawer.style.setProperty("--mini-index-stone-mask",maskUrl);

        function applySharedMask(el){
          if(!el) return;
          var rect=el.getBoundingClientRect();
          if(rect.width<2||rect.height<2) return;
          var x=rect.left-drawerRect.left;
          var y=rect.top-drawerRect.top;
          el.style.setProperty("-webkit-mask-image",maskUrl);
          el.style.setProperty("mask-image",maskUrl);
          el.style.setProperty("-webkit-mask-size",Number(geom.width).toFixed(2)+"px "+Number(geom.height).toFixed(2)+"px");
          el.style.setProperty("mask-size",Number(geom.width).toFixed(2)+"px "+Number(geom.height).toFixed(2)+"px");
          el.style.setProperty("-webkit-mask-position",(-x).toFixed(2)+"px "+(-y).toFixed(2)+"px");
          el.style.setProperty("mask-position",(-x).toFixed(2)+"px "+(-y).toFixed(2)+"px");
          el.style.setProperty("-webkit-mask-repeat","no-repeat");
          el.style.setProperty("mask-repeat","no-repeat");
        }

        applySharedMask(indexDrawer.querySelector(".ruin-mini-stele-copy"));
      }

      var onMiniStoneGeometry=function(event){
        syncMiniSourceStoneMask(event&&event.detail ? event.detail : window.__indexStoneFragmentGeometry);
      };
      window.addEventListener("index-stone-geometry-ready",onMiniStoneGeometry);

      function syncMiniIndexDrawerBaseline() {
        var shellHeight = system.clientHeight || 0;
        if (!shellHeight) return;
        var exactHandleH = shellHeight * (95 / 820);
        indexDrawer.style.setProperty("--mini-index-handle-h",exactHandleH.toFixed(2)+"px");
      }

      function renderMiniIndexStone() {
        syncMiniIndexDrawerBaseline();
        if(typeof window.installRuinMiniStoneFragments==="function"){
          window.installRuinMiniStoneFragments();
        }
        if(typeof window.ensureIndexStoneFragmentsReady==="function"){
          window.ensureIndexStoneFragmentsReady();
        }
        if(window.__indexStoneFragmentGeometry){
          syncMiniSourceStoneMask(window.__indexStoneFragmentGeometry);
        }
      }

      function rebuildArchiveDamagePlan() {
        archiveDamagePlan = { record: new Map(), garden: new Map() };

        function put(map,index,damage){
          if(index < 0) return;
          map.set(index,damage);
        }

        function cluster(count,isRecord){
          if(count <= 0) return;
          var rand = seededRandom(hashString(
            "mini-archive-cluster-v1:" + fractureIteration + ":" + (isRecord ? "record" : "garden")
          ));
          var map = isRecord ? archiveDamagePlan.record : archiveDamagePlan.garden;
          var indices;
          if(count >= 3){
            var center = 1 + Math.floor(rand() * (count - 2));
            indices = [center-1,center,center+1];
          } else {
            indices = Array.from({length:count},function(_,i){return i;});
          }

          // Port the source bias: left/record stack breaks mostly on its right
          // edge; garden is more evenly distributed across top/left/right.
          var roll=rand();
          var side=isRecord
            ? (roll<.20 ? "top" : (roll<.32 ? "left" : "right"))
            : (roll<.36 ? "top" : (roll<.68 ? "left" : "right"));
          var sharedT=isRecord ? .20+rand()*.30 : .24+rand()*.52;
          var baseWidth=side==="top" ? 14+rand()*10 : 15+rand()*12;
          var baseDepth=side==="top" ? 3.2+rand()*2.0 : 2.8+rand()*1.8;
          var scales=indices.length===3 ? [.66,1,.72] : indices.length===2 ? [1,.72] : [1];

          indices.forEach(function(index,i){
            var sc=scales[i]||.72;
            put(map,index,{
              side:side,
              t:Math.max(.14,Math.min(.84,sharedT+(rand()-.5)*.045)),
              width:baseWidth*(.84+sc*.36),
              depth:baseDepth*(.76+sc*.34)
            });
          });

          // One or two isolated shallow chips keep the stack from becoming a
          // perfectly repeated triplet, matching the source wear system.
          var extras = count >= 7 ? 2 : 1;
          for(var e=0;e<extras;e++){
            if(rand()>.62) continue;
            var idx=Math.floor(rand()*count);
            if(map.has(idx)) continue;
            var sideRoll=rand();
            var extraSide=sideRoll<.34?"top":(sideRoll<.67?"left":"right");
            put(map,idx,{
              side:extraSide,
              t:.18+rand()*.64,
              width:8+rand()*10,
              depth:1.8+rand()*2.1
            });
          }
        }

        cluster(recordStack.querySelectorAll(".ruin-mini-archive-doc").length,true);
        cluster(gardenStack.querySelectorAll(".ruin-mini-archive-doc").length,false);
      }

      function applyCut(doc, index, isGarden) {
        if (!doc || !doc.isConnected) return;
        var rect = doc.getBoundingClientRect();
        if (rect.width < 8 || rect.height < 8) return;

        var w=rect.width,h=rect.height;
        var seedLabel=(isGarden?"mini-garden-":"mini-record-")+index+"-cut-v3:"+fractureIteration;
        var rand=seededRandom(hashString(seedLabel));

        // Smaller corner chamfers than the previous pass.
        var tl=(3.5+rand()*7.0)*scale;
        var tr=(3.0+rand()*7.5)*scale;
        var br=(rand()<.28 ? 2.5+rand()*5.5 : 0)*scale;
        var bl=(rand()<.24 ? 2.5+rand()*5.0 : 0)*scale;
        tl=Math.min(tl,w*.13,h*.075);
        tr=Math.min(tr,w*.13,h*.075);
        br=Math.min(br,w*.10,h*.060);
        bl=Math.min(bl,w*.10,h*.060);

        var damage=(isGarden?archiveDamagePlan.garden:archiveDamagePlan.record).get(index)||null;

        function point(x,y){ return [x,y]; }
        function edgeWithChip(a,b,side){
          if(!damage||damage.side!==side) return [a,b];
          var dx=b[0]-a[0],dy=b[1]-a[1],len=Math.hypot(dx,dy)||1;
          var t=Math.max(.10,Math.min(.90,damage.t));
          var half=Math.min(.16,Math.max(.025,(damage.width*scale*.5)/len));
          var t0=Math.max(.02,t-half),t1=Math.min(.98,t+half);
          var n;
          if(side==="top") n=[0,1];
          else if(side==="right") n=[-1,0];
          else n=[1,0];
          var depth=Math.min((damage.depth*scale),side==="top"?h*.055:w*.09);
          var asym=.78+rand()*.42;
          var samples=[
            [0,0],
            [.20,.18*asym],
            [.42,.62],
            [.54,1],
            [.70,.54/asym],
            [1,0]
          ];
          var out=[a];
          samples.forEach(function(sample){
            var et=t0+(t1-t0)*sample[0];
            out.push([
              a[0]+dx*et+n[0]*depth*sample[1],
              a[1]+dy*et+n[1]*depth*sample[1]
            ]);
          });
          out.push(b);
          return out;
        }

        var tlTop=point(tl,0);
        var trTop=point(w-tr,0);
        var trRight=point(w,tr);
        var brRight=point(w,h-br);
        var brBottom=point(w-br,h);
        var blBottom=point(bl,h);
        var blLeft=point(0,h-bl);
        var tlLeft=point(0,tl);

        var top=edgeWithChip(tlTop,trTop,"top");
        var right=edgeWithChip(trRight,brRight,"right");
        var left=edgeWithChip(blLeft,tlLeft,"left");

        var points=[];
        points=points.concat(top);
        points.push(trRight);
        points=points.concat(right.slice(1));
        points.push(brBottom,blBottom,blLeft);
        points=points.concat(left.slice(1));

        // Deduplicate adjacent points generated at edge junctions.
        points=points.filter(function(p,i,arr){
          if(i===0) return true;
          var q=arr[i-1];
          return Math.hypot(p[0]-q[0],p[1]-q[1])>.12;
        });

        var polygon=points.map(function(p){
          return p[0].toFixed(2)+"px "+p[1].toFixed(2)+"px";
        }).join(", ");
        var clip="polygon("+polygon+")";
        doc.style.clipPath=clip;
        doc.style.webkitClipPath=clip;
        doc.style.setProperty("--archive-doc-shape-clip",clip);

        doc.querySelectorAll(":scope > .ruin-mini-archive-cut-outline").forEach(function(node){node.remove();});

        var NS="http://www.w3.org/2000/svg";
        var svg=document.createElementNS(NS,"svg");
        svg.setAttribute("class","ruin-mini-archive-cut-outline");
        svg.setAttribute("viewBox","0 0 "+w+" "+h);
        svg.setAttribute("preserveAspectRatio","none");

        var path=document.createElementNS(NS,"path");
        path.setAttribute("d",points.map(function(p,pointIndex){
          return (pointIndex?"L":"M")+p[0].toFixed(2)+" "+p[1].toFixed(2);
        }).join(" ")+" Z");
        svg.appendChild(path);

        // A short interior continuation grows from some chips. It is subtle:
        // the source system treats the missing edge as primary and the hairline
        // continuation as secondary.
        if(damage&&rand()<.58){
          var crack=document.createElementNS(NS,"path");
          var side=damage.side;
          var startX,startY,angle,length;
          if(side==="top"){
            startX=w*damage.t;
            startY=Math.min(h*.08,damage.depth*scale);
            angle=(.34+rand()*.30)*Math.PI;
          }else if(side==="right"){
            startX=w-Math.min(w*.09,damage.depth*scale);
            startY=h*damage.t;
            angle=(.72+rand()*.18)*Math.PI;
          }else{
            startX=Math.min(w*.09,damage.depth*scale);
            startY=h*(1-damage.t);
            angle=(-.18-rand()*.18)*Math.PI;
          }
          length=(6+rand()*14)*scale;
          var midX=startX+Math.cos(angle)*length*.52+(rand()-.5)*2*scale;
          var midY=startY+Math.sin(angle)*length*.52+(rand()-.5)*2*scale;
          var endX=startX+Math.cos(angle)*length;
          var endY=startY+Math.sin(angle)*length;
          crack.setAttribute("d","M"+startX.toFixed(2)+" "+startY.toFixed(2)+
            " Q"+midX.toFixed(2)+" "+midY.toFixed(2)+" "+endX.toFixed(2)+" "+endY.toFixed(2));
          crack.setAttribute("class","ruin-mini-archive-hairline-crack");
          svg.appendChild(crack);
        }

        doc.insertBefore(svg,doc.firstChild);
      }

      function layoutStacks() {
        if (!system.isConnected) return;
        setGeometryVariables();

        var recordDocs = Array.from(recordStack.querySelectorAll(".ruin-mini-archive-doc"));
        var recordBaseTop = 455;
        var recordGapY = 35;
        var recordGapX = 3.2;

        recordDocs.forEach(function(doc, index) {
          var rank = (recordDocs.length - 1) - index;
          var x = -rank * recordGapX * scale;
          var y = (recordBaseTop + rank * recordGapY) * scale;
          var jitterX = (((index * 17) % 5) - 2) * 0.72 * scale;
          var jitterY = (((index * 11) % 5) - 2) * 0.62 * scale;
          doc.style.setProperty("--stack-x", (x + jitterX).toFixed(2) + "px");
          doc.style.setProperty("--stack-y", (y + jitterY).toFixed(2) + "px");
          doc.style.zIndex = String(130 + rank);
          doc.dataset.zIndex = String(130 + rank);
          applyCut(doc,index,false);
        });

        var gardenDocs = Array.from(gardenStack.querySelectorAll(".ruin-mini-archive-doc"));
        gardenDocs.forEach(function(doc, index) {
          var rank = (gardenDocs.length - 1) - index;
          var top = rank * 43 * scale;
          var right = -rank * 2.6 * scale;
          var jitterX = (((index * 13) % 5) - 2) * 0.78 * scale;
          var jitterY = (((index * 7) % 5) - 2) * 0.64 * scale;
          doc.style.top = (top + jitterY).toFixed(2) + "px";
          doc.style.right = (right + jitterX).toFixed(2) + "px";
          doc.style.zIndex = String(150 + rank);
          doc.dataset.zIndex = String(150 + rank);
          applyCut(doc,index,true);
        });
      }

      function retractDoc(doc) {
        if (!doc || !doc.classList.contains("extracted") || doc.classList.contains("retracting")) return;
        var isRecord = !!doc.closest("#ruin-mini-stack-record");
        if (!isRecord) {
          doc.classList.remove("extracted");
          doc.style.zIndex = doc.dataset.zIndex || "";
          return;
        }
        doc.classList.add("retracting");
        var done = false;
        var finish = function() {
          if (done) return;
          done = true;
          doc.classList.remove("retracting","extracted");
          doc.style.zIndex = doc.dataset.zIndex || "";
        };
        var onEnd = function(event) {
          if (event.target !== doc || (event.propertyName !== "transform" && event.propertyName !== "top")) return;
          doc.removeEventListener("transitionend",onEnd);
          finish();
        };
        doc.addEventListener("transitionend",onEnd);
        cleanupTimers.push(setTimeout(function() {
          doc.removeEventListener("transitionend",onEnd);
          finish();
        },620));
      }

      function toggleExtract(doc) {
        if (!doc) return;
        if (doc.classList.contains("extracted")) {
          retractDoc(doc);
          return;
        }
        system.querySelectorAll(".ruin-mini-archive-doc.extracted").forEach(function(other) {
          if (other !== doc) retractDoc(other);
        });
        doc.classList.remove("retracting");
        doc.classList.add("extracted");
        doc.style.zIndex = "260";
      }

      recordStack.innerHTML = "";
      gardenStack.innerHTML = "";

      recordEntries.forEach(function(entry,index) {
        var doc = makeDoc(entry,index,false);
        doc.addEventListener("click",function(event) {
          event.preventDefault();
          event.stopPropagation();
          toggleExtract(doc);
        });
        recordStack.appendChild(doc);
      });

      gardenSites.forEach(function(site,index) {
        var doc = makeDoc(site,index,true);
        doc.addEventListener("click",function(event) {
          event.preventDefault();
          event.stopPropagation();
          toggleExtract(doc);
        });
        gardenStack.appendChild(doc);
      });

      rebuildArchiveDamagePlan();
      layoutStacks();
      renderMiniIndexStone();

      // Miniature port of the source index-drawer + procedural broken-stone rubbing:
      // slide the slab upward, and sink/restore the archive stacks around it.
      var surfaceTrigger = indexDrawer.querySelector(".ruin-mini-index-surface-trigger");
      var cabinetShell = system.closest(".ruin-mini-cabinet-shell");
      var refractureButton = document.querySelector(".ruin-mini-cabinet-section .ruin-mini-refracture-button");
      var drawerOpenTimer = 0;
      var refractureTimer = 0;

      function setDrawerOpen(open) {
        syncMiniIndexDrawerBaseline();
        indexDrawer.classList.toggle("open",open);
        if (surfaceTrigger) surfaceTrigger.setAttribute("aria-expanded",open ? "true" : "false");

        window.clearTimeout(drawerOpenTimer);
        if (open) {
          recordStack.classList.add("sink-down");
          gardenStack.classList.add("sink-down");
          drawerOpenTimer = window.setTimeout(function() {
            recordStack.classList.add("elevated-z");
            gardenStack.classList.add("elevated-z");
            recordStack.classList.remove("sink-down");
            gardenStack.classList.remove("sink-down");
          },400);
        } else {
          recordStack.classList.add("sink-down");
          gardenStack.classList.add("sink-down");
          drawerOpenTimer = window.setTimeout(function() {
            recordStack.classList.remove("elevated-z","sink-down");
            gardenStack.classList.remove("elevated-z","sink-down");
          },400);
        }
      }


      if (surfaceTrigger) {
        surfaceTrigger.addEventListener("click",function(event) {
          event.preventDefault();
          event.stopPropagation();
          setDrawerOpen(!indexDrawer.classList.contains("open"));
        });
      }

      var onRefracture = function(event) {
        event.preventDefault();
        if (!cabinetShell || cabinetShell.classList.contains("is-refracturing")) return;

        if (refractureButton) refractureButton.disabled = true;
        cabinetShell.classList.add("is-refracturing");

        window.clearTimeout(refractureTimer);
        refractureTimer = window.setTimeout(function() {
          fractureIteration = (
            fractureIteration +
            1 +
            Math.floor(Math.random() * 0x3fffffff)
          ) >>> 0;

          rebuildArchiveDamagePlan();
          layoutStacks();
          if(typeof window.rerollIndexStoneFragments==="function"){
            window.rerollIndexStoneFragments();
          }else{
            renderMiniIndexStone();
          }

          requestAnimationFrame(function() {
            requestAnimationFrame(function() {
              if (!cabinetShell || !cabinetShell.isConnected) return;
              cabinetShell.classList.remove("is-refracturing");
              window.setTimeout(function() {
                if (refractureButton) refractureButton.disabled = false;
              },360);
            });
          });
        },230);
      };

      if (refractureButton) {
        refractureButton.addEventListener("click",onRefracture);
      }

      var onOutside = function(event) {
        if (!system.isConnected) return;
        if (indexDrawer.classList.contains("open") && !indexDrawer.contains(event.target)) {
          setDrawerOpen(false);
        }
        if (!system.contains(event.target)) {
          system.querySelectorAll(".ruin-mini-archive-doc.extracted").forEach(retractDoc);
        }
      };

      var resizeRaf = 0;
      var onResize = function() {
        if (resizeRaf) cancelAnimationFrame(resizeRaf);
        resizeRaf = requestAnimationFrame(function() {
          resizeRaf = 0;
          if (token !== ruinMiniArchiveMountToken || !system.isConnected) return;
          layoutStacks();
          renderMiniIndexStone();
        });
      };

      document.addEventListener("pointerdown",onOutside,true);
      window.addEventListener("resize",onResize,{passive:true});

      ruinMiniArchiveCleanup = function() {
        window.clearTimeout(drawerOpenTimer);
        window.clearTimeout(refractureTimer);
        if (refractureButton) refractureButton.removeEventListener("click",onRefracture);
        window.removeEventListener("index-stone-geometry-ready",onMiniStoneGeometry);
        cleanupTimers.forEach(window.clearTimeout);
        cleanupTimers = [];
        if (resizeRaf) cancelAnimationFrame(resizeRaf);
        document.removeEventListener("pointerdown",onOutside,true);
        window.removeEventListener("resize",onResize);
      };
    });
  }

  function mountSeawaterWorld(item) {
    if (!item || item.slug !== "seawater") return;

    var room = document.querySelector('.room-view[data-room="seawater"]');
    if (!room) return;

    var scroll = room.querySelector(".room-scroll");
    if (!scroll || room.querySelector(".seawater-caustic-projection")) return;

    room.querySelectorAll(".seawater-world-light, .seawater-world-shadow, .seawater-caustics").forEach(function (node) {
      node.remove();
    });

    /*
      Canvas2D projected Water Caustics
      ---------------------------------
      Keep the earlier low-resolution optical interference field, but make the
      projected space almost parallel. A physical point-light projection still
      determines the direction and depth; only the exaggerated convergence is
      damped so the far rectangle shrinks by just a few percent.

      The caustic field is rendered in depth bands. Every band is progressively
      more blurred and less opaque, and the complete layer receives a small base
      blur so both long side edges are soft from beginning to end, like a real
      shadow / light volume.
    */
    var canvas = document.createElement("canvas");
    canvas.className = "seawater-caustic-projection";
    canvas.setAttribute("aria-hidden", "true");
    room.insertBefore(canvas, scroll);

    var ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) {
      canvas.remove();
      return;
    }

    var low = document.createElement("canvas");
    var lowCtx = low.getContext("2d", { alpha: true, willReadFrequently: false });
    var mid = document.createElement("canvas");
    var midCtx = mid.getContext("2d", { alpha: true });
    var far = document.createElement("canvas");
    var farCtx = far.getContext("2d", { alpha: true });
    var soft = document.createElement("canvas");
    var softCtx = soft.getContext("2d", { alpha: true });
    var layer = document.createElement("canvas");
    var layerCtx = layer.getContext("2d", { alpha: true });
    var mask = document.createElement("canvas");
    var maskCtx = mask.getContext("2d", { alpha: true });
    if (!lowCtx || !midCtx || !farCtx || !softCtx || !layerCtx || !maskCtx) {
      canvas.remove();
      return;
    }

    var width = 1;
    var height = 1;
    var pixelRatio = 1;
    var lowWidth = 168;
    var lowHeight = 132;
    var lowImageData = null;
    var reduceMotion = false;
    var lastFrame = 0;
    var lastFieldFrame = -1;
    var currentSolarProgress = null;

    try {
      reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    } catch (_) {}

    function clamp(value, min, max) {
      return Math.max(min, Math.min(max, value));
    }

    function lerp(a, b, t) {
      return a + (b - a) * t;
    }

    function lerpPoint(a, b, t) {
      return { x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t) };
    }

    function scrollProgress() {
      var maxScroll = Math.max(1, scroll.scrollHeight - scroll.clientHeight);
      return clamp(scroll.scrollTop / maxScroll, 0, 1);
    }


    /*
      Seawater page background exposure curve
      ---------------------------------------
      From top to bottom the page follows the requested darkness sequence:
      0 -> 20 -> 30 -> 40 -> 30 -> 20 -> 10 -> 0.
      Level 0 is the site's warm paper (#f4f3ee); level 40 is sampled from the
      user's ideal-effect reference (#928c80). Each interval uses smoothstep so
      the change reads as a slow exposure shift rather than discrete bands.
    */
    var seawaterBackgroundLevels = [0, 20, 30, 40, 30, 20, 10, 0];
    var seawaterPaperRgb = [244, 243, 238];
    var seawaterDeepRgb = [146, 140, 128];
    var lastSeawaterBackground = "";

    function smoothstep01(value) {
      var t = clamp(value, 0, 1);
      return t * t * (3 - 2 * t);
    }

    function interpolateBackgroundStops(stops, progress) {
      var scaled = clamp(progress, 0, 1) * (stops.length - 1);
      var index = Math.min(stops.length - 2, Math.floor(scaled));
      var local = smoothstep01(scaled - index);
      return lerp(stops[index], stops[index + 1], local);
    }

    function artworkMidpointTargetScroll() {
      var maxScroll = Math.max(1, scroll.scrollHeight - scroll.clientHeight);
      var images = Array.prototype.slice.call(scroll.querySelectorAll(".room-image img")).slice(0, 2);
      if (images.length < 2) return maxScroll * 0.5;

      var scrollRect = scroll.getBoundingClientRect();
      var centers = images.map(function (image) {
        var rect = image.getBoundingClientRect();
        return (rect.top - scrollRect.top) + scroll.scrollTop + rect.height * 0.5;
      });
      var contentMidpoint = (centers[0] + centers[1]) * 0.5;
      return clamp(contentMidpoint - scroll.clientHeight * 0.5, 0, maxScroll);
    }

    function backgroundLevelForScroll() {
      var maxScroll = Math.max(1, scroll.scrollHeight - scroll.clientHeight);
      var current = clamp(scroll.scrollTop, 0, maxScroll);
      var target = artworkMidpointTargetScroll();

      if (current <= target) {
        var before = target > 0 ? current / target : 1;
        return interpolateBackgroundStops([0, 20, 30, 40], before);
      }

      var afterRange = Math.max(1, maxScroll - target);
      var after = (current - target) / afterRange;
      return interpolateBackgroundStops([40, 30, 20, 10, 0], after);
    }

    function updateSeawaterBackground() {
      var level = backgroundLevelForScroll();
      var mix = clamp(level / 40, 0, 1);
      var r = Math.round(lerp(seawaterPaperRgb[0], seawaterDeepRgb[0], mix));
      var g = Math.round(lerp(seawaterPaperRgb[1], seawaterDeepRgb[1], mix));
      var b = Math.round(lerp(seawaterPaperRgb[2], seawaterDeepRgb[2], mix));
      var value = "rgb(" + r + ", " + g + ", " + b + ")";
      if (value !== lastSeawaterBackground) {
        lastSeawaterBackground = value;
        room.style.backgroundColor = value;
        room.style.setProperty("--seawater-scroll-background", value);
      }
      document.documentElement.dataset.seawaterBackgroundLevel = String(Math.round(level));
    }

    function lightForFrame() {
      /*
        Scroll-driven 3D solar arc.
        0.00 = low morning light from down-left
        0.50 = high noon light from almost overhead / slightly left
        1.00 = low evening light from up-left

        The scroll target is eased so the light has inertia instead of sticking
        directly to touch movement. Solar altitude follows sin(pi*p): high at
        noon, low at both ends. That same altitude later compresses / expands
        the projected caustic volume like a real morning-noon-evening shadow.
      */
      var targetProgress = clamp(scrollProgress(), 0, 1);
      if (currentSolarProgress == null) currentSolarProgress = targetProgress;
      currentSolarProgress += (targetProgress - currentSolarProgress) * 0.014;

      var p = clamp(currentSolarProgress, 0, 1);
      var altitude = Math.sin(Math.PI * p);
      var altitudeEase = Math.pow(clamp(altitude, 0, 1), 0.88);
      var mobile = width <= 760;
      var distance = Math.max(width, height) * lerp(1.52, 1.18, altitudeEase);

      /* Horizontal orbit: low sun sits farther left; noon comes closer to the
         vertical axis while remaining slightly left of the artwork. */
      var xOffset = lerp(0.72, 0.24, altitudeEase);

      /* Screen-space vertical keyframes, matching the user's 3D sketch:
         down-left -> overhead-left -> up-left. */
      var yOffset;
      if (p <= 0.5) {
        yOffset = lerp(0.58, -0.92, smoothstep01(p / 0.5));
      } else {
        yOffset = lerp(-0.92, -0.52, smoothstep01((p - 0.5) / 0.5));
      }

      var lowZ = mobile ? 1850 : 2450;
      var highZ = mobile ? 5200 : 6800;
      var z = lerp(lowZ, highZ, altitudeEase);

      document.documentElement.dataset.seawaterTimeSource = "scroll-solar-arc";
      document.documentElement.dataset.seawaterSolarAltitude = altitude.toFixed(3);
      document.documentElement.dataset.seawaterSolarProgress = p.toFixed(3);

      return {
        x: width * 0.5 - distance * xOffset,
        y: height * 0.5 + distance * yOffset,
        z: z,
        altitude: altitude,
        progress: p
      };
    }

    function physicalProjectRect(rect, light, elevation, canvasRect) {
      var left = rect.left - canvasRect.left;
      var right = rect.right - canvasRect.left;
      var top = rect.top - canvasRect.top;
      var bottom = rect.bottom - canvasRect.top;
      var base = [
        { x: left, y: top },
        { x: right, y: top },
        { x: right, y: bottom },
        { x: left, y: bottom }
      ];
      var projection = light.z / Math.max(1, light.z - elevation);
      var projected = base.map(function (point) {
        return {
          x: light.x + (point.x - light.x) * projection,
          y: light.y + (point.y - light.y) * projection
        };
      });
      return { base: base, projected: projected };
    }

    function buildSolarProjectedVolume(rect, index, light, canvasRect) {
      var mobile = width <= 760;
      var left = rect.left - canvasRect.left;
      var right = rect.right - canvasRect.left;
      var top = rect.top - canvasRect.top;
      var bottom = rect.bottom - canvasRect.top;
      var base = [
        { x: left, y: top },
        { x: right, y: top },
        { x: right, y: bottom },
        { x: left, y: bottom }
      ];

      var baseCenter = {
        x: (left + right) * 0.5,
        y: (top + bottom) * 0.5
      };
      var dx = baseCenter.x - light.x;
      var dy = baseCenter.y - light.y;
      var len = Math.sqrt(dx * dx + dy * dy) || 1;
      var ux = dx / len;
      var uy = dy / len;

      /* Height controls projection length. The noon volume becomes compact,
         while low morning/evening light produces a long caustic space. */
      var altitude = clamp(light.altitude == null ? 0.5 : light.altitude, 0, 1);
      var heightEase = Math.pow(altitude, 0.82);
      var longDepth = clamp(
        rect.width * (index === 0 ? 0.76 : 0.70),
        mobile ? 175 : 235,
        mobile ? 290 : 420
      );
      var noonDepth = clamp(
        rect.width * (index === 0 ? 0.24 : 0.22),
        mobile ? 68 : 92,
        mobile ? 118 : 158
      );
      var depth = lerp(longDepth, noonDepth, heightEase);
      var farCenter = {
        x: baseCenter.x + ux * depth,
        y: baseCenter.y + uy * depth
      };

      /* Keep the single-point character extremely restrained. A higher noon
         source reduces divergence further, so the volume feels almost parallel. */
      var elevation = clamp(
        rect.width * (index === 0 ? 0.18 : 0.16),
        mobile ? 44 : 60,
        mobile ? 90 : 124
      );
      var perspectiveScale = clamp(
        light.z / Math.max(1, light.z - elevation),
        1.006,
        1.028
      );
      var halfW = rect.width * perspectiveScale * 0.5;
      var halfH = rect.height * perspectiveScale * 0.5;
      var far = [
        { x: farCenter.x - halfW, y: farCenter.y - halfH },
        { x: farCenter.x + halfW, y: farCenter.y - halfH },
        { x: farCenter.x + halfW, y: farCenter.y + halfH },
        { x: farCenter.x - halfW, y: farCenter.y + halfH }
      ];

      return {
        base: base,
        far: far,
        elevation: elevation,
        direction: { x: ux, y: uy },
        altitude: altitude,
        depth: depth
      };
    }

    function pathQuad(targetCtx, quad) {
      targetCtx.beginPath();
      targetCtx.moveTo(quad[0].x, quad[0].y);
      targetCtx.lineTo(quad[1].x, quad[1].y);
      targetCtx.lineTo(quad[2].x, quad[2].y);
      targetCtx.lineTo(quad[3].x, quad[3].y);
      targetCtx.closePath();
    }

    function cross(o, a, b) {
      return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
    }

    function convexHull(points) {
      var sorted = points.slice().sort(function (a, b) {
        return a.x === b.x ? a.y - b.y : a.x - b.x;
      });
      if (sorted.length <= 2) return sorted;

      var lower = [];
      sorted.forEach(function (point) {
        while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], point) <= 0) {
          lower.pop();
        }
        lower.push(point);
      });

      var upper = [];
      for (var i = sorted.length - 1; i >= 0; i -= 1) {
        var point = sorted[i];
        while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], point) <= 0) {
          upper.pop();
        }
        upper.push(point);
      }

      upper.pop();
      lower.pop();
      return lower.concat(upper);
    }

    function volumeHull(volume) {
      return convexHull(volume.base.concat(volume.far));
    }

    function pathPolygon(targetCtx, points) {
      if (!points || !points.length) return;
      targetCtx.beginPath();
      targetCtx.moveTo(points[0].x, points[0].y);
      for (var i = 1; i < points.length; i += 1) {
        targetCtx.lineTo(points[i].x, points[i].y);
      }
      targetCtx.closePath();
    }

    function boundsOf(points) {
      var minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
      points.forEach(function (p) {
        minX = Math.min(minX, p.x);
        minY = Math.min(minY, p.y);
        maxX = Math.max(maxX, p.x);
        maxY = Math.max(maxY, p.y);
      });
      return { minX: minX, minY: minY, maxX: maxX, maxY: maxY };
    }

    function resizeWorld() {
      var rect = canvas.getBoundingClientRect();
      width = Math.max(1, Math.round(rect.width));
      height = Math.max(1, Math.round(rect.height));
      var mobile = width <= 760;

      pixelRatio = Math.min(window.devicePixelRatio || 1, mobile ? 1.35 : 1.5);
      canvas.width = Math.max(1, Math.round(width * pixelRatio));
      canvas.height = Math.max(1, Math.round(height * pixelRatio));
      ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      /* One CSS-pixel soft layer keeps edge blur inexpensive. */
      soft.width = Math.max(1, Math.round(width));
      soft.height = Math.max(1, Math.round(height));
      softCtx.imageSmoothingEnabled = true;
      softCtx.imageSmoothingQuality = "high";

      lowWidth = mobile ? 220 : 300;
      lowHeight = Math.round(lowWidth * Math.max(0.72, Math.min(1.08, height / Math.max(width, 1))));
      low.width = lowWidth;
      low.height = lowHeight;
      lowCtx.imageSmoothingEnabled = true;
      lowCtx.imageSmoothingQuality = "high";
      lowImageData = lowCtx.createImageData(lowWidth, lowHeight);

      /* Keep the blur pyramid dense enough that Safari never exposes pixel blocks. */
      mid.width = Math.max(150, Math.round(lowWidth * 0.76));
      mid.height = Math.max(108, Math.round(lowHeight * 0.76));
      far.width = Math.max(108, Math.round(lowWidth * 0.52));
      far.height = Math.max(82, Math.round(lowHeight * 0.52));
      midCtx.imageSmoothingEnabled = true;
      midCtx.imageSmoothingQuality = "high";
      farCtx.imageSmoothingEnabled = true;
      farCtx.imageSmoothingQuality = "high";

      layer.width = soft.width;
      layer.height = soft.height;
      mask.width = soft.width;
      mask.height = soft.height;
      layerCtx.imageSmoothingEnabled = true;
      layerCtx.imageSmoothingQuality = "high";
      maskCtx.imageSmoothingEnabled = true;
      maskCtx.imageSmoothingQuality = "high";
      lastFieldFrame = -1;
    }

    function renderLowField(timeSeconds) {
      if (!lowImageData) return;
      var data = lowImageData.data;
      var time = reduceMotion ? 0 : timeSeconds;
      var pointer = 0;

      for (var y = 0; y < lowHeight; y += 1) {
        var ny = (y + 0.5) / lowHeight - 0.5;
        for (var x = 0; x < lowWidth; x += 1) {
          var nx = (x + 0.5) / lowWidth - 0.5;

          var wx = nx + 0.085 * Math.sin(ny * 12.5 + time * 1.46) + 0.034 * Math.sin(ny * 25.0 - time * 1.08 + 0.7);
          var wy = ny + 0.082 * Math.cos(nx * 11.2 - time * 1.28) + 0.030 * Math.cos(nx * 22.4 + time * 0.92 + 1.3);
          var a = Math.sin(wx * 18.0 + Math.sin(wy * 10.5 + time * 1.18));
          var b = Math.cos(wy * 17.0 + Math.sin(wx * 11.5 - time * 1.02));
          var c = Math.sin((wx + wy) * 12.2 + Math.cos((wx - wy) * 9.7 + time * 0.84));
          var d = Math.cos((wx - wy) * 14.3 + Math.sin(wy * 8.6 - time * 0.72));
          var f = (a + b + c + d) * 0.25;
          var ridge = Math.max(0, 1 - Math.abs(f) * 1.64);
          var core = Math.pow(ridge, 8.5);
          var halo = Math.pow(Math.max(0, 1 - Math.abs(f) * 1.02), 2.7) * 0.17;
          var crossField = Math.sin(wx * 13.5 + Math.sin(wy * 18.0 + time * 0.82)) * 0.55 +
            Math.cos(wy * 14.8 + Math.sin(wx * 16.0 - time * 0.88)) * 0.45;
          var crossing = Math.pow(Math.max(0, 1 - Math.abs(crossField) * 1.48), 7.2) * 0.26;
          var value = clamp(core * 1.06 + halo + crossing, 0, 1);

          /* Strict neutral grayscale. Equal RGB channels avoid the previous yellow / magenta interpolation fringes. */
          data[pointer] = 255;
          data[pointer + 1] = 255;
          data[pointer + 2] = 255;
          data[pointer + 3] = Math.round(value * 226);
          pointer += 4;
        }
      }

      lowCtx.putImageData(lowImageData, 0, 0);

      /*
        Cross-browser blur pyramid. Instead of ctx.filter="blur(...)" (which is
        unreliable on iPhone Safari), progressively downsample the same caustic
        field. Upscaling these smaller buffers with high-quality interpolation
        produces a genuine soft-focus version with no rectangular band seams.
      */
      midCtx.setTransform(1, 0, 0, 1, 0, 0);
      midCtx.clearRect(0, 0, mid.width, mid.height);
      midCtx.drawImage(low, 0, 0, mid.width, mid.height);

      farCtx.setTransform(1, 0, 0, 1, 0, 0);
      farCtx.clearRect(0, 0, far.width, far.height);
      farCtx.drawImage(mid, 0, 0, far.width, far.height);
    }

    function volumeAxis(volume) {
      return {
        near: {
          x: (volume.base[0].x + volume.base[2].x) * 0.5,
          y: (volume.base[0].y + volume.base[2].y) * 0.5
        },
        far: {
          x: (volume.far[0].x + volume.far[2].x) * 0.5,
          y: (volume.far[0].y + volume.far[2].y) * 0.5
        }
      };
    }

    function polygonCenter(points) {
      var sumX = 0;
      var sumY = 0;
      points.forEach(function (point) {
        sumX += point.x;
        sumY += point.y;
      });
      return {
        x: sumX / Math.max(1, points.length),
        y: sumY / Math.max(1, points.length)
      };
    }

    function scalePolygon(points, center, scale) {
      return points.map(function (point) {
        return {
          x: center.x + (point.x - center.x) * scale,
          y: center.y + (point.y - center.y) * scale
        };
      });
    }

    function buildLayerMask(volume, stops, edgeBlur) {
      var whole = volumeHull(volume);
      var axis = volumeAxis(volume);
      var center = polygonCenter(whole);
      var mobile = width <= 760;

      maskCtx.setTransform(1, 0, 0, 1, 0, 0);
      maskCtx.clearRect(0, 0, width, height);
      maskCtx.globalCompositeOperation = "source-over";

      /*
        Safari-safe geometric feather:
        many translucent hulls span from slightly outside the projected volume
        to slightly inside it. The result is a real soft edge with no visible
        straight clipping line, and the far optical layers request a wider feather.
      */
      var reference = Math.max(260, Math.min(width, height));
      var feather = clamp(edgeBlur / reference * 0.46, 0.008, 0.070);
      var steps = mobile ? 16 : 20;
      var passAlpha = mobile ? 0.115 : 0.095;

      for (var i = 0; i < steps; i += 1) {
        var t = steps <= 1 ? 0.5 : i / (steps - 1);
        var scale = 1 + feather - feather * 2 * t;
        var feathered = scalePolygon(whole, center, scale);
        maskCtx.fillStyle = "rgba(255,255,255," + passAlpha + ")";
        pathPolygon(maskCtx, feathered);
        maskCtx.fill();
      }

      var gradient = maskCtx.createLinearGradient(axis.near.x, axis.near.y, axis.far.x, axis.far.y);
      stops.forEach(function (stop) {
        gradient.addColorStop(stop[0], "rgba(255,255,255," + stop[1] + ")");
      });
      maskCtx.globalCompositeOperation = "destination-in";
      maskCtx.fillStyle = gradient;
      maskCtx.fillRect(0, 0, width, height);

      /* Directional front gate: no caustic halo may wrap around the light-facing
         sides of the image. This is the key fix for the extra two/three edges. */
      var axisDx = axis.far.x - axis.near.x;
      var axisDy = axis.far.y - axis.near.y;
      var axisLength = Math.sqrt(axisDx * axisDx + axisDy * axisDy) || 1;
      var dirX = axisDx / axisLength;
      var dirY = axisDy / axisLength;
      var gateBack = Math.min(axisLength * 0.10, Math.max(6, edgeBlur * 0.48));
      var gateForward = Math.min(axisLength * 0.24, Math.max(10, edgeBlur * 0.92));
      var gate = maskCtx.createLinearGradient(
        axis.near.x - dirX * gateBack,
        axis.near.y - dirY * gateBack,
        axis.near.x + dirX * gateForward,
        axis.near.y + dirY * gateForward
      );
      gate.addColorStop(0, "rgba(255,255,255,0)");
      gate.addColorStop(0.38, "rgba(255,255,255,0)");
      gate.addColorStop(0.72, "rgba(255,255,255,0.82)");
      gate.addColorStop(1, "rgba(255,255,255,1)");
      maskCtx.fillStyle = gate;
      maskCtx.fillRect(0, 0, width, height);
      maskCtx.globalCompositeOperation = "source-over";
    }

    function drawCausticLayer(source, volume, bounds, stops, edgeBlur, alpha) {
      layerCtx.setTransform(1, 0, 0, 1, 0, 0);
      layerCtx.clearRect(0, 0, width, height);
      layerCtx.globalCompositeOperation = "source-over";
      layerCtx.globalAlpha = alpha;
      layerCtx.imageSmoothingEnabled = true;
      layerCtx.imageSmoothingQuality = "high";

      var pad = 76;
      layerCtx.drawImage(
        source,
        bounds.minX - pad,
        bounds.minY - pad,
        (bounds.maxX - bounds.minX) + pad * 2,
        (bounds.maxY - bounds.minY) + pad * 2
      );

      buildLayerMask(volume, stops, edgeBlur);
      layerCtx.globalCompositeOperation = "destination-in";
      layerCtx.globalAlpha = 1;
      layerCtx.drawImage(mask, 0, 0);
      layerCtx.globalCompositeOperation = "source-over";

      softCtx.save();
      softCtx.globalCompositeOperation = "source-over";
      softCtx.globalAlpha = 1;
      softCtx.drawImage(layer, 0, 0);
      softCtx.restore();
    }

    function drawProjectedCaustic(rect, index, light, canvasRect) {
      if (rect.width < 2 || rect.height < 2) return;
      var mobile = width <= 760;
      var volume = buildSolarProjectedVolume(rect, index, light, canvasRect);
      var wholeBounds = boundsOf(volume.base.concat(volume.far));
      var baseAlpha = index === 0 ? 0.92 : 0.88;

      /*
        Continuous depth-of-field blend:
        sharp near the image -> medium focus -> broad far focus.
        No per-band clipping and no Canvas2D filter, so iOS Safari cannot reveal
        the old stack of rectangular blur strips.
      */
      drawCausticLayer(
        low,
        volume,
        wholeBounds,
        [[0, 1], [0.14, 0.96], [0.30, 0.66], [0.48, 0.16], [0.58, 0]],
        mobile ? 7 : 8,
        baseAlpha
      );
      drawCausticLayer(
        mid,
        volume,
        wholeBounds,
        [[0, 0.12], [0.18, 0.30], [0.42, 0.60], [0.68, 0.56], [0.88, 0.20], [1, 0]],
        mobile ? 14 : 17,
        baseAlpha * 0.90
      );
      drawCausticLayer(
        far,
        volume,
        wholeBounds,
        [[0, 0], [0.28, 0.05], [0.50, 0.22], [0.72, 0.50], [0.90, 0.60], [1, 0.50]],
        mobile ? 28 : 34,
        baseAlpha * 0.78
      );
    }

    function render(now) {
      if (!canvas.isConnected) return;
      var mobile = width <= 760;
      var frameInterval = mobile ? 52 : 40;

      if (now - lastFrame >= frameInterval || reduceMotion && lastFieldFrame < 0) {
        lastFrame = now;
        var fieldFrame = Math.floor(now / frameInterval);
        if (fieldFrame !== lastFieldFrame) {
          renderLowField(now * 0.00118);
          lastFieldFrame = fieldFrame;
        }

        softCtx.setTransform(1, 0, 0, 1, 0, 0);
        softCtx.clearRect(0, 0, width, height);

        updateSeawaterBackground();

        var canvasRect = canvas.getBoundingClientRect();
        var images = Array.prototype.slice.call(scroll.querySelectorAll(".room-image img")).slice(0, 2);
        var light = lightForFrame();
        var anyVisible = false;

        images.forEach(function (image, index) {
          var rect = image.getBoundingClientRect();
          if (rect.bottom < canvasRect.top - height * 0.80 || rect.top > canvasRect.bottom + height * 0.80) return;
          anyVisible = true;
          drawProjectedCaustic(rect, index, light, canvasRect);
        });

        ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
        ctx.clearRect(0, 0, width, height);
        ctx.globalCompositeOperation = "source-over";
        ctx.globalAlpha = 1;
        ctx.drawImage(soft, 0, 0, width, height);

        canvas.style.opacity = anyVisible ? "1" : "0";
        document.documentElement.dataset.seawaterRenderer = "canvas2d-scroll-solar3d-caustics";
        document.documentElement.dataset.seawaterProjection = "scroll-solar-arc-3d";
      }

      requestAnimationFrame(render);
    }

    window.addEventListener("resize", resizeWorld, { passive: true });
    window.addEventListener("orientationchange", resizeWorld, { passive: true });
    scroll.querySelectorAll(".room-image img").forEach(function (image) {
      if (!image.complete) image.addEventListener("load", resizeWorld, { once: true });
    });

    resizeWorld();
    updateSeawaterBackground();
    requestAnimationFrame(render);
  }


  var collectionStageResizeFrame = 0;

  function sizeCollectionStages(item) {
    if (!item || item.group !== "collection") return;

    var stages = document.querySelectorAll('.room-view[data-group="collection"] .room-image');
    if (!stages.length) return;

    var viewportWidth = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0);
    var viewportHeight = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0);
    var mobile = viewportWidth <= 760;

    stages.forEach(function (stage) {
      var img = stage.querySelector("img");
      if (!img) return;

      function applyStageSize() {
        if (!stage.isConnected || !img.naturalWidth || !img.naturalHeight) return;

        var imageWidth = img.naturalWidth;
        var imageHeight = img.naturalHeight;

        /*
          User-defined proportions:
          - start with a field that is 150% of the artwork in both dimensions;
          - then add another 10% of artwork width to both the left and right sides.
          Result: field width = artwork × 1.70; field height = artwork × 1.50.
        */
        var stageWidthRatio = 1.70;
        var stageHeightRatio = 1.50;

        /* Viewport limits only scale the whole construction; they never change its ratio. */
        var maxStageWidth = mobile
          ? Math.max(260, viewportWidth - 30)
          : Math.min(viewportWidth * 0.76, 1160);
        var maxStageHeight = mobile
          ? Math.min(viewportHeight * 0.62, 560)
          : Math.min(viewportHeight * 0.72, 740);

        var scale = Math.min(
          maxStageWidth / (imageWidth * stageWidthRatio),
          maxStageHeight / (imageHeight * stageHeightRatio)
        );
        scale = Math.max(scale, 0.01);

        var displayedImageWidth = Math.round(imageWidth * scale * 10) / 10;
        var displayedImageHeight = Math.round(imageHeight * scale * 10) / 10;
        var stageWidth = Math.round(displayedImageWidth * stageWidthRatio * 10) / 10;
        var stageHeight = Math.round(displayedImageHeight * stageHeightRatio * 10) / 10;

        stage.style.setProperty("--image-width", displayedImageWidth + "px");
        stage.style.setProperty("--image-height", displayedImageHeight + "px");
        stage.style.setProperty("--stage-width", stageWidth + "px");
        stage.style.setProperty("--stage-height", stageHeight + "px");
      }

      if (img.complete && img.naturalWidth) {
        applyStageSize();
      } else if (img.dataset.collectionStageSizingBound !== "true") {
        img.dataset.collectionStageSizingBound = "true";
        img.addEventListener("load", applyStageSize, { once: true });
      }
    });
  }

  function scheduleCollectionStageSizing() {
    if (collectionStageResizeFrame) cancelAnimationFrame(collectionStageResizeFrame);
    collectionStageResizeFrame = requestAnimationFrame(function () {
      collectionStageResizeFrame = 0;
      sizeCollectionStages(parseRoute());
    });
  }

  function refineCurrentView() {
    repairAmbientCalendarVideo();

    var item = parseRoute();
    var roomView = document.querySelector(".room-view");
    if (!item || !roomView) return;

    roomView.dataset.room = item.slug;
    roomView.dataset.group = item.group;
    updateFooterNavigation(item);
    sizeCollectionStages(item);
    mountSeawaterWorld(item);
    mountRuinAtlasMiniMap(item);
    mountRuinArchiveMiniSystem(item);
  }

  var appNode = document.querySelector("#app");
  if (appNode && "MutationObserver" in window) {
    var queued = false;
    var observer = new MutationObserver(function () {
      if (queued) return;
      queued = true;
      requestAnimationFrame(function () {
        queued = false;
        refineCurrentView();
      });
    });
    observer.observe(appNode, { childList: true, subtree: true });
  }

  function resumeMediaAfterGesture() {
    repairAmbientCalendarVideo();
  }

  window.addEventListener("resize", scheduleCollectionStageSizing, { passive: true });
  window.addEventListener("orientationchange", scheduleCollectionStageSizing, { passive: true });
  if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", scheduleCollectionStageSizing, { passive: true });
  }

  document.addEventListener("pointerdown", resumeMediaAfterGesture, { passive: true, capture: true });
  document.addEventListener("touchstart", resumeMediaAfterGesture, { passive: true, capture: true });
  document.addEventListener("visibilitychange", function () {
    if (!document.hidden) repairAmbientCalendarVideo();
  });

  render();
  requestAnimationFrame(refineCurrentView);
})();

// === RUIN MINI SOURCE STONE PORT START ===
// v268 · Index Drawer smoother stone + rubbing text reflow source geometry
// ----------------------------------------------------------------------------
// Goals of this pass:
// - abandon the hub/radial topology: each fracture splits ONE existing slab;
// - choose 1–4 fractures per page, so later breaks may terminate on older seams;
// - fracture edges are independently irregular and often nearly coincide;
// - seam width varies along the same break, creating dark/near-contact and
//   lighter/open sections like tightly reassembled stone;
// - edge mouths follow the ACTUAL incidence angle of each fracture, but the
//   rim is now weathered as a shallow rounded bevel instead of a pointed tooth;
// - top-edge mouths avoid the central title and prefer the two side bands;
// - mouth size / erosion style varies from small to occasional large worn bays;
// - mouth throat width is oriented perpendicular to the entering fracture, so
//   the opening flows into the seam without a geometric kink;
// - seams are opened a little more again to reveal rounded, rubbed fracture faces.
// Text interruption remains disabled for this stage.
// ============================================================================
(() => {
    const NS = 'http://www.w3.org/2000/svg';
    const LAYER_ID = 'ruin-mini-index-stone-layer';

    function hash32(str) {
        let h = 2166136261 >>> 0;
        for (let i = 0; i < str.length; i++) {
            h ^= str.charCodeAt(i);
            h = Math.imul(h, 16777619);
        }
        return h >>> 0;
    }

    function mulberry32(seed) {
        let a = seed >>> 0;
        return function () {
            a |= 0;
            a = (a + 0x6D2B79F5) | 0;
            let t = Math.imul(a ^ (a >>> 15), 1 | a);
            t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
            return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        };
    }

    function pageSeed(forceNew = false) {
        if (!forceNew && Number.isFinite(window.__indexStoneFragmentSeed)) return window.__indexStoneFragmentSeed >>> 0;
        try {
            const params = new URLSearchParams(location.search);
            // v268 · IMPORTANT: URLSearchParams#get() returns null when the key
            // is absent, and Number(null) === 0. v267 therefore accidentally
            // interpreted every normal URL as ?stone-seed=0, freezing the same
            // fracture on every reload. Only honor an explicit, non-empty seed.
            if (params.has('stone-seed')) {
                const rawSeed = (params.get('stone-seed') || '').trim();
                if (rawSeed !== '') {
                    const querySeed = Number(rawSeed);
                    if (Number.isFinite(querySeed) && querySeed >= 0) {
                        window.__indexStoneFragmentSeed = querySeed >>> 0;
                        return window.__indexStoneFragmentSeed;
                    }
                }
            }
        } catch (_) {}
        let seed = (Date.now() ^ Math.floor(Math.random() * 0xffffffff)) >>> 0;
        try {
            const u = new Uint32Array(2);
            crypto.getRandomValues(u);
            seed ^= u[0];
            seed ^= ((u[1] << 7) | (u[1] >>> 25)) >>> 0;
        } catch (_) {}
        seed ^= (Math.floor((performance.timeOrigin || 0)) >>> 0);
        seed ^= ((Math.floor((performance.now() || 0) * 1000) * 2654435761) >>> 0);
        window.__indexStoneFragmentSeed = seed >>> 0;
        return window.__indexStoneFragmentSeed;
    }

    let seed = pageSeed(true);

    function svgEl(tag, attrs = {}) {
        const el = document.createElementNS(NS, tag);
        Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, String(v)));
        return el;
    }

    function cssNumber(name, fallback) {
        const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
        const n = parseFloat(value);
        return Number.isFinite(n) ? n : fallback;
    }

    function v(x, y, outer = false) { return { x, y, outer }; }
    function clamp(x, a, b) { return Math.max(a, Math.min(b, x)); }
    function lerp(a, b, t) { return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t }; }
    function distance(a, b) { return Math.hypot(b.x - a.x, b.y - a.y); }
    function toward(a, b, dist) {
        const dx = b.x - a.x, dy = b.y - a.y;
        const l = Math.hypot(dx, dy) || 1;
        return { x: a.x + dx / l * dist, y: a.y + dy / l * dist };
    }
    function centroid(points) {
        let x = 0, y = 0;
        points.forEach(p => { x += p.x; y += p.y; });
        return { x: x / points.length, y: y / points.length };
    }
    function polygonArea(points) {
        let area = 0;
        for (let i = 0; i < points.length; i++) {
            const a = points[i], b = points[(i + 1) % points.length];
            area += a.x * b.y - b.x * a.y;
        }
        return area * 0.5;
    }
    function absArea(points) { return Math.abs(polygonArea(points)); }
    function cross(ax, ay, bx, by) { return ax * by - ay * bx; }
    function unitVec(a) {
        const l = Math.hypot(a.x, a.y) || 1;
        return { x: a.x / l, y: a.y / l };
    }
    function dotVec(a, b) { return a.x * b.x + a.y * b.y; }
    function blendDir(a, b, t) {
        return unitVec({ x: a.x * (1 - t) + b.x * t, y: a.y * (1 - t) + b.y * t });
    }
    function smoothstep01(x) {
        x = clamp(x, 0, 1);
        return x * x * (3 - 2 * x);
    }
    function projectAlong(origin, dir, p) {
        return (p.x - origin.x) * dir.x + (p.y - origin.y) * dir.y;
    }
    function smoothChainInterior(points, passes = 1, blend = 0.20) {
        const out = points.map(p => ({ ...p }));
        for (let pass = 0; pass < passes; pass++) {
            for (let i = 1; i < out.length - 1; i++) {
                const prev = out[i - 1], cur = out[i], next = out[i + 1];
                out[i] = {
                    ...cur,
                    x: cur.x * (1 - blend * 2) + (prev.x + next.x) * blend,
                    y: cur.y * (1 - blend * 2) + (prev.y + next.y) * blend
                };
            }
        }
        return out;
    }

    function pathD(points) {
        // v258 · only INTERNAL fracture vertices can be softly rounded.
        // The true outer silhouette remains literal / faceted.  A tiny quadratic
        // radius on seam vertices suggests abrasion after broken slabs rubbed
        // against one another, without turning the stone into a soft blob.
        const n = points.length;
        if (n < 3) return '';

        const rounded = points.map((cur, i) => {
            const prev = points[(i - 1 + n) % n];
            const next = points[(i + 1) % n];
            const requested = ((cur.mouth && cur.rimWear) || (!cur.outer && (cur.seam || cur.mouth)))
                ? (cur.wear || 0)
                : 0;
            if (requested <= 0.05) return { round: false, cur };

            const lenPrev = distance(prev, cur);
            const lenNext = distance(cur, next);
            // v265 · rounded mouths and rubbed contact nodes need slightly more
            // local radius than ordinary seam points, otherwise the geometry is
            // technically worn but still reads as a kink. Keep the outer frame
            // literal, but allow mouth/junction/contact points to consume more
            // edge length and reveal the intended eroded trajectory.
            const roundLimit = cur.junction
                ? (cur.mouth ? 0.56 : 0.38)
                : cur.contact
                    ? 0.38
                    : cur.mouth
                        ? 0.44
                        : 0.22;
            const roundBias = cur.roundBias ?? 1;
            const r = Math.min(requested * roundBias, lenPrev * roundLimit, lenNext * roundLimit);
            if (r < 0.18) return { round: false, cur };

            return {
                round: true,
                cur,
                entry: toward(cur, prev, r),
                exit: toward(cur, next, r)
            };
        });

        const first = rounded[0];
        let d;
        if (first.round) {
            d = `M ${first.entry.x.toFixed(2)} ${first.entry.y.toFixed(2)} `;
            d += `Q ${first.cur.x.toFixed(2)} ${first.cur.y.toFixed(2)} ${first.exit.x.toFixed(2)} ${first.exit.y.toFixed(2)} `;
        } else {
            d = `M ${first.cur.x.toFixed(2)} ${first.cur.y.toFixed(2)} `;
        }

        for (let i = 1; i < n; i++) {
            const item = rounded[i];
            if (item.round) {
                d += `L ${item.entry.x.toFixed(2)} ${item.entry.y.toFixed(2)} `;
                d += `Q ${item.cur.x.toFixed(2)} ${item.cur.y.toFixed(2)} ${item.exit.x.toFixed(2)} ${item.exit.y.toFixed(2)} `;
            } else {
                d += `L ${item.cur.x.toFixed(2)} ${item.cur.y.toFixed(2)} `;
            }
        }
        return d + 'Z';
    }

    function lineSegmentIntersection(linePoint, dir, p, q) {
        const sx = q.x - p.x, sy = q.y - p.y;
        const denom = cross(dir.x, dir.y, sx, sy);
        if (Math.abs(denom) < 1e-8) return null;
        const rx = p.x - linePoint.x, ry = p.y - linePoint.y;
        const t = cross(rx, ry, sx, sy) / denom;
        const u = cross(rx, ry, dir.x, dir.y) / denom;
        if (u < -1e-6 || u > 1 + 1e-6) return null;
        return { x: linePoint.x + dir.x * t, y: linePoint.y + dir.y * t, t, u };
    }

    function linePolygonIntersections(poly, linePoint, dir) {
        const hits = [];
        for (let i = 0; i < poly.length; i++) {
            const a = poly[i], b = poly[(i + 1) % poly.length];
            const hit = lineSegmentIntersection(linePoint, dir, a, b);
            if (!hit) continue;
            const outerEdge = !!(a.outer && b.outer);
            // v264 · a later fracture can terminate on an older fracture face.
            // Keep that information: those junctions need their own rounded /
            // rubbed opening instead of behaving like an anonymous polygon edge.
            const seamEdge = !!((a.seam || a.mouth) && (b.seam || b.mouth));
            const existing = hits.find(h => Math.hypot(h.x - hit.x, h.y - hit.y) < 0.45);
            if (existing) {
                existing.outer = existing.outer && outerEdge;
                existing.seamEdge = existing.seamEdge || seamEdge;
                existing.edgeIndex = i;
                existing.u = hit.u;
                if (Math.abs(hit.t) < Math.abs(existing.t)) existing.t = hit.t;
                continue;
            }
            hits.push({
                x: hit.x, y: hit.y, t: hit.t, u: hit.u,
                edgeIndex: i,
                outer: outerEdge,
                seamEdge
            });
        }
        hits.sort((a, b) => a.t - b.t);
        return hits;
    }

    function buildArc(poly, startEdge, endEdge, startPoint, endPoint) {
        const out = [{ ...startPoint }];
        let i = (startEdge + 1) % poly.length;
        const stop = (endEdge + 1) % poly.length;
        let guard = 0;
        while (i !== stop && guard++ < poly.length + 2) {
            out.push({ ...poly[i] });
            i = (i + 1) % poly.length;
        }
        out.push({ ...endPoint });
        return out;
    }

    function edgeFrame(poly, hit) {
        const a = poly[hit.edgeIndex];
        const b = poly[(hit.edgeIndex + 1) % poly.length];
        const dx = b.x - a.x, dy = b.y - a.y;
        const edgeLen = Math.hypot(dx, dy) || 1;
        const tangent = { x: dx / edgeLen, y: dy / edgeLen };
        const n1 = { x: -tangent.y, y: tangent.x };
        const n2 = { x: tangent.y, y: -tangent.x };
        const c = centroid(poly);
        const p1 = { x: hit.x + n1.x * 10, y: hit.y + n1.y * 10 };
        const p2 = { x: hit.x + n2.x * 10, y: hit.y + n2.y * 10 };
        const d1 = Math.hypot(p1.x - c.x, p1.y - c.y);
        const d2 = Math.hypot(p2.x - c.x, p2.y - c.y);
        return { tangent, inward: d1 < d2 ? n1 : n2, edgeLen, a, b };
    }

    function pointOnHitEdge(poly, hit, u, flags = null) {
        const a = poly[hit.edgeIndex];
        const b = poly[(hit.edgeIndex + 1) % poly.length];
        const t = clamp(u, 0.018, 0.982);
        const result = {
            x: a.x + (b.x - a.x) * t,
            y: a.y + (b.y - a.y) * t,
            outer: !!hit.outer,
            edgeIndex: hit.edgeIndex,
            edgeU: t
        };
        if (flags) Object.assign(result, flags);
        return result;
    }

    // v261 · angle-aware, size-varied, eroded edge mouths.
    // The reference is not a repeated notch. Some mouths are tiny and almost
    // closed, some are medium scoops, and a minority are broader worn bays. The
    // two sides are allowed to weather differently, while every mouth still
    // turns into the actual fracture direction rather than the rim normal.
    function chooseMouthProfile(rand) {
        const r = rand();
        if (r < 0.46) {
            return {
                name: 'small',
                widthScale: 0.90 + rand() * 0.18,
                depthScale: 0.90 + rand() * 0.16,
                wearScale: 0.92 + rand() * 0.18,
                throatScale: 0.96 + rand() * 0.12,
                heavyChance: 0.18
            };
        }
        if (r < 0.82) {
            return {
                name: 'medium',
                widthScale: 1.18 + rand() * 0.28,
                depthScale: 1.02 + rand() * 0.22,
                wearScale: 1.12 + rand() * 0.24,
                throatScale: 1.10 + rand() * 0.18,
                heavyChance: 0.42
            };
        }
        return {
            name: 'large',
            widthScale: 1.58 + rand() * 0.42,
            depthScale: 1.18 + rand() * 0.30,
            wearScale: 1.34 + rand() * 0.34,
            throatScale: 1.24 + rand() * 0.24,
            heavyChance: 0.68
        };
    }

    function chooseMouthShape(rand, heavy) {
        const r = rand();
        if (heavy && r < 0.34) return 'worn-bay';
        if (r < 0.30) return 'soft-scoop';
        if (r < 0.58) return 'rounded-ledge';
        if (r < 0.82) return 'worn-bay';
        return 'plain-bevel';
    }

    function mouthSideChain(shoulder, throat, frame, entryDir, rand, opts = {}) {
        const sign = opts.sign || 1;
        const slowTaper = !!opts.slowTaper;
        const weathered = !!opts.weathered;
        const profile = opts.profile || { wearScale: 1, name: 'small' };
        const shape = opts.shape || 'soft-scoop';
        const wearScale = profile.wearScale || 1;
        const heavy = weathered && (profile.name === 'large' || rand() < (profile.heavyChance || 0));

        const pts = [{
            ...shoulder,
            mouth: true,
            rimWear: true,
            roundBias: 1.52 + rand() * 0.32,
            wear: (2.45 + rand() * 2.10) * wearScale
        }];

        const direct = unitVec({ x: throat.x - shoulder.x, y: throat.y - shoulder.y });
        const seamPull = blendDir(direct, entryDir, 0.66 + rand() * 0.14);
        const sideNormal = unitVec({ x: -entryDir.y, y: entryDir.x });
        const sidePolarity = dotVec(sideNormal, frame.tangent) * sign >= 0 ? 1 : -1;

        let baseTs;
        let scoopScale;
        if (shape === 'rounded-ledge') {
            baseTs = slowTaper ? [0.05, 0.11, 0.20, 0.33, 0.49, 0.66, 0.82] : [0.07, 0.15, 0.28, 0.46, 0.69, 0.84];
            scoopScale = heavy ? 1.74 : 1.26;
        } else if (shape === 'worn-bay') {
            baseTs = slowTaper ? [0.05, 0.12, 0.22, 0.37, 0.53, 0.69, 0.84] : [0.08, 0.18, 0.33, 0.52, 0.72, 0.86];
            scoopScale = heavy ? 2.32 : 1.64;
        } else if (shape === 'plain-bevel') {
            baseTs = slowTaper ? [0.08, 0.17, 0.31, 0.50, 0.72, 0.88] : [0.10, 0.23, 0.42, 0.66, 0.86];
            scoopScale = 0.84;
        } else {
            baseTs = slowTaper ? [0.06, 0.14, 0.25, 0.40, 0.58, 0.77, 0.88] : [0.08, 0.18, 0.32, 0.52, 0.74, 0.88];
            scoopScale = heavy ? 1.58 : 1.12;
        }

        const ts = baseTs
            .map((t, idx) => {
                const jitter = (shape === 'worn-bay' ? 0.052 : 0.036) * (idx === 0 || idx === baseTs.length - 1 ? 0.42 : 1);
                return clamp(t + (rand() - 0.5) * jitter, 0.045, 0.92);
            })
            .sort((a, b) => a - b);

        const interior = [];
        const primaryBend = rand() < 0.5 ? -1 : 1;
        const secondaryBend = rand() < 0.5 ? -primaryBend : primaryBend;
        ts.forEach((t, i) => {
            const easedT = smoothstep01(t);
            const base = lerp(shoulder, throat, t);
            const envelope = Math.sin(Math.PI * easedT);
            const shoulderEase = smoothstep01(clamp(t / 0.26, 0, 1));
            const throatEase = smoothstep01(clamp((1 - t) / 0.26, 0, 1));
            const neckBell = cosineBell(t, 0.17 + rand() * 0.03, 0.11 + rand() * 0.03);
            const bayBell = cosineBell(t, 0.42 + rand() * 0.07, 0.17 + rand() * 0.07);
            const lateBell = cosineBell(t, 0.65 + rand() * 0.06, 0.12 + rand() * 0.05);

            let scoop = envelope * (0.38 + rand() * 0.66) * scoopScale * wearScale;
            if (shape === 'rounded-ledge' && i <= 1) scoop *= 0.18 + rand() * 0.16;
            if (shape === 'worn-bay' && i === Math.floor(ts.length / 2)) scoop *= 1.18 + rand() * 0.22;
            scoop *= 0.52 + shoulderEase * 0.58;
            scoop *= 0.86 + (1 - throatEase) * 0.12;

            const neckPull = neckBell * (0.42 + rand() * (heavy ? 0.78 : 0.52)) * wearScale;
            const bayPush = bayBell * (0.28 + rand() * (heavy ? 1.08 : 0.74)) * wearScale;
            const latePush = lateBell * (0.10 + rand() * 0.42) * wearScale;
            scoop = Math.max(0.08, scoop - neckPull + bayPush + latePush);

            const roughnessGate = 0.16 + envelope * 0.84;
            const along = (rand() - 0.5) * (heavy ? 1.06 : 0.62) * wearScale * roughnessGate;
            const lateralAmplitude = (0.08 + bayBell * (heavy ? 0.42 : 0.28) + lateBell * 0.16) * (0.72 + rand() * 0.70);
            const lateral = sidePolarity * ((i % 2 === 0 ? primaryBend : secondaryBend) * lateralAmplitude + (rand() - 0.5) * 0.16) * (0.35 + envelope * 0.65);
            const tangentWave = ((i % 2 === 0 ? -1 : 1) * (0.05 + bayBell * 0.20) + (rand() - 0.5) * 0.08) * sign * sidePolarity;
            const tangentSlide = frame.tangent.x ? tangentWave : tangentWave;

            interior.push({
                x: base.x + frame.inward.x * scoop + seamPull.x * along + sideNormal.x * lateral + frame.tangent.x * tangentSlide,
                y: base.y + frame.inward.y * scoop + seamPull.y * along + sideNormal.y * lateral + frame.tangent.y * tangentSlide,
                outer: false,
                mouth: true,
                seam: true,
                rimWear: t < 0.18,
                roundBias: t < 0.22 || t > 0.70 ? 1.24 + rand() * 0.18 : 1.08 + rand() * 0.14,
                wear: (2.55 + rand() * 2.05 + (slowTaper ? 0.52 : 0) + (heavy ? 0.96 : 0) + bayBell * 0.85) * wearScale
            });
        });

        if ((shape === 'worn-bay' || heavy) && rand() < (heavy ? 0.82 : 0.48)) {
            const t = 0.48 + rand() * 0.20;
            const base = lerp(shoulder, throat, t);
            interior.push({
                x: base.x + frame.inward.x * (1.10 + rand() * (heavy ? 2.25 : 1.15)) * wearScale + frame.tangent.x * sign * (rand() - 0.5) * 0.50,
                y: base.y + frame.inward.y * (1.10 + rand() * (heavy ? 2.25 : 1.15)) * wearScale + frame.tangent.y * sign * (rand() - 0.5) * 0.50,
                outer: false,
                mouth: true,
                seam: true,
                roundBias: 1.18 + rand() * 0.14,
                wear: (3.10 + rand() * 2.20) * wearScale
            });
        }

        interior.sort((a, b) => projectAlong(shoulder, direct, a) - projectAlong(shoulder, direct, b));
        for (let i = 1; i < interior.length; i++) {
            const prevProj = projectAlong(shoulder, direct, interior[i - 1]);
            const proj = projectAlong(shoulder, direct, interior[i]);
            const minStep = 0.24 + Math.min(0.34, i * 0.024);
            if (proj < prevProj + minStep) {
                const push = prevProj + minStep - proj;
                interior[i].x += direct.x * push;
                interior[i].y += direct.y * push;
            }
        }
        const smoothed = smoothChainInterior(interior, heavy ? 2 : 1, heavy ? 0.16 : 0.13);
        pts.push(...smoothed);

        pts.push({
            ...throat,
            outer: false,
            mouth: true,
            seam: true,
            roundBias: 1.34 + rand() * 0.22,
            wear: (3.10 + rand() * 1.85 + (heavy ? 0.72 : 0)) * wearScale
        });
        return pts;
    }


    function chooseJunctionWearProfile(rand) {
        const r = rand();
        if (r < 0.46) return { name: 'small', side: 5.4 + rand() * 3.6, run: 6.6 + rand() * 4.2, throat: 1.30 + rand() * 0.92, wear: 1.08 + rand() * 0.30 };
        if (r < 0.84) return { name: 'medium', side: 7.8 + rand() * 4.6, run: 9.2 + rand() * 5.5, throat: 1.82 + rand() * 1.36, wear: 1.28 + rand() * 0.40 };
        return { name: 'large', side: 10.8 + rand() * 6.0, run: 12.6 + rand() * 6.5, throat: 2.30 + rand() * 1.76, wear: 1.50 + rand() * 0.56 };
    }

    function buildJunctionMouth(poly, hit, rand, approachDir) {
        // A secondary crack meeting an existing fracture is a rubbed stone
        // junction, not a mathematically sharp T/Y node. We shave a short,
        // unequal section from the older seam and let the new fracture emerge
        // from a rounded pocket. Size varies per junction so the wear reads as
        // accumulated handling / rocking rather than a repeated UI motif.
        const frame = edgeFrame(poly, hit);
        const profile = chooseJunctionWearProfile(rand);
        let incoming = unitVec(approachDir || frame.inward);
        if (dotVec(incoming, frame.inward) < 0) incoming = { x: -incoming.x, y: -incoming.y };
        // v265 · contact nodes should look rubbed, not snapped. Blend a little
        // more toward the host seam's inward normal so the new branch peels out
        // of a shallow worn pocket instead of leaving a hard angular hinge.
        const entryDir = blendDir(incoming, frame.inward, 0.22 + rand() * 0.16);

        const edgeAvailBefore = hit.u * frame.edgeLen;
        const edgeAvailAfter = (1 - hit.u) * frame.edgeLen;
        if (edgeAvailBefore < 4.0 || edgeAvailAfter < 4.0) return null;

        let beforePx = profile.side * (0.82 + rand() * 0.54);
        let afterPx = profile.side * (0.82 + rand() * 0.54);
        // Unequal wear is important: one fragment often rounds farther than its
        // neighbour after repeated contact.
        if (rand() < 0.5) beforePx *= 1.15 + rand() * 0.32;
        else afterPx *= 1.15 + rand() * 0.32;
        beforePx = Math.min(beforePx, edgeAvailBefore * 0.58);
        afterPx = Math.min(afterPx, edgeAvailAfter * 0.58);

        const beforeU = hit.u - beforePx / frame.edgeLen;
        const afterU = hit.u + afterPx / frame.edgeLen;
        const shoulderBefore = pointOnHitEdge(poly, hit, beforeU, {
            outer: false, seam: true, mouth: true, junction: true,
            roundBias: 1.50 + rand() * 0.26,
            wear: (3.15 + rand() * 2.75) * profile.wear
        });
        const shoulderAfter = pointOnHitEdge(poly, hit, afterU, {
            outer: false, seam: true, mouth: true, junction: true,
            roundBias: 1.50 + rand() * 0.26,
            wear: (3.15 + rand() * 2.75) * profile.wear
        });

        const run = profile.run * (0.96 + rand() * 0.30);
        const throatCenter = {
            x: hit.x + entryDir.x * run,
            y: hit.y + entryDir.y * run,
            outer: false, seam: true, mouth: true, junction: true,
            roundBias: 1.34 + rand() * 0.20,
            wear: (3.65 + rand() * 2.85) * profile.wear
        };
        let seamNormal = unitVec({ x: -entryDir.y, y: entryDir.x });
        if (dotVec(seamNormal, frame.tangent) < 0) seamNormal = { x: -seamNormal.x, y: -seamNormal.y };
        const throatHalf = profile.throat * (1.08 + rand() * 0.18);
        const throatBefore = {
            x: throatCenter.x - seamNormal.x * throatHalf,
            y: throatCenter.y - seamNormal.y * throatHalf,
            outer: false, seam: true, mouth: true, junction: true,
            roundBias: 1.34 + rand() * 0.22,
            wear: (3.85 + rand() * 2.95) * profile.wear
        };
        const throatAfter = {
            x: throatCenter.x + seamNormal.x * throatHalf,
            y: throatCenter.y + seamNormal.y * throatHalf,
            outer: false, seam: true, mouth: true, junction: true,
            roundBias: 1.34 + rand() * 0.22,
            wear: (3.85 + rand() * 2.95) * profile.wear
        };

        // Use the existing mouth curve builder, but with a compact custom
        // profile. One side can be visibly more worn than the other.
        const pseudoProfile = {
            name: profile.name === 'large' ? 'large' : 'medium',
            widthScale: 1,
            depthScale: 1,
            throatScale: 1,
            wearScale: profile.wear * (1.02 + rand() * 0.10),
            heavyChance: profile.name === 'large' ? 0.66 : 0.36
        };
        const weatheredSide = rand() < 0.5 ? 'before' : 'after';
        const beforeChain = mouthSideChain(shoulderBefore, throatBefore, frame, entryDir, rand, {
            sign: -1,
            slowTaper: profile.name !== 'small' && rand() < 0.56,
            weathered: weatheredSide === 'before',
            profile: pseudoProfile,
            shape: weatheredSide === 'before' && rand() < 0.58 ? 'worn-bay' : 'soft-scoop'
        }).map(p => ({ ...p, junction: true }));
        const afterChain = mouthSideChain(shoulderAfter, throatAfter, frame, entryDir, rand, {
            sign: 1,
            slowTaper: profile.name === 'large' || rand() < 0.42,
            weathered: weatheredSide === 'after',
            profile: pseudoProfile,
            shape: weatheredSide === 'after' && rand() < 0.58 ? 'worn-bay' : 'rounded-ledge'
        }).map(p => ({ ...p, junction: true }));

        return {
            hasMouth: true,
            isJunction: true,
            shoulderBefore, shoulderAfter,
            throatBefore, throatAfter, throatCenter,
            beforeChain, afterChain,
            entryDir,
            junctionProfile: profile.name
        };
    }

    function buildEdgeMouth(poly, hit, rand, approachDir) {
        const rawApproach = unitVec(approachDir || { x: 0, y: 1 });
        if (!hit.outer) {
            // v264 · when a new branch lands on an older seam, carve a rounded
            // variable-size contact pocket at the junction. Only fall back to a
            // point hit for non-seam internal edges.
            if (hit.seamEdge) {
                const junction = buildJunctionMouth(poly, hit, rand, rawApproach);
                if (junction) return junction;
            }
            const p = { x: hit.x, y: hit.y, outer: false, seam: true, mouth: false, wear: 1.9 };
            return {
                hasMouth: false,
                shoulderBefore: p,
                shoulderAfter: p,
                throatBefore: p,
                throatAfter: p,
                throatCenter: p,
                beforeChain: [p],
                afterChain: [p],
                entryDir: rawApproach
            };
        }

        const frame = edgeFrame(poly, hit);
        if (hit.u < 0.075 || hit.u > 0.925) return null;

        let incoming = rawApproach;
        if (dotVec(incoming, frame.inward) < 0) incoming = { x: -incoming.x, y: -incoming.y };
        const incidence = clamp(dotVec(incoming, frame.inward), 0.16, 1);
        const entryDir = blendDir(incoming, frame.inward, incidence < 0.34 ? 0.18 : 0.035);
        const tangentIncidence = dotVec(entryDir, frame.tangent);

        const profile = chooseMouthProfile(rand);
        const slowTaper = rand() < (profile.name === 'large' ? 0.72 : profile.name === 'medium' ? 0.60 : 0.48);
        const weatheredSide = rand() < 0.5 ? 'before' : 'after';
        const heavyBefore = weatheredSide === 'before' && rand() < profile.heavyChance;
        const heavyAfter = weatheredSide === 'after' && rand() < profile.heavyChance;
        const beforeShape = chooseMouthShape(rand, heavyBefore);
        let afterShape = chooseMouthShape(rand, heavyAfter);
        if (afterShape === beforeShape && rand() < 0.62) afterShape = chooseMouthShape(rand, heavyAfter);

        // Variable mouth scale: most are modest; some refreshes contain one of
        // the broader, more weathered openings visible in the reference.
        const glancing = 1 - incidence;
        const base = (4.2 + glancing * 2.3 + rand() * 1.8) * profile.widthScale;
        let beforePx = base * (0.80 + rand() * 0.34);
        let afterPx = base * (0.80 + rand() * 0.34);
        if (tangentIncidence > 0.08) afterPx *= 1 + Math.min(0.34, tangentIncidence * 0.42);
        if (tangentIncidence < -0.08) beforePx *= 1 + Math.min(0.34, -tangentIncidence * 0.42);
        if (weatheredSide === 'before') beforePx *= 1.10 + rand() * 0.22;
        else afterPx *= 1.10 + rand() * 0.22;

        const maxMouthSide = profile.name === 'large' ? 19.5 : profile.name === 'medium' ? 15.2 : 11.0;
        beforePx = clamp(beforePx, 3.6, maxMouthSide);
        afterPx = clamp(afterPx, 3.6, maxMouthSide);

        const beforeU = hit.u - beforePx / frame.edgeLen;
        const afterU = hit.u + afterPx / frame.edgeLen;
        if (beforeU <= 0.025 || afterU >= 0.975) return null;

        const shoulderBefore = pointOnHitEdge(poly, hit, beforeU);
        const shoulderAfter = pointOnHitEdge(poly, hit, afterU);

        const baseDepth = slowTaper ? (12.6 + rand() * 8.8) : (9.4 + rand() * 6.4);
        const desiredInwardDepth = baseDepth * profile.depthScale;
        const run = clamp(
            desiredInwardDepth / Math.max(0.38, dotVec(entryDir, frame.inward)),
            8.0,
            (slowTaper ? 29.0 : 21.8) * profile.depthScale
        );
        const throatCenter = {
            x: hit.x + entryDir.x * run + frame.tangent.x * (rand() - 0.5) * (profile.name === 'large' ? 1.6 : 1.0),
            y: hit.y + entryDir.y * run + frame.tangent.y * (rand() - 0.5) * (profile.name === 'large' ? 1.6 : 1.0),
            outer: false,
            mouth: true,
            seam: true,
            wear: 2.7 * profile.wearScale
        };

        let seamNormal = unitVec({ x: -entryDir.y, y: entryDir.x });
        if (dotVec(seamNormal, frame.tangent) < 0) seamNormal = { x: -seamNormal.x, y: -seamNormal.y };

        // Wider throat than v260. Large mouths also feed a visibly broader seam,
        // giving the quadratic abrasion enough physical space to show.
        const throatBase = slowTaper ? (1.58 + rand() * 1.02) : (1.34 + rand() * 0.88);
        const throatHalf = throatBase * profile.throatScale;
        const throatBefore = {
            x: throatCenter.x - seamNormal.x * throatHalf,
            y: throatCenter.y - seamNormal.y * throatHalf,
            outer: false, mouth: true, seam: true, wear: 2.8 * profile.wearScale
        };
        const throatAfter = {
            x: throatCenter.x + seamNormal.x * throatHalf,
            y: throatCenter.y + seamNormal.y * throatHalf,
            outer: false, mouth: true, seam: true, wear: 2.8 * profile.wearScale
        };

        const beforeChain = mouthSideChain(shoulderBefore, throatBefore, frame, entryDir, rand, {
            sign: -1,
            slowTaper,
            weathered: weatheredSide === 'before',
            profile,
            shape: beforeShape
        });
        const afterChain = mouthSideChain(shoulderAfter, throatAfter, frame, entryDir, rand, {
            sign: 1,
            slowTaper,
            weathered: weatheredSide === 'after',
            profile,
            shape: afterShape
        });

        return {
            hasMouth: true,
            shoulderBefore, shoulderAfter,
            throatBefore, throatAfter, throatCenter,
            beforeChain, afterChain,
            weatheredSide,
            slowTaper,
            entryDir,
            incidence,
            mouthProfile: profile.name,
            beforeShape,
            afterShape
        };
    }


    function buildFractureCenterline(start, end, rand, startEntryDir, endEntryDir) {
        const dx = end.x - start.x, dy = end.y - start.y;
        const l = Math.hypot(dx, dy) || 1;
        const ux = dx / l, uy = dy / l;
        const nx = -uy, ny = ux;
        const segments = clamp(Math.round(l / 72), 7, 14);
        const pts = [{ ...start, seam: true }];

        const startHint = unitVec(startEntryDir || { x: ux, y: uy });
        const endHintInward = unitVec(endEntryDir || { x: -ux, y: -uy });
        const mouthGuide = Math.min(24, Math.max(12, l * 0.055));

        if (segments >= 5) {
            pts.push({
                x: start.x + startHint.x * mouthGuide + nx * (rand() - 0.5) * 1.2,
                y: start.y + startHint.y * mouthGuide + ny * (rand() - 0.5) * 1.2,
                outer: false,
                seam: true
            });
        }

        let drift = 0;
        const firstI = segments >= 5 ? 2 : 1;
        for (let i = firstI; i < segments - 1; i++) {
            const t = i / segments;
            drift += (rand() - 0.5) * 4.2;
            const maxDrift = Math.min(10.5, 3.0 + l * 0.0105);
            drift = clamp(drift, -maxDrift, maxDrift);
            let kink = 0;
            if (rand() < 0.30) kink = (rand() < 0.5 ? -1 : 1) * (1.1 + rand() * 3.5);
            pts.push({
                x: start.x + dx * t + nx * (drift + kink),
                y: start.y + dy * t + ny * (drift + kink),
                outer: false,
                seam: true
            });
        }

        if (segments >= 5) {
            pts.push({
                x: end.x + endHintInward.x * mouthGuide + nx * (rand() - 0.5) * 1.2,
                y: end.y + endHintInward.y * mouthGuide + ny * (rand() - 0.5) * 1.2,
                outer: false,
                seam: true
            });
        }
        pts.push({ ...end, seam: true });
        return pts;
    }


    function localNormal(points, i) {
        const a = points[Math.max(0, i - 1)];
        const b = points[Math.min(points.length - 1, i + 1)];
        const dx = b.x - a.x, dy = b.y - a.y;
        const l = Math.hypot(dx, dy) || 1;
        return { x: -dy / l, y: dx / l, tx: dx / l, ty: dy / l };
    }

    function seamSideSignFromEndpoint(centerline, endpoint, atStart = true) {
        // v263 · derive the retreat side from the ACTUAL mouth throat geometry.
        // v261 hard-coded +1/-1 here. That assumption fails when a fracture's
        // line direction is reversed by the intersection ordering: both slab
        // boundaries can then be displaced toward the same side and visually
        // overlap, leaving only a faint doubled line instead of negative space.
        const i = atStart ? 0 : centerline.length - 1;
        const c = centerline[i];
        const n = localNormal(centerline, i);
        const vx = endpoint.x - c.x;
        const vy = endpoint.y - c.y;
        const d = vx * n.x + vy * n.y;
        if (Math.abs(d) > 0.05) return d >= 0 ? 1 : -1;

        // Extremely narrow mouths can be numerically almost centered. Sample
        // the neighbouring centerline segment as a fallback rather than making
        // the old global-direction assumption again.
        const j = atStart ? Math.min(1, centerline.length - 1) : Math.max(0, centerline.length - 2);
        const c2 = centerline[j];
        const n2 = localNormal(centerline, j);
        const d2 = (endpoint.x - c2.x) * n2.x + (endpoint.y - c2.y) * n2.y;
        return d2 >= 0 ? 1 : -1;
    }

    function seamSidesAreSeparated(centerline, sideA, sideB) {
        if (!centerline.length || !sideA.length || !sideB.length) return false;
        const probes = [
            Math.max(1, Math.floor((centerline.length - 1) * 0.30)),
            Math.max(1, Math.floor((centerline.length - 1) * 0.50)),
            Math.max(1, Math.floor((centerline.length - 1) * 0.70))
        ];
        let opposite = 0;
        let tested = 0;
        for (const i0 of probes) {
            const i = Math.min(centerline.length - 2, i0);
            if (i <= 0 || i >= sideA.length - 1 || i >= sideB.length - 1) continue;
            const c = centerline[i];
            const n = localNormal(centerline, i);
            const da = (sideA[i].x - c.x) * n.x + (sideA[i].y - c.y) * n.y;
            const db = (sideB[i].x - c.x) * n.x + (sideB[i].y - c.y) * n.y;
            if (Math.abs(da) < 0.03 || Math.abs(db) < 0.03) continue;
            tested++;
            if (da * db < 0) opposite++;
        }
        return tested === 0 || opposite >= Math.ceil(tested * 0.67);
    }

    function cosineBell(t, center, radius) {
        const d = Math.abs(t - center);
        if (d >= radius) return 0;
        const x = d / radius;
        return 0.5 + 0.5 * Math.cos(Math.PI * x);
    }

    function buildSeamGapPlan(count, rand) {
        const widths = new Array(count).fill(0);
        const contact = new Array(count).fill(0);
        const openBoost = new Array(count).fill(0);
        const n = Math.max(1, count - 1);

        let state = 1.00 + rand() * 0.92;
        for (let i = 0; i < count; i++) {
            state = clamp(state * 0.60 + (0.70 + rand() * 1.95) * 0.40, 0.60, 2.9);
            widths[i] = state;
        }

        const bayCount = rand() < 0.56 ? 2 : 1;
        for (let b = 0; b < bayCount; b++) {
            const center = 0.22 + rand() * 0.56;
            const radius = 0.10 + rand() * 0.14;
            const amp = 0.92 + rand() * 1.85;
            for (let i = 1; i < count - 1; i++) {
                const t = i / n;
                const bell = cosineBell(t, center, radius);
                openBoost[i] += bell * amp;
                widths[i] += bell * amp;
            }
        }

        const mouthPinchSeeds = [];
        if (count >= 7) {
            mouthPinchSeeds.push(clamp(1 + Math.round(rand() * 2), 1, count - 3));
            if (count >= 9) mouthPinchSeeds.push(clamp(count - 2 - Math.round(rand() * 2), 2, count - 2));
        }
        mouthPinchSeeds.forEach((idx, order) => {
            const shouldApply = order === 0 ? true : rand() < 0.78;
            if (!shouldApply) return;
            contact[idx] = Math.max(contact[idx], 0.94);
            widths[idx] = Math.min(widths[idx], 0.055 + rand() * 0.11);
            const shoulder = idx + (idx < count / 2 ? 1 : -1);
            if (shoulder > 0 && shoulder < count - 1) {
                contact[shoulder] = Math.max(contact[shoulder], 0.52);
                widths[shoulder] = Math.min(widths[shoulder], 0.22 + rand() * 0.18);
            }
            const openIdx = idx + (idx < count / 2 ? 2 : -2);
            if (openIdx > 0 && openIdx < count - 1) {
                const openAmp = 0.72 + rand() * 1.18;
                widths[openIdx] += openAmp;
                openBoost[openIdx] += openAmp;
            }
        });

        const maxContacts = count >= 12 ? 3 : count >= 8 ? 2 : 1;
        const contactCount = 1 + Math.floor(rand() * maxContacts);
        const chosen = [];
        let guard = 0;
        while (chosen.length < contactCount && guard++ < 30) {
            const idx = clamp(Math.round((0.22 + rand() * 0.56) * n), 2, count - 3);
            if (chosen.every(v => Math.abs(v - idx) >= 2)) chosen.push(idx);
        }
        if (!chosen.length && count > 4) chosen.push(Math.floor(count / 2));

        chosen.forEach(idx => {
            contact[idx] = Math.max(contact[idx], 1);
            widths[idx] = Math.min(widths[idx], 0.030 + rand() * 0.075);
            if (idx - 1 > 0) {
                contact[idx - 1] = Math.max(contact[idx - 1], 0.68);
                widths[idx - 1] = Math.min(widths[idx - 1], 0.22 + rand() * 0.22);
            }
            if (idx + 1 < count - 1) {
                contact[idx + 1] = Math.max(contact[idx + 1], 0.68);
                widths[idx + 1] = Math.min(widths[idx + 1], 0.22 + rand() * 0.22);
            }
            if (idx - 2 > 0 && rand() < 0.72) {
                contact[idx - 2] = Math.max(contact[idx - 2], 0.32);
                widths[idx - 2] *= 0.44 + rand() * 0.18;
            }
            if (idx + 2 < count - 1 && rand() < 0.72) {
                contact[idx + 2] = Math.max(contact[idx + 2], 0.32);
                widths[idx + 2] *= 0.44 + rand() * 0.18;
            }
        });

        if (count) {
            widths[0] *= 0.48;
            widths[count - 1] *= 0.48;
        }
        return { widths, contact, openBoost, contactIndices: chosen };
    }


    function buildSeamSide(centerline, sideSign, rand, startPoint, endPoint, gapPlan, sideIdentity = 0) {
        const plan = gapPlan || buildSeamGapPlan(centerline.length, rand);
        const widths = plan.widths;
        const contacts = plan.contact || [];
        const out = [];
        const abrasionMode = rand() < 0.90;
        const abrasionStrength = 0.58 + rand() * 0.78;
        const nCount = Math.max(1, centerline.length - 1);
        // Keep each face independent, but only modestly so shared contact points
        // actually meet rather than being destroyed by unrelated randomness.
        const faceBias = sideIdentity === 0 ? (0.90 + rand() * 0.18) : (0.86 + rand() * 0.24);

        for (let i = 0; i < centerline.length; i++) {
            if (i === 0) {
                out.push({ ...startPoint, outer: false, seam: true, wear: 1.65 + rand() * 1.15 });
                continue;
            }
            if (i === centerline.length - 1) {
                out.push({ ...endPoint, outer: false, seam: true, wear: 1.65 + rand() * 1.15 });
                continue;
            }

            const p = centerline[i];
            const n = localNormal(centerline, i);
            const t = i / nCount;
            const edgeProximity = Math.pow(clamp(1 - Math.min(t, 1 - t) / 0.34, 0, 1), 1.35);
            const contactness = contacts[i] || 0;
            const contactGuard = 1 - contactness * 0.965;
            const localWear = abrasionMode
                ? edgeProximity * abrasionStrength * (0.82 + rand() * 0.74) * contactGuard
                : 0;

            let asym = faceBias * (0.86 + rand() * 0.24);
            if (contactness > 0.55) asym = 0.95 + rand() * 0.06;
            const rubbed = contactness > 0.22;
            const off = Math.min(6.1, widths[i] * asym + localWear);
            const tangential = (rand() - 0.5) * (0.34 + edgeProximity * 0.24) * (1 - contactness * 0.78);
            out.push({
                x: p.x + n.x * off * sideSign + n.tx * tangential,
                y: p.y + n.y * off * sideSign + n.ty * tangential,
                outer: false,
                seam: true,
                contact: rubbed,
                roundBias: rubbed ? (1.12 + rand() * 0.18) : undefined,
                wear: contactness > 0.55
                    ? (1.24 + rand() * 1.02)
                    : rubbed
                        ? (1.58 + rand() * 1.18 + (plan.openBoost?.[i] || 0) * 0.18)
                        : (1.75 + rand() * 1.32 + edgeProximity * (1.36 + rand() * 1.66) + (plan.openBoost?.[i] || 0) * 0.54)
            });
        }
        return out;
    }


    function splitPolygonByFracture(poly, linePoint, dir, rand) {
        const hits = linePolygonIntersections(poly, linePoint, dir);
        if (hits.length < 2) return null;
        const first = hits[0], last = hits[hits.length - 1];
        if (distance(first, last) < 110) return null;

        const firstApproach = unitVec(dir);
        const lastApproach = { x: -firstApproach.x, y: -firstApproach.y };
        const firstMouth = buildEdgeMouth(poly, first, rand, firstApproach);
        const lastMouth = buildEdgeMouth(poly, last, rand, lastApproach);
        if (!firstMouth || !lastMouth) return null;

        const center = buildFractureCenterline(
            firstMouth.throatCenter,
            lastMouth.throatCenter,
            rand,
            firstMouth.entryDir,
            lastMouth.entryDir
        );

        // v263 · IMPORTANT: retreat each stone face toward its own side of the
        // fracture. Do not assume that localNormal(+1) always corresponds to the
        // `after` mouth and localNormal(-1) to `before`; intersection ordering can
        // reverse that relationship. Derive it from the actual throat points.
        const sideASign = seamSideSignFromEndpoint(center, firstMouth.throatAfter, true);
        let sideBSign = seamSideSignFromEndpoint(center, firstMouth.throatBefore, true);
        if (sideBSign === sideASign) sideBSign = -sideASign;

        const gapPlan = buildSeamGapPlan(center.length, rand);
        let sideA = buildSeamSide(center, sideASign, rand, firstMouth.throatAfter, lastMouth.throatBefore, gapPlan, 0);
        let sideB = buildSeamSide(center, sideBSign, rand, firstMouth.throatBefore, lastMouth.throatAfter, gapPlan, 1);

        // Safety check for the exact regression visible in the user's screenshot:
        // if the two generated fracture faces still land on the same side at
        // most interior probes, rebuild B on the opposite side. This preserves
        // all v261 mouth/wear parameters while guaranteeing a real gap.
        if (!seamSidesAreSeparated(center, sideA, sideB)) {
            sideBSign = -sideASign;
            sideB = buildSeamSide(center, sideBSign, rand, firstMouth.throatBefore, lastMouth.throatAfter, gapPlan, 1);
        }

        const arcA = buildArc(poly, first.edgeIndex, last.edgeIndex, firstMouth.shoulderAfter, lastMouth.shoulderBefore);
        const arcB = buildArc(poly, last.edgeIndex, first.edgeIndex, lastMouth.shoulderAfter, firstMouth.shoulderBefore);

        const polyA = [
            ...arcA,
            ...lastMouth.beforeChain.slice(1),
            ...sideA.slice(0, -1).reverse(),
            ...firstMouth.afterChain.slice(0, -1).reverse()
        ];
        const polyB = [
            ...arcB,
            ...firstMouth.beforeChain.slice(1),
            ...sideB.slice(1),
            ...lastMouth.afterChain.slice(0, -1).reverse()
        ];

        if (polyA.length < 5 || polyB.length < 5) return null;
        if (absArea(polyA) < 9000 || absArea(polyB) < 9000) return null;
        return [polyA, polyB];
    }

    function cornerAngle(prev, cur, next) {
        const ax = prev.x - cur.x, ay = prev.y - cur.y;
        const bx = next.x - cur.x, by = next.y - cur.y;
        const al = Math.hypot(ax, ay) || 1, bl = Math.hypot(bx, by) || 1;
        const dot = clamp((ax * bx + ay * by) / (al * bl), -1, 1);
        return Math.acos(dot) * 180 / Math.PI;
    }

    function chamferAndRoughen(points, rand) {
        const base = [];
        for (let i = 0; i < points.length; i++) {
            const prev = points[(i - 1 + points.length) % points.length];
            const cur = points[i];
            const next = points[(i + 1) % points.length];

            // fracture edges and mouths are already purpose-built; don't apply
            // generic noise that would turn them into busy saw-teeth.
            if (cur.outer || cur.seam || cur.mouth) {
                base.push({ ...cur });
                continue;
            }

            const angle = cornerAngle(prev, cur, next);
            const chance = angle < 112 ? 0.52 : angle < 132 ? 0.28 : 0.12;
            if (rand() < chance) {
                const cut = 3.4 + rand() * 6.0;
                base.push(
                    { ...toward(cur, prev, Math.min(cut, distance(cur, prev) * 0.18)), outer: false },
                    { ...toward(cur, next, Math.min(cut * (0.76 + rand() * 0.30), distance(cur, next) * 0.18)), outer: false }
                );
            } else base.push({ ...cur });
        }
        return base;
    }

    // v291-opt31 · REAL desktop Index Drawer outer-rim pits.
    // Desktop V291 does not render #index-drawer::before/::after; the visible
    // shell is the generated stone-fragment silhouette itself. Therefore the
    // pit must become part of this polygon BEFORE fracture partitioning.
    function buildOuterRimPitEdge(a, b, pit = null) {
        if (!pit) return [{ ...a }, { ...b }];

        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const len = Math.hypot(dx, dy) || 1;
        const nx = -dy / len;
        const ny = dx / len;
        const centerT = clamp(pit.centerT, 0.06, 0.94);
        const halfT = clamp(pit.halfT, 0.025, 0.18);
        const depth = clamp(pit.depth, 1.8, 8.8);
        const variant = pit.variant || 'shallow';
        const bias = clamp(pit.bias ?? 0, -0.85, 0.85);
        const profile = variant === 'deep'
            ? [
                [-1.38, 0.00], [-1.08, 0.02], [-0.84, 0.10], [-0.62, 0.26],
                [-0.46, 0.56], [-0.28, 0.90], [-0.12, 1.16], [0.05, 1.30],
                [0.18, 1.12], [0.34, 0.78], [0.54, 0.54], [0.76, 0.30],
                [1.00, 0.10], [1.26, 0.02], [1.42, 0.00]
            ]
            : [
                [-1.28, 0.00], [-0.96, 0.10], [-0.62, 0.34], [-0.30, 0.68],
                [-0.08, 0.94], [0.00, 1.00], [0.18, 0.82], [0.46, 0.48],
                [0.82, 0.17], [1.24, 0.00]
            ];
        const edgeReach = variant === 'deep' ? 1.42 : 1.30;
        const startT = clamp(centerT - halfT * edgeReach, 0, 1);
        const endT = clamp(centerT + halfT * edgeReach, 0, 1);
        const out = [{ ...a }];
        const makeBase = (t) => ({ x: a.x + dx * t, y: a.y + dy * t });
        if (startT > 0.002) out.push({ ...makeBase(startT), outer: true, pitShoulder: true });
        profile.forEach(([offset, weight]) => {
            const side = offset < 0 ? -1 : 1;
            const sideScale = variant === 'deep'
                ? 1 + bias * side * 0.24
                : 1 + bias * side * 0.14;
            const shiftedOffset = offset * sideScale;
            const t = clamp(centerT + shiftedOffset * halfT, startT, endT);
            const base = makeBase(t);
            const lip = variant === 'deep'
                ? (Math.abs(offset) < 0.24 ? 1.08 : 1.0)
                : 1.0;
            out.push({
                x: base.x + nx * depth * weight * lip,
                y: base.y + ny * depth * weight * lip,
                outer: true,
                pit: weight > 0.001,
                pitShoulder: weight <= 0.001,
                pitVariant: variant
            });
        });
        if (endT < 0.998) out.push({ ...makeBase(endT), outer: true, pitShoulder: true });
        out.push({ ...b });
        return out.filter((point, index, arr) => {
            if (index === 0) return true;
            const prev = arr[index - 1];
            return Math.hypot(point.x - prev.x, point.y - prev.y) > 0.12;
        });
    }

    function makeOuterRimPitPlan(w, h) {
        const pitRand = mulberry32(seed ^ hash32(`${Math.round(w)}x${Math.round(h)}-outer-rim-pits-v291-opt32-r1`));
        const plan = { left: null, top: null, right: null };
        const makePit = (segment) => {
            const isDeep = pitRand() < 0.32;
            if (segment === 'top') {
                const safe = [[0.090, 0.155], [0.845, 0.910]];
                const range = safe[Math.floor(pitRand() * safe.length)] || safe[0];
                return {
                    centerT: range[0] + pitRand() * (range[1] - range[0]),
                    halfT: isDeep ? (0.040 + pitRand() * 0.014) : (0.040 + pitRand() * 0.018),
                    depth: isDeep ? (5.6 + pitRand() * 2.6) : (2.3 + pitRand() * 1.10),
                    variant: isDeep ? 'deep' : 'shallow',
                    bias: (pitRand() - 0.5) * 1.45
                };
            }
            const safe = segment === 'left'
                ? [[0.16, 0.28], [0.74, 0.86]]
                : [[0.14, 0.26], [0.72, 0.84]];
            const range = safe[Math.floor(pitRand() * safe.length)] || safe[0];
            return {
                centerT: range[0] + pitRand() * (range[1] - range[0]),
                halfT: isDeep ? (0.070 + pitRand() * 0.022) : (0.082 + pitRand() * 0.026),
                depth: isDeep ? (5.8 + pitRand() * 2.8) : (2.5 + pitRand() * 1.20),
                variant: isDeep ? 'deep' : 'shallow',
                bias: (pitRand() - 0.5) * 1.35
            };
        };
        const roll = pitRand();
        const primary = roll < 0.50 ? 'top' : (roll < 0.75 ? 'left' : 'right');
        plan[primary] = makePit(primary);
        return plan;
    }

    function protectedTitleCrossing(points, w, h) {
        // Keep the central title bands readable for the future text-fracture pass.
        const zones = [
            { x1: w * 0.34, x2: w * 0.66, y1: h * 0.025, y2: h * 0.16 },
            { x1: w * 0.34, x2: w * 0.66, y1: h * 0.73, y2: h * 0.84 }
        ];
        return points.some(p => zones.some(z => p.x >= z.x1 && p.x <= z.x2 && p.y >= z.y1 && p.y <= z.y2));
    }

    function topMouthHitAllowed(poly, hit, w) {
        if (!hit.outer) return true;
        const a = poly[hit.edgeIndex];
        const b = poly[(hit.edgeIndex + 1) % poly.length];
        if (!a || !b) return true;
        if (hit.outer && (a.pit || b.pit)) return false;

        // Only police the long horizontal top rim. The user's marked preferred
        // regions correspond roughly to these two bands; the central title gap
        // and the far corners are kept free of edge mouths.
        const isTopHorizontal = Math.abs(a.y - b.y) < 1.2 && Math.max(Math.abs(a.y), Math.abs(b.y)) < 2.5;
        if (!isTopHorizontal) return true;
        const x = hit.x / Math.max(1, w);
        return (x >= 0.21 && x <= 0.47) || (x >= 0.57 && x <= 0.82);
    }

    function splitCell(cells, index, point, angleDeg, rand, w, h) {
        if (index < 0 || index >= cells.length) return false;
        const theta = angleDeg * Math.PI / 180;
        const dir = { x: Math.cos(theta), y: Math.sin(theta) };

        // Preview the entire candidate, not only its midpoint. Top-edge mouths
        // are accepted only in the two side bands marked by the user, and the
        // crack itself must not run through the title zones.
        const hits = linePolygonIntersections(cells[index].points, point, dir);
        if (hits.length < 2) return false;
        const firstHit = hits[0];
        const lastHit = hits[hits.length - 1];
        if (!topMouthHitAllowed(cells[index].points, firstHit, w)
            || !topMouthHitAllowed(cells[index].points, lastHit, w)) return false;

        const preview = [];
        for (let i = 0; i <= 10; i++) preview.push(lerp(firstHit, lastHit, i / 10));
        if (protectedTitleCrossing(preview, w, h)) return false;

        const result = splitPolygonByFracture(cells[index].points, point, dir, rand);
        if (!result) return false;
        const original = cells[index];
        cells.splice(index, 1,
            { id: `${original.id}-a`, points: result[0] },
            { id: `${original.id}-b`, points: result[1] }
        );
        return true;
    }

    function weightedCellIndex(cells, rand) {
        const weights = cells.map(c => Math.max(0, absArea(c.points) - 12000));
        const total = weights.reduce((a, b) => a + b, 0);
        if (total <= 0) return -1;
        let r = rand() * total;
        for (let i = 0; i < cells.length; i++) {
            r -= weights[i];
            if (r <= 0) return i;
        }
        return cells.length - 1;
    }

    function buildPartition(w, h, rand) {
        const miniDrawer = document.getElementById('ruin-mini-index-drawer');
        let leftInset = w * 0.195;
        let rightInset = w * 0.115;
        let handleH = parseFloat(
            getComputedStyle(miniDrawer || document.documentElement)
                .getPropertyValue('--mini-index-handle-h')
        ) || Math.max(28, h * 0.12);

        // v377 · Preserve the desktop fracture algorithm, but feed it the
        // authored MOBILE outer silhouette on compact screens. The previous
        // shared renderer could occasionally resolve the desktop 230/168px
        // shoulder values during startup, producing the giant X-like diagonals
        // seen across the phone drawer. Mobile now derives both shoulders from
        // the real viewport frame and the real handle height.
        const compact = false;
        if (compact) {
            const drawer = document.getElementById('ruin-mini-index-drawer');
            const frame = document.querySelector('.ruin-mini-cabinet-frame');
            const handle = document.getElementById('ruin-mini-index-handle');
            const drawerRect = drawer?.getBoundingClientRect?.();
            const frameRect = frame?.getBoundingClientRect?.();
            const handleRect = handle?.getBoundingClientRect?.();
            const maxMobileInset = Math.min(32, w * 0.12);

            const liveLeft = Number(frameRect?.left) - Number(drawerRect?.left);
            const liveRight = Number(drawerRect?.right) - Number(frameRect?.right);
            const liveHandleH = Number(handleRect?.height);

            leftInset = Number.isFinite(liveLeft) && liveLeft > 0
                ? clamp(liveLeft, 10, maxMobileInset)
                : clamp(cssNumber('--frame-left', 14), 10, maxMobileInset);

            rightInset = Number.isFinite(liveRight) && liveRight > 0
                ? clamp(liveRight, 10, maxMobileInset)
                : clamp(cssNumber('--frame-right', 14), 10, maxMobileInset);

            if (Number.isFinite(liveHandleH) && liveHandleH > 8) {
                handleH = liveHandleH;
            } else {
                handleH = clamp(handleH, 44, 60);
            }
        }

        const pitPlan = makeOuterRimPitPlan(w, h);
        const leftStart = v(0, handleH, true);
        const leftTop = v(leftInset, 0, true);
        const rightTop = v(w - rightInset, 0, true);
        const rightEnd = v(w, handleH, true);
        const leftEdge = buildOuterRimPitEdge(leftStart, leftTop, pitPlan.left);
        const topEdge = buildOuterRimPitEdge(leftTop, rightTop, pitPlan.top);
        const rightEdge = buildOuterRimPitEdge(rightTop, rightEnd, pitPlan.right);
        const silhouette = [
            ...leftEdge.slice(0, -1),
            ...topEdge.slice(0, -1),
            ...rightEdge,
            v(w, h, true),
            v(0, h, true)
        ];

        const cells = [{ id: 'slab-0', points: silhouette }];
        // v393 · Phone-sized stone rubbings keep the desktop split logic, but
        // reduce density to suit the much smaller slab: usually 1–2 seams, rarely 3.
        // Desktop keeps the original 1–4 fracture range unchanged.
        const compactFractureRoll = compact ? rand() : 0;
        const target = compact
            ? (compactFractureRoll < 0.56 ? 1 : (compactFractureRoll < 0.92 ? 2 : 3))
            : 1 + Math.floor(rand() * 4);
        let made = 0;
        let attempts = 0;

        // avoid low-angle horizontal cuts. Most stone breaks are diagonal or
        // near-vertical, with secondary cuts attaching to existing seams.
        const anglePools = [
            [42, 68], [112, 138], [78, 101],
            [36, 48], [132, 145]
        ];

        const maxAttempts = 34 + target * 12;
        while (made < target && attempts++ < maxAttempts) {
            const index = weightedCellIndex(cells, rand);
            if (index < 0) break;
            const cell = cells[index];
            const c = centroid(cell.points);
            const pool = anglePools[Math.floor(rand() * anglePools.length)];
            let angle = pool[0] + rand() * (pool[1] - pool[0]);
            if (rand() < 0.5) angle += (rand() - 0.5) * 5;

            const p = {
                x: c.x + (rand() - 0.5) * w * 0.18,
                y: clamp(c.y + (rand() - 0.5) * h * 0.18, h * 0.18, h * 0.90)
            };

            if (splitCell(cells, index, p, angle, rand, w, h)) made++;
        }

        return {
            crackCount: made,
            outerPits: pitPlan,
            cells: cells
                .filter(cell => absArea(cell.points) > 5000)
                .sort((a, b) => centroid(a.points).y - centroid(b.points).y || centroid(a.points).x - centroid(b.points).x)
                .map((cell, i) => ({ id: `stone-${i + 1}`, points: cell.points }))
        };
    }

    // v291-opt01-r1 · single frosted surface, minimal-diff edition.
    // Important: no Index Drawer layout CSS is changed. The original V291
    // .index-stone-frost-face rule is reused verbatim; only the N fragment
    // surfaces are replaced by one full-size surface carrying a union SVG mask.
    function buildFrostMaskUrl(refinedCells, w, h) {
        const polygons = refinedCells.map(cell => {
            const points = cell.points
                .map(p => `${p.x.toFixed(2)},${p.y.toFixed(2)}`)
                .join(' ');
            return `<polygon points="${points}" fill="white"/>`;
        }).join('');
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w.toFixed(2)} ${h.toFixed(2)}" preserveAspectRatio="none">${polygons}</svg>`;
        return `url("data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}")`;
    }

    function buildFrostHost(refinedCells, w, h) {
        const host = document.createElement('div');
        host.className = 'index-stone-frost-host';
        host.setAttribute('aria-hidden', 'true');

        const face = document.createElement('div');
        face.className = 'index-stone-frost-face';
        face.dataset.stoneFrostSurface = 'union';
        const mask = buildFrostMaskUrl(refinedCells, w, h);
        face.style.maskImage = mask;
        face.style.webkitMaskImage = mask;
        face.style.maskSize = '100% 100%';
        face.style.webkitMaskSize = '100% 100%';
        face.style.maskPosition = '0 0';
        face.style.webkitMaskPosition = '0 0';
        face.style.maskRepeat = 'no-repeat';
        face.style.webkitMaskRepeat = 'no-repeat';
        host.appendChild(face);
        return host;
    }

    function buildIndexImmuneFrost(drawer, drawerRect) {
        const stable = document.getElementById('ruin-mini-index-stable-zone');
        if (!stable) return null;
        const sr = stable.getBoundingClientRect();
        if (sr.width < 10 || sr.height < 10) return null;

        // v271 · Treat the lexicology area as one calm lower inscription field,
        // not merely a padded box around #index-stable-zone. The immunity veil
        // starts above the heading and feathers in vertically, then spans almost
        // the full slab width and continues to the bottom rim. This prevents a
        // diagonal seam from reappearing beside or below the last tag while the
        // 3px guard still leaves the physical outer contour visible.
        const fade = Math.max(64, Math.min(108, drawerRect.height * 0.135));
        const rimGuard = 3;
        const upperLift = Math.max(18, Math.min(34, drawerRect.height * 0.032));
        const top = Math.max(0, sr.top - drawerRect.top - fade - upperLift);
        const left = rimGuard;
        const right = rimGuard;

        // opt57 · seal the lexicology immunity field all the way to the lower
        // edge.  The old 3px bottom rim guard could expose the terminal few
        // pixels of a random stone seam, so a crack occasionally leaked out
        // beneath the last index row.  The drawer's authored outer contour is
        // rendered by its own SVG layer, therefore the immunity veil can safely
        // reach bottom:0 without erasing the physical frame line.
        const bottom = 0;

        const veil = document.createElement('div');
        veil.className = 'index-stone-crack-immunity';
        veil.setAttribute('aria-hidden', 'true');
        veil.style.top = `${top.toFixed(2)}px`;
        veil.style.left = `${left.toFixed(2)}px`;
        veil.style.right = `${right.toFixed(2)}px`;
        veil.style.bottom = `${bottom.toFixed(2)}px`;
        veil.style.setProperty('--index-immune-fade-px', `${fade.toFixed(1)}px`);
        return veil;
    }

    function ensureLayer(drawer) {
        let layer = document.getElementById(LAYER_ID);
        if (!layer) {
            layer = document.createElement('div');
            layer.id = LAYER_ID;
            layer.setAttribute('aria-hidden', 'true');
            drawer.prepend(layer);
        }
        return layer;
    }

    function render() {
        const drawer = document.getElementById('ruin-mini-index-drawer');
        if (!drawer) return;
        const compact = window.innerWidth <= 760;
        const rect = drawer.getBoundingClientRect();
        const w = rect.width, h = rect.height;
        // v393 · mobile keeps the desktop stone-partition METHOD and silhouette logic,
        // but uses a sparse fracture-count rule sized for a phone slab.
        if (w < (compact ? 260 : 400) || h < (compact ? 140 : 180)) return;

        const rand = mulberry32(seed ^ hash32(`${Math.round(w)}x${Math.round(h)}-v268`));
        const layer = ensureLayer(drawer);
        const svg = svgEl('svg', {
            viewBox: `0 0 ${w} ${h}`,
            preserveAspectRatio: 'none',
            class: 'index-stone-fragment-svg'
        });

        const partition = buildPartition(w, h, rand);
        const refinedCells = [];
        partition.cells.forEach((cell, index) => {
            const localRand = mulberry32(seed ^ hash32(cell.id) ^ (index * 0x9E3779B9));
            const refined = chamferAndRoughen(cell.points, localRand);
            refinedCells.push({
                id: cell.id,
                points: refined.map(pt => ({ ...pt }))
            });
            const path = svgEl('path', {
                d: pathD(refined),
                class: `index-stone-fragment-face index-stone-fragment-${cell.id}`,
                'data-stone-fragment': cell.id,
                'vector-effect': 'non-scaling-stroke'
            });
            path.style.setProperty('--stone-alpha', (0.84 + localRand() * 0.065).toFixed(3));
            // tiny per-face stroke variation lets near-coincident seams create
            // natural dark/light depth without a fake shadow.
            path.style.setProperty('--stone-stroke-alpha', (0.72 + localRand() * 0.15).toFixed(3));
            path.style.setProperty('--stone-stroke-width', (0.72 + localRand() * 0.16).toFixed(3));
            svg.appendChild(path);
        });

        const frostHost = buildFrostHost(refinedCells, w, h);
        const immuneVeil = compact ? null : buildIndexImmuneFrost(drawer, rect);
        if (compact) layer.replaceChildren(frostHost, svg);
        else if (immuneVeil) layer.replaceChildren(frostHost, svg, immuneVeil);
        else layer.replaceChildren(frostHost, svg);
        drawer.classList.add('index-stone-fragments-ready', 'index-stone-frosted-ready');
        drawer.dataset.stoneFragmentCount = String(partition.cells.length);
        drawer.dataset.stoneCrackCount = String(partition.crackCount);
        drawer.dataset.stoneFragmentSeed = String(seed >>> 0);
        drawer.dataset.outerRimPits = JSON.stringify(partition.outerPits || {});

        // v266 · expose the actual rendered stone polygons. The text rubbing
        // engine consumes these slab faces directly: text is allowed only where
        // a scanline intersects stone, so the complement becomes the crack mask.
        // This avoids trying to reconstruct a centerline from variable-width,
        // rounded negative seams.
        window.__indexStoneFragmentGeometry = {
            width: w,
            height: h,
            seed: seed >>> 0,
            crackCount: partition.crackCount,
            outerPits: partition.outerPits,
            cells: refinedCells,
            renderedAt: performance.now(),
            crackImmunity: immuneVeil ? {
                top: parseFloat(immuneVeil.style.top) || 0,
                left: parseFloat(immuneVeil.style.left) || 0,
                right: parseFloat(immuneVeil.style.right) || 0,
                bottom: parseFloat(immuneVeil.style.bottom) || 0
            } : null
        };
        window.dispatchEvent(new CustomEvent('index-stone-geometry-ready', {
            detail: window.__indexStoneFragmentGeometry
        }));
    }

    let raf = 0;
    let initialRenderComplete = false;
    function schedule() {
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => requestAnimationFrame(() => {
            render();
            if (window.__indexStoneFragmentGeometry) initialRenderComplete = true;
        }));
    }

    function scheduleInitialIdle() {
        if (initialRenderComplete || window.__indexStoneFragmentGeometry) {
            initialRenderComplete = true;
            return;
        }
        // opt16 · historical name retained to keep call sites stable, but this is
        // no longer an idle task. Index stone geometry belongs to critical startup.
        window.StartupIdleQueue?.cancel?.('index-stone-initial');
        schedule();
    }

    function ensureReady() {
        if (window.__indexStoneFragmentGeometry) {
            initialRenderComplete = true;
            return;
        }
        window.StartupIdleQueue?.cancel?.('index-stone-initial');
        schedule();
    }

    function install() {
        const drawer = document.getElementById('ruin-mini-index-drawer');
        if (!drawer) return;
        if (drawer.dataset.ruinMiniStoneInstalled === 'true') {
            schedule();
            return;
        }
        drawer.dataset.ruinMiniStoneInstalled = 'true';
        window.__indexStoneFragmentGeometry = null;
        // v268 · if this preview shell preserves the page context between opens,
        // force a fresh random seed unless the user explicitly supplied ?stone-seed=.
        let queryHasSeed = false;
        try {
            queryHasSeed = new URLSearchParams(location.search).has('stone-seed');
        } catch (_) {}
        if (!queryHasSeed) seed = pageSeed(true);
        window.rerollIndexStoneFragments = () => {
            seed = pageSeed(true);
            initialRenderComplete = true;
            schedule();
        };
        window.ensureIndexStoneFragmentsReady = ensureReady;
        ensureLayer(drawer);
        if ('ResizeObserver' in window) {
            const ro = new ResizeObserver(() => {
                if (initialRenderComplete || window.__indexStoneFragmentGeometry) schedule();
                else scheduleInitialIdle();
            });
            ro.observe(drawer);
        } else {
            window.addEventListener('resize', () => {
                if (initialRenderComplete || window.__indexStoneFragmentGeometry) schedule();
                else scheduleInitialIdle();
            }, { passive: true });
        }
        window.addEventListener('pageshow', (event) => {
            if (event.persisted && !queryHasSeed) {
                seed = pageSeed(true);
                schedule();
            }
        });
        document.fonts?.ready?.then(() => {
            if (initialRenderComplete || window.__indexStoneFragmentGeometry) schedule();
            else scheduleInitialIdle();
        }).catch(() => {});
        scheduleInitialIdle();
    }

    window.installRuinMiniStoneFragments = install;
    if (document.getElementById('ruin-mini-index-drawer')) install();
})();
// === RUIN MINI SOURCE STONE PORT END ===
