import {Client, Collection, EmbedBuilder, TextChannel} from "discord.js";
import {GameUser} from "../interfaces/Internal";
import discordTokens from "../config/discordTokens";
import {Vote} from "../interfaces/Game";

// TODO: Make a struct for transferring maps, and cleanup existing calcVote

const logVotes = async (votes: Collection<string, string[]>,
                        orderedMapList: any,
                        voteLabel: string, gameUsers: GameUser[], client: Client) => {
    const channel = await client.channels.fetch(discordTokens.GameLogChannel) as TextChannel;

    let userVotes: {
        userId: string;
        votes: string;
    }[] = [];

    for (let vote of votes) {
        let convertedMaps = "";
        for (let map of vote[1]) {
            // @ts-ignore
            convertedMaps += orderedMapList[map] + ", ";
        }
        let discordId = 'not found';
        for (let user of gameUsers) {
            // Have to check ObjectIds with string comparison because js
            if (String(user.dbID) == String(vote[0])) {
                discordId = user.discordMember  .id;
            }
        }
        userVotes.push({
            userId: `${discordId}`,
            votes: convertedMaps,
        });
    }

    const embed = new EmbedBuilder();
    embed.setTitle(`Votes for ${voteLabel}`);
    embed.setDescription("Votes:")
    for (let user of userVotes) {
        embed.addFields({
            name: user.userId,
            value: `<@${user.userId}>\n${user.votes}`,
            inline: false,
        });
    }

    await channel.send({content: `Votes for ${voteLabel}`, embeds: [embed.toJSON()]});
}

const getRandom = (votes: Vote[], lowerBound: number, upperBound: number, count: number): string[] => {
    if (count == 1) {
        return [votes[Math.floor(Math.random() * upperBound) + lowerBound].id]
    }
    let i1 = Math.floor(Math.random() * upperBound) + lowerBound
    let i2 = Math.floor(Math.random() * upperBound) + lowerBound


    while (i1 == i2) {
        i2 = Math.floor(Math.random() * upperBound) + lowerBound
    }

    if (count == 3) {
        let i3 = Math.floor(Math.random() * upperBound) + lowerBound
        while (i1 == i3 || i2 == i3) {
            i3 = Math.floor(Math.random() * upperBound) + lowerBound
        }
        return [votes[i1].id, votes[i2].id, votes[i3].id];
    } else {
        return [votes[i1].id, votes[i2].id];
    }
}

export const calcVotes = async () => {
    // TODO: implement new vote calculation
}