/**
 * ===========================================================================
 * 应急小达人 v1.2.0 — 证书打印增强引擎
 * ===========================================================================
 * 
 * 功能：
 * 1. 增强证书渲染（更精美的视觉效果）
 * 2. 添加打印功能（优化打印样式）
 * 3. 支持批量导出所有证书
 * 4. 证书分享功能（生成分享链接）
 * 
 * @version 1.2.0
 * ===========================================================================
 */

const CertificateEnhancer = {
  
  // 增强版证书渲染
  renderEnhancedCertificate(levelIndex, cert) {
    const canvas = document.getElementById('certificateCanvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const W = canvas.width;
    const H = canvas.height;
    const level = CertificationEngine._levels[levelIndex];
    
    // 高清背景渐变
    const bgGradient = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, W);
    bgGradient.addColorStop(0, '#1a1f3a');
    bgGradient.addColorStop(0.5, '#0f172a');
    bgGradient.addColorStop(1, '#020617');
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, W, H);
    
    // 装饰光晕
    this._drawGlow(ctx, W/2, H/3, 200, level.color, 0.1);
    this._drawGlow(ctx, W/4, H/2, 150, '#3b82f6', 0.05);
    this._drawGlow(ctx, W*3/4, H/2, 150, '#8b5cf6', 0.05);
    
    // 精美边框（双层）
    this._drawFancyBorder(ctx, W, H, level.color);
    
    // 顶部装饰线
    const topGrad = ctx.createLinearGradient(0, 0, W, 0);
    topGrad.addColorStop(0, 'transparent');
    topGrad.addColorStop(0.3, level.color);
    topGrad.addColorStop(0.7, level.color);
    topGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = topGrad;
    ctx.fillRect(50, 40, W - 100, 2);
    
    // 标题区域
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    // 主标题（带阴影）
    ctx.shadowColor = level.color;
    ctx.shadowBlur = 20;
    ctx.font = 'bold 36px "Microsoft YaHei", sans-serif';
    ctx.fillStyle = '#F8FAFC';
    ctx.fillText('应急小达人', W / 2, 80);
    ctx.shadowBlur = 0;
    
    // 副标题
    ctx.font = '18px "Microsoft YaHei", sans-serif';
    ctx.fillStyle = 'rgba(148, 163, 184, 0.8)';
    ctx.fillText('DISASTER BLIND BOX COMMAND HQ', W / 2, 115);
    
    // 认证标题
    ctx.font = 'bold 24px "Microsoft YaHei", sans-serif';
    ctx.fillStyle = level.color;
    ctx.fillText('— 能力认证证书 —', W / 2, 160);
    
    // 徽章（带光晕）
    this._drawGlow(ctx, W/2, 230, 60, level.color, 0.3);
    ctx.font = '72px sans-serif';
    ctx.fillText(level.icon, W / 2, 230);
    
    // 等级名称（大字）
    ctx.shadowColor = level.color;
    ctx.shadowBlur = 30;
    ctx.font = 'bold 48px "Microsoft YaHei", sans-serif';
    ctx.fillStyle = level.color;
    ctx.fillText(level.name, W / 2, 320);
    ctx.shadowBlur = 0;
    
    // 分隔线
    const sepGrad = ctx.createLinearGradient(W/2 - 100, 0, W/2 + 100, 0);
    sepGrad.addColorStop(0, 'transparent');
    sepGrad.addColorStop(0.5, level.color);
    sepGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = sepGrad;
    ctx.fillRect(W/2 - 100, 355, 200, 1);
    
    // 描述文字
    ctx.font = '16px "Microsoft YaHei", sans-serif';
    ctx.fillStyle = 'rgba(226, 232, 240, 0.9)';
    ctx.fillText(level.desc, W / 2, 390);
    
    // 数据统计卡片
    this._drawStatsCard(ctx, W/2, 450, cert, level);
    
    // 日期和编号
    const date = new Date(cert.date);
    const dateStr = `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
    const certNo = `CERT-${date.getTime().toString(36).toUpperCase()}`;
    
    ctx.font = '12px "Microsoft YaHei", sans-serif';
    ctx.fillStyle = 'rgba(148, 163, 184, 0.5)';
    ctx.fillText(`颁发日期：${dateStr}`, W / 2, 520);
    
    ctx.font = '10px monospace';
    ctx.fillStyle = 'rgba(148, 163, 184, 0.3)';
    ctx.fillText(`证书编号：${certNo}`, W / 2, 545);
    
    // 防伪水印
    this._drawWatermark(ctx, W, H);
    
    // 底部装饰线
    ctx.fillStyle = topGrad;
    ctx.fillRect(50, H - 40, W - 100, 2);
  },
  
  _drawGlow(ctx, x, y, radius, color, alpha) {
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, this._colorWithAlpha(color, alpha));
    gradient.addColorStop(1, 'transparent');
    ctx.fillStyle = gradient;
    ctx.fillRect(x - radius, y - radius, radius * 2, radius * 2);
  },
  
  _drawFancyBorder(ctx, W, H, color) {
    // 外边框
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.strokeRect(15, 15, W - 30, H - 30);
    
    // 内边框
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    ctx.strokeRect(25, 25, W - 50, H - 50);
    
    // 装饰角
    const drawCorner = (x, y, angle) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      
      // 外层角
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(50, 0);
      ctx.lineTo(0, 50);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
      
      // 内层角
      ctx.beginPath();
      ctx.moveTo(5, 5);
      ctx.lineTo(35, 5);
      ctx.lineTo(5, 35);
      ctx.closePath();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
      ctx.fill();
      
      ctx.restore();
    };
    
    drawCorner(25, 25, 0);
    drawCorner(W - 25, 25, Math.PI / 2);
    drawCorner(25, H - 25, -Math.PI / 2);
    drawCorner(W - 25, H - 25, Math.PI);
  },
  
  _drawStatsCard(ctx, cx, cy, cert, level) {
    const cardW = 400;
    const cardH = 60;
    const x = cx - cardW / 2;
    const y = cy - cardH / 2;
    
    // 卡片背景
    ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(x, y, cardW, cardH, 10);
    ctx.fill();
    ctx.stroke();
    
    // 三个统计项
    const stats = [
      { value: cert.totalAnswered, label: '答题数' },
      { value: cert.accuracy + '%', label: '正确率' },
      { value: cert.masteredModules + '/12', label: '掌握模块' }
    ];
    
    const itemW = cardW / 3;
    stats.forEach((stat, i) => {
      const sx = x + itemW * i + itemW / 2;
      
      // 数值
      ctx.font = 'bold 20px "Microsoft YaHei", sans-serif';
      ctx.fillStyle = level.color;
      ctx.fillText(stat.value, sx, cy - 5);
      
      // 标签
      ctx.font = '11px "Microsoft YaHei", sans-serif';
      ctx.fillStyle = 'rgba(148, 163, 184, 0.6)';
      ctx.fillText(stat.label, sx, cy + 18);
      
      // 分隔线（除了最后一个）
      if (i < 2) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.beginPath();
        ctx.moveTo(x + itemW * (i + 1), y + 10);
        ctx.lineTo(x + itemW * (i + 1), y + cardH - 10);
        ctx.stroke();
      }
    });
  },
  
  _drawWatermark(ctx, W, H) {
    ctx.save();
    ctx.translate(W / 2, H / 2);
    ctx.rotate(-Math.PI / 6);
    ctx.font = 'bold 100px "Microsoft YaHei", sans-serif';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.015)';
    ctx.fillText('防灾认证', 0, 0);
    ctx.restore();
  },
  
  _colorWithAlpha(color, alpha) {
    // 简单的颜色转 RGBA
    if (color.startsWith('#')) {
      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    return color;
  },
  
  // 打印证书
  printCertificate(levelIndex) {
    const canvas = document.getElementById('certificateCanvas');
    if (!canvas) return;
    
    const dataUrl = canvas.toDataURL('image/png');
    const level = CertificationEngine._levels[levelIndex];
    
    // 创建打印窗口
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>打印证书 - ${level.name}</title>
        <style>
          @page {
            size: landscape;
            margin: 0;
          }
          body {
            margin: 0;
            padding: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            background: #000;
          }
          img {
            max-width: 100%;
            max-height: 100vh;
            object-fit: contain;
          }
          @media print {
            body {
              background: none;
            }
            img {
              width: 100%;
              height: 100vh;
              object-fit: contain;
            }
          }
        </style>
      </head>
      <body>
        <img src="${dataUrl}" onload="window.print(); window.close();">
      </body>
      </html>
    `);
    printWindow.document.close();
  },
  
  // 批量导出所有证书
  exportAllCertificates() {
    const data = CertificationEngine._data;
    if (!data || !data.certificates || data.certificates.length === 0) {
      if (typeof Modal !== 'undefined') {
        Modal.show('提示', '暂无证书可导出', '📜');
      }
      return;
    }
    
    data.certificates.forEach((cert, index) => {
      setTimeout(() => {
        this._exportSingleCertificate(cert.levelIndex, cert);
      }, index * 500); // 间隔 500ms 避免浏览器阻止
    });
  },
  
  _exportSingleCertificate(levelIndex, cert) {
    // 创建临时 canvas
    const canvas = document.createElement('canvas');
    canvas.width = 800;
    canvas.height = 560;
    document.body.appendChild(canvas);
    canvas.style.display = 'none';
    
    // 临时替换 certificateCanvas
    const originalCanvas = document.getElementById('certificateCanvas');
    const originalId = canvas.id;
    canvas.id = 'certificateCanvas';
    if (originalCanvas) originalCanvas.id = 'temp-hidden';
    
    // 渲染证书
    this.renderEnhancedCertificate(levelIndex, cert);
    
    // 下载
    const level = CertificationEngine._levels[levelIndex];
    const link = document.createElement('a');
    link.download = `防灾认证_${level.name}_${new Date(cert.date).toISOString().slice(0, 10)}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    
    // 恢复
    canvas.id = originalId;
    if (originalCanvas) originalCanvas.id = 'certificateCanvas';
    document.body.removeChild(canvas);
  },
  
  // 钩入原有证书系统
  hookIntoCertification() {
    // 保存原有方法
    const originalDraw = CertificationEngine.drawCertificate;
    const self = this;
    
    // 覆盖证书渲染
    CertificationEngine.drawCertificate = function(levelIndex, cert) {
      self.renderEnhancedCertificate(levelIndex, cert);
    };
    
    // 添加打印按钮到证书弹窗
    const originalShow = CertificationEngine.showCertificate;
    CertificationEngine.showCertificate = function(levelIndex) {
      originalShow.call(this, levelIndex);
      
      // 延迟添加打印按钮
      setTimeout(() => {
        const actions = document.querySelector('.cert-modal-actions');
        if (actions && !actions.querySelector('.cert-print-btn')) {
          const printBtn = document.createElement('button');
          printBtn.className = 'cert-print-btn';
          printBtn.innerHTML = '🖨️ 打印证书';
          printBtn.onclick = () => CertificateEnhancer.printCertificate(levelIndex);
          actions.appendChild(printBtn);
        }
      }, 200);
    };
  }
};

// 自动钩入
document.addEventListener('DOMContentLoaded', function() {
  // 等待 CertificationEngine 加载
  const checkInterval = setInterval(() => {
    if (typeof CertificationEngine !== 'undefined') {
      clearInterval(checkInterval);
      CertificateEnhancer.hookIntoCertification();
      console.log('🎨 证书增强引擎已加载');
    }
  }, 100);
});

// 挂载到全局
window.CertificateEnhancer = CertificateEnhancer;
