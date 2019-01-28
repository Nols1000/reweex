import { Store, AnyAction, Action, Unsubscribe, Reducer } from "redux";
import { Message } from "./message";
import { MessageType } from "./message-type";
import { UpdateMessage } from "./update-message";
import { Channel } from "./channel";

export class StoreProxy<S = any, A extends Action = AnyAction> implements Store<S, A> {

    private state: S;
    private listeners: Array<() => void> = [];

    constructor(state: S) {
        this.state = state;

        // @ts-ignore https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/runtime/connect
        const port = browser.runtime.connect({ name: Channel.STATE_UPDATE });

        port.onMessage.addListener((message: Object) => {
            if ((<Message> message).type) {
                this.onMessage(<Message> message);
            }
        });
    }

    dispatch<T extends A>(action: T): T {
        browser.runtime.sendMessage({
            type: MessageType.DISPATCH,
            action: action
        });

        return action;
    }    
    
    getState(): S {
        return this.state;
    }
    
    subscribe(listener: () => void): Unsubscribe {
        this.listeners.push(listener);

        return () => {
            const index = this.listeners.indexOf(listener);

            if (index > -1) {
                this.listeners.splice(index, 1);
            }
        }
    }

    replaceReducer(nextReducer: Reducer<S, A>): void {
        throw new Error("Method not implemented.")
    }

    private onMessage(message: Message) {
        if (message.type === MessageType.CLIENT_UPDATE) {
            if ((<UpdateMessage<S>> message).state) {
                this.state = (<UpdateMessage<S>> message).state;
                this.listeners.forEach(listener => listener());
            } else {
                console.warn(`Received invalid update-message: ${message}`);
            }
        }
    }
}

export async function createStoreProxy() {
    return browser.runtime.sendMessage({
        type: MessageType.REQ_CLIENT_UPDATE
    }).then((state: any) => {
        return new StoreProxy(state);
    })
}