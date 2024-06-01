import {GuildMember} from "discord.js";
import {ObjectId} from "mongoose";
import {Regions} from "../database/models/UserModel";
import {Stages} from "../controllers/GameController";

export interface InternalResponse {
    success: boolean;
    message: string;
    next?: boolean;
    data?: any;
}


// limited and channel specify if that check was the reason for invalid permission
export interface CommandPermission {
    valid: boolean;
    limited: boolean;
    channel: boolean;
    guild: boolean;
}

export interface Rank {
    name: string;
    threshold: number;
    roleID: string;
}

export interface GameUser {
    accepted: boolean;
    discordMember: GuildMember;
    dbID: ObjectId;
    team: number;
    uniqueID: string;
    name: string;
    region: Regions;
    mmr: number;
}

export interface GameData {
    matchNumber: number;
    tickCount: number;
    state: number;
    stage: Stages;
    users: string[];
}
