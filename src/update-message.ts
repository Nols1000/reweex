import { Message } from "./message";

export interface UpdateMessage<S> extends Message {
    state: S;
}