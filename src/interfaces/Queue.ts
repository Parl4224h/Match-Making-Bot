import {ObjectId} from "mongoose";
import {Regions} from "../database/models/UserModel";

export interface QueueUser {
    dbID: ObjectId;
    discordID: string;
    expireTime: number;
    name: string;
    region: Regions;
    mmr: number;
    uniqueID: string;
}

export interface PingMeUser {
    id: string;
    inQueue: number;
    expireTime: number;
    pinged: boolean;
}

export interface playerInfo {
    db: ObjectId;
    discord: string;
    region: Regions;
    mmr: number;
    name: string;
    uniqueID: string;
}