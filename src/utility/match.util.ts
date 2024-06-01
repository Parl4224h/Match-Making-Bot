import {
    ButtonInteraction,
    ChatInputCommandInteraction,
    EmbedBuilder,
    TextChannel,
    Client,
    Guild
} from "discord.js";
import {Data} from "../data";
import {GameMap, mapIndex} from "../interfaces/Game";
import tokens from "../config/tokens";
import cacheController from "../controllers/CacheController";
import {MapInt} from "../database/models/MapModel";
import {GameController} from "../controllers/GameController";
import discordTokens from "../config/discordTokens";
import {grammaticalTime} from "./grammatical";
import {UserInt} from "../database/models/UserModel";

export interface FinalData {
    channelID: string;
}

export const getPreviousVotes = (userVotes: string[], matchNumber: number, mapManager: MapManager) => {
    let str = '';
    for (let vote of userVotes) {
        str += ` ${mapManager.getMapNameByGame(matchNumber, vote as mapIndex)}`;
    }
    return str;
}

export const matchVotes = async (interaction: ButtonInteraction, data: Data) => {
    const gameResponse = data.getGameByChannel(interaction.channelId);
    if (gameResponse.success) {
        const game = gameResponse.data as GameController;
        const voteResponse = await game.vote(interaction.user.id, interaction.customId as mapIndex);
        await interaction.reply({ephemeral: true, content: voteResponse.message});
    } else {
        await interaction.reply({ephemeral: true, content: gameResponse.message});
    }
}

export const matchReady = async (interaction: ButtonInteraction | ChatInputCommandInteraction, data: Data, time: number) => {
    const queue = data.getQueue();
    const user = await cacheController.getUserByUser(interaction.user);
    const response = await queue.addUser(user, time);
    await interaction.reply({ephemeral: true, content: response.message});
}

export const matchUnready = async (interaction: ButtonInteraction | ChatInputCommandInteraction, data: Data) => {
    const queue = data.getQueue();
    const user = await cacheController.getUserByUser(interaction.user);
    const response = await queue.removeUser(user._id, false);
    if (response) {
        await interaction.reply({ephemeral: true, content: "You have been removed from queue"});
    } else {
        await interaction.reply({ephemeral: true, content: `You were either not in queue or were not removed from queue. Current queue:
${queue.getQueueStr()}`});
    }

}

export const matchScore = async (interaction: ButtonInteraction, data: Data, score: number)=> {
    const dbUser = await cacheController.getUserByUser(interaction.user);
    const gameResponse = data.getGameByChannel(interaction.channelId);
    if (gameResponse.success) {
        const game = gameResponse.data as GameController;
        const res = await game.submitScore(dbUser, score);
        await interaction.reply({ephemeral: !res.success, content: res.message});
    } else {
        await interaction.reply({ephemeral: true, content: gameResponse.message});
    }
}

export const logScoreSubmit = async (userId: string, matchId: number, score: number, client: Client) => {
    const channel = await client.channels.fetch(discordTokens.GameLogChannel) as TextChannel;
    const embed = new EmbedBuilder();
    embed.setTitle("User has Submitted a score");
    embed.setDescription(`<@${userId}> has submitted a score of ${score} for match ${matchId}`);
    await channel.send({embeds: [embed.toJSON()]});
}

export const sendAbandonMessage = async (guild: Guild, user: UserInt, now: number, acceptFail: boolean) => {
    const channel = await guild.channels.fetch(discordTokens.GeneralChannel) as TextChannel;
    if (acceptFail) {
        await channel.send(`<@${user.id}> has failed to accept a match and been given a cooldown of ${grammaticalTime(user.banUntil - now)}`);
    } else {
        await channel.send(`<@${user.id}> has abandoned a match and been given a cooldown of ${grammaticalTime(user.banUntil - now)}`);
    }

}

export class MapManager {
    private gameMaps: Map<number, GameMap[]> = new Map<number, GameMap[]>();
    private lastPlayed: string[] = [];
    private maps: MapInt[] = [];

    constructor() {
    }

    public async load() {
        this.maps = await cacheController.getMaps();
    }

    public getLastPlayed() {
        return this.lastPlayed;
    }

    public addPlayed(map: string) {
        this.lastPlayed.push(map);
        let activeCount = 0;
        for (let map of this.maps) {
            if (map.inPool) {
                activeCount++;
            }
        }
        while (this.lastPlayed.length > activeCount - tokens.VoteSize) {
            this.lastPlayed.shift();
        }
    }

    public getMap(name: string) {
        for (let map of this.maps) {
            if (map.name == name) {
                return map;
            }
        }
    }

    public getAllMaps() {
        return this.maps;
    }

    public getMapNames() {
        const names: string[] = [];
        for (let map of this.maps) {
            names.push(map.name);
        }
        return names;
    }

    public registerGame(matchNumber: number) {
        const maps: MapInt[] = [];
        for (let map of this.maps) {
            if (!this.lastPlayed.includes(map.name) && map.inPool) {
                maps.push(map);
            }
        }
        while (maps.length < tokens.VoteSize) {
            const nextMap = this.getMap(this.lastPlayed.shift()!);
            if (nextMap) {
                if (nextMap.inPool) {
                    maps.push(nextMap);
                }
            }
        }
        while (maps.length > tokens.VoteSize) {
            maps.shift();
        }
        let i = 1;
        const gameMaps: GameMap[] = [];
        for (let map of maps) {
            gameMaps.push({
                name: map.name,
                ugc: map.resourceID,
                banned: false,
                mapID: String(i) as mapIndex,
                imageURL: map.imageURL,
            });
            i++;
        }
        this.gameMaps.set(matchNumber, gameMaps);
    }

    public registerBans(matchNumber: number, banned: string[]) {
        const maps = this.gameMaps.get(matchNumber);
        if (maps) {
            for (let map of maps) {
                if (banned.includes(map.name)) {
                    map.banned = true;
                }
            }
        }
    }

    public newIndices(matchNumber: number) {
        const maps = this.gameMaps.get(matchNumber);
        if (maps) {
            let i = 1;
            for (let map of maps) {
                if (map.banned) {
                    map.mapID = "7";
                } else {
                    map.mapID = String(i) as mapIndex;
                    i++;
                }
            }
        }
    }

    public getMapByGame(matchNumber: number, id: mapIndex) {
        const gameMaps = this.gameMaps.get(matchNumber);
        if (gameMaps) {
            for (let map of gameMaps) {
                if (map.mapID == id) {
                    return map;
                }
            }
        }
    }

    public getMapNameByGame(matchNumber: number, id: mapIndex) {
        const map = this.getMapByGame(matchNumber, id);
        if (map) {
            return map.name;
        }
        return "";
    }

    public setLastPlayed(maps: string[]) {
        this.lastPlayed = [];
        this.lastPlayed = maps;
    }
}
