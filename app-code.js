class EmoMonsterApp {
  constructor() {
    this.canvas = document.getElementById('canvas');
    this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });
    this.elements = [];
    this.compositeColor = '#ffffff';
    
    // 設置 Canvas DPI
    const dpr = window.devicePixelRatio || 1;
    this.canvas.width = 640 * dpr;
    this.canvas.height = 480 * dpr;
    this.ctx.scale(dpr, dpr);
    
    console.log('✓ Canvas 初始化成功', 640, 480, 'DPI:', dpr);
    this.init();
  }

  init() {
    document.querySelectorAll('.emotion-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const color = btn.dataset.color;
        console.log('點擊按鈕，顏色:', color);
        this.addEmotion(color);
      });
    });
    document.getElementById('exportBtn').addEventListener('click', () => this.exportPNG());
    document.getElementById('clearBtn').addEventListener('click', () => this.clear());
    this.draw();
  }

  addEmotion(color) {
    const x = 320; // Canvas 中心 (640/2)
    const y = 240; // Canvas 中心 (480/2)
    this.elements.push({ x, y, color });
    console.log('添加顏色:', color, '總數:', this.elements.length);
    this.draw();
  }

  draw() {
    console.log('開始繪製，元素數:', this.elements.length);
    
    // 清空背景
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillRect(0, 0, 640, 480);
    
    // 繪製圓形
    this.ctx.globalCompositeOperation = 'lighter';
    this.elements.forEach((el, i) => {
      console.log('繪製圓形', i, '顏色:', el.color, '位置:', el.x, el.y);
      this.ctx.fillStyle = el.color;
      this.ctx.beginPath();
      this.ctx.arc(el.x, el.y, 40, 0, Math.PI * 2);
      this.ctx.fill();
    });
    this.ctx.globalCompositeOperation = 'source-over';

    this.updateColor();
    document.getElementById('count').textContent = this.elements.length;
    document.getElementById('color').textContent = this.compositeColor;
    console.log('繪製完成，合成色:', this.compositeColor);
  }

  updateColor() {
    const imageData = this.ctx.getImageData(0, 0, 640, 480);
    const data = imageData.data;
    let r = 0, g = 0, b = 0, count = 0;

    for (let i = 0; i < data.length; i += 4) {
      if (data[i + 3] > 10) {
        r += data[i];
        g += data[i + 1];
        b += data[i + 2];
        count++;
      }
    }

    if (count === 0) {
      this.compositeColor = '#ffffff';
    } else {
      r = Math.round(r / count);
      g = Math.round(g / count);
      b = Math.round(b / count);
      this.compositeColor = '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
    }
  }

  exportPNG() {
    const url = this.canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = 'emo-monster-' + Date.now() + '.png';
    a.click();
  }

  clear() {
    this.elements = [];
    this.draw();
  }
}

console.log('應用初始化中...');
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded 觸發');
    new EmoMonsterApp();
  });
} else {
  console.log('直接初始化');
  new EmoMonsterApp();
}
