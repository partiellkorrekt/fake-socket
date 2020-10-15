import WebSocket from 'ws'

export const knownCloseCodes = {
  1000: 'Normal Closure',
  1001: 'Going Away',
  1002: 'Protocol Error',
  1003: 'Unsupported Data',
  1005: 'No Status Received',
  1006: 'Abnormal Closure',
  1007: 'Invalid frame payload data',
  1008: 'Policy Violation',
  1009: 'Message too big',
  1010: 'Missing Extension',
  1011: 'Internal Error',
  1012: 'Service Restart',
  1013: 'Try Again Later',
  1014: 'Bad Gateway',
  1015: 'TLS Handshake'
}

export const READYSTATES = ['CONNECTING', 'OPEN', 'CLOSING', 'CLOSED']

const getID = (() => {
  let nb = 0
  return () => {
    nb++
    return nb
  }
})()

export type WebsocketEvent =
  | {
      type: 'message'
      data: WebSocket.Data
    }
  | {
      type: 'error'
    }

class FakeSocketConnection {
  _socket: WebSocket
  _lastUsed = 0
  _buffer: WebsocketEvent[] = []
  id = getID()
  closeReason: number | undefined

  constructor(address: string, protocols?: string[], options?: WebSocket.ClientOptions) {
    this._socket =
      protocols && protocols.length > 0 ? new WebSocket(address, protocols, options) : new WebSocket(address, options)
    this.refresh()
    this._socket.onmessage = (e) => {
      this._buffer.push({ type: 'message', data: e.data })
    }
    this._socket.on('close', (e: number) => {
      this.closeReason = e
    })
    this._socket.onerror = () => {
      this._buffer.push({ type: 'error' })
    }
  }

  refresh(): void {
    this._lastUsed = new Date().getTime()
  }
  get age(): number {
    return new Date().getTime() - this._lastUsed
  }

  set onopen(listener: (event: WebSocket.OpenEvent) => void) {
    this._socket.onopen = listener
  }
  get onopen(): (event: WebSocket.OpenEvent) => void {
    return this._socket.onopen
  }

  send(message: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this._socket.send(message, (e) => {
        if (e) {
          reject(e)
        } else {
          resolve()
        }
      })
    })
  }

  close(code = 1000, message?: string): Promise<void> {
    return new Promise((resolve) => {
      if (this._socket.readyState === 3) {
        resolve()
      } else {
        this._socket.once('close', resolve)
        this._socket.close(code, message)
      }
    })
  }

  getBuffer(
    destructive = false
  ): {
    readyState: number
    readyStateName: string
    closeReason: number | undefined
    closeReasonName: string | undefined
    buffer: WebsocketEvent[]
  } {
    const buffer = this._buffer
    this.refresh()
    if (destructive) {
      this._buffer = []
    }
    return {
      readyState: this._socket.readyState,
      readyStateName: READYSTATES[this._socket.readyState],
      closeReason: this.closeReason,
      closeReasonName: knownCloseCodes[this.closeReason as keyof typeof knownCloseCodes],
      buffer
    }
  }
}

export default FakeSocketConnection
