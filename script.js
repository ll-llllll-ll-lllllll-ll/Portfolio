// 语言库提取
const languageVault = {
    "zh": {
        "garden_title": "废墟园林",
        "geo_title": "虚构地形学",
        "instrument_title": "儀器 Series"
    },
    "en": {
        "garden_title": "Ruin Garden",
        "geo_title": "Fictional Topography",
        "instrument_title": "the-instrument 系列"
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

    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (vault[key] && el.innerText !== vault[key]) {
            setTimeout(() => cyberDecodeTranslate(el, vault[key], 800), Math.random() * 200);
        }
    });

    document.querySelectorAll('[data-i18n-inverse]').forEach(el => {
        const key = el.getAttribute('data-i18n-inverse');
        const inverseLang = targetLang === 'zh' ? 'en' : 'zh';
        const inverseText = languageVault[inverseLang][key];

        if (inverseText && el.innerText !== inverseText) {
            setTimeout(() => cyberDecodeTranslate(el, inverseText, 800), Math.random() * 200);
        }
    });

    document.querySelectorAll('.lang-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-lang') === targetLang);
    });
}

document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        switchLanguage(e.target.getAttribute('data-lang'));
    });
});
switchLanguage('zh');

/* =========================
   全局状态与面板逻辑
========================= */
let isNested = false;
let currentSeries = null;

function enterSeries(seriesName) {
    if (isNested) return;

    currentSeries = seriesName;
    isNested = true;
    stopAutoplay(); // 进入沉浸模式，停止自动滚动与蠕动

    const panels = document.querySelectorAll('.series-panel');
    panels.forEach(panel => {
        if (panel.id === `panel-${seriesName}`) {
            panel.classList.add('expanded');
            setTimeout(() => {
                panel.scrollIntoView({ behavior: 'smooth', inline: 'center' });
            }, 100);
        } else {
            panel.style.opacity = '0.3';
            panel.style.transform = 'scale(0.9)';
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
   生命推演引擎 (缓慢蠕动 + 自动翻页 + 10秒闲置恢复)
========================= */
const slider = document.getElementById('slider');
let autoplayTimer;
let idleTimer;
let panRaf;
let isUserActive = false;
let isTransitioning = false; // 标记是否正在进行大幅度的平滑翻页

// 核心机制：重置闲置计时器
function resetIdleTimer() {
    if (isNested) return; // 如果已经进入了某个作品集的内页，不触发自动推演

    // 1. 标记用户活跃，立即停止自动推演与蠕动
    isUserActive = true;
    stopAutoplay();

    // 2. 恢复 CSS 吸附，让用户手动滑动时手感丝滑、能准确停在板块中央
    slider.style.scrollSnapType = 'x mandatory';

    // 3. 清除旧的计时器，重新开始 10 秒倒计时
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
        isUserActive = false;
        startAutoplay(); // 10秒完全无交互，重新唤醒推演引擎
    }, 10000);
}

// 监听所有代表“用户介入”的事件
['mousemove', 'mousedown', 'touchstart', 'touchmove', 'wheel', 'click'].forEach(evt => {
    slider.addEventListener(evt, resetIdleTimer, { passive: true });
});

// 引擎 1：像素级缓慢蠕动
function slowPan() {
    // 只有在：用户未介入、未进入内页、且没有在进行大幅度翻页时，才缓慢移动
    if (!isUserActive && !isNested && !isTransitioning) {
        slider.style.scrollSnapType = 'none'; // 关键修复：蠕动时必须解除吸附，否则会卡死在原地
        slider.scrollLeft += 0.5; // 蠕动速度

        // 循环检测：如果滑到了最右侧，平滑地回到开头，营造循环感
        if (slider.scrollLeft >= slider.scrollWidth - slider.clientWidth - 1) {
            isTransitioning = true;
            slider.scrollTo({ left: 0, behavior: 'smooth' });
            setTimeout(() => { isTransitioning = false; }, 1000);
        }
    }
    panRaf = requestAnimationFrame(slowPan);
}

// 引擎 2：定时大幅度丝滑切换
function startAutoplay() {
    if (!panRaf) slowPan(); // 启动蠕动

    autoplayTimer = setInterval(() => {
        if (isUserActive || isNested || isTransitioning) return;

        isTransitioning = true; // 锁定蠕动引擎，防止与翻页冲突

        // 找到当前的 scrollLeft，加上一个板块的宽度 (80vw)
        const panelWidth = window.innerWidth * 0.8;
        let nextScroll = slider.scrollLeft + panelWidth;

        // 检查是否即将滑出边界，如果是，则无缝回到第一个板块
        if (nextScroll > slider.scrollWidth - slider.clientWidth) {
            nextScroll = 0;
        }

        // 恢复吸附并平滑滚动到下一个目标
        slider.style.scrollSnapType = 'x mandatory';
        slider.scrollTo({ left: nextScroll, behavior: 'smooth' });

        // 等待平滑滚动完成后（约 800ms），重新解除吸附，把控制权交还给蠕动引擎
        setTimeout(() => {
            if (!isUserActive && !isNested) {
                slider.style.scrollSnapType = 'none';
            }
            isTransitioning = false;
        }, 800);

    }, 6000); // 每 6 秒触发一次自动翻页 (你可以根据视觉节奏自行调整)
}

function stopAutoplay() {
    clearInterval(autoplayTimer);
    if (panRaf) {
        cancelAnimationFrame(panRaf);
        panRaf = null;
    }
}

// 初始化：网站载入时设定为活跃状态（触发一次10秒等待），让用户有时间先看清第一眼
resetIdleTimer();
/* =========================
   视觉中心焦点系统 (IntersectionObserver)
========================= */

const panelObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        // 当板块超过 60% 面积进入视窗中心时，判定为活跃
        if (entry.isIntersecting) {
            entry.target.classList.add('in-view');
        } else {
            entry.target.classList.remove('in-view');
        }
    });
}, {
    root: document.getElementById('slider'),
    threshold: 0.6 // 触发阈值设定为 60%
});

document.querySelectorAll('.series-panel').forEach(panel => {
    panelObserver.observe(panel);
});