import { Document, model, Schema } from "mongoose";

export interface MapInt extends Document {
    name: string;
    resourceID: string;
    inPool: boolean;
    imageURL: string;
    calloutMap: string;
}

export const MapSchema = new Schema({
    name: String,
    resourceID: String,
    inPool: String,
    imageURL: String,
    calloutMap: String,
});

export default model<MapInt>("maps", MapSchema);