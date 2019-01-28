import { MessageType } from "./message-type";

export interface Message extends Object {
    type: MessageType
}