const alternatives: { [url: string]: string } = {}
const errorCounter: { [url: string]: number } = {}
let loggingEnabled = false
const log: typeof console.log = (...args: Parameters<typeof console.log>) => {
  if (loggingEnabled) {
    console.log(...args)
  }
}

const resetErrorCount = (url: string): void => {
  errorCounter[url] = 0
}
const increaseErrorCount = (url: string): void => {
  errorCounter[url] = (errorCounter[url] || 0) + 1
  console.warn(`Connection to Websocket failed: ${errorCounter[url]} of 3`)
}
const isWSAvailable = (url: string): boolean => {
  return !errorCounter[url] || errorCounter[url] < 3
}

const ReadyStates = {
  CONNECTING: 0,
  OPEN: 1,
  CLOSING: 2,
  CLOSED: 3
} as const

type FakeSocketEvent =
  | {
      type: 'message'
      data: string
    }
  | {
      type: 'error'
    }

type FakeResponse = {
  socket?: {
    buffer: FakeSocketEvent[]
    readyState: 0 | 1 | 2 | 3
    readyStateName: string
    closeReason?: number
    closeReasonName?: string
  }
}

export type EventEmitterClasses = {
  EventTarget: typeof EventTarget
  Event: typeof Event
  MessageEvent: typeof MessageEvent
  CloseEvent: typeof CloseEvent
}

class FakeSocketBase implements WebSocket {
  static addAlternative(forUrl: string, url: string): void {
    alternatives[forUrl] = url
  }

  static setLoggingEnabled(enabled: boolean): void {
    loggingEnabled = enabled
  }

  url: string
  origin: string
  _fakeUrl = ''
  _wSocket: WebSocket | undefined
  isFakeSocket = false
  _readyState: number = ReadyStates.CONNECTING
  _eeClasses: EventEmitterClasses

  // EventTarget Stuff
  _eventTarget: EventTarget
  addEventListener(...args: Parameters<WebSocket['addEventListener']>): void {
    this._eventTarget.addEventListener(...args)
  }
  dispatchEvent(...args: Parameters<WebSocket['dispatchEvent']>): boolean {
    return this._eventTarget.dispatchEvent(...args)
  }
  removeEventListener(...args: Parameters<WebSocket['removeEventListener']>): void {
    return this._eventTarget.removeEventListener(...args)
  }

  onopen: WebSocket['onopen'] = null
  onclose: WebSocket['onclose'] = null
  onmessage: WebSocket['onmessage'] = null
  onerror: WebSocket['onerror'] = null

  handleOpen = (): void => {
    if (this.isFakeSocket) {
      console.warn('Connected via FakeSocket')
    }
    log('🟢 Open', { isFakeSocket: this.isFakeSocket })
    if (!this.isFakeSocket) {
      resetErrorCount(this.url)
    }
    const event = new this._eeClasses.Event('open')
    this.onopen && this.onopen(event)
    this.dispatchEvent(event)
  }
  handleError = (): void => {
    log('🟡 Error', {
      isFakeSocket: this.isFakeSocket
    })
    if (!this.isFakeSocket && this._wSocket && this._wSocket.readyState === ReadyStates.CLOSED) {
      increaseErrorCount(this.url)
    }
    const event = new this._eeClasses.Event('error')
    this.onerror && this.onerror(event)
    this.dispatchEvent(event)
  }
  handleMessage = (init: { data: string }): void => {
    const { data } = init
    log('⏬ Receive', data)
    const event = new this._eeClasses.MessageEvent('message', {
      data,
      origin: this.origin
    })
    this.onmessage && this.onmessage(event)
    this.dispatchEvent(event)
  }
  handleClose = (data: CloseEventInit): void => {
    log('🔴 Close', {
      code: data.code,
      reason: data.reason,
      wasClean: data.wasClean
    })
    const { code, reason, wasClean } = data
    const event = new this._eeClasses.CloseEvent('close', { code, reason, wasClean })
    this.onclose && this.onclose(event)
    this.dispatchEvent(event)
  }

  constructor(eeClasses: EventEmitterClasses, url: string, protocols?: string | string[]) {
    this._eeClasses = eeClasses
    this._eventTarget = new this._eeClasses.EventTarget()
    this.url = url
    this.origin = url.split('/').slice(0, 3).join('/')
    if (isWSAvailable(url) || !alternatives[url]) {
      this._wSocket = new WebSocket(url, protocols)
      this._wSocket.onopen = this.handleOpen
      this._wSocket.onclose = this.handleClose
      this._wSocket.onmessage = this.handleMessage
      this._wSocket.onerror = this.handleError
    } else {
      this.isFakeSocket = true
      console.warn('Failed to open a real websocket. Trying to open a fake socket.')
      setTimeout(this.onInterval, 1000)
      fetch(alternatives[url], {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          protocols: Array.isArray(protocols) ? protocols : [protocols]
        })
      })
        .then((request) => request.json().then((data) => ({ request, data })))
        .then(({ request, data }) => {
          if (!request.ok) {
            throw {
              reason: data.socket.closeReasonName,
              code: data.socket.closeReason
            }
          }
          return data
        })
        .then((x) => {
          this._fakeUrl = x.url
          this._readyState = ReadyStates.OPEN
          this.handleOpen()
        })
        .catch((e) => {
          const { reason = 'Connection failed', code = 1006 } = e || {}
          this._readyState = 3
          this.handleClose({
            reason: reason || 'Connection failed',
            code: code || 1006,
            wasClean: false
          })
          this.handleNetworkError()
        })
    }
  }
  get binaryType(): BinaryType {
    // console.log(this._wSocket ? this._wSocket.binaryType : 'blob')
    if (this._wSocket) {
      return this._wSocket.binaryType
    }
    return 'blob'
  }
  get bufferedAmount(): number {
    // console.log(this._wSocket ? this._wSocket.bufferedAmount : 0)
    if (this._wSocket) {
      return this._wSocket.bufferedAmount
    }
    return 0
  }
  get extensions(): string {
    // console.log(this._wSocket ? this._wSocket.extensions : 0)
    if (this._wSocket) {
      return this._wSocket.extensions
    }
    return ''
  }
  get protocol(): string {
    // console.log(this._wSocket ? this._wSocket.protocol : '')
    if (this._wSocket) {
      return this._wSocket.protocol
    }
    return ''
  }

  CLOSED = ReadyStates.CLOSED
  CLOSING = ReadyStates.CLOSING
  CONNECTING = ReadyStates.CONNECTING
  OPEN = ReadyStates.OPEN
  static CLOSED = ReadyStates.CLOSED
  static CLOSING = ReadyStates.CLOSING
  static CONNECTING = ReadyStates.CONNECTING
  static OPEN = ReadyStates.OPEN

  get readyState(): number {
    // console.log(this._wSocket ? this._wSocket.readyState : this._readyState)
    const readyState = this._wSocket ? this._wSocket.readyState : this._readyState
    return readyState
  }

  handleFakeResponse = (response: FakeResponse): void => {
    if (response.socket) {
      if (response.socket.buffer) {
        response.socket.buffer.forEach((e) => {
          if (e.type === 'message') {
            this.handleMessage({ data: e.data })
          }
          if (e.type === 'error') {
            this.handleError()
          }
        })
      }
      if (response.socket.readyState !== this._readyState) {
        this._readyState = response.socket.readyState
        if (this.readyState === 3) {
          this.handleClose({
            code: response.socket.closeReason,
            reason: response.socket.closeReasonName
          })
        }
      }
    }
  }

  _hasPanicked = false
  handleNetworkError = (): void => {
    if (this.isFakeSocket && !this._hasPanicked) {
      this._hasPanicked = true
      console.warn('FakeSocket encountered a network error. Trying to open a real socket.')
      resetErrorCount(this.url)
      if (this.readyState < 3)
        this.handleClose({
          code: 1006,
          reason: 'Network Error',
          wasClean: false
        })
    }
  }

  _busy = false
  _currentTransaction: Promise<unknown> = Promise.resolve()
  _sendBuffer: string[] = []
  send(data: string | ArrayBuffer | SharedArrayBuffer | Blob | ArrayBufferView): void {
    log('⏫ Send', data)
    if (this.isFakeSocket) {
      this._sendBuffer.push(data.toString())
      this._currentTransaction.then(() => {
        if (this._sendBuffer.length) {
          this._busy = true
          const body = JSON.stringify(this._sendBuffer)
          this._sendBuffer = []
          this._currentTransaction = fetch(this._fakeUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body
          })
            .then((response) => response.json())
            .then((data) => {
              this.handleFakeResponse(data)
              this._busy = false
            })
            .catch(this.handleNetworkError)
        }
      })
    } else {
      this._wSocket && this._wSocket.send(data)
    }
  }

  onInterval = (): void => {
    if (this.isFakeSocket && !this._busy) {
      this._currentTransaction.then(() => {
        this._busy = true
        this._currentTransaction = fetch(this._fakeUrl, {
          method: 'GET'
        })
          .then((x) => x.json())
          .then((data) => {
            this.handleFakeResponse(data)
            this._busy = false
          })
          .catch(this.handleNetworkError)
          .then(() => {
            if (this.readyState < 3) {
              setTimeout(this.onInterval, 1000)
            }
          })
      })
    }
  }

  close(code?: number | undefined, reason?: string | undefined): void {
    this._wSocket && this._wSocket.close(code, reason)
  }
}

export default FakeSocketBase
