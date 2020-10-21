type EventListener = (evt: Event) => void

type EventListenerObject = {
  handleEvent(evt: Event): void
}

/*
  Nur once wird beachtet
*/
type AddEventListenerOptions = {
  once?: boolean
  passive?: boolean
  capture?: boolean
}

class EventTargetPolyfill implements EventTarget {
  _listeners: {
    [type: string]: {
      listener: EventListener | EventListenerObject
      options: {
        once: boolean
      }
    }[]
  } = {}

  /**
   * Appends an event listener for events whose type attribute value is type. The callback argument sets
   * the callback that will be invoked when the event is dispatched.
   *
   * The options argument sets listener-specific options. For compatibility this can be a boolean, in which
   * case the method behaves exactly as if the value was specified as options's capture.
   *
   * When set to true, options's once indicates that the callback will only be invoked once after which the
   * event listener will be removed.
   *
   * The event listener is appended to target's event listener list and is not appended if it has the same
   * type and callback
   */
  addEventListener(
    type: string,
    listener: EventListener | EventListenerObject | null,
    options?: boolean | AddEventListenerOptions
  ): void {
    if (!(type in this._listeners)) {
      this._listeners[type] = []
    }
    if (this._listeners[type].some((item) => item.listener === listener)) {
      return
    }
    if (listener) {
      this._listeners[type].push({
        listener,
        options: {
          once: !!(options && options !== true && options.once)
        }
      })
    }
  }

  /**
   * Dispatches a synthetic event event to target and returns true if either event's cancelable attribute
   * value is false or its preventDefault() method was not invoked, and false otherwise.
   */
  dispatchEvent(event: Event): boolean {
    if (event.type in this._listeners) {
      this._listeners[event.type].forEach((item) => {
        if (item.listener instanceof Function) {
          item.listener(event)
        } else {
          item.listener.handleEvent(event)
        }
      })
      const removeListeners = this._listeners[event.type].filter((x) => x.options.once)
      removeListeners.forEach((x) => this.removeEventListener(event.type, x.listener))
    }
    return !event.cancelable || !event.defaultPrevented
  }

  /**
   * Removes the event listener in target's event listener list with the same type and callback.
   */
  removeEventListener(
    type: string,
    callback: EventListener | EventListenerObject | null,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    options?: boolean | EventListenerOptions
  ): void {
    if (type in this._listeners) {
      this._listeners[type] = this._listeners[type].filter((x) => x.listener !== callback)
    }
  }
}

export default EventTargetPolyfill
