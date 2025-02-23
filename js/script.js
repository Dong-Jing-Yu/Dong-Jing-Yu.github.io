let isAnimating = false;
let currentJob = null;

// 打字动画核心函数
async function typeEffect(element, text) {
    return new Promise(resolve => {
        let index = 0;
        element.textContent = '';
        element.style.opacity = '1';

        const animate = () => {
            if (index < text.length) {
                element.textContent += text.charAt(index);
                index++;
                requestAnimationFrame(animate);
            } else {
                resolve();
            }
        };
        requestAnimationFrame(animate);
    });
}

// 删除动画核心函数
async function deleteEffect(element) {
    return new Promise(resolve => {
        let text = element.textContent;
        let index = text.length;

        const animate = () => {
            if (index >= 0) {
                element.textContent = text.slice(0, index);
                index--;
                requestAnimationFrame(animate);
            } else {
                resolve();
            }
        };
        requestAnimationFrame(animate);
    });
}

async function reverseReset() {
    const textElement = document.getElementById('hitokoto-text');
    const fromElement = document.getElementById('hitokoto-from');
    const timeElement = document.getElementById('hitokoto-time');

    // 1. 清除时间
    timeElement.style.opacity = '0';
    await new Promise(r => setTimeout(r, 300));

    // 2. 清除来源
    await deleteEffect(fromElement);

    // 3. 清除一言
    await deleteEffect(textElement);
}

// 处理一言数据
async function processHitokoto(data) {
    const textElement = document.getElementById('hitokoto-text');
    const fromElement = document.getElementById('hitokoto-from');
    const timeElement = document.getElementById('hitokoto-time');

    // 正向动画序列
    await typeEffect(textElement, data.hitokoto);
    await typeEffect(fromElement, data.from || '未知来源');

    const date = new Date(data.created_at * 1000);
    timeElement.textContent = date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });

    // 时间渐显动画
    await new Promise(resolve => {
        let opacity = 0;
        const fadeIn = () => {
            if (opacity < 1) {
                opacity += 0.1;
                timeElement.style.opacity = opacity;
                requestAnimationFrame(fadeIn);
            } else {
                resolve();
            }
        };
        fadeIn();
    });
}

// 重置到默认状态
async function resetToDefault() {
    const textElement = document.getElementById('hitokoto-text');
    const fromElement = document.getElementById('hitokoto-from');
    const timeElement = document.getElementById('hitokoto-time');

    // 隐藏时间
    timeElement.style.opacity = '0';

    // 删除现有内容
    await deleteEffect(textElement);
    await deleteEffect(fromElement);

    // 恢复默认内容
    await typeEffect(textElement, textElement.dataset.original);
    await typeEffect(fromElement, fromElement.dataset.original);
}

// 主更新函数
async function updateHitokoto() {
    if (isAnimating) return;
    isAnimating = true;

    try {
        // 清除现有计时器和动画
        if (currentJob) {
            clearTimeout(currentJob);
            currentJob = null;
            await reverseReset(); // 改为反向清除
        }

        // 获取新数据
        const response = await fetch('https://v1.hitokoto.cn/');
        if (!response.ok) throw new Error('Network error');
        const data = await response.json();

        // 处理新数据
        await processHitokoto(data);

        // 重置倒计时（10秒）
        currentJob = setTimeout(async () => {
            await reverseReset();
            await typeEffect(textElement, textElement.dataset.original);
            await typeEffect(fromElement, fromElement.dataset.original);
            currentJob = null;
        }, 10000);

    } catch (error) {
        await processHitokoto({
            hitokoto: "✨ 星链信号中断",
            from: "深空网络",
            created_at: Math.floor(Date.now() / 1000)
        });
    } finally {
        isAnimating = false;
    }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    // 获取元素引用
    const textElement = document.getElementById('hitokoto-text');
    const fromElement = document.getElementById('hitokoto-from');

    // 创建时间元素
    const timeElement = document.createElement('span');
    timeElement.id = 'hitokoto-time';
    timeElement.className = 'hitokoto-time';
    fromElement.appendChild(timeElement);

    // 设置默认内容
    textElement.dataset.original = '🌌 夜影的维度';
    fromElement.dataset.original = '在代码与星光的交界处构建数字世界';

    // 初始动画
    (async () => {
        await typeEffect(textElement, textElement.dataset.original);
        await typeEffect(fromElement, fromElement.dataset.original);
    })();

    // 点击事件绑定
    document.getElementById('hitokoto-header').addEventListener('click', updateHitokoto);

    // 自动刷新（可选）
    setInterval(() => {
        if (!isAnimating && !currentJob) {
            updateHitokoto();
        }
    }, 30000);
});