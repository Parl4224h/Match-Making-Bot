import {GameUser, Rank} from "../interfaces/Internal";
import tokens from "../config/tokens";
import {GuildMember, Role, Client} from "discord.js";
import discordTokens from "../config/discordTokens";
import cacheController from "../controllers/CacheController";
import {StatsInt} from "../database/models/StatsModel";

const ranks = tokens.Ranks

const rankRoles = ranks.map(rank => rank.roleID);

export const getRank = (mmr: number): Rank => {
    let highRank: Rank = {name: 'unranked', threshold: -999999, roleID: ''};
    for (let rank of tokens.Ranks) {
        if (rank.threshold <= mmr && rank.threshold >= highRank.threshold) {
            highRank = rank;
        }
    }
    return highRank!;
}

export const roleRemovalCallback = async (value: Role, member: GuildMember) => {
    if (rankRoles.includes(value.id)) {
        await member.roles.remove(value.id);
    }
}

export const updateRanks = async (users: GameUser[], client: Client) => {
    const guild = await client.guilds!.fetch(discordTokens.GuildID);
    for (let user of users) {
        const stats = await cacheController.getStatsByUserId(user.dbID) as StatsInt;
        const member = await guild.members.fetch(user.discordMember.id);
        member.roles.cache.forEach((value) => {roleRemovalCallback(value, member)});
        if (stats.gamesPlayed >= 10) {
            const rank = getRank(stats.mmr);
            await member.roles.add(rank.roleID);
        }
    }
}