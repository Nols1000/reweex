import { StoreProxy, createStoreProxy } from "./store-proxy";
import { MessageType } from "./message-type";
import { Channel } from "./channel";

describe('StoreProxy', () => {

    it('should exist', () => {
        expect(StoreProxy).toBeTruthy();
    });

    it('should be created', async () => {
        const store = await createStoreProxy();

        expect(store).toBeTruthy();
    });

    it('should get the state when creating a new proxy', async () => {
        await createStoreProxy();

        expect(browser.runtime.sendMessage).toBeCalledWith({
            type: MessageType.REQ_CLIENT_UPDATE
        });
    });

    it('should send dispatched action to the store-server', async () => {
        const store = await createStoreProxy();

        const action = {
            type: 'TEST_ACTION',
            data: {
                test: {
                    data: [1, 2, 3]
                },
                hello: "world"
            }
        };

        // @ts-ignore browser is not provided by the browser but https://www.npmjs.com/package/jest-webextension-mock
        browser.runtime.sendMessage.mockClear();

        store.dispatch(action);

        expect(browser.runtime.sendMessage).toBeCalledWith({
            type: MessageType.DISPATCH,
            action: action
        });
    });

    it('should listen for state-updates', async () => {
        // @ts-ignore
        const port = browser.runtime.connect({ name: Channel.STATE_UPDATE })

        // @ts-ignore
        browser.runtime.connect.mockClear();

        // @ts-ignore browser is not provided by the browser but https://www.npmjs.com/package/jest-webextension-mock
        browser.runtime.connect.mockReturnValueOnce(port)

        await createStoreProxy();

        expect(browser.runtime.connect).toBeCalledWith({ name: Channel.STATE_UPDATE })
        expect(port.onMessage.addListener).toBeCalled();
    });

    it('should show a warn in the console when an update-message is invalid', async () => {
        console.warn = jest.fn();

        // @ts-ignore
        const port = browser.runtime.connect({ name: Channel.STATE_UPDATE })

        // @ts-ignore
        browser.runtime.connect.mockClear();

        // @ts-ignore browser is not provided by the browser but https://www.npmjs.com/package/jest-webextension-mock
        browser.runtime.connect.mockReturnValueOnce(port)

        const store = await createStoreProxy();

        expect(browser.runtime.connect).toBeCalledWith({ name: Channel.STATE_UPDATE })
        expect(port.onMessage.addListener).toBeCalled();

        // @ts-ignore
        const listener = port.onMessage.addListener.mock.calls[0][0];

        expect(listener).toBeInstanceOf(Function);

        const message = {
            type: MessageType.CLIENT_UPDATE
        };

        listener(message);

        expect(console.warn).toBeCalledWith(`Received invalid update-message: ${message}`);
    });

    it('should update the state when recieving a state update', async () => {
        // @ts-ignore
        const port = browser.runtime.connect({ name: Channel.STATE_UPDATE })

        // @ts-ignore
        browser.runtime.connect.mockClear();

        // @ts-ignore browser is not provided by the browser but https://www.npmjs.com/package/jest-webextension-mock
        browser.runtime.connect.mockReturnValueOnce(port)

        const store = await createStoreProxy();

        // @ts-ignore
        const listener = port.onMessage.addListener.mock.calls[0][0];

        expect(listener).toBeInstanceOf(Function);

        const state = {
            new: "state"
        };

        listener({
            type: MessageType.CLIENT_UPDATE,
            state: state
        });

        expect(store.getState()).toBe(state);
    });

    it('should notify a subscriber when the state changed', async () => {
        // @ts-ignore
        const port = browser.runtime.connect({ name: Channel.STATE_UPDATE })

        // @ts-ignore
        browser.runtime.connect.mockClear();

        // @ts-ignore browser is not provided by the browser but https://www.npmjs.com/package/jest-webextension-mock
        browser.runtime.connect.mockReturnValueOnce(port)

        const store = await createStoreProxy();

        const subscriber = jest.fn();

        store.subscribe(subscriber);

        // @ts-ignore
        const listener = port.onMessage.addListener.mock.calls[0][0];

        expect(listener).toBeInstanceOf(Function);

        const state = {
            new: "state"
        };

        listener({
            type: MessageType.CLIENT_UPDATE,
            state: state
        });

        expect(subscriber).toBeCalledTimes(1);
    });

    it('should notify all subscribers when the state changed', async () => {
        // @ts-ignore
        const port = browser.runtime.connect({ name: Channel.STATE_UPDATE })

        // @ts-ignore
        browser.runtime.connect.mockClear();

        // @ts-ignore browser is not provided by the browser but https://www.npmjs.com/package/jest-webextension-mock
        browser.runtime.connect.mockReturnValueOnce(port)

        const store = await createStoreProxy();

        const subscriber1 = jest.fn();
        const subscriber2 = jest.fn();

        store.subscribe(subscriber1);
        store.subscribe(subscriber2);

        // @ts-ignore
        const listener = port.onMessage.addListener.mock.calls[0][0];

        expect(listener).toBeInstanceOf(Function);

        const state = {
            new: "state"
        };

        listener({
            type: MessageType.CLIENT_UPDATE,
            state: state
        });

        expect(subscriber1).toBeCalledTimes(1);
        expect(subscriber2).toBeCalledTimes(1);
    });

    it('should notify all subscribers did not unsubscribe when the state changed', async () => {
        // @ts-ignore
        const port = browser.runtime.connect({ name: Channel.STATE_UPDATE })

        // @ts-ignore
        browser.runtime.connect.mockClear();

        // @ts-ignore browser is not provided by the browser but https://www.npmjs.com/package/jest-webextension-mock
        browser.runtime.connect.mockReturnValueOnce(port)

        const store = await createStoreProxy();

        const subscriber1 = jest.fn();
        const subscriber2 = jest.fn();

        const unsubscribe = store.subscribe(subscriber1);
        store.subscribe(subscriber2);

        unsubscribe();

        // @ts-ignore
        const listener = port.onMessage.addListener.mock.calls[0][0];

        expect(listener).toBeInstanceOf(Function);

        const state = {
            new: "state"
        };

        listener({
            type: MessageType.CLIENT_UPDATE,
            state: state
        });

        expect(subscriber2).toBeCalledTimes(1);
    });

    it('should throw an Error when replaceReducer is called', async () => {
        const store = await createStoreProxy();

        expect(() => store.replaceReducer(() => {})).toThrowError(/Method not implemented./)
    });
});
