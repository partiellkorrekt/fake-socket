type FakeSocketEvent = {
    type: 'message';
    data: string;
} | {
    type: 'error';
};
type FakeResponse = {
    socket?: {
        buffer: FakeSocketEvent[];
        readyState: 0 | 1 | 2 | 3;
        readyStateName: string;
        closeReason?: number;
        closeReasonName?: string;
    };
};
export type EventEmitterClasses = {
    EventTarget: typeof EventTarget;
    Event: typeof Event;
    MessageEvent: typeof MessageEvent;
    CloseEvent: typeof CloseEvent;
};
declare class FakeSocketBase implements WebSocket {
    static addAlternative(forUrl: string, url: string): void;
    static setLoggingEnabled(enabled: boolean): void;
    url: string;
    origin: string;
    _fakeUrl: string;
    _wSocket: WebSocket | undefined;
    isFakeSocket: boolean;
    _readyState: number;
    _eeClasses: EventEmitterClasses;
    _eventTarget: EventTarget;
    addEventListener(...args: Parameters<WebSocket['addEventListener']>): void;
    dispatchEvent(...args: Parameters<WebSocket['dispatchEvent']>): boolean;
    removeEventListener(...args: Parameters<WebSocket['removeEventListener']>): void;
    onopen: WebSocket['onopen'];
    onclose: WebSocket['onclose'];
    onmessage: WebSocket['onmessage'];
    onerror: WebSocket['onerror'];
    handleOpen: () => void;
    handleError: () => void;
    handleMessage: (init: {
        data: string;
    }) => void;
    handleClose: (data: CloseEventInit) => void;
    constructor(eeClasses: EventEmitterClasses, url: string, protocols?: string | string[]);
    get binaryType(): BinaryType;
    get bufferedAmount(): number;
    get extensions(): string;
    get protocol(): string;
    CLOSED: 3;
    CLOSING: 2;
    CONNECTING: 0;
    OPEN: 1;
    static CLOSED: 3;
    static CLOSING: 2;
    static CONNECTING: 0;
    static OPEN: 1;
    get readyState(): number;
    handleFakeResponse: (response: FakeResponse) => void;
    _hasPanicked: boolean;
    handleNetworkError: () => void;
    _busy: boolean;
    _currentTransaction: Promise<unknown>;
    _sendBuffer: string[];
    send(data: string | ArrayBuffer | SharedArrayBuffer | Blob | ArrayBufferView): void;
    onInterval: () => void;
    close(code?: number | undefined, reason?: string | undefined): void;
}
export default FakeSocketBase;
