class ProfileWidgets {
    constructor() {
        this.init3DSystem();
        this.initSkillsProgress();  
        this.createSkillCloud();
    }

    init3DSystem() {
        document.querySelectorAll('.card-3d').forEach(card => {
            new Card3D(card, 14);
        });
    }

    initSkillsProgress() {
        // 获取所有进度条元素
        const progressBars = document.querySelectorAll('.progress');

        // 先重置所有进度条状态
        progressBars.forEach(progress => {
            progress.style.width = '0';
            progress.style.opacity = '0'; // 初始隐藏
        });

        // 延迟执行动画
        setTimeout(() => {
            progressBars.forEach((progress) => {
                const targetWidth = progress.style.getPropertyValue('--progress');
                const parentItem = progress.closest('.skill-item');
                const percentElement = parentItem.querySelector('.skill-percent');

                // 显示元素
                progress.style.opacity = '1';

                // 开始宽度动画
                this.animateProgress(progress, targetWidth, percentElement);
            });
        }, 500); // 适当延迟保证元素加载完成
    }

    animateProgress(progressElement, targetWidth, percentElement) {
        const duration = 1500; // 动画时长
        const startTime = Date.now();
        const startWidth = 0;
        const targetValue = parseInt(targetWidth);

        const update = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // 更新宽度
            const currentWidth = startWidth + (targetValue - startWidth) * progress;
            progressElement.style.width = `${currentWidth}%`;

            // 更新数字
            percentElement.textContent = `${Math.floor(currentWidth)}%`;

            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                // 动画完成时确保精确值
                progressElement.style.width = targetWidth;
                percentElement.textContent = `${targetValue}%`;
            }
        };

        // 强制初始布局更新
        progressElement.getBoundingClientRect();
        requestAnimationFrame(update);
    }

    createSkillCloud() {
        const cloud = document.querySelector('.skill-cloud');
        cloud.innerHTML = '';

        const skills = [
            { name: 'React', level: 90 },
            { name: 'Vue', level: 85 },
            { name: 'Node', level: 92 },
            { name: 'Docker', level: 80 },
            { name: 'K8S', level: 75 },
            { name: 'AWS', level: 88 }
        ];

        // 动态布局参数
        const CONFIG = {
            BASE_RADIUS: 0.6,
            BASE_SCALE: 0.6,
            SCALE_FACTOR: 120,
            FOLLOW_STRENGTH: 0.6
        };

        const rect = cloud.getBoundingClientRect();
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const baseRadius = Math.min(centerX, centerY) * CONFIG.BASE_RADIUS;

        const nodes = skills.map((skill, i) => ({
            x: centerX + Math.cos((i * Math.PI * 2) / skills.length) * baseRadius,
            y: centerY + Math.sin((i * Math.PI * 2) / skills.length) * baseRadius,
            radius: 4 + (skill.level / 25)
        }));

        this.resolveCollisions(nodes, 16);

        nodes.forEach((pos, i) => {
            const node = document.createElement('div');
            node.className = 'skill-node';
            const baseScale = CONFIG.BASE_SCALE + (skills[i].level / CONFIG.SCALE_FACTOR);

            node.style.cssText = `
                left: ${pos.x}px;
                top: ${pos.y}px;
                color: hsl(${(i * 60) % 360}, 70%, 75%);
                transform: 
                    translate(-50%, -50%)
                    scale(${baseScale});
                z-index: ${Math.floor(skills[i].level)};
            `;

            node.innerHTML = `
                <div class="node-core" style="animation-delay: ${i * 0.1}s"></div>
                <span>${skills[i].name}<br><em>${skills[i].level}%</em></span>
            `;

            // 增强版鼠标交互
            node.addEventListener('mousemove', (e) => {
                const rect = node.getBoundingClientRect();
                const dx = (e.clientX - rect.left - rect.width / 2) * CONFIG.FOLLOW_STRENGTH;
                const dy = (e.clientY - rect.top - rect.height / 2) * CONFIG.FOLLOW_STRENGTH;
                node.style.transform = `
                    translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px))
                    scale(${baseScale * 1.4})
                `;
            });

            node.addEventListener('mouseleave', () => {
                node.style.transform = `
                    translate(-50%, -50%)
                    scale(${baseScale})
                `;
            });

            cloud.appendChild(node);
        });

        // 优化resize处理
        const debounceResize = this.debounce(() => this.createSkillCloud(), 200);
        window.addEventListener('resize', debounceResize);
    }

    resolveCollisions(nodes, padding = 16) {
        nodes.forEach((a, i) => {
            nodes.slice(i + 1).forEach(b => {
                const dx = a.x - b.x;
                const dy = a.y - b.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const minDistance = a.radius + b.radius + padding;

                if (distance < minDistance) {
                    const adjust = (minDistance - distance) / distance * 0.6;
                    a.x += dx * adjust;
                    a.y += dy * adjust;
                    b.x -= dx * adjust;
                    b.y -= dy * adjust;
                }
            });
        });
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
        this.element.addEventListener('mousemove', this.handleMove.bind(this));
        this.element.addEventListener('mouseleave', this.handleLeave.bind(this));
    }

    handleMove(e) {
        const rect = this.element.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width - 0.5) * this.rotationRange;
        const y = ((e.clientY - rect.top) / rect.height - 0.5) * -this.rotationRange * 2;

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