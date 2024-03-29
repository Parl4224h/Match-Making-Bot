import {GuildMember} from "discord.js";
import {ObjectId} from "mongoose";

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
    channel: boolean
}

export interface GameUser {
    accepted: boolean;
    discordMember: GuildMember;
    dbID: ObjectId;
    team: number;
}


