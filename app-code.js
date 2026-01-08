class EmoMonsterApp {
  constructor() {
    this.canvas = document.getElementById('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.elements = [];
    this.compositeColor = '#ffffff';
    this.init();
  }

  init() {
    document.querySelectorAll('.emotion-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.addEmotion(btn.dataset.color);
      });
    });
    document.getElementById('exportBtn').addEventListener('click', () => this.exportPNG());
    document.getElementById('clearBtn').addEventListener('click', () => this.clear());
    this.draw();
  }

  addEmotion(color) {
    const x = this.canvas.width / 2;
    const y = this.canvas.height / 2;
    this.elements.push({ x, y, color });
    this.draw();
  }

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

    this.updateColor();
    document.getElementById('count').textContent = this.elements.length;
    document.getElementById('color').textContent = this.compositeColor;
  }

  updateColor() {
    const imageData = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
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

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new EmoMonsterApp());
} else {
  new EmoMonsterApp();
}
