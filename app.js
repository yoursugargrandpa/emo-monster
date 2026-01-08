class EmoMonsterApp {
  constructor() {
    this.canvas = document.getElementById('canvas');
    this.ctx = this.canvas.getContext('2d');
    this.elements = [];
    this.compositeColor = '#ffffff';
    
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.draw();
  }

  setupEventListeners() {
    // Emotion buttons
    document.querySelectorAll('.emotion-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const color = btn.dataset.color;
        this.addEmotion(color);
      });
    });

    // Control buttons
    document.getElementById('exportBtn').addEventListener('click', () => this.exportPNG());
    document.getElementById('clearBtn').addEventListener('click', () => this.clear());

    // Canvas drag and drop
    this.canvas.addEventListener('dragover', (e) => e.preventDefault());
    this.canvas.addEventListener('drop', (e) => {
      e.preventDefault();
      const rect = this.canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const color = e.dataTransfer.getData('text/plain');
      if (color) this.elements.push({ x, y, color });
      this.draw();
    });
  }

  addEmotion(color) {
    const x = this.canvas.width / 2;
    const y = this.canvas.height / 2;
    this.elements.push({ x, y, color });
    console.log('Adding emotion with color:', color, 'Total elements:', this.elements.length);
    this.draw();
  }

  draw() {
    // Clear and fill background
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw elements with lighter composite mode
    this.ctx.globalCompositeOperation = 'lighter';
    this.elements.forEach(el => {
      this.ctx.fillStyle = el.color;
      this.ctx.beginPath();
      this.ctx.arc(el.x, el.y, 40, 0, Math.PI * 2);
      this.ctx.fill();
    });
    this.ctx.globalCompositeOperation = 'source-over';

    // Calculate composite color
    this.updateColor();
    this.updateUI();
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
      this.compositeColor = `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
    }
  }

  updateUI() {
    document.getElementById('count').textContent = this.elements.length;
    document.getElementById('color').textContent = this.compositeColor;
  }

  exportPNG() {
    const url = this.canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `emo-monster-${Date.now()}.png`;
    a.click();
  }

  clear() {
    this.elements = [];
    this.draw();
  }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new EmoMonsterApp();
  });
} else {
  new EmoMonsterApp();
}
