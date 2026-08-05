document.addEventListener('DOMContentLoaded', () => {
    // 获取所有的动态卡片
    const postCards = document.querySelectorAll('.post-card');

    postCards.forEach(card => {
        // ---- 独立点赞系统逻辑 ----
        const likeBtn = card.querySelector('.like-btn');
        const heartIcon = card.querySelector('.heart-icon');
        const likeCountSpan = card.querySelector('.like-count');

        // 自动读取HTML里设置的初始点赞数并转成数字
        let currentLikes = parseInt(likeCountSpan.textContent.replace(/,/g, '')) || 0;
        let isLiked = false;

        likeBtn.addEventListener('click', () => {
            isLiked = !isLiked;

            if (isLiked) {
                currentLikes++;
                likeBtn.classList.add('liked');
                heartIcon.classList.replace('far', 'fas');

                // --- 新增：触发点击后的全屏动画 ---
                // 1. 创建一个新的临时 div 元素
                const popIcon = document.createElement('div');
                // 2. 将 CSS 中定义好的动画样式添加给它
                popIcon.classList.add('like-pop-animation');

                // 3. 将这个新元素添加到 body（网页最外层）中
                document.body.appendChild(popIcon);

                // 4. 设置一个定时器，在动画播放完毕后（1.5秒）自动将该元素从网页中移除
                setTimeout(() => {
                    popIcon.remove();
                }, 1500); // 1500毫秒 = 1.5秒，需与 CSS 动画时间一致

            } else {
                currentLikes--;
                likeBtn.classList.remove('liked');
                heartIcon.classList.replace('fas', 'far');
            }

            likeCountSpan.textContent = currentLikes.toLocaleString();
        });

        // ---- 独立评论系统逻辑 ----
        const commentBtn = card.querySelector('.comment-btn');
        const commentForm = card.querySelector('.comment-form');
        const commentInput = card.querySelector('.comment-input');
        const commentList = card.querySelector('.comment-list');

        // 点击外面的评论按钮，让输入框自动聚焦
        commentBtn.addEventListener('click', () => {
            commentInput.focus();
        });

        commentForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const text = commentInput.value.trim();
            if (text === '') return;

            const newLi = document.createElement('li');
            newLi.innerHTML = `<strong>路过小猫:</strong> ${text}`;

            commentList.appendChild(newLi);
            commentInput.value = '';
        });
    });
});