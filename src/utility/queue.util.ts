import {Client, EmbedBuilder, TextChannel} from "discord.js";
import discordTokens from "../config/discordTokens";
import {playerInfo, QueueUser} from "../interfaces/Queue";
import tokens from "../config/tokens";

export const logReady = async (userId: string, time: number, client: Client) => {
    const channel = await client.channels.fetch(discordTokens.QueueLogChannel) as TextChannel;
    const embed = new EmbedBuilder();
    embed.setTitle("User has readied");
    embed.setDescription(`<@${userId}> has readied up for ${time} minutes`);
    await channel.send({embeds: [embed.toJSON()]});
}

export const logUnready = async (userId: string, client: Client) => {
    const channel = await client.channels.fetch(discordTokens.QueueLogChannel) as TextChannel;
    const embed = new EmbedBuilder();
    embed.setTitle("User has unreadied");
    embed.setDescription(`<@${userId}> has unreadied`);
    await channel.send({embeds: [embed.toJSON()]});
}

export function shuffleArray(array: any[]) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

export const makeTeams = async (users: QueueUser[]): Promise<{teamA: playerInfo[], teamB: playerInfo[], mmrDiff: number}> => {

    let length = users.length,
        permutations = [users.slice()],
        c = new Array(length).fill(0),
        i = 1, k, p;

    while (i < length) {
        if (c[i] < i) {
            k = i % 2 && c[i];
            p = users[i];
            users[i] = users[k];
            users[k] = p;
            ++c[i];
            i = 1;
            permutations.push(users.slice());
        } else {
            c[i] = 0;
            ++i;
        }
    }

    let bestDiff = 9999;
    let bestA: QueueUser[] = [];
    let bestB: QueueUser[] = [];

    for (let permutation of permutations) {
        let teamA = permutation.slice(0, tokens.PlayerCount/2);
        let teamB = permutation.slice(tokens.PlayerCount/2, tokens.PlayerCount);

        let aSum = 0;
        let bSum = 0;

        teamA.forEach(c => aSum += c.mmr);
        teamB.forEach(c => bSum += c.mmr);

        const diff = Math.abs(aSum - bSum)

        if (diff < bestDiff) {
            bestA = teamA;
            bestB = teamB;
            bestDiff = diff;
        }
    }

    let teamA: playerInfo[] = [];
    let teamB: playerInfo[] = [];

    bestA.forEach(c => teamA.push({db: c.dbID, discord: c.discordID, region: c.region, mmr: c.mmr, name: c.name, uniqueID: c.uniqueID}));
    bestB.forEach(c => teamB.push({db: c.dbID, discord: c.discordID, region: c.region, mmr: c.mmr, name: c.name, uniqueID: c.uniqueID}));


    return {teamA: teamA, teamB: teamB, mmrDiff: bestDiff};
}
