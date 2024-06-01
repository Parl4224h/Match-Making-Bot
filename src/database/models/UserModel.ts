import {Document, model, Schema} from "mongoose";


export enum Regions {
    NAE = "NAE",
    NAW = "NAW",
    EUE = "EUE",
    EUW = "EUW",
    APAC = "APAC",
}

export interface UserInt extends Document {
    id: string
    name: string;
    banUntil: number;
    lastBan: number;
    banCounterAbandon: number;
    banCounterFail: number;
    dmMatch: boolean;
    dmQueue: boolean;
    dmAuto: boolean;
    lastReductionAbandon: number;
    gamesPlayedSinceReductionAbandon: number;
    lastReductionFail: number;
    gamesPlayedSinceReductionFail: number;
    requeue: boolean;
    frozen: boolean;
    region: Regions;
    steamID: string;
    muteUntil: number;
    transferred: boolean;
}

export const UserSchema = new Schema({
    id: String,
    name: String,
    banUntil: Number,
    lastBan: Number,
    banCounterAbandon: Number,
    banCounterFail: Number,
    dmMatch: Boolean,
    dmQueue: Boolean,
    dmAuto: Boolean,
    lastReductionAbandon: Number,
    gamesPlayedSinceReductionAbandon: Number,
    lastReductionFail: Number,
    gamesPlayedSinceReductionFail: Number,
    requeue: Boolean,
    frozen: Boolean,
    region: {
        type: String,
        enum: ["NAE", "NAW", "EUE", "EUW", "APAC"]
    },
    steamID: String,
    muteUntil: Number,
    transferred: Boolean,
})

export default model<UserInt>('users', UserSchema)
