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
    logEvent: (message: string, socket?: FakeSocketConnection | undefined, emoji?: string | undefined) => void;
    createSocket: (protocols: string[]) => Promise<{
        key: string;
        socket: FakeSocketConnection;
    }>;
    getSocket: (key?: string | undefined) => Promise<FakeSocketConnection>;
    sendMessages: (key?: string | undefined, messages?: string[] | undefined) => Promise<FakeSocketConnection>;
    _close: (socket: FakeSocketConnection, code?: number, message?: string | undefined) => Promise<void>;
    close: (key?: string, code?: number | undefined, message?: string | undefined) => Promise<FakeSocketConnection>;
}
export default FakeSocketConnectionManager;
