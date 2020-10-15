import { Express, Request, Application } from 'express-serve-static-core'
import { json as ExpressJSON } from 'body-parser'
import FakeSocketConnectionManager from './FakeSocketConnectionManager'
import { sendData, sendError } from './sendAnswer'

export type FakeSocketExpressSettings = {
  express: (() => Express) & { json: typeof ExpressJSON }
  remoteUrl: string
  baseUrl?: string | ((request: Request) => string | undefined)
  log?: (message: string) => void
  activityTimeout?: number
}

const fakeSocketExpress = ({
  express,
  remoteUrl,
  log,
  baseUrl,
  activityTimeout
}: FakeSocketExpressSettings): Application => {
  const app = express()

  const connectionManager = new FakeSocketConnectionManager({
    url: remoteUrl,
    log,
    activityTimeout
  })

  const getBaseUrl = (request: Request) => {
    const settingsBaseUrl = typeof baseUrl === 'function' ? baseUrl(request) : baseUrl
    return settingsBaseUrl || request.protocol + '://' + request.get('host')
  }

  app.use((request, response, next) => {
    response.setHeader('Access-Control-Allow-Origin', '*')
    response.setHeader('Access-Control-Allow-Methods', '*')
    response.setHeader('Access-Control-Allow-Headers', '*')
    express.json()(request, response, (error) => {
      if (error) {
        sendError(response, 'Invalid JSON', new Error(error.type), null, 400)
      } else {
        next()
      }
    })
  })

  app.put('/', (request, response) => {
    const protocols = Array.isArray(request.body.protocols) ? request.body.protocols : []
    connectionManager
      .createSocket(protocols)
      .then(({ key, socket }) => {
        const url = getBaseUrl(request) + request.originalUrl + '/' + key
        sendData(response, 'Connection successful!', { url }, socket)
      })
      .catch((e) => {
        const { message, socket, error } = e || {}
        sendError(response, message || 'Connection failed!', error, socket)
      })
  })

  app.get('/:key', (request, response) => {
    connectionManager
      .getSocket(request.params.key)
      .then((socket) => {
        sendData(response, 'Socket found', undefined, socket)
      })
      .catch((e) => {
        sendError(response, e.message || 'Unknown socket', e, undefined, 404)
      })
  })

  app.post('/:key', (request, response) => {
    connectionManager
      .sendMessages(request.params.key, request.body)
      .then((socket) => {
        sendData(response, 'Messages sent', undefined, socket)
      })
      .catch((e) => {
        if ('socket' in e) {
          sendError(response, e.message, e.error, e.socket, 400)
        } else {
          sendError(response, e.message || 'Unknown socket', e, undefined, 404)
        }
      })
  })

  app.delete('/:key', (request, response) => {
    connectionManager
      .close(request.params.key)
      .then((socket) => {
        sendData(response, 'Socket closed', undefined, socket)
      })
      .catch((e) => {
        sendError(response, e.message || 'Unknown socket', e, undefined, 404)
      })
  })

  return app
}

export default fakeSocketExpress
