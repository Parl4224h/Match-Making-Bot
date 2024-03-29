import {Document, model, Schema} from "mongoose";

export interface MessageInt extends Document {
    id: string;
    title: string;
    body: string;
}

export const MessageSchema = new Schema({
    id: String,
    title: String,
    body: String,
});

export default model<MessageInt>('messages', MessageSchema);
