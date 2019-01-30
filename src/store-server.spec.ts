import { Channel } from './channel';
import { StoreServer, createStoreServer } from "./store-server";
import { Store } from "redux";
import { MessageType } from './message-type';

describe('StoreServer', () => {

    it('should exist', () => {
        expect(StoreServer).toBeTruthy();
    });

    it('should be created', () => {
        const store = createStoreServer(() => {});

        expect(store).toBeTruthy();
    });

    it('should call dispatch on the wrapped store', () => {
        const mockStore: Store = {
            dispatch: jest.fn(),
            getState: jest.fn(),
            subscribe: jest.fn(),
            replaceReducer: jest.fn(),
        }

        const store = new StoreServer(mockStore);

        const action = {
            type: 'TEST_ACTION'
        };

        store.dispatch(action);

        expect(mockStore.dispatch).toBeCalledWith(action);
    });

    it('should call getState on the wrapped store', () => {
        const mockStore: Store = {
            dispatch: jest.fn(),
            getState: jest.fn(),
            subscribe: jest.fn(),
            replaceReducer: jest.fn(),
        }

        const store = new StoreServer(mockStore);

        store.getState();

        expect(mockStore.getState).toBeCalledTimes(1);
    });

    it('should call subscribe on the wrapped store', () => {
        const mockStore: Store = {
            dispatch: jest.fn(),
            getState: jest.fn(),
            subscribe: jest.fn(),
            replaceReducer: jest.fn(),
        }

        const store = new StoreServer(mockStore);

        const listener = () => {};

        store.subscribe(listener);

        expect(mockStore.subscribe).toBeCalledWith(listener);
    });

    it('should call replaceReducer on the wrapped store', () => {
        const mockStore: Store = {
            dispatch: jest.fn(),
            getState: jest.fn(),
            subscribe: jest.fn(),
            replaceReducer: jest.fn(),
        }

        const store = new StoreServer(mockStore);

        const reducer = () => {}

        store.replaceReducer(reducer);

        expect(mockStore.replaceReducer).toBeCalledWith(reducer);
    });

    it('should listen for state update requests', () => {
        // @ts-ignore
        browser.runtime.onConnect.addListener.mockClear();
        // @ts-ignore
        const port = browser.runtime.connect({ name: Channel.STATE_UPDATE })

        const mockStore: any = {
            dispatch: jest.fn(),
            getState: jest.fn(),
            subscribe: jest.fn(),
            replaceReducer: jest.fn(),
        }

        const store = new StoreServer(mockStore);

        expect(browser.runtime.onConnect.addListener).toBeCalledTimes(1);

        // @ts-ignore
        const listener = browser.runtime.onConnect.addListener.mock.calls[0][0];

        expect(listener).toBeInstanceOf(Function);

        const unsubcriber = jest.fn();
        mockStore.subscribe.mockReturnValueOnce(unsubcriber)

        listener(port);

        expect(mockStore.subscribe).toBeCalledTimes(1)

        const subscriber = mockStore.subscribe.mock.calls[0][0];

        expect(subscriber).toBeInstanceOf(Function);

        subscriber();

        expect(port.postMessage).toBeCalledWith({
            type: MessageType.CLIENT_UPDATE,
            state: undefined
        });
    });

    it('should unsubscribe when port disconnects', () => {
        // @ts-ignore
        browser.runtime.onConnect.addListener.mockClear();
        // @ts-ignore
        const port = browser.runtime.connect({ name: Channel.STATE_UPDATE })

        const mockStore: any = {
            dispatch: jest.fn(),
            getState: jest.fn(),
            subscribe: jest.fn(),
            replaceReducer: jest.fn(),
        }

        const store = new StoreServer(mockStore);

        expect(browser.runtime.onConnect.addListener).toBeCalledTimes(1);

        // @ts-ignore
        const listener = browser.runtime.onConnect.addListener.mock.calls[0][0];

        expect(listener).toBeInstanceOf(Function);

        const unsubcriber = jest.fn();
        mockStore.subscribe.mockReturnValueOnce(unsubcriber)

        listener(port);

        expect(mockStore.subscribe).toBeCalledTimes(1)

        // @ts-ignore
        const onDisconnectListener = port.onDisconnect.addListener.mock.calls[0][0]

        expect(onDisconnectListener).toBeInstanceOf(Function);

        onDisconnectListener();

        expect(unsubcriber).toBeCalledTimes(1);
    });

    it('should not listen for state update requests when port name false', () => {
        // @ts-ignore
        browser.runtime.onConnect.addListener.mockClear();
        // @ts-ignore
        const port = browser.runtime.connect({ name: 'test' })

        const mockStore: any = {
            dispatch: jest.fn(),
            getState: jest.fn(),
            subscribe: jest.fn(),
            replaceReducer: jest.fn(),
        }

        new StoreServer(mockStore);

        expect(browser.runtime.onConnect.addListener).toBeCalledTimes(1);

        // @ts-ignore
        const listener = browser.runtime.onConnect.addListener.mock.calls[0][0];

        expect(listener).toBeInstanceOf(Function);

        listener(port);

        expect(mockStore.subscribe).toBeCalledTimes(0);
    });

    it('should listen for messages', () => {
        // @ts-ignore
        browser.runtime.onMessage.addListener.mockClear();

        const mockStore: any = {
            dispatch: jest.fn(),
            getState: jest.fn(),
            subscribe: jest.fn(),
            replaceReducer: jest.fn(),
        }

        new StoreServer(mockStore);

        expect(browser.runtime.onMessage.addListener).toBeCalledTimes(1)
    });

    it('should listen for messages', () => {
        // @ts-ignore
        browser.runtime.onMessage.addListener.mockClear();

        const mockStore: any = {
            dispatch: jest.fn(),
            getState: jest.fn(),
            subscribe: jest.fn(),
            replaceReducer: jest.fn(),
        }

        new StoreServer(mockStore);

        // @ts-ignore
        const onMessageListener = browser.runtime.onMessage.addListener.mock.calls[0][0];

        expect(browser.runtime.onMessage.addListener).toBeCalledTimes(1);

        const action = {
            type: 'TEST_ACTION'
        }

        const message = {
            type: MessageType.DISPATCH,
            action: action
        };

        const sender = {};

        onMessageListener(message, sender, jest.fn());

        expect(mockStore.dispatch).toBeCalledWith(Object.assign({}, action, {
            _sender: sender
        }));
    });

    it('should listen for messages', () => {
        console.warn = jest.fn();
        // @ts-ignore
        browser.runtime.onMessage.addListener.mockClear();

        const mockStore: any = {
            dispatch: jest.fn(),
            getState: jest.fn(),
            subscribe: jest.fn(),
            replaceReducer: jest.fn(),
        }

        new StoreServer(mockStore);

        // @ts-ignore
        const onMessageListener = browser.runtime.onMessage.addListener.mock.calls[0][0];

        expect(browser.runtime.onMessage.addListener).toBeCalledTimes(1);

        const sendResponds = jest.fn();

        const message = {
            type: MessageType.DISPATCH,
        }

        onMessageListener(message, {}, sendResponds);

        expect(console.warn).toBeCalledWith(`Received invalid dispatch-message: ${message}`)
    });

    it('should listen for messages', () => {
        // @ts-ignore
        browser.runtime.onMessage.addListener.mockClear();

        const mockStore: any = {
            dispatch: jest.fn(),
            getState: jest.fn(),
            subscribe: jest.fn(),
            replaceReducer: jest.fn(),
        }

        new StoreServer(mockStore);

        // @ts-ignore
        const onMessageListener = browser.runtime.onMessage.addListener.mock.calls[0][0];

        expect(browser.runtime.onMessage.addListener).toBeCalledTimes(1);

        const sendResponds = jest.fn();

        onMessageListener({
            type: MessageType.REQ_CLIENT_UPDATE,
        }, {}, sendResponds);

        expect(sendResponds).toBeCalledWith(undefined);
    });
});
