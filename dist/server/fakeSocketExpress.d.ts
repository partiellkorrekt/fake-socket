import { Express, Request, Application } from 'express-serve-static-core';
import { json as ExpressJSON } from 'body-parser';
export type FakeSocketExpressSettings = {
    express: (() => Express) & {
        json: typeof ExpressJSON;
    };
    remoteUrl: string;
    baseUrl?: string | ((request: Request) => string | undefined);
    log?: (message: string) => void;
    activityTimeout?: number;
};
declare const fakeSocketExpress: ({ express, remoteUrl, log, baseUrl, activityTimeout }: FakeSocketExpressSettings) => Application;
export default fakeSocketExpress;
