// 语言库提取 (新增了 ja)
const languageVault = {
    "zh": {
        "garden_title": "废墟园林",
        "geo_title": "虚构地形学",
        "instrument_title": "the-instrument 系列"
    },
    "en": {
        "garden_title": "Ruin Garden",
        "geo_title": "Fictional Topography",
        "instrument_title": "儀器 Series"
    },
    "ja": {
        "garden_title": "廃墟庭園",
        "geo_title": "架空地形学",
        "instrument_title": "the-instrument シリーズ"
    }
};

let currentLang = 'zh';

// 骇客打字机解码效果
function cyberDecodeTranslate(element, targetText, duration = 800) {
    const originalText = element.innerText;
    const originalLen = originalText.length;
    const targetLen = targetText.length;
    const startTime = performance.now();

    function updateFrame(currentTime) {
        const elapsed = currentTime - startTime;
        let progress = elapsed / duration;
        if (progress > 1) progress = 1;

        const easeProgress = 1 - Math.pow(1 - progress, 3);
        const targetCutIndex = Math.round(targetLen * easeProgress);
        const originalCutIndex = Math.round(originalLen * easeProgress);

        const currentString = targetText.substring(0, targetCutIndex) +
            originalText.substring(originalCutIndex);

        element.innerText = currentString;

        if (progress < 1) {
            requestAnimationFrame(updateFrame);
        }
    }
    requestAnimationFrame(updateFrame);
}

// 语言切换逻辑
function switchLanguage(targetLang) {
    currentLang = targetLang;
    const vault = languageVault[targetLang];
    if (!vault) return;

    // 常规翻译替换
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (vault[key] && el.innerText !== vault[key]) {
            setTimeout(() => cyberDecodeTranslate(el, vault[key], 800), Math.random() * 200);
        }
    });

    // 异化翻译替换 (针对 instrument)
    document.querySelectorAll('[data-i18n-inverse]').forEach(el => {
        const key = el.getAttribute('data-i18n-inverse');

        // 重新定义多语言环境下的“异化”逻辑：
        // 中文 -> 英文，英文 -> 中文，日文 -> 英文
        let inverseLang;
        if (targetLang === 'zh') {
            inverseLang = 'en';
        } else if (targetLang === 'en') {
            inverseLang = 'zh';
        } else {
            inverseLang = 'en';
        }

        const inverseText = languageVault[inverseLang][key];

        if (inverseText && el.innerText !== inverseText) {
            setTimeout(() => cyberDecodeTranslate(el, inverseText, 800), Math.random() * 200);
        }
    });

    // 更新按钮状态
    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-lang') === targetLang);
    });
}
// 【请将以下代码补充在这里】
// 绑定语言切换按钮的点击事件
document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        switchLanguage(e.target.getAttribute('data-lang'));
    });
});

// 初始化网站默认语言
switchLanguage('zh');
// 【补充结束】

/* =========================
   全局状态与面板逻辑
========================= */
let isNested = false;
let currentSeries = null;

function enterSeries(seriesName) {
    if (isNested) return;

    currentSeries = seriesName;
    isNested = true;
    stopAutoplay();
    document.getElementById('text-scrollbar').classList.add('hidden');

    const panels = document.querySelectorAll('.series-panel');
    panels.forEach(panel => {
        if (panel.id === `panel-${seriesName}`) {
            panel.classList.add('expanded');

            // 👇 修改这里：将原本的 100ms 延长至 400ms，等 CSS 动画起步后再平滑滚动居中
            setTimeout(() => {
                panel.scrollIntoView({ behavior: 'smooth', inline: 'center' });
            }, 400);

        } else {
            panel.style.opacity = '0.3';
            panel.style.transform = 'scale(0.9)'; /* 如果想让旁边的收缩，保留这句 */
        }
    });

    document.getElementById('breadcrumbs').classList.add('active');
    document.getElementById('current-level').innerText = seriesName.toUpperCase();
}

