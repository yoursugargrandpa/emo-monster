// 純 JavaScript 實現（無 React，無 eval）
const app = {
  canvas: null,
  ctx: null,
  elements: [],
  images: {},
  coins: 0,

  async init() {
    this.canvas = document.createElement('canvas');
    this.canvas.width = 640;
    this.canvas.height = 480;
    this.ctx = this.canvas.getContext('2d');

    const root = document.getElementById('root');
    const appDiv = document.createElement('div');
    appDiv.className = 'app';
    appDiv.innerHTML = '<h1>🎨 情感怪獸 Emo Monster</h1>';
    
    appDiv.appendChild(this.canvas);

    const paletteDiv = document.createElement('div');
    paletteDiv.className = 'palette';

    const emotions = [
      { id: 'angry', name: '生氣', emoji: '😠' },
      { id: 'sad', name: '難過', emoji: '😢' },
      { id: 'happy', name: '快樂', emoji: '😊' }
    ];

    emotions.forEach(emotion => {
      const item = document.createElement('div');
      item.className = 'emotion-item';
      item.innerHTML = `<div>${emotion.emoji}</div><div>${emotion.name}</div>`;
      item.onclick = () => this.addEmotion(emotion.id);
      paletteDiv.appendChild(item);
    });

    appDiv.appendChild(paletteDiv);

    const buttonDiv = document.createElement('div');
    buttonDiv.style.marginTop = '16px';
    buttonDiv.innerHTML = `
      <button onclick="app.exportPNG()">匯出 PNG</button>
      <button onclick="app.clear()" style="margin-left: 8px;">清除</button>
    `;
    appDiv.appendChild(buttonDiv);

    root.appendChild(appDiv);
    this.draw();
  },

  addEmotion(id) {
    const x = this.canvas.width / 2;
    const y = this.canvas.height / 2;
    
    // 根據 emotion 繪製圓形
    const colors = { angry: '#ff6b6b', sad: '#6bcaff', happy: '#ffd93d' };
    const color = colors[id] || '#ffff00';
    
    this.elements.push({ x, y, color });
    this.draw();
    console.log('Added emotion:', id, 'Elements:', this.elements.length);
  },

  draw() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.globalCompositeOperation = 'lighter';
    this.elements.forEach(el => {
      this.ctx.fillStyle = el.color;
      this.ctx.beginPath();
      this.ctx.arc(el.x, el.y, 40, 0, Math.PI * 2);
      this.ctx.fill();
    });
    this.ctx.globalCompositeOperation = 'source-over';
  },

  exportPNG() {
    const url = this.canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = 'emo-monster.png';
    a.click();
  },

  clear() {
    this.elements = [];
    this.draw();
  }
};

document.addEventListener('DOMContentLoaded', () => app.init());
