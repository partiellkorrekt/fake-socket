import express from 'express'
import FakeSocketConnection, { READYSTATES, knownCloseCodes } from './FakeSocketConnection'

export const sendJSONAnswer = (response: express.Response<string>, answer: unknown, statusCode = 200): void => {
  response.statusCode = statusCode
  response.setHeader('Content-Type', 'application/json')
  response.write(JSON.stringify(answer))
  response.end()
}

export const sendError = (
  response: express.Response<string>,
  message: string,
  error: Error,
  socket?: FakeSocketConnection | null,
  statusCode = 400
): void => {
  sendJSONAnswer(
    response,
    {
      message,
      socket:
        socket === null
          ? null
          : socket
          ? socket.getBuffer(true)
          : {
              readyState: 3,
              readyStateName: READYSTATES[3],
              closeReason: 1006,
              closeReasonName: knownCloseCodes[1006],
              buffer: []
            },
      error
    },
    statusCode
  )
}

export const sendData = (
  response: express.Response<string>,
  message: string,
  data: { [key: string]: unknown } = {},
  socket?: FakeSocketConnection,
  statusCode = 200
): void => {
  sendJSONAnswer(
    response,
    Object.assign(
      {
        message,
        socket: socket
          ? socket.getBuffer(true)
          : {
              readyState: 3,
              readyStateName: READYSTATES[3],
              closeReason: 1006,
              closeReasonName: knownCloseCodes[1006],
              buffer: []
            }
      },
      data
    ),
    statusCode
  )
}
