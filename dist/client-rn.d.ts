import FakeSocketBase from './client/FakeSocketBase';
export default class FakeSocket extends FakeSocketBase {
    constructor(url: string, protocols?: string | string[]);
}
