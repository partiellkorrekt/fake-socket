import WebSocket from 'ws';
export declare const knownCloseCodes: {
    1000: string;
    1001: string;
    1002: string;
    1003: string;
    1005: string;
    1006: string;
    1007: string;
    1008: string;
    1009: string;
    1010: string;
    1011: string;
    1012: string;
    1013: string;
    1014: string;
    1015: string;
};
export declare const READYSTATES: string[];
export type WebsocketEvent = {
    type: 'message';
    data: WebSocket.Data;
} | {
    type: 'error';
};
declare class FakeSocketConnection {
    _socket: WebSocket;
    _lastUsed: number;
    _buffer: WebsocketEvent[];
    id: number;
    closeReason: number | undefined;
    constructor(address: string, protocols?: string[], options?: WebSocket.ClientOptions);
    refresh(): void;
    get age(): number;
    set onopen(listener: (event: WebSocket.Event) => void);
    get onopen(): ((event: WebSocket.Event) => void) | null;
    send(message: string): Promise<void>;
    close(code?: number, message?: string): Promise<void>;
    getBuffer(destructive?: boolean): {
        readyState: number;
        readyStateName: string;
        closeReason: number | undefined;
        closeReasonName: string | undefined;
        buffer: WebsocketEvent[];
    };
}
export default FakeSocketConnection;
