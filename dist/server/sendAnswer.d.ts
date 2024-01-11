import express from 'express';
import FakeSocketConnection from './FakeSocketConnection';
export declare const sendJSONAnswer: (response: express.Response<string>, answer: unknown, statusCode?: number) => void;
export declare const sendError: (response: express.Response<string>, message: string, error: Error, socket?: FakeSocketConnection | null, statusCode?: number) => void;
export declare const sendData: (response: express.Response<string>, message: string, data?: {
    [key: string]: unknown;
}, socket?: FakeSocketConnection, statusCode?: number) => void;
