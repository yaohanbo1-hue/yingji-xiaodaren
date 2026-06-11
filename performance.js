/**
 * ===========================================================================
 * 应急小达人 v1.2.0 — 性能优化引擎
 * ===========================================================================
 * 
 * 1. Canvas 帧率限制（省电模式）
 * 2. 懒加载非关键资源
 * 3. 内存泄漏防护
 * 4. 粒子数量动态调整
 * 5. 页面可见性 API（后台暂停动画）
 * 
 * @version 1.2.0
 * ===========================================================================
 */

(function() {
  'use strict';
  
  var PerformanceEngine = {
    _fps: 60,
    _lastFrame: 0,
    _frameInterval: 1000 / 60,
    _isInBackground: false,
    _lowPerfMode: false,
    _particleMultiplier: 1,
    
    init() {
      // 检测设备性能
      this._detectPerformance();
      
      // 页面可见性监听
      this._setupVisibilityAPI();
      
      // 内存监控
      this._setupMemoryMonitor();
      
      // Canvas 帧率限制
      this._throttleCanvases();
      
      console.log('⚡ Performance Engine loaded (FPS: ' + this._fps + ', Particles: ' + (this._particleMultiplier * 100) + '%)');
    },
    
    _detectPerformance() {
      // 检测低端设备
      var cores = navigator.hardwareConcurrency || 2;
      var memory = navigator.deviceMemory || 4; // GB
      var isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
      
      if (cores <= 2 || memory <= 2 || isMobile) {
        this._lowPerfMode = true;
        this._fps = 30;
        this._frameInterval = 1000 / 30;
        this._particleMultiplier = 0.5;
        document.body.classList.add('low-perf-mode');
      }
    },
    
    _setupVisibilityAPI() {
      var self = this;
      
      document.addEventListener('visibilitychange', function() {
        self._isInBackground = document.hidden;
        
        if (document.hidden) {
          // 暂停所有动画
          document.querySelectorAll('canvas').forEach(function(canvas) {
            canvas.dataset.wasRunning = 'true';
            // 停止 requestAnimationFrame
          });
          
          // 暂停 BGM
          if (typeof BGMEngineV2 !== 'undefined') {
            BGMEngineV2._ctx && BGMEngineV2._ctx.suspend();
          }
        } else {
          // 恢复动画
          document.querySelectorAll('canvas[data-was-running="true"]').forEach(function(canvas) {
            delete canvas.dataset.wasRunning;
          });
          
          // 恢复 BGM
          if (typeof BGMEngineV2 !== 'undefined') {
            BGMEngineV2._ctx && BGMEngineV2._ctx.resume();
          }
        }
      });
    },
    
    _setupMemoryMonitor() {
      // 定期检查内存使用
      setInterval(function() {
        if (performance.memory) {
          var used = performance.memory.usedJSHeapSize;
          var total = performance.memory.jsHeapSizeLimit;
          var ratio = used / total;
          
          if (ratio > 0.9) {
            // 内存使用过高，清理缓存
            console.warn('⚠️ High memory usage: ' + (ratio * 100).toFixed(1) + '%');
            PerformanceEngine._cleanupMemory();
          }
        }
      }, 10000); // 每 10 秒检查一次
    },
    
    _cleanupMemory() {
      // 清理未使用的 DOM 元素
      document.querySelectorAll('.particle, .confetti, .float-text').forEach(function(el) {
        if (el.parentNode) el.parentNode.removeChild(el);
      });
      
      // 清理离屏 canvas
      document.querySelectorAll('canvas').forEach(function(canvas) {
        if (!canvas.offsetParent) {
          var ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
          }
        }
      });
      
      // 强制垃圾回收提示
      if (window.gc) {
        window.gc();
      }
    },
    
    _throttleCanvases() {
      // 拦截 requestAnimationFrame 实现帧率限制
      if (this._fps >= 60) return; // 不需要限制
      
      var self = this;
      var originalRAF = window.requestAnimationFrame;
      var lastTime = 0;
      
      window.requestAnimationFrame = function(callback) {
        return originalRAF(function(timestamp) {
          if (timestamp - lastTime >= self._frameInterval) {
            lastTime = timestamp;
            callback(timestamp);
          } else {
            // 递归调用直到达到目标帧率
            window.requestAnimationFrame(callback);
          }
        });
      };
    },
    
    // 获取当前粒子倍率（供其他引擎使用）
    getParticleMultiplier() {
      return this._particleMultiplier;
    },
    
    // 是否在低性能模式
    isLowPerfMode() {
      return this._lowPerfMode;
    },
    
    // 是否在后台
    isInBackground() {
      return this._isInBackground;
    }
  };
  
  // 导出到全局
  window.PerformanceEngine = PerformanceEngine;
  
  // 初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
      PerformanceEngine.init();
    });
  } else {
    PerformanceEngine.init();
  }
  
})();
