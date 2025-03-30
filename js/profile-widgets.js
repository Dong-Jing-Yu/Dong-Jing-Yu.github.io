class ProfileWidgets {
    // 更新后的配置
    static CONFIG = {
        PROGRESS: {
            ANIMATION_DELAY: 300,  // 优化延迟时间
            ANIMATION_DURATION: 1200
        }
    };
    constructor() {
        if (!this.checkDomElements()) return;

        this.init3DSystem();
        this.initSkillsProgress();
        this.setupEventListeners();
    }

    // 更新DOM检查
    checkDomElements() {
        const selectors = ['.card-3d', '.progress'];
        return selectors.every(selector => {
            const exists = !!document.querySelector(selector);
            !exists && console.warn(`Missing required element: ${selector}`);
            return exists;
        });
    }

    // 3D卡片系统（保留）
    init3DSystem() {
        try {
            document.querySelectorAll('.card-3d').forEach(card => {
                new Card3D(card, 14);
            });
        } catch (error) {
            console.error('3D system initialization failed:', error);
        }
    }

    // 技能进度条（保留）
    initSkillsProgress() {
        const progressBars = document.querySelectorAll('.progress');

        // 先重置所有进度条状态
        progressBars.forEach(progress => {
            progress.style.width = '0';
            progress.style.opacity = '0';
        });

        setTimeout(() => {
            progressBars.forEach(progress => {
                const parentItem = progress.closest('.skill-item');
                const percentElement = parentItem.querySelector('.skill-percent');

                // 双重数据源保障
                const targetValue = parseInt(percentElement.dataset.progress) ||
                    parseInt(progress.style.getPropertyValue('--progress')) ||
                    0;

                progress.style.opacity = '1';
                this.animateProgress(progress, targetValue, percentElement);
            });
        }, ProfileWidgets.CONFIG.PROGRESS.ANIMATION_DELAY);
    }

    // 进度条动画（保留）
    animateProgress(element, targetValue, displayElement) {
        const startTime = Date.now();
        const duration = ProfileWidgets.CONFIG.PROGRESS.ANIMATION_DURATION;

        const update = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const currentValue = Math.floor(targetValue * progress);

            // 同步更新进度条和数字
            element.style.width = `${currentValue}%`;
            displayElement.textContent = `${currentValue}%`;

            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                element.style.width = `${targetValue}%`;
                displayElement.textContent = `${targetValue}%`;
            }
        };

        // 强制布局更新
        element.getBoundingClientRect();
        requestAnimationFrame(update);
    }

    finalizeAnimation(element, value, display) {
        element.style.width = `${value}%`;
        display.textContent = `${value}%`;
    }

    // 清理不需要的方法
    setupEventListeners() {
        // 保留基础事件监听
    }

    debounce(func, wait) {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
    }
}

class Card3D {
    constructor(element, rotationRange = 14) {
        this.element = element;
        this.rotationRange = rotationRange;
        this.init();
    }

    init() {
        this.handleMove = this.handleMove.bind(this);
        this.element.addEventListener('mousemove', this.handleMove);
        this.element.addEventListener('mouseleave', this.handleLeave.bind(this));
    }

    handleMove(e) {
        const { left, top, width, height } = this.element.getBoundingClientRect();
        const x = ((e.clientX - left) / width - 0.5) * this.rotationRange;
        const y = ((e.clientY - top) / height - 0.5) * -this.rotationRange * 2;

        this.element.style.transform = `
            rotateX(${y}deg)
            rotateY(${x}deg)
            translateZ(40px)
        `;
    }

    handleLeave() {
        this.element.style.transform = 'translateZ(20px)';
    }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    new ProfileWidgets();
});