import {ObjectId} from "mongoose";
import {UserInt} from "../../database/models/UserModel";
import {GuildMember, User} from "discord.js";
// TODO: implement user getting
export const getUserById = async (id: ObjectId): Promise<UserInt> => {

    return "" as any as UserInt
}

export const getUserByUser = async (user: GuildMember | User): Promise<UserInt> => {
    return "" as any as UserInt;
}