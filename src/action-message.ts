import { Message } from "./message";

export interface ActionMessage<A> extends Message {
    action: A;
}