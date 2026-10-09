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
        '<div class="ruin-mini-index-handle">' +
          '<button type="button" class="ruin-mini-index-surface-trigger" aria-expanded="false" aria-label="' + escapeHtml(drawer.center) + '"></button>' +
          '<div class="ruin-mini-index-bottom-labels" aria-hidden="true">' +
            '<span>' + escapeHtml(drawer.record) + '</span>' +
            '<strong>' + escapeHtml(drawer.center) + '</strong>' +
            '<span>' + escapeHtml(drawer.garden) + '</span>' +
          '</div>' +
        '</div>' +
        '<div class="ruin-mini-index-content">' +
          '<section class="ruin-mini-index-fracture-zone">' +
            '<p class="ruin-mini-index-top-title">' + escapeHtml(drawer.intro) + '</p>' +
            '<div class="ruin-mini-index-columns"><p>' + escapeHtml(drawer.p1) + '</p><p>' + escapeHtml(drawer.p2) + '</p></div>' +
          '</section>' +
          '<section class="ruin-mini-index-stable-zone">' +
            '<div class="ruin-mini-index-title">' + escapeHtml(drawer.title) + '</div>' +
            '<p class="ruin-mini-index-lex">' + escapeHtml(drawer.lex) + '</p>' +
            '<div class="ruin-mini-index-system">' + indexRows() + '</div>' +
          '</section>' +
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


      function renderMiniIndexStone() {
        var layer = document.getElementById("ruin-mini-index-stone-layer");
        if (!layer || !indexDrawer.isConnected) return;

        var w = indexDrawer.clientWidth;
        var h = indexDrawer.clientHeight;
        if (w < 120 || h < 90) return;

        // The closed drawer occupies exactly the bottom frame rail. This makes
        // the top of the stone handle coincide with the inner-frame bottom edge.
        var handleH = Math.max(28, system.clientHeight * (95 / 820));
        var leftInset = w * 0.195;
        var rightInset = w * 0.115;
        indexDrawer.style.setProperty("--mini-index-handle-h",handleH.toFixed(2)+"px");

        var seed = hashString(
          "mini-index-stone-v3:" + fractureIteration + ":" + Math.round(w) + "x" + Math.round(h)
        );
        var rand = seededRandom(seed);

        function clampLocal(value,min,max){ return Math.max(min,Math.min(max,value)); }
        function lerpPoint(a,b,t){ return {x:a.x+(b.x-a.x)*t,y:a.y+(b.y-a.y)*t}; }
        function distance(a,b){ return Math.hypot(b.x-a.x,b.y-a.y); }
        function unit(dx,dy){
          var len=Math.hypot(dx,dy)||1;
          return {x:dx/len,y:dy/len};
        }
        function cross(a,b,p){
          return (b.x-a.x)*(p.y-a.y)-(b.y-a.y)*(p.x-a.x);
        }
        function intersect(a,b,p,q){
          var A1=b.y-a.y, B1=a.x-b.x, C1=A1*a.x+B1*a.y;
          var A2=q.y-p.y, B2=p.x-q.x, C2=A2*p.x+B2*p.y;
          var det=A1*B2-A2*B1;
          if(Math.abs(det)<1e-7) return null;
          return {x:(B2*C1-B1*C2)/det,y:(A1*C2-A2*C1)/det};
        }
        function clipHalf(poly,a,b,keepPositive){
          var out=[];
          for(var i=0;i<poly.length;i++){
            var cur=poly[i], next=poly[(i+1)%poly.length];
            var c1=cross(a,b,cur), c2=cross(a,b,next);
            var in1=keepPositive ? c1>=-0.01 : c1<=0.01;
            var in2=keepPositive ? c2>=-0.01 : c2<=0.01;
            if(in1) out.push(cur);
            if(in1!==in2){
              var hit=intersect(cur,next,a,b);
              if(hit) out.push(hit);
            }
          }
          return out;
        }
        function area(poly){
          var sum=0;
          for(var i=0;i<poly.length;i++){
            var a=poly[i],b=poly[(i+1)%poly.length];
            sum+=a.x*b.y-b.x*a.y;
          }
          return Math.abs(sum/2);
        }
        function centroid(poly){
          var x=0,y=0;
          poly.forEach(function(p){x+=p.x;y+=p.y;});
          return {x:x/poly.length,y:y/poly.length};
        }
        function lineHits(poly,a,b){
          var hits=[];
          for(var i=0;i<poly.length;i++){
            var p=poly[i],q=poly[(i+1)%poly.length];
            var hit=intersect(a,b,p,q);
            if(!hit) continue;
            var withinX=hit.x>=Math.min(p.x,q.x)-.2&&hit.x<=Math.max(p.x,q.x)+.2;
            var withinY=hit.y>=Math.min(p.y,q.y)-.2&&hit.y<=Math.max(p.y,q.y)+.2;
            if(!withinX||!withinY) continue;
            if(hits.some(function(existing){return distance(existing,hit)<.8;})) continue;
            hits.push(hit);
          }
          var d=unit(b.x-a.x,b.y-a.y);
          hits.sort(function(p,q){
            return (p.x-a.x)*d.x+(p.y-a.y)*d.y-((q.x-a.x)*d.x+(q.y-a.y)*d.y);
          });
          return hits;
        }

        // Directly adapted from the source drawer's outer-rim pit profile:
        // one real bite is cut into the slab silhouette before fracture splitting.
        function pitEdge(a,b,pit){
          if(!pit) return [a,b];
          var dx=b.x-a.x,dy=b.y-a.y,len=Math.hypot(dx,dy)||1;
          var nx=-dy/len,ny=dx/len;
          var centerT=clampLocal(pit.centerT,.06,.94);
          var halfT=clampLocal(pit.halfT,.025,.18);
          var depth=clampLocal(pit.depth,1.8,8.8);
          var profile=pit.deep
            ? [[-1.38,0],[-1.08,.02],[-.84,.10],[-.62,.26],[-.46,.56],[-.28,.90],[-.12,1.16],[.05,1.30],[.18,1.12],[.34,.78],[.54,.54],[.76,.30],[1,.10],[1.26,.02],[1.42,0]]
            : [[-1.28,0],[-.96,.10],[-.62,.34],[-.30,.68],[-.08,.94],[0,1],[.18,.82],[.46,.48],[.82,.17],[1.24,0]];
          var reach=pit.deep?1.42:1.30;
          var startT=clampLocal(centerT-halfT*reach,0,1);
          var endT=clampLocal(centerT+halfT*reach,0,1);
          var out=[a];
          function base(t){return {x:a.x+dx*t,y:a.y+dy*t};}
          if(startT>.002) out.push(base(startT));
          profile.forEach(function(pair){
            var offset=pair[0],weight=pair[1];
            var side=offset<0?-1:1;
            var sideScale=1+pit.bias*side*(pit.deep?.24:.14);
            var t=clampLocal(centerT+offset*sideScale*halfT,startT,endT);
            var p=base(t);
            var lip=pit.deep&&Math.abs(offset)<.24?1.08:1;
            out.push({x:p.x+nx*depth*weight*lip,y:p.y+ny*depth*weight*lip});
          });
          if(endT<.998) out.push(base(endT));
          out.push(b);
          return out;
        }
        function makePit(segment){
          var deep=rand()<.34;
          var safe=segment==="top"
            ? [[.09,.155],[.845,.91]]
            : segment==="left" ? [[.16,.28],[.74,.86]] : [[.14,.26],[.72,.84]];
          var range=safe[Math.floor(rand()*safe.length)]||safe[0];
          return {
            centerT:range[0]+rand()*(range[1]-range[0]),
            halfT:segment==="top"
              ? .04+rand()*(deep?.014:.018)
              : (deep?.07:.082)+rand()*(deep?.022:.026),
            depth:deep ? 5.6+rand()*2.8 : 2.3+rand()*1.2,
            deep:deep,
            bias:(rand()-.5)*1.35
          };
        }

        var pitPlan={left:null,top:null,right:null};
        var pitRoll=rand();
        var pitSide=pitRoll<.50?"top":(pitRoll<.75?"left":"right");
        pitPlan[pitSide]=makePit(pitSide);

        var leftStart={x:0,y:handleH};
        var leftTop={x:leftInset,y:0};
        var rightTop={x:w-rightInset,y:0};
        var rightEnd={x:w,y:handleH};
        var leftEdge=pitEdge(leftStart,leftTop,pitPlan.left);
        var topEdge=pitEdge(leftTop,rightTop,pitPlan.top);
        var rightEdge=pitEdge(rightTop,rightEnd,pitPlan.right);
        var shell=leftEdge.slice(0,-1)
          .concat(topEdge.slice(0,-1))
          .concat(rightEdge)
          .concat([{x:w,y:h},{x:0,y:h}]);

        var cells=[shell];
        var cracks=[];
        var target=2+Math.floor(rand()*3); // 2–4 seams in this desktop miniature.
        var anglePools=[[42,68],[112,138],[78,101],[36,48],[132,145]];
        var attempts=0;

        while(cracks.length<target&&attempts++<50){
          var targetIndex=0;
          for(var ci=1;ci<cells.length;ci++){
            if(area(cells[ci])>area(cells[targetIndex])) targetIndex=ci;
          }
          var poly=cells[targetIndex];
          var c=centroid(poly);
          var pool=anglePools[Math.floor(rand()*anglePools.length)];
          var angle=(pool[0]+rand()*(pool[1]-pool[0]))*Math.PI/180;
          var d={x:Math.cos(angle),y:Math.sin(angle)};
          var n={x:-d.y,y:d.x};
          var mid={
            x:c.x+(rand()-.5)*w*.16,
            y:clampLocal(c.y+(rand()-.5)*h*.15,h*.16,h*.90)
          };
          var len=Math.hypot(w,h)*1.4;
          var a={x:mid.x-d.x*len,y:mid.y-d.y*len};
          var b={x:mid.x+d.x*len,y:mid.y+d.y*len};
          var hits=lineHits(poly,a,b);
          if(hits.length<2) continue;
          var startHit=hits[0],endHit=hits[hits.length-1];
          if(distance(startHit,endHit)<Math.min(w,h)*.22) continue;

          var p1=clipHalf(poly,a,b,true);
          var p2=clipHalf(poly,a,b,false);
          if(p1.length<3||p2.length<3||area(p1)<w*h*.028||area(p2)<w*h*.028) continue;

          cells.splice(targetIndex,1,p1,p2);

          // Source-like fracture centreline: not perfectly straight, and each
          // seam receives a different "contact / open" rhythm.
          var crackRand=seededRandom(seed ^ ((cracks.length+1)*2654435761));
          var path=[];
          var pieces=6+Math.floor(crackRand()*4);
          var tangent=unit(endHit.x-startHit.x,endHit.y-startHit.y);
          var normal={x:-tangent.y,y:tangent.x};
          var bow=(crackRand()-.5)*Math.min(w,h)*.018;
          for(var pi=0;pi<pieces;pi++){
            var t=pi/(pieces-1);
            var envelope=Math.sin(Math.PI*t);
            var rough=(crackRand()-.5)*Math.min(w,h)*.010*envelope;
            path.push({
              x:startHit.x+(endHit.x-startHit.x)*t+normal.x*(bow*envelope+rough),
              y:startHit.y+(endHit.y-startHit.y)*t+normal.y*(bow*envelope+rough)
            });
          }

          var profileRoll=crackRand();
          var profile=profileRoll<.46?"small":profileRoll<.82?"medium":"large";
          var baseGap=profile==="large" ? 3.0+crackRand()*2.0
            : profile==="medium" ? 2.0+crackRand()*1.6
            : 1.15+crackRand()*1.0;
          var mouthWidth=profile==="large" ? 10+crackRand()*9.5
            : profile==="medium" ? 7+crackRand()*7
            : 4.2+crackRand()*4.8;
          var mouthDepth=profile==="large" ? 18+crackRand()*11
            : profile==="medium" ? 13+crackRand()*9
            : 9+crackRand()*7;

          cracks.push({
            path:path,
            baseGap:baseGap,
            mouthWidth:mouthWidth,
            mouthDepth:mouthDepth,
            profile:profile,
            phase:crackRand()*Math.PI*2,
            branches:[]
          });
        }

        // Secondary fissures: the source stele sometimes lets a main seam shed
        // a shorter branch. Keep them sparse and lighter than the structural cuts.
        cracks.forEach(function(crack, crackIndex){
          var branchRand = seededRandom(seed ^ ((crackIndex + 11) * 1597334677));
          var branchCount = branchRand() < .28 ? 0 : (branchRand() < .82 ? 1 : 2);
          for(var bi=0;bi<branchCount;bi++){
            if(crack.path.length < 4) continue;
            var anchorIndex = 1 + Math.floor(branchRand() * (crack.path.length - 2));
            var anchor = crack.path[anchorIndex];
            var before = crack.path[Math.max(0,anchorIndex-1)];
            var after = crack.path[Math.min(crack.path.length-1,anchorIndex+1)];
            var baseDir = unit(after.x-before.x,after.y-before.y);
            var sign = branchRand()<.5 ? -1 : 1;
            var angle = sign * ((24 + branchRand()*31) * Math.PI/180);
            var bd = {
              x:baseDir.x*Math.cos(angle)-baseDir.y*Math.sin(angle),
              y:baseDir.x*Math.sin(angle)+baseDir.y*Math.cos(angle)
            };
            var length = Math.min(w,h) * (.055 + branchRand()*.085);
            var segCount = 3 + Math.floor(branchRand()*3);
            var points=[{x:anchor.x,y:anchor.y}];
            var bn={x:-bd.y,y:bd.x};
            for(var bsi=1;bsi<=segCount;bsi++){
              var bt=bsi/segCount;
              var jitter=(branchRand()-.5)*Math.min(w,h)*.008*Math.sin(Math.PI*bt);
              points.push({
                x:anchor.x+bd.x*length*bt+bn.x*jitter,
                y:anchor.y+bd.y*length*bt+bn.y*jitter
              });
            }
            crack.branches.push({
              path:points,
              gap:.62+branchRand()*1.18,
              phase:branchRand()*Math.PI*2
            });
          }
        });

        function roughened(poly,index){
          var c=centroid(poly);
          return poly.map(function(p,pi){
            var local=seededRandom(seed ^ ((index+1)*2654435761) ^ ((pi+7)*2246822519));
            var inward=.35+local()*.88;
            var vx=c.x-p.x,vy=c.y-p.y,vl=Math.hypot(vx,vy)||1;
            return {x:p.x+vx/vl*inward,y:p.y+vy/vl*inward};
          });
        }

        var NS="http://www.w3.org/2000/svg";
        var svg=document.createElementNS(NS,"svg");
        svg.setAttribute("viewBox","0 0 "+w+" "+h);
        svg.setAttribute("preserveAspectRatio","none");
        svg.setAttribute("class","ruin-mini-index-stone-svg");

        var refined=cells.map(roughened);
        refined.forEach(function(poly,index){
          var path=document.createElementNS(NS,"path");
          path.setAttribute("d",poly.map(function(p,i){
            return (i?"L":"M")+p.x.toFixed(2)+" "+p.y.toFixed(2);
          }).join(" ")+" Z");
          path.setAttribute("class","ruin-mini-index-stone-face");
          path.style.setProperty("--stone-alpha",(.80+(index%4)*.023).toFixed(3));
          path.style.setProperty("--stone-stroke-alpha",(.62+(index%3)*.08).toFixed(3));
          svg.appendChild(path);
        });

        // Draw actual open fracture gaps on top of the slab faces. The width
        // varies along a single seam; ends flare into weathered mouths, closely
        // following the source's small/medium/large opening logic.
        var crackGroup=document.createElementNS(NS,"g");
        crackGroup.setAttribute("class","ruin-mini-index-open-cracks");
        cracks.forEach(function(crack,crackIndex){
          var pts=crack.path;
          for(var si=0;si<pts.length-1;si++){
            var a=pts[si],b=pts[si+1];
            var midT=(si+.5)/(pts.length-1);
            var contactWave=.56+.44*Math.abs(Math.sin(midT*Math.PI*2.2+crack.phase));
            var gap=crack.baseGap*contactWave;

            var voidLine=document.createElementNS(NS,"line");
            voidLine.setAttribute("x1",a.x.toFixed(2));
            voidLine.setAttribute("y1",a.y.toFixed(2));
            voidLine.setAttribute("x2",b.x.toFixed(2));
            voidLine.setAttribute("y2",b.y.toFixed(2));
            voidLine.setAttribute("class","ruin-mini-index-crack-void");
            voidLine.style.setProperty("--crack-gap",gap.toFixed(2)+"px");
            crackGroup.appendChild(voidLine);

            var d=unit(b.x-a.x,b.y-a.y);
            var n={x:-d.y,y:d.x};
            [-1,1].forEach(function(sign){
              var edge=document.createElementNS(NS,"line");
              edge.setAttribute("x1",(a.x+n.x*gap*.48*sign).toFixed(2));
              edge.setAttribute("y1",(a.y+n.y*gap*.48*sign).toFixed(2));
              edge.setAttribute("x2",(b.x+n.x*gap*.48*sign).toFixed(2));
              edge.setAttribute("y2",(b.y+n.y*gap*.48*sign).toFixed(2));
              edge.setAttribute("class","ruin-mini-index-crack-face");
              edge.style.setProperty("--crack-face-alpha",(0.40+((si+crackIndex)%3)*.13).toFixed(2));
              crackGroup.appendChild(edge);
            });
          }

          function addMouth(endpoint,nextPoint,isStart){
            var inward=unit(nextPoint.x-endpoint.x,nextPoint.y-endpoint.y);
            var normal={x:-inward.y,y:inward.x};
            var asym=.78+((crackIndex+isStart)%3)*.13;
            var w1=crack.mouthWidth*asym;
            var w2=crack.mouthWidth*(1.72-asym);
            var depth=crack.mouthDepth*(.88+((crackIndex+1)%3)*.09);
            var throatHalf=Math.max(.8,crack.baseGap*.58);
            var throat={x:endpoint.x+inward.x*depth,y:endpoint.y+inward.y*depth};
            var pA={x:endpoint.x+normal.x*w1,y:endpoint.y+normal.y*w1};
            var pB={x:endpoint.x-normal.x*w2,y:endpoint.y-normal.y*w2};
            var tA={x:throat.x+normal.x*throatHalf,y:throat.y+normal.y*throatHalf};
            var tB={x:throat.x-normal.x*throatHalf,y:throat.y-normal.y*throatHalf};

            var mouth=document.createElementNS(NS,"path");
            mouth.setAttribute("d",
              "M"+pA.x.toFixed(2)+" "+pA.y.toFixed(2)+
              " Q"+(lerpPoint(pA,tA,.44).x+normal.x*1.4).toFixed(2)+" "+
                   (lerpPoint(pA,tA,.44).y+normal.y*1.4).toFixed(2)+" "+
                   tA.x.toFixed(2)+" "+tA.y.toFixed(2)+
              " L"+tB.x.toFixed(2)+" "+tB.y.toFixed(2)+
              " Q"+(lerpPoint(tB,pB,.56).x-normal.x*1.2).toFixed(2)+" "+
                   (lerpPoint(tB,pB,.56).y-normal.y*1.2).toFixed(2)+" "+
                   pB.x.toFixed(2)+" "+pB.y.toFixed(2)+" Z"
            );
            mouth.setAttribute("class","ruin-mini-index-crack-mouth");
            crackGroup.appendChild(mouth);

            [[pA,tA],[pB,tB]].forEach(function(pair){
              var lip=document.createElementNS(NS,"path");
              lip.setAttribute("d","M"+pair[0].x.toFixed(2)+" "+pair[0].y.toFixed(2)+
                " Q"+lerpPoint(pair[0],pair[1],.52).x.toFixed(2)+" "+
                lerpPoint(pair[0],pair[1],.52).y.toFixed(2)+" "+
                pair[1].x.toFixed(2)+" "+pair[1].y.toFixed(2));
              lip.setAttribute("class","ruin-mini-index-crack-mouth-edge");
              crackGroup.appendChild(lip);
            });
          }

          crack.branches.forEach(function(branch){
            for(var bsi=0;bsi<branch.path.length-1;bsi++){
              var ba=branch.path[bsi], bb=branch.path[bsi+1];
              var wave=.62+.38*Math.abs(Math.sin((bsi+.5)*1.7+branch.phase));
              var branchGap=branch.gap*wave;

              var bVoid=document.createElementNS(NS,"line");
              bVoid.setAttribute("x1",ba.x.toFixed(2));
              bVoid.setAttribute("y1",ba.y.toFixed(2));
              bVoid.setAttribute("x2",bb.x.toFixed(2));
              bVoid.setAttribute("y2",bb.y.toFixed(2));
              bVoid.setAttribute("class","ruin-mini-index-crack-void ruin-mini-index-crack-branch-void");
              bVoid.style.setProperty("--crack-gap",branchGap.toFixed(2)+"px");
              crackGroup.appendChild(bVoid);

              var bEdge=document.createElementNS(NS,"line");
              bEdge.setAttribute("x1",ba.x.toFixed(2));
              bEdge.setAttribute("y1",ba.y.toFixed(2));
              bEdge.setAttribute("x2",bb.x.toFixed(2));
              bEdge.setAttribute("y2",bb.y.toFixed(2));
              bEdge.setAttribute("class","ruin-mini-index-crack-face ruin-mini-index-crack-branch-face");
              bEdge.style.setProperty("--crack-face-alpha",(0.28+((bsi+crackIndex)%3)*.09).toFixed(2));
              crackGroup.appendChild(bEdge);
            }
          });

          if(pts.length>2){
            addMouth(pts[0],pts[1],1);
            addMouth(pts[pts.length-1],pts[pts.length-2],0);
          }
        });
        svg.appendChild(crackGroup);

        // Shared rubbing mask: stone silhouette + real edge pits, with variable
        // fracture widths and flared mouths removed from the text mask.
        var maskSvg='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 '+w+' '+h+'" preserveAspectRatio="none">';
        maskSvg+='<polygon points="'+shell.map(function(p){return p.x.toFixed(2)+','+p.y.toFixed(2);}).join(' ')+'" fill="white"/>';
        cracks.forEach(function(crack){
          for(var si=0;si<crack.path.length-1;si++){
            var a=crack.path[si],b=crack.path[si+1];
            var midT=(si+.5)/(crack.path.length-1);
            var contactWave=.56+.44*Math.abs(Math.sin(midT*Math.PI*2.2+crack.phase));
            var gap=crack.baseGap*contactWave;
            maskSvg+='<line x1="'+a.x.toFixed(2)+'" y1="'+a.y.toFixed(2)+'" x2="'+b.x.toFixed(2)+'" y2="'+b.y.toFixed(2)+'" stroke="black" stroke-width="'+gap.toFixed(2)+'" stroke-linecap="round"/>';
          }
          crack.branches.forEach(function(branch){
            for(var bsi=0;bsi<branch.path.length-1;bsi++){
              var ba=branch.path[bsi],bb=branch.path[bsi+1];
              var wave=.62+.38*Math.abs(Math.sin((bsi+.5)*1.7+branch.phase));
              var branchGap=branch.gap*wave;
              maskSvg+='<line x1="'+ba.x.toFixed(2)+'" y1="'+ba.y.toFixed(2)+'" x2="'+bb.x.toFixed(2)+'" y2="'+bb.y.toFixed(2)+'" stroke="black" stroke-width="'+branchGap.toFixed(2)+'" stroke-linecap="round"/>';
            }
          });
          [0,crack.path.length-1].forEach(function(which){
            var endpoint=crack.path[which];
            var nextPoint=which===0?crack.path[1]:crack.path[crack.path.length-2];
            var inward=unit(nextPoint.x-endpoint.x,nextPoint.y-endpoint.y);
            var normal={x:-inward.y,y:inward.x};
            var depth=crack.mouthDepth;
            var throat={x:endpoint.x+inward.x*depth,y:endpoint.y+inward.y*depth};
            var mw=crack.mouthWidth;
            var th=Math.max(.8,crack.baseGap*.58);
            var mouthPts=[
              {x:endpoint.x+normal.x*mw,y:endpoint.y+normal.y*mw},
              {x:throat.x+normal.x*th,y:throat.y+normal.y*th},
              {x:throat.x-normal.x*th,y:throat.y-normal.y*th},
              {x:endpoint.x-normal.x*mw,y:endpoint.y-normal.y*mw}
            ];
            maskSvg+='<polygon points="'+mouthPts.map(function(p){return p.x.toFixed(2)+','+p.y.toFixed(2);}).join(' ')+'" fill="black"/>';
          });
        });
        maskSvg+='</svg>';
        var maskUrl='url("data:image/svg+xml;charset=utf-8,'+encodeURIComponent(maskSvg)+'")';

        layer.replaceChildren(svg);
        indexDrawer.style.setProperty("--mini-index-drawer-height",h.toFixed(2)+"px");
        indexDrawer.style.setProperty("--mini-index-stone-mask",maskUrl);
        indexDrawer.style.setProperty(
          "--mini-index-drawer-shell-clip",
          "polygon("+shell.map(function(p){return p.x.toFixed(2)+"px "+p.y.toFixed(2)+"px";}).join(", ")+")"
        );
        indexDrawer.classList.add("stone-ready");
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

      function applyIndexFilter() {
        var active = Array.from(selectedTags);
        system.querySelectorAll(".ruin-mini-archive-doc").forEach(function(doc) {
          var docTags = String(doc.dataset.tags || "").split(",").filter(Boolean);
          var match = !active.length || active.every(function(tag) { return docTags.indexOf(tag) !== -1; });
          doc.classList.toggle("index-filter-muted",!match);
        });
      }

      if (surfaceTrigger) {
        surfaceTrigger.addEventListener("click",function(event) {
          event.preventDefault();
          event.stopPropagation();
          setDrawerOpen(!indexDrawer.classList.contains("open"));
        });
      }

      indexDrawer.querySelectorAll(".ruin-mini-index-tag").forEach(function(button) {
        button.addEventListener("click",function(event) {
          event.preventDefault();
          event.stopPropagation();
          var tag = button.dataset.tag;
          if (selectedTags.has(tag)) selectedTags.delete(tag);
          else selectedTags.add(tag);
          button.classList.toggle("active",selectedTags.has(tag));
          applyIndexFilter();
        });
      });

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
          renderMiniIndexStone();

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
