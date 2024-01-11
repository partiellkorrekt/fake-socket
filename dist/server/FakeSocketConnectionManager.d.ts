import FakeSocketConnection from './FakeSocketConnection';
declare class FakeSocketConnectionManager {
    sockets: {
        [key: string]: {
            socket: FakeSocketConnection;
            lastActive: number;
        };
    };
    wsUrl: string;
    log: (message: string) => void;
    activityTimeout: number;
    constructor(args: {
        url: string;
        log?: (message: string) => void;
        activityTimeout?: number;
    });
    onActivityTimer: () => void;
    logEvent: (message: string, socket?: FakeSocketConnection, emoji?: string) => void;
    createSocket: (protocols: string[]) => Promise<{
        key: string;
        socket: FakeSocketConnection;
    }>;
    getSocket: (key?: string) => Promise<FakeSocketConnection>;
    sendMessages: (key?: string, messages?: string[]) => Promise<FakeSocketConnection>;
    _close: (socket: FakeSocketConnection, code?: number, message?: string) => Promise<void>;
    close: (key?: string, code?: number, message?: string) => Promise<FakeSocketConnection>;
}
export default FakeSocketConnectionManager;
