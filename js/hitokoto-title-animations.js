/**
 * 文件名: hitokoto-title-animations.js
 * 功能: 管理标题区域的一言API动态效果
 * 包含功能：
 * - 打字机效果动画
 * - 时间戳显示逻辑
 * - 自动刷新机制
 * - 错误恢复系统
 * 作者: 夜影
 * 版本: 2.0
 * 最后更新: 2023-12-20
 */

// ===================== 核心动画配置 ===================== 
const TYPE_DELAY = 100;    // 打字间隔(ms)
const FADE_STEP = 0.015;   // 渐隐步长(越小越慢)
const AUTO_RESET_TIME = 15_000; // 自动重置时间(ms)

let isAnimating = false;
let currentJob = null;


// 打字动画核心函数
async function typeEffect(element, text) {
    return new Promise(resolve => {
        let index = 0;
        let lastTime = 0;
        element.textContent = '';
        element.style.opacity = '1';

        const animate = (timestamp) => {
            if (!lastTime) lastTime = timestamp;
            const delta = timestamp - lastTime;

            if (delta > TYPE_DELAY) {
                if (index < text.length) {
                    element.textContent += text.charAt(index);
                    index++;
                    lastTime = timestamp;
                } else {
                    resolve();
                    return;
                }
            }
            requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
    });
}



async function reverseReset() {
    const textElement = document.getElementById('hitokoto-text');
    const fromElement = document.getElementById('hitokoto-from');
    const timeElement = document.getElementById('hitokoto-time');

    // 1. 并行清除时间和来源
    await Promise.all([
        fadeOutElement(timeElement, 0.03),
        deleteEffect(fromElement, 80)
    ]);

    // 2. 清除一言
    await deleteEffect(textElement, 80);
}

// 新增渐隐动画方法（可复用）
async function fadeOutElement(element) {
    return new Promise(resolve => {
        // 使用FADE_STEP控制速度
        let opacity = 1;
        const animate = () => {
            if (opacity > 0) {
                opacity -= FADE_STEP;
                element.style.opacity = Math.max(0, opacity).toFixed(3); // 更精确的透明度
                requestAnimationFrame(animate);
            } else {
                element.textContent = '';
                resolve();
            }
        };
        requestAnimationFrame(animate);
    });
}

// 修改后的删除效果（支持速度参数）
async function deleteEffect(element) {
    return new Promise(resolve => {
        let text = element.textContent;
        let index = text.length;
        let lastTime = 0;

        const animate = (timestamp) => {
            if (!lastTime) lastTime = timestamp;
            const delta = timestamp - lastTime;

            if (delta > TYPE_DELAY) {
                if (index >= 0) {
                    element.textContent = text.slice(0, index--);
                    lastTime = timestamp;
                } else {
                    resolve();
                    return;
                }
            }
            requestAnimationFrame(animate);
        };

        requestAnimationFrame(animate);
    });
}

// 处理一言数据
async function processHitokoto(data) {
    const textElement = document.getElementById('hitokoto-text');
    const fromElement = document.getElementById('hitokoto-from');
    const timeElement = document.getElementById('hitokoto-time');

    // 1. 显示一言
    await typeEffect(textElement, data.hitokoto);
    // 2. 同时显示来源和时间
    await Promise.all([
        typeEffect(fromElement, data.from || '未知来源'),
        (async () => {
            const date = new Date(data.created_at * 1000);
            timeElement.textContent = date.toLocaleDateString('zh-CN', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
            // 渐显动画
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
        })()
    ]);
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
        // 始终清除现有内容和计时器
        if (currentJob) {
            clearTimeout(currentJob);
        }
        currentJob = null; // 新增：强制重置计时器引用

        // 新增：无论当前状态都执行清除
        await reverseReset();

        // 获取新数据并显示
        const response = await fetch('https://v1.hitokoto.cn/');
        if (!response.ok) throw new Error('Network error');
        const data = await response.json();
        await processHitokoto(data);

        // 设置新的自动重置定时器
        currentJob = setTimeout(async () => {
            const textElement = document.getElementById('hitokoto-text'); // 新增：重新获取元素引用
            const fromElement = document.getElementById('hitokoto-from'); // 新增：重新获取元素引用

            await reverseReset();

            // 恢复默认内容时添加打字效果
            await typeEffect(textElement, textElement.dataset.original);
            await typeEffect(fromElement, fromElement.dataset.original);

            currentJob = null;
        }, AUTO_RESET_TIME);

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