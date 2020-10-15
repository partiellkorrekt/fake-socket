import { v4 as uuid } from 'uuid'
import FakeSocketConnection, { knownCloseCodes } from './FakeSocketConnection'

class FakeSocketConnectionManager {
  sockets: { [key: string]: { socket: FakeSocketConnection; lastActive: number } } = {}
  wsUrl: string
  log: (message: string) => void
  activityTimeout: number

  constructor(args: { url: string; log?: (message: string) => void; activityTimeout?: number }) {
    this.wsUrl = args.url
    this.log = args.log || (() => undefined)
    this.activityTimeout = args.activityTimeout || 10000
    setInterval(this.onActivityTimer, Math.max(500, this.activityTimeout / 5))
  }

  onActivityTimer = (): void => {
    const now = new Date().getTime()
    const oldConnections = Object.values(this.sockets).filter((x) => now - x.lastActive > this.activityTimeout)
    oldConnections.forEach(({ socket }) => this._close(socket, 1000, 'Connection Timeout Reached'))
  }

  logEvent = (message: string, socket?: FakeSocketConnection, emoji?: string): void => {
    for (const key in this.sockets) {
      if (this.sockets[key].socket === socket) {
        this.sockets[key].lastActive = new Date().getTime()
      }
    }
    this.log([emoji, socket && socket.id ? `#${socket.id}` : '', message].filter((x) => !!x).join(' | '))
  }

  createSocket = (protocols: string[]): Promise<{ key: string; socket: FakeSocketConnection }> =>
    new Promise((resolve, reject) => {
      try {
        const key = uuid()
        const { socket } = (this.sockets[key] = {
          socket: new FakeSocketConnection(this.wsUrl, protocols),
          lastActive: new Date().getTime()
        })
        let successfulConnection = false
        socket._socket.on('close', (e: number) => {
          if (!successfulConnection) {
            const description = e in knownCloseCodes ? ` (${knownCloseCodes[e as keyof typeof knownCloseCodes]})` : ''
            delete this.sockets[key]
            this.logEvent('Socket closed: ' + e + description, socket, '🟠')
            this.logEvent(`Socket deleted: ${e} (Initial connection failed)`, socket, '🔴')

            reject({
              message: 'Connection failed!',
              socket,
              error: new Error('Connection failed')
            })
          } else {
            const description = e in knownCloseCodes ? ` (${knownCloseCodes[e as keyof typeof knownCloseCodes]})` : ''
            this.logEvent('Socket closed: ' + e + description, socket, '🟠')
          }
        })
        socket.onopen = () => {
          this.logEvent('Socket opened: ' + key, socket, '🟢')
          setTimeout(() => {
            if (socket._socket.readyState !== 3) {
              successfulConnection = true
              resolve({ key, socket })
            }
          }, 100)
        }
        socket._socket.on('message', (data) => {
          this.logEvent(
            'Receive: ' + (['string', 'boolean', 'number'].includes(typeof data) ? data : JSON.stringify(data)),
            socket,
            '⏬'
          )
        })
      } catch (error) {
        reject({
          message: 'Connection failed!',
          socket: undefined,
          error
        })
      }
    })

  getSocket = (key?: string): Promise<FakeSocketConnection> =>
    new Promise((resolve, reject) => {
      const connection = this.sockets[key || '']
      if (!connection) {
        reject({ message: 'Socket not found!' })
      }
      connection.lastActive = new Date().getTime()
      resolve(connection.socket)
    })

  sendMessages = (key?: string, messages?: string[]): Promise<FakeSocketConnection> => {
    return this.getSocket(key).then((socket) => {
      if (Array.isArray(messages)) {
        return Promise.all(
          messages.map((message) => {
            this.logEvent('Send: ' + message.toString(), socket, '⏫')
            return socket.send(message)
          })
        )
          .catch((e) => {
            this.logEvent('Send error: ' + e.message, socket, '🟡')
            throw {
              message: 'Error sending messages',
              error: e,
              socket
            }
          })
          .then(() => socket)
      }
      return socket
    })
  }

  _close = (socket: FakeSocketConnection, code = 1000, message?: string): Promise<void> => {
    return socket.close(code, message).then(() => {
      for (const key in this.sockets) {
        if (this.sockets[key].socket === socket) {
          delete this.sockets[key]
          break
        }
      }
      this.logEvent(`Socket deleted: ${code} (${message || 'no message'})`, socket, '🔴')
      this.logEvent(`${Object.keys(this.sockets).length} sockets remaining`, undefined, 'ℹ️ ')
    })
  }

  close = (key = '', code?: number, message?: string): Promise<FakeSocketConnection> => {
    return this.getSocket(key).then((socket) => this._close(socket, code, message).then(() => socket))
  }
}

export default FakeSocketConnectionManager
