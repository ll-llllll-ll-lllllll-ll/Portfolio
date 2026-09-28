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
    "这个日历不记录行程，只记录天空、水面与天气。“海之日”“云之日”“湖之日”“天之日”并不是节日，而是把某一天轻轻交给一种景象。每次进入这里，首页只留下大约二十秒的风景：湖边的风、海面、云层，或从高处望见的天。",
    "我把这些短片看作香水店里放在一众香水旁的一小碟咖啡豆。咖啡豆本身并非真正“无味”——它仍然有苦味与焦香；但在高浓度气味不断叠加的环境里，它承担了一种重新校准感官的作用。这里所谓的“纯净”也不是空白，而是一枚纯净锚点：在现代生活过量的信息、图像、情绪与判断之间，让观看暂时退回到被解释、命名和要求之前。对我而言，天空、海洋、湖泊与云层就是这样的锚点。",
    "我并不希望艺术只是继续增加观看者的压力与内耗。艺术当然可以指向不公、提出问题，也值得引发讨论；但讨论不必以撕裂本身为目的，它仍可以建立在对更好结果的相信之上。因此，我更愿意把创作看作对“纯粹之物”的回应：保留人在经历复杂世界之后，仍能被简单的美触动的能力。看过作品以后，也可以回到这里——像漫长的探索最终回到火堆旁。所谓纯粹的心灵，并不是从未见过复杂，而是在复杂之后，仍愿意抬头看一眼天空。"
  ],
  en: [
    "This calendar does not keep appointments. It keeps sky, water and weather. A day of the sea, clouds, lake or sky is not a holiday, but a way of quietly giving one day to one kind of view. Each visit leaves only a short landscape on the homepage: wind beside a lake, the surface of the sea, a bank of clouds, or the sky seen from high above.",
    "I think of these films as the small dish of coffee beans sometimes placed among perfumes. Coffee is not truly neutral—it carries bitterness and roast of its own—but amid layers of concentrated scent it can serve as a point of recalibration. The “purity” here is similar. It is not emptiness, but a pure anchor: a stable reference within the excess of information, images, emotion and judgement that shapes modern life, allowing perception to return for a moment to something before explanation, naming and demand. For me, sky, sea, lake and cloud can hold that role.",
    "I do not want art merely to add pressure or another layer of inner friction. Art can of course address injustice, raise difficult questions and provoke debate; but debate need not treat rupture as an end in itself. It can still begin from a belief that something better is possible. I would rather understand my work as a response to simple, irreducible things: a way of preserving our ability to be moved by beauty after passing through a complicated world. After looking through the work, one can return here as to a small fire after a long exploration. A pure mind is not one that has never encountered complexity, but one that can still look up at the sky after it."
  ],
  ja: [
    "このカレンダーは予定ではなく、空、水面、天気を記録する。「海の日」「雲の日」「湖の日」「空の日」は祝日ではなく、一日をひとつの景色へそっと渡すための名前だ。ここを訪れるたび、湖畔の風、海面、雲、高い場所から見た空など、およそ二十秒の風景だけがホームに残る。",
    "私はこれらの短い映像を、香水店で多くの香りのそばに置かれる小皿のコーヒー豆のように考えている。コーヒー豆は本当の意味で「無臭」ではない。苦味や焦げた香りを自分自身のうちに持っている。それでも濃い香りが重なり続ける環境では、感覚をいったん調整し直すための基準になりうる。ここでいう「純粋」も空白ではなく、ひとつの純粋な錨である。情報、イメージ、感情、判断が過剰に重なる現代生活のなかで、見ることを一瞬だけ、説明され、名づけられ、要求される以前へ戻すための基準。私にとって、空、海、湖、雲がその役割を担う。",
    "私は、芸術が見る人にさらに圧力や内耗を加えるだけのものにはなってほしくない。不公正を示し、問いを立て、議論を呼び起こすことはもちろん芸術の役割になりうる。しかし議論は、亀裂そのものを目的にする必要はなく、よりよい結果を信じることから始めることもできる。だから私は制作を、より単純で純粋なものへの応答として考えたい。複雑な世界を通ったあとにも、なお美しさに動かされる力を残しておくために。作品を見たあと、長い探索の果てに焚き火へ戻るように、またここへ帰ってこられる。純粋な心とは、複雑さを知らない心ではなく、複雑さのあとでも空を見上げることのできる心だ。"
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
      if (themeMeta) themeMeta.setAttribute("content", "#080a09");
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
    var list = item && item.group === "collection" ? collections : works;
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

  function addRippleHallucination(item) {
    if (!item || item.slug !== "room-by-the-lake") return;

    var firstFrame = document.querySelector(".room-image");
    if (!firstFrame || firstFrame.querySelector(".room-image-ripple")) return;

    firstFrame.classList.add("has-ripple-hallucination");

    var reduceMotion = false;
    try {
      reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    } catch (_) {}

    var video = document.createElement("video");
    video.className = "room-image-ripple";
    video.autoplay = !reduceMotion;
    video.defaultMuted = true;
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.controls = false;
    video.preload = "auto";
    video.disablePictureInPicture = true;
    video.setAttribute("muted", "");
    video.setAttribute("playsinline", "");
    video.setAttribute("webkit-playsinline", "");
    video.setAttribute("disablepictureinpicture", "");
    video.setAttribute("aria-hidden", "true");
    video.setAttribute("tabindex", "-1");

    var sources = [
      "https://videos.pexels.com/video-files/5678004/5678004-sd_640_360_30fps.mp4",
      "https://videos.pexels.com/video-files/5678004/5678004-uhd_4096_2160_30fps.mp4"
    ];

    sources.forEach(function (src) {
      var sourceNode = document.createElement("source");
      sourceNode.src = src;
      sourceNode.type = "video/mp4";
      video.appendChild(sourceNode);
    });

    var veil = document.createElement("span");
    veil.className = "room-image-ripple-veil";
    veil.setAttribute("aria-hidden", "true");

    firstFrame.insertBefore(video, firstFrame.firstChild);
    firstFrame.insertBefore(veil, firstFrame.querySelector("img"));

    function markPlaying() {
      firstFrame.classList.add("is-ripple-playing");
      firstFrame.classList.remove("is-ripple-blocked");
    }

    function markBlocked() {
      if (!video.paused) return;
      firstFrame.classList.add("is-ripple-blocked");
    }

    function tryPlay() {
      if (reduceMotion || !document.documentElement.contains(video)) return;
      video.muted = true;
      var promise;
      try {
        promise = video.play();
      } catch (_) {
        markBlocked();
        return;
      }
      if (promise && typeof promise.catch === "function") {
        promise.catch(markBlocked);
      }
    }

    video.addEventListener("playing", markPlaying);
    video.addEventListener("loadeddata", function () {
      if (!reduceMotion) tryPlay();
    });
    video.addEventListener("error", markBlocked);
    video.addEventListener("stalled", markBlocked);

    if ("IntersectionObserver" in window) {
      var visibilityObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting && entry.intersectionRatio > 0.05) {
            tryPlay();
          } else if (!video.paused) {
            video.pause();
          }
        });
      }, { threshold: [0, 0.05, 0.25] });
      visibilityObserver.observe(firstFrame);
    } else {
      tryPlay();
    }
  }

  function refineCurrentView() {
    repairAmbientCalendarVideo();

    var item = parseRoute();
    var roomView = document.querySelector(".room-view");
    if (!item || !roomView) return;

    roomView.dataset.room = item.slug;
    roomView.dataset.group = item.group;
    updateFooterNavigation(item);
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
    var rippleVideo = document.querySelector(".room-image-ripple");
    if (rippleVideo) tryPlayVideo(rippleVideo);
  }

  document.addEventListener("pointerdown", resumeMediaAfterGesture, { passive: true, capture: true });
  document.addEventListener("touchstart", resumeMediaAfterGesture, { passive: true, capture: true });
  document.addEventListener("visibilitychange", function () {
    if (!document.hidden) repairAmbientCalendarVideo();
  });

  render();
  requestAnimationFrame(refineCurrentView);
})();
