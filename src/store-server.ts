import { Message } from "./message";
import { MessageType } from "./message-type";
import { Store, Action, AnyAction, Unsubscribe, Reducer, createStore, StoreEnhancer } from "redux";
import { ActionMessage } from "./action-message";
import { Channel } from "./channel";

export class StoreServer<S = any, A extends Action = AnyAction> implements Store<S, A> {

    private store: Store<S, A>;

    constructor(store: Store<S, A>) {
        this.store = store;

        browser.runtime.onConnect.addListener((port: browser.runtime.Port) => {
            this.onConnect(port);
        });

        browser.runtime.onMessage.addListener((message: Object, sender: browser.runtime.MessageSender, sendResponse: any) => {
            if ((<Message> message).type) {
                this.onMessage(<Message> message, sender, sendResponse);
            }
        });
    }

    dispatch<T extends A>(action: T): T {
        return this.store.dispatch(action);
    }    
    
    getState(): S {
        return this.store.getState();
    }
    
    subscribe(listener: () => void): Unsubscribe {
        return this.store.subscribe(listener);
    }

    replaceReducer(nextReducer: Reducer<S, A>): void {
        this.store.replaceReducer(nextReducer);
    }

    private onMessage(message: Message, sender: browser.runtime.MessageSender, sendResponse: any) {
        if (message.type === MessageType.DISPATCH) {
            if ((<ActionMessage<A>> message).action) {
                sendResponse(this.dispatch(Object.assign({
                    _sender: sender
                }, (<ActionMessage<A>> message).action)));
            } else {
                console.warn(`Received invalid dispatch-message: ${message}`);
            }
        } else if (message.type === MessageType.REQ_CLIENT_UPDATE) {
            sendResponse(this.getState());
        } else {

        }
    }

    private onConnect(port: browser.runtime.Port) {
        if (port.name !== Channel.STATE_UPDATE) {
            return;
        }

        const unsubscribe = this.subscribe(() => {
            port.postMessage({
                type: MessageType.CLIENT_UPDATE,
                state: this.getState()
            });
        })

        port.onDisconnect.addListener(() => {
            unsubscribe();
        });
    }
}

export function createStoreServer<S, A extends Action, Ext, StateExt>(reducer: Reducer<S, A>, enhancer?: StoreEnhancer<Ext, StateExt>): StoreServer<S, A> {
    return new StoreServer(createStore(reducer, enhancer))
}