import FakeSocketBase, { EventEmitterClasses } from './client/FakeSocketBase'
import { EventTarget } from 'event-target-shim'

class Event {
  type: string

  constructor(type: string, args: EventInit | undefined) {
    this.type = type
    if (args) {
      for (const key in args) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        this[key] = args[key]
      }
    }
  }
}

const eeClasses = {
  EventTarget,
  Event,
  MessageEvent: Event,
  CloseEvent: Event
}

export default class FakeSocket extends FakeSocketBase {
  constructor(url: string, protocols?: string | string[]) {
    super((eeClasses as unknown) as EventEmitterClasses, url, protocols)
  }
}
