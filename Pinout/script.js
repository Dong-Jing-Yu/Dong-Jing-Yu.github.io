const esp32Board = document.getElementById('esp32Board');
const toggleThemeBtn = document.getElementById('toggleTheme');
const pinDetail = document.getElementById('pinDetail');
const pinHover = document.getElementById('pinHover');

let darkMode = false;

// ESP32 Dev Module 左右引脚（实际位置）
const pinsLeft = [
    {name:'EN', top:50}, {name:'VP', top:80}, {name:'VN', top:110},
    {name:'IO34', top:140}, {name:'IO35', top:170}, {name:'IO32', top:200},
    {name:'IO33', top:230}, {name:'IO25', top:260}, {name:'IO26', top:290},
    {name:'IO27', top:320}, {name:'IO14', top:350}, {name:'IO12', top:380},
    {name:'GND1', top:410}, {name:'IO13', top:440}, {name:'SD2', top:470},
    {name:'SD3', top:500}, {name:'CMD', top:530}, {name:'5V', top:560}
];

const pinsRight = [
    {name:'3V3', top:50}, {name:'GND2', top:80}, {name:'IO15', top:110},
    {name:'IO2', top:140}, {name:'IO0', top:170}, {name:'IO4', top:200},
    {name:'IO16', top:230}, {name:'IO17', top:260}, {name:'IO5', top:290},
    {name:'IO18', top:320}, {name:'IO19', top:350}, {name:'GND3', top:380},
    {name:'IO21', top:410}, {name:'RX2', top:440}, {name:'TX2', top:470},
    {name:'IO22', top:500}, {name:'IO23', top:530}, {name:'GND4', top:560}
];

// 创建引脚
function createPins() {
    pinsLeft.forEach(pin => {
        const div = document.createElement('div');
        div.className = 'pin pin-left';
        div.dataset.pin = pin.name;
        div.style.top = pin.top + 'px';
        div.style.left = '-45px';
        div.textContent = pin.name;
        
        // 悬浮显示文字
        div.addEventListener('mouseenter', (e)=>{
            pinHover.style.display = 'block';
            pinHover.textContent = pin.name;
        });
        div.addEventListener('mousemove', (e)=>{
            pinHover.style.top = (e.pageY + 10) + 'px';
            pinHover.style.left = (e.pageX + 10) + 'px';
        });
        div.addEventListener('mouseleave', ()=>{
            pinHover.style.display = 'none';
        });

        // 点击显示详细信息
        div.addEventListener('click', () => {
            pinDetail.textContent = `左侧引脚 ${pin.name} 的详细信息`;
        });

        esp32Board.appendChild(div);
    });

    pinsRight.forEach(pin => {
        const div = document.createElement('div');
        div.className = 'pin pin-right';
        div.dataset.pin = pin.name;
        div.style.top = pin.top + 'px';
        div.style.right = '-45px';
        div.textContent = pin.name;

        // 悬浮显示文字
        div.addEventListener('mouseenter', (e)=>{
            pinHover.style.display = 'block';
            pinHover.textContent = pin.name;
        });
        div.addEventListener('mousemove', (e)=>{
            pinHover.style.top = (e.pageY + 10) + 'px';
            pinHover.style.left = (e.pageX + 10) + 'px';
        });
        div.addEventListener('mouseleave', ()=>{
            pinHover.style.display = 'none';
        });

        // 点击显示详细信息
        div.addEventListener('click', () => {
            pinDetail.textContent = `右侧引脚 ${pin.name} 的详细信息`;
        });

        esp32Board.appendChild(div);
    });
}

// 暗黑模式切换
toggleThemeBtn.addEventListener('click', () => {
    darkMode = !darkMode;
    document.body.classList.toggle('dark', darkMode);
});

createPins();
