/**
 * ============================================================================
 * DOMUtils - Common DOM Manipulation Utilities
 * ============================================================================
 * Extracted from game.js to reduce duplication and centralize
 * DOM access patterns.
 * ============================================================================
 */

const DOMUtils = {
  /**
   * Safely get an element by ID. Returns null if not found.
   * @param {string} id - Element ID
   * @returns {HTMLElement|null}
   */
  getById(id) {
    try {
      return document.getElementById(id);
    } catch (e) {
      console.error('DOMUtils.getById("' + id + '") failed:', e);
      return null;
    }
  },

  /**
   * Safely query a single element.
   * @param {string} selector - CSS selector
   * @returns {HTMLElement|null}
   */
  query(selector) {
    try {
      return document.querySelector(selector);
    } catch (e) {
      console.error('DOMUtils.query("' + selector + '") failed:', e);
      return null;
    }
  },

  /**
   * Safely query all matching elements.
   * @param {string} selector - CSS selector
   * @returns {NodeList}
   */
  queryAll(selector) {
    try {
      return document.querySelectorAll(selector);
    } catch (e) {
      console.error('DOMUtils.queryAll("' + selector + '") failed:', e);
      return [];
    }
  },

  /**
   * Safely set innerHTML with null check.
   * @param {string|HTMLElement} el - Element or element ID
   * @param {string} html - HTML content
   */
  setHTML(el, html) {
    const element = typeof el === 'string' ? this.getById(el) : el;
    if (!element) {
      console.warn('DOMUtils.setHTML: element "' + el + '" not found');
      return;
    }
    element.innerHTML = html;
  },

  /**
   * Safely set textContent with null check.
   * @param {string|HTMLElement} el - Element or element ID
   * @param {string} text - Text content
   */
  setText(el, text) {
    const element = typeof el === 'string' ? this.getById(el) : el;
    if (!element) {
      console.warn('DOMUtils.setText: element "' + el + '" not found');
      return;
    }
    element.textContent = text;
  },

  /**
   * Safely add a CSS class with null check.
   * @param {string|HTMLElement} el - Element or element ID
   * @param {string} className - Class to add
   */
  addClass(el, className) {
    const element = typeof el === 'string' ? this.getById(el) : el;
    if (!element) {
      console.warn('DOMUtils.addClass: element "' + el + '" not found');
      return;
    }
    element.classList.add(className);
  },

  /**
   * Safely remove a CSS class with null check.
   * @param {string|HTMLElement} el - Element or element ID
   * @param {string} className - Class to remove
   */
  removeClass(el, className) {
    const element = typeof el === 'string' ? this.getById(el) : el;
    if (!element) {
      console.warn('DOMUtils.removeClass: element "' + el + '" not found');
      return;
    }
    element.classList.remove(className);
  },

  /**
   * Show an element by removing 'hidden' or adding 'active'.
   * @param {string|HTMLElement} el - Element or element ID
   */
  show(el) {
    const element = typeof el === 'string' ? this.getById(el) : el;
    if (!element) return;
    element.classList.remove('hidden');
    element.classList.add('active');
  },

  /**
   * Hide an element by removing 'active' or adding 'hidden'.
   * @param {string|HTMLElement} el - Element or element ID
   */
  hide(el) {
    const element = typeof el === 'string' ? this.getById(el) : el;
    if (!element) return;
    element.classList.remove('active');
    element.classList.add('hidden');
  }
};

/**
 * ============================================================================
 * StorageUtils - Safe localStorage wrapper
 * ============================================================================
 * Provides defensive access to localStorage with automatic error handling
 * and JSON serialization/deserialization.
 * ============================================================================
 */

const StorageUtils = {
  /**
   * Safely get an item from localStorage.
   * @param {string} key - Storage key
   * @param {any} defaultValue - Default if not found or error
   * @returns {any}
   */
  get(key, defaultValue = null) {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null) return defaultValue;
      try {
        return JSON.parse(raw);
      } catch (e) {
        return raw; // Return as string if not JSON
      }
    } catch (e) {
      console.error('StorageUtils.get("' + key + '") failed:', e);
      return defaultValue;
    }
  },

  /**
   * Safely set an item in localStorage.
   * @param {string} key - Storage key
   * @param {any} value - Value to store (auto-JSON-serialized if object)
   */
  set(key, value) {
    try {
      const raw = typeof value === 'string' ? value : JSON.stringify(value);
      localStorage.setItem(key, raw);
    } catch (e) {
      console.error('StorageUtils.set("' + key + '") failed:', e);
    }
  },

  /**
   * Safely remove an item from localStorage.
   * @param {string} key - Storage key
   */
  remove(key) {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error('StorageUtils.remove("' + key + '") failed:', e);
    }
  },

  /**
   * Get a numeric value, returning default if invalid.
   * @param {string} key - Storage key
   * @param {number} defaultValue - Default value
   * @returns {number}
   */
  getNumber(key, defaultValue = 0) {
    const val = this.get(key, defaultValue);
    const num = Number(val);
    return Number.isNaN(num) ? defaultValue : num;
  },

  /**
   * Get a boolean value.
   * @param {string} key - Storage key
   * @param {boolean} defaultValue - Default value
   * @returns {boolean}
   */
  getBoolean(key, defaultValue = false) {
    const val = this.get(key, defaultValue);
    if (val === 'true' || val === true) return true;
    if (val === 'false' || val === false) return false;
    return defaultValue;
  }
};

/**
 * ============================================================================
 * AnimationUtils - Common animation and visual effect helpers
 * ============================================================================
 * Extracted to reduce code duplication across engine modules.
 * ============================================================================
 */

const AnimationUtils = {
  /**
   * Shake an element briefly.
   * @param {HTMLElement} element - Element to shake
   * @param {number} duration - Duration in ms
   */
  shake(element, duration = 300) {
    if (!element) return;
    element.classList.add('shake');
    setTimeout(() => element.classList.remove('shake'), duration);
  },

  /**
   * Flash an element with a color.
   * @param {HTMLElement} element - Element to flash
   * @param {string} color - Flash color
   * @param {number} duration - Duration in ms
   */
  flash(element, color = '#ff0', duration = 150) {
    if (!element) return;
    const original = element.style.backgroundColor;
    element.style.backgroundColor = color;
    setTimeout(() => { element.style.backgroundColor = original; }, duration);
  },

  /**
   * Animate a number counting up.
   * @param {HTMLElement} element - Element to update
   * @param {number} target - Target number
   * @param {number} duration - Duration in ms
   */
  countUp(element, target, duration = 1000) {
    if (!element) return;
    const start = performance.now();
    const initial = parseInt(element.textContent || '0', 10) || 0;
    const step = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const current = Math.floor(initial + (target - initial) * progress);
      element.textContent = current;
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  },

  /**
   * Delay utility for async/await patterns.
   * @param {number} ms - Milliseconds to delay
   * @returns {Promise<void>}
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
};

/**
 * ============================================================================
 * ErrorHandler - Global error handling and reporting utilities
 * ============================================================================
 */

const ErrorHandler = {
  /**
   * Wrap a function with try/catch error handling.
   * @param {Function} fn - Function to wrap
   * @param {string} context - Description for error logging
   * @returns {Function}
   */
  wrap(fn, context = 'anonymous') {
    return function(...args) {
      try {
        return fn.apply(this, args);
      } catch (e) {
        console.error('Error in ' + context + ':', e);
        return undefined;
      }
    };
  },

  /**
   * Wrap an async function with try/catch error handling.
   * @param {Function} fn - Async function to wrap
   * @param {string} context - Description for error logging
   * @returns {Function}
   */
  wrapAsync(fn, context = 'anonymous') {
    return async function(...args) {
      try {
        return await fn.apply(this, args);
      } catch (e) {
        console.error('Error in async ' + context + ':', e);
        return undefined;
      }
    };
  },

  /**
   * Safely execute a callback, logging errors but not crashing.
   * @param {Function} fn - Callback to execute
   * @param {any} defaultValue - Value to return on error
   * @returns {any}
   */
  safeExecute(fn, defaultValue = null) {
    try {
      return fn();
    } catch (e) {
      console.error('safeExecute caught error:', e);
      return defaultValue;
    }
  }
};

/**
 * ============================================================================
 * GameUtils - Game-specific common utilities
 * ============================================================================
 */

const GameUtils = {
  /**
   * Generate a random integer in [min, max].
   * @param {number} min
   * @param {number} max
   * @returns {number}
   */
  randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },

  /**
   * Shuffle an array in-place using Fisher-Yates.
   * @param {Array} arr
   * @returns {Array}
   */
  shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  },

  /**
   * Pick n random items from an array without replacement.
   * @param {Array} arr
   * @param {number} n
   * @returns {Array}
   */
  sample(arr, n) {
    return this.shuffle(arr).slice(0, n);
  },

  /**
   * Clamp a number between min and max.
   * @param {number} val
   * @param {number} min
   * @param {number} max
   * @returns {number}
   */
  clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
  },

  /**
   * Format a number with commas.
   * @param {number} n
   * @returns {string}
   */
  formatNumber(n) {
    return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }
};