function goBack() {
    if (!isNested) return;

    // 如果当前停留在第3级抽屉，先收起抽屉
    const nested = document.getElementById(`nested-${currentSeries}`);
    if (nested && nested.classList.contains('show-detail')) {
        nested.classList.remove('show-detail');
    }

    // 恢复第1级画廊状态
    const panels = document.querySelectorAll('.series-panel');
    panels.forEach(panel => {
        panel.classList.remove('expanded');
        panel.style.opacity = '1';
        panel.style.transform = 'scale(1)';
    });

    document.getElementById('breadcrumbs').classList.remove('active');
    isNested = false;
    currentSeries = null;

    startAutoplay(); // 恢复全景自动推演
    // 【新增】返回外层时，恢复底栏导航
    document.getElementById('text-scrollbar').classList.remove('hidden');

    isNested = false;
    currentSeries = null;
    startAutoplay();
}

/* =========================
   第三级 抽屉系统
========================= */
function openWorkDetail(event, title, seriesId) {
    event.stopPropagation(); // 阻止冒泡，防止触发进入系列

    const nested = document.getElementById(`nested-${seriesId}`);
    if (!nested) return;

    const titleEl = nested.querySelector('.work-detail-title');
    if (titleEl) titleEl.innerText = title;

    nested.classList.add('show-detail');
    document.getElementById('current-level').innerText = `${seriesId.toUpperCase()} / ${title}`;
}

function closeWorkDetail(event, seriesId) {
    event.stopPropagation();

    const nested = document.getElementById(`nested-${seriesId}`);
    if (!nested) return;

    nested.classList.remove('show-detail');
    document.getElementById('current-level').innerText = seriesId.toUpperCase();
}
/* =========================
   单纯平移轮播引擎 (纯净版)
========================= */
const slider = document.getElementById('slider');
let autoplayTimer;
let idleTimer;
let isUserActive = false;

// 重置闲置计时器 (用户滑动、点击时暂停轮播)
function resetIdleTimer() {
    if (isNested) return; // 如果进入了作品内页，不触发轮播

    // 标记用户活跃，立即停止自动轮播
    isUserActive = true;
    stopAutoplay();

    // 重新开始 8 秒倒计时，8秒无交互则恢复自动轮播
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
        isUserActive = false;
        startAutoplay();
    }, 8000);
}

// 监听所有用户交互，一旦介入就暂停轮播
['mousemove', 'mousedown', 'touchstart', 'touchmove', 'wheel', 'click'].forEach(evt => {
    slider.addEventListener(evt, resetIdleTimer, { passive: true });
});

// 引擎：纯粹的定时平移切换
function startAutoplay() {
    stopAutoplay();

    autoplayTimer = setInterval(() => {
        if (isUserActive || isNested) return;

        // 获取所有板块并找到当前处于视窗中心的板块
        const panels = Array.from(document.querySelectorAll('.series-panel'));
        const currentPanel = panels.find(p => p.classList.contains('in-view')) || panels[0];

        // 计算下一个目标
        let nextIndex = panels.indexOf(currentPanel) + 1;
        if (nextIndex >= panels.length) {
            nextIndex = 0; // 到底了就回到第一个
        }

        // 直接依赖 CSS 的 scroll-behavior: smooth 进行平移跳转
        panels[nextIndex].scrollIntoView({ behavior: 'smooth', inline: 'center' });

    }, 6000);
}

function stopAutoplay() {
    clearInterval(autoplayTimer);
}

// 初始化时触发一次倒计时
resetIdleTimer();

/* =========================
   视觉中心焦点系统 & 底部文字导航联动
========================= */
const navTitles = document.querySelectorAll('.nav-title');

const panelObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        // 当板块超过 60% 面积进入视窗中心时
        if (entry.isIntersecting) {
            entry.target.classList.add('in-view');

            // 联动更新底部文字状态
            const targetId = entry.target.id;
            navTitles.forEach(nav => {
                if (nav.getAttribute('data-target') === targetId) {
                    nav.classList.add('active');
                } else {
                    nav.classList.remove('active');
                }
            });
        } else {
            entry.target.classList.remove('in-view');
        }
    });
}, {
    root: document.getElementById('slider'),
    threshold: 0.6
});

document.querySelectorAll('.series-panel').forEach(panel => {
    panelObserver.observe(panel);
});

/* =========================
   底部文字点击跳转联动
========================= */
navTitles.forEach(nav => {
    nav.addEventListener('click', (e) => {
        const targetId = nav.getAttribute('data-target');
        const targetPanel = document.getElementById(targetId);

        if (targetPanel) {
            resetIdleTimer(); // 用户主动点击，重置停留时间
            targetPanel.scrollIntoView({ behavior: 'smooth', inline: 'center' });
        }
    });
});