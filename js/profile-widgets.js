class ProfileWidgets {
    constructor() {
        this.nodes = {
            skills: [
                { name: '量子编程', level: 92 },
                { name: '星图导航', level: 88 },
                { name: '曲速引擎', level: 95 }
            ],
            links: [
                { icon: 'github', url: 'https://github.com' },
                { icon: 'linkedin', url: '#' },
                { icon: 'rocket', url: '#' }
            ]
        };
    }

    init() {
        this.renderStarMap();
        this.renderQuantumLinks();
        this.startPulseAnimation();
    }

    renderStarMap() {
        const container = document.createElement('div');
        container.className = 'star-map';

        this.nodes.skills.forEach(skill => {
            const node = document.createElement('div');
            node.className = 'star-node';
            node.innerHTML = `
        <div class="skill-progress" 
             style="--progress: ${skill.level}%"></div>
        <span class="skill-name">${skill.name}</span>
      `;
            container.appendChild(node);
        });

        document.querySelector('.profile-box').appendChild(container);
    }

    renderQuantumLinks() {
        const container = document.createElement('div');
        container.className = 'quantum-link';

        this.nodes.links.forEach(link => {
            const anchor = document.createElement('a');
            anchor.className = 'q-link';
            anchor.href = link.url;
            anchor.target = '_blank';
            anchor.innerHTML = `
        <i class="fab fa-${link.icon}"></i>
      `;
            container.appendChild(anchor);
        });

        document.querySelector('.profile-box').appendChild(container);
    }

    startPulseAnimation() {
        const avatar = document.querySelector('.profile-image');
        let scale = 1;

        const pulse = () => {
            scale = scale === 1 ? 0.95 : 1;
            avatar.style.transform = `scale(${scale})`;
            requestAnimationFrame(pulse);
        };

        pulse();
    }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    new ProfileWidgets().init();
});