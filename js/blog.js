class BlogEngine {
    constructor() {
        // 元素初始化
        this.container = document.querySelector('.blog-container');
        this.filterButtonsContainer = document.querySelector('.filter-buttons');
        this.maxExcerptLength = 150; // 摘要最大字数限制

        // 初始化检查
        if (!this.container || !this.filterButtonsContainer) {
            console.error('关键元素未找到，初始化中止');
            return;
        }

        // 状态管理
        this.posts = [];
        this.selectedCategories = new Set(['all']); // 默认选中"全部"
        this.animationObserver = null;

        // 主流程
        this.init()
            .catch(error => {
                console.error('博客引擎初始化失败:', error);
                this.showErrorMessage('知识星云暂时无法连接');
            });
    }

    async init() {
        await this.loadPosts();
        this.generateCategoryFilters();
        this.setupEventListeners();
        this.renderPosts();
        this.setupIntersectionObserver();
    }

    // ================= 数据加载 =================
    async loadPosts() {
        try {
            const response = await fetch('/data/posts.json');
            if (!response.ok) throw new Error(`HTTP错误 ${response.status}`);
            this.posts = await response.json();

            if (!Array.isArray(this.posts)) {
                throw new Error('数据格式错误：预期数组');
            }
        } catch (error) {
            console.error('文章加载失败:', error);
            this.showErrorMessage('星际数据传输中断');
            throw error;
        }
    }

    // ================= 分类过滤系统 =================
    generateCategoryFilters() {
        const allTags = this.extractUniqueTags();
        const filterButtons = this.createFilterButtons(allTags);
        this.filterButtonsContainer.innerHTML = filterButtons;
    }

    extractUniqueTags() {
        return [...new Set(
            this.posts.flatMap(post => {
                if (!post.tags || !Array.isArray(post.tags)) {
                    console.warn('文章数据缺少tags字段:', post);
                    return [];
                }
                return post.tags;
            })
        )];
    }

    createFilterButtons(tags) {
        const buttons = [
            { tag: 'all', label: '全部星域', isActive: true },
            ...tags.map(tag => ({
                tag,
                label: tag,
                isActive: false
            }))
        ];

        return buttons.map(({ tag, label }) => `
      <button class="filter-btn ${this.selectedCategories.has(tag) ? 'active' : ''}" 
              data-category="${tag}"
              aria-label="筛选 ${label} 相关文章">
        ${label}
        ${tag !== 'all' ? `<span class="tag-count">${this.getTagCount(tag)}</span>` : ''}
      </button>
    `).join('');
    }

    getTagCount(tag) {
        return this.posts.filter(post =>
            post.tags && post.tags.includes(tag)
        ).length;
    }

    // ================= 事件处理 =================
    setupEventListeners() {
        // 分类筛选事件
        this.filterButtonsContainer.addEventListener('click', (e) => {
            const button = e.target.closest('.filter-btn');
            if (!button) return;

            const category = button.dataset.category;
            this.handleCategorySelection(category, button);
        });

        // 文章点击事件
        this.container.addEventListener('click', (e) => {
            const card = e.target.closest('.article-card');
            if (card?.dataset.url) {
                window.location.href = card.dataset.url;
            }
        });

        // 窗口resize事件
        window.addEventListener('resize', this.handleWindowResize.bind(this));
    }

    handleCategorySelection(category, button) {
        // 处理"全部"选项
        if (category === 'all') {
            // 点击"全部"时清除其他所有选择
            this.selectedCategories = new Set(['all']);
            this.filterButtonsContainer.querySelectorAll('.filter-btn').forEach(b =>
                b.classList.remove('active')
            );
            button.classList.add('active');
            this.updatePosts();
            return;
        }

        // 处理普通分类
        // 当选择其他分类时，自动取消"全部"的选中状态
        this.selectedCategories.delete('all');
        this.filterButtonsContainer.querySelector('[data-category="all"]')
            .classList.remove('active');

        // 切换当前分类的选中状态
        if (this.selectedCategories.has(category)) {
            this.selectedCategories.delete(category);
            button.classList.remove('active');
        } else {
            this.selectedCategories.add(category);
            button.classList.add('active');
        }

        // 当没有选中任何分类时自动选择"全部"
        if (this.selectedCategories.size === 0) {
            this.selectedCategories.add('all');
            this.filterButtonsContainer.querySelector('[data-category="all"]')
                .classList.add('active');
        }

        this.updatePosts();
    }

    updatePosts() {
        const filtered = this.selectedCategories.has('all')
            ? this.posts // 如果选择了"全部"，显示所有文章
            : this.posts.filter(post =>
                post.tags.some(tag => this.selectedCategories.has(tag))
            );

        this.renderPosts(filtered);
    }

    // ================= 内容渲染 =================
    renderPosts(posts = this.posts) {
        try {
            this.container.innerHTML = posts
                .map(post => this.createArticleCard(post))
                .join('');
            this.setupIntersectionObserver();
        } catch (error) {
            console.error('文章渲染失败:', error);
            this.showErrorMessage('全息投影生成失败');
        }
    }

    createArticleCard(post) {
        if (!post.url) console.warn('文章缺少URL:', post);

        return `
      <article class="article-card" 
               data-url="${post.url || '#'}"
               data-tags="${post.tags?.join(',') || ''}">
        <div class="article-media">
          <img src="${post.cover || '/img/placeholder.jpg'}" 
               alt="${post.title || '未命名文章'}" 
               loading="lazy"
               class="article-cover">
        </div>
        <div class="article-content">
          <div class="article-meta">
            <time>${this.formatDate(post.date)}</time>
            <div class="tag-list">
              ${post.tags?.map(tag => `
                <span class="tag">${tag}</span>
              `).join('') || ''}
            </div>
          </div>
          <h3 class="article-title">${post.title || '未命名文章'}</h3>
          <p class="article-excerpt">
            ${this.truncateExcerpt(post.excerpt || '')}
          </p>
        </div>
        <div class="card-glow"></div>
      </article>
    `;
    }

    // ================= 工具方法 =================
    truncateExcerpt(text) {
        const maxLength = this.maxExcerptLength;
        return text.length > maxLength
            ? text.slice(0, maxLength).replace(/\s\S*$/, '...')
            : text;
    }

    formatDate(dateString) {
        try {
            return new Date(dateString).toLocaleDateString('zh-CN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
            });
        } catch {
            return '日期未知';
        }
    }

    handleWindowResize() {
        clearTimeout(this.resizeTimer);
        this.resizeTimer = setTimeout(() => {
            this.setupIntersectionObserver();
        }, 200);
    }

    // ================= 动画系统 =================
    setupIntersectionObserver() {
        if (this.animationObserver) {
            this.animationObserver.disconnect();
        }

        this.animationObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = 1;
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        document.querySelectorAll('.article-card').forEach(card => {
            card.style.opacity = 0;
            card.style.transform = 'translateY(20px)';
            card.style.transition = 'all 0.6s cubic-bezier(0.22, 1, 0.36, 1)';
            this.animationObserver.observe(card);
        });
    }

    // ================= 错误处理 =================
    showErrorMessage(message) {
        this.container.innerHTML = `
      <div class="error-state">
        <i class="fas fa-universal-access"></i>
        <p>${message}</p>
      </div>
    `;
    }
}

// ================= 初始化 =================
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('.blog-container')) {
        new BlogEngine();
    } else {
        console.log('未找到博客容器，跳过初始化');
    }
});