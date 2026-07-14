/**
 * EventBus — lightweight pub/sub for cross-service communication.
 *
 * Replaces dynamic `await import()` workarounds with a clean fire-and-forget
 * pattern. Services emit domain events; interested listeners react.
 *
 * Events are fire-and-forget by default. Listeners should never throw —
 * errors are caught and logged but do not propagate to the emitter.
 *
 * Usage:
 *   import events from '../shared/events.js';
 *   events.emit('booking:accepted', { booking });
 *   events.on('booking:accepted', (data) => { ... });
 */

import logger from '../config/logger.js';

class EventBus {
  constructor() {
    this._listeners = new Map();
  }

  /**
   * Register a listener for an event.
   * @param {string} event
   * @param {Function} handler
   */
  on(event, handler) {
    if (!this._listeners.has(event)) {
      this._listeners.set(event, []);
    }
    this._listeners.get(event).push(handler);
  }

  /**
   * Remove a listener.
   * @param {string} event
   * @param {Function} handler
   */
  off(event, handler) {
    const handlers = this._listeners.get(event);
    if (handlers) {
      this._listeners.set(event, handlers.filter((h) => h !== handler));
    }
  }

  /**
   * Emit an event. Handlers run asynchronously; errors are caught and logged.
   * @param {string} event
   * @param {*} data
   */
  emit(event, data) {
    const handlers = this._listeners.get(event);
    if (!handlers || handlers.length === 0) return;

    for (const handler of handlers) {
      Promise.resolve()
        .then(() => handler(data))
        .catch((err) => {
          logger.error(`EventBus handler error for "${event}"`, {
            error: err.message,
            stack: err.stack,
          });
        });
    }
  }

  /**
   * Remove all listeners for an event (or all events if no argument).
   * @param {string} [event]
   */
  clear(event) {
    if (event) {
      this._listeners.delete(event);
    } else {
      this._listeners.clear();
    }
  }
}

const events = new EventBus();
export default events;
