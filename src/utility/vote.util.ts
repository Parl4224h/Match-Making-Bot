import {Client, EmbedBuilder, TextChannel} from "discord.js";
import discordTokens from "../config/discordTokens";
import {mapIndex, Vote} from "../interfaces/Game";
import {MapManager} from "./match.util";


export enum VoteTypes {
    banThree = 0,
    banTwo = 1,
    selectOne = 2,
}

export interface VoteData {
    sideSet: {
        "1": string,
        "2": string,
    };
    bannedMaps: string[];
    teamAChannelID: string;
    teamBChannelID: string;
    teamARoleID: string;
    teamBRoleID: string;
    teamAVCID: string;
    teamBVCID: string;
}

export const getTotals = (votes: Map<string, string[]>, entries: number): Map<string, number> => {
    const totals: Map<string, number> = new Map<string, number>();

    for (let i = 1; i <= entries; i++) {
        totals.set(String(i), 0)
    }

    for (let vote of votes.values()) {
        for (let subVote of vote) {
            totals.set(subVote, totals.get(subVote)! + 1);
        }
    }

    return totals;
}

const logVotes = async (votes: Map<string, string[]>,
                        orderedMapList: MapManager,
                        voteLabel: string, client: Client) => {
    const channel = await client.channels.fetch(discordTokens.GameLogChannel) as TextChannel;

    // TODO: fix vote logging to work with new map manager

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
        userVotes.push({
            userId: `${vote[0]}`,
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
    console.log('-------------')
    console.log(lowerBound, upperBound, count);
    // Generate the random indexes to return
    const randomIndexes: number[] = [];
    while (randomIndexes.length < count) {
        let newIndex = Math.floor(Math.random() * (upperBound - lowerBound)) + lowerBound;
        while (randomIndexes.includes(newIndex)) {
            newIndex = Math.floor(Math.random() * (upperBound - lowerBound)) + lowerBound;
        }
        randomIndexes.push(newIndex);
    }
    console.log(randomIndexes);
    console.log('-------------')
    // Create the list of values to return
    const returnValues: string[] = []
    for (let index of randomIndexes) {
        returnValues.push(votes[index].id);
    }
    return returnValues
}

const getMapTotals = (votes: Map<string, string[]>, total: number): Map<string, Vote> => {
    const mapTotals: Map<string, Vote> = new Map<string, Vote>();

    for (let i = 1; i <= total; i++) {
        mapTotals.set(String(i), {id: String(i), total: 0});
    }

    // Transform votes into map totals instead of user totals
    for (let voter of votes.values()) {
        for (let vote of voter) {
            let check = mapTotals.get(vote);
            if (check) {
                mapTotals.set(vote, {id: check.id, total: check.total + 1})
            } else {
                mapTotals.set(vote, {id: vote, total: 1});
            }
        }
    }

    return mapTotals
}


export const calcSide = async (votes: Map<string, string[]>, matchNumber: number, client: Client): Promise<[string, string]> => {
    const mapTotals: Map<string, Vote> = getMapTotals(votes, 2);

    const CT = mapTotals.get("1")!;
    const T = mapTotals.get("2")!;

    // TODO: add vote logging

    if (CT.total == T.total) {
        return getRandom([CT, T], 0, 2, 2) as [string, string];
    } else if (CT.total > T.total) {
        return ["T", "CT"];
    } else {
        return ["CT", "T"];
    }
}

export const calcVotes = async (votes: Map<string, string[]>, voteType: VoteTypes, team: 'A' | 'B', matchNumber: number, mapManager: MapManager, client: Client) => {
    let total = 4;
    let selected: string[] = [];
    let voteLabel = `Match ${matchNumber}: Team ${team}, `;
    let selectNumber = 0;

    switch (voteType) {
        case VoteTypes.banThree: {
            selectNumber = 3;
            voteLabel += "Ban Three";
            total = 7;
        } break;
        case VoteTypes.banTwo: {
            selectNumber = 2;
            voteLabel += "Ban Two";
            total = 4;
        } break;
        case VoteTypes.selectOne: {
            selectNumber = 1;
            voteLabel += "Select One";
            total = 2;
        } break;
    }

    await logVotes(votes, mapManager, voteLabel, client);

    const mapTotals: Map<string, Vote> = getMapTotals(votes, total);
    // Create an array instead of collection for easier use in loops
    const mapVotes = Array.from(mapTotals.values()).sort((a, b) => b.total - a.total);

    let offset = 0;
    let complete = false;

    while (!complete) {
        let sameCount = 0;
        let sameIds: string[] = [];
        for (let i = offset; i < mapVotes.length; i++) {
            if (mapVotes[offset].total == mapVotes[i].total) {
                sameIds.push(mapVotes[i].id);
                sameCount++;
            } else {
                break;
            }
        }

        if (sameCount + selected.length < selectNumber) {
            selected = selected.concat(sameIds);
            offset += sameCount;
        } else if (sameCount + selected.length == selectNumber) {
            selected = selected.concat(sameIds);
            complete = true;
        } else {
            selected = selected.concat(getRandom(mapVotes, offset , offset + sameCount - 1, selectNumber - selected.length));
            complete = true;
        }
    }

    const returnMaps: string[] = [];

    for (let id of selected) {
        returnMaps.push(mapManager.getMapNameByGame(matchNumber, id as mapIndex));
    }

    return returnMaps;
}