/**
 * ============================================================================
 * EventDelegate.js — 事件委托
 * ============================================================================
 */

const EventDelegate = {
  _handlers: [],
  on: function(parent, selector, eventType, handler) {
    var wrapped = function(e) {
      var target = e.target;
      while (target && target !== parent) {
        if (target.matches && target.matches(selector)) {
          handler.call(target, e);
          return;
        }
        target = target.parentNode;
      }
    };
    parent.addEventListener(eventType, wrapped);
    this._handlers.push({ parent: parent, selector: selector, type: eventType, handler: handler, wrapped: wrapped });
  },
  off: function(parent, eventType, handler) {
    for (var i = this._handlers.length - 1; i >= 0; i--) {
      var h = this._handlers[i];
      if (h.parent === parent && h.type === eventType && h.handler === handler) {
        parent.removeEventListener(eventType, h.wrapped);
        this._handlers.splice(i, 1);
      }
    }
  }
};
