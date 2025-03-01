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
        // 延迟执行确保动画可见
        setTimeout(() => {
            document.querySelectorAll('.progress').forEach(progress => {
                const targetWidth = getComputedStyle(progress).getPropertyValue('--progress');
                progress.style.width = '0';

                // 强制重绘
                void progress.offsetWidth;

                // 应用动画
                progress.style.width = targetWidth;

                // 动态更新百分比数字
                const percentElement = progress.closest('.skill-item').querySelector('.skill-percent');
                let current = 0;
                const target = parseInt(targetWidth);
                const duration = 1200;
                const startTime = Date.now();

                const updatePercent = () => {
                    const elapsed = Date.now() - startTime;
                    const progress = Math.min(elapsed / duration, 1);
                    current = Math.floor(progress * target);
                    percentElement.textContent = `${current}%`;

                    if (progress < 1) {
                        requestAnimationFrame(updatePercent);
                    }
                };

                requestAnimationFrame(updatePercent);
            });
        }, 500);
    }

    createSkillCloud() {
        const cloud = document.querySelector('.skill-cloud');
        const skills = ['React', 'Vue', 'Node', 'Docker', 'K8S', 'AWS'];
        const centerX = cloud.offsetWidth / 2;
        const centerY = cloud.offsetHeight / 2;
        const radius = 140;

        skills.forEach((skill, index) => {
            const angle = (index * Math.PI * 2) / skills.length;
            const node = document.createElement('div');
            node.className = 'skill-node';

            const x = centerX + Math.cos(angle) * radius - 20;
            const y = centerY + Math.sin(angle) * radius - 20;

            node.style.cssText = `
                left: ${x}px;
                top: ${y}px;
                color: hsl(${(index * 60) % 360}, 70%, 75%);
            `;
            node.innerHTML = `
                <div class="node-core"></div>
                <span>${skill}</span>
            `;
            cloud.appendChild(node);
        });
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