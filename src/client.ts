import FakeSocketBase, { EventEmitterClasses } from './client/FakeSocketBase'

const eeClasses: EventEmitterClasses = {
  EventTarget,
  Event,
  MessageEvent,
  CloseEvent
}

export default class FakeSocket extends FakeSocketBase {
  constructor(url: string, protocols?: string | string[]) {
    super(eeClasses, url, protocols)
  }
}
