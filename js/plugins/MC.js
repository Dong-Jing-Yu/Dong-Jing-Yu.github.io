// MC.js - 修复后的完整代码
document.addEventListener('DOMContentLoaded', function () {
    // ======================
    // 服务器过滤功能
    // ======================
    const filterButtons = document.querySelectorAll('.filter-button');
    const serverCards = document.querySelectorAll('.server-card');

    filterButtons.forEach(button => {
        button.addEventListener('click', function () {
            // 更新激活状态
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');

            // 获取过滤类型
            const filterType = this.dataset.filter;

            // 过滤显示逻辑
            serverCards.forEach(card => {
                const showCard = filterType === 'all' ||
                    card.dataset.type.split(' ').includes(filterType);
                card.style.display = showCard ? 'block' : 'none';
            });
        });
    });

    // ======================
    // 标签切换功能（修复版）
    // ======================
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', function () {
            // 限定在当前服务器卡片内操作
            const serverCard = this.closest('.server-card');

            // 切换标签状态
            serverCard.querySelectorAll('.tab').forEach(t => {
                t.classList.remove('active');
            });
            this.classList.add('active');

            // 切换对应内容
            const targetId = this.dataset.tab;
            serverCard.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            serverCard.querySelector(`#${targetId}`).classList.add('active');
        });
    });

    // ======================
    // 复制IP功能（现代版）
    // ======================
    document.querySelectorAll('.copy-button').forEach(button => {
        button.addEventListener('click', async function () {
            try {
                const ip = this.previousElementSibling.textContent.trim();
                await navigator.clipboard.writeText(ip);

                // 视觉反馈
                const originalText = this.textContent;
                this.textContent = '✅ 已复制';
                this.style.backgroundColor = 'var(--success)';

                setTimeout(() => {
                    this.textContent = originalText;
                    this.style.backgroundColor = 'var(--accent)';
                }, 1500);
            } catch (err) {
                console.error('复制失败:', err);
                this.textContent = '❌ 复制失败';
                setTimeout(() => {
                    this.textContent = '复制IP';
                }, 1500);
            }
        });
    });

    // ======================
    // 下载功能（真实下载）
    // ======================
    document.querySelectorAll('.download-button').forEach(button => {
        button.addEventListener('click', function () {
            const url = this.dataset.downloadUrl;
            if (!url) {
                console.warn('缺少下载链接');
                return;
            }

            // 创建隐藏的下载链接
            const link = document.createElement('a');
            link.href = url;
            link.download = true;
            link.style.display = 'none';

            // 触发下载
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            // 视觉反馈
            const originalText = this.textContent;
            this.textContent = '⏳ 下载中...';
            this.disabled = true;

            setTimeout(() => {
                this.textContent = originalText;
                this.disabled = false;
            }, 2000);
        });
    });

    // ======================
    // 搜索功能
    // ======================
    const searchBox = document.querySelector('.search-box');
    if (searchBox) {
        searchBox.addEventListener('input', function () {
            const term = this.value.trim().toLowerCase();

            serverCards.forEach(card => {
                const visible = Array.from(card.querySelectorAll('.server-name, .tab-content'))
                    .some(element => element.textContent.toLowerCase().includes(term));

                card.style.display = visible ? 'block' : 'none';
            });
        });
    }

    // ======================
    // 悬停动画效果
    // ======================
    serverCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-10px) scale(1.02)';
            card.style.zIndex = '10';
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
            card.style.zIndex = '';
        });
    });
});