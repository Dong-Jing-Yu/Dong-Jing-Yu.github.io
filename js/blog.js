class BlogEngine {
    constructor() {
        this.container = document.querySelector('.blog-container');
        this.init();
    }

    async init() {
        await this.loadPosts();
        this.renderPosts();
        this.setupIntersectionObserver();
    }

    async loadPosts() {
        try {
            const response = await fetch('/data/posts.json');
            this.posts = await response.json();
        } catch (error) {
            console.error('Failed to load posts:', error);
        }
    }

    renderPosts() {
        this.container.innerHTML = this.posts.map(post => `
      <article class="article-card" data-id="${post.id}">
        <div class="article-media">
          <img src="${post.cover}" 
               alt="${post.title}" 
               loading="lazy"
               class="article-cover">
        </div>
        <div class="article-content">
          <div class="article-meta">
            <time>${post.date}</time>
            <div class="tag-list">
              ${post.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
          </div>
          <h3 class="article-title">${post.title}</h3>
          <p class="article-excerpt">${post.excerpt}</p>
        </div>
      </article>
    `).join('');
    }

    setupIntersectionObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = 1;
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('.article-card').forEach(card => {
            card.style.opacity = 0;
            card.style.transform = 'translateY(20px)';
            card.style.transition = 'all 0.6s cubic-bezier(0.22, 1, 0.36, 1)';
            observer.observe(card);
        });
    }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    new BlogEngine();
});