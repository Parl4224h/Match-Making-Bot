import {Data} from "../data";
import {Client, Guild, TextChannel, APIEmbed, GuildMember} from "discord.js";
import {PingMeUser, QueueUser} from "../interfaces/Queue";
import {GameController} from "./GameController";
import moment from "moment-timezone";
import {Regions, UserInt} from "../database/models/UserModel";
import {GameData, GameUser, InternalResponse} from "../interfaces/Internal";
import {grammaticalList, grammaticalTime} from "../utility/grammatical";
import {ObjectId} from "mongoose";
import cacheController from "./CacheController";
import tokens from "../config/tokens";
import discordTokens from "../config/discordTokens";
import {logReady, logUnready, makeTeams, shuffleArray} from "../utility/queue.util";
import {logWarn} from "../utility/loggers";
import {gameEmbed} from "../embeds/game.embeds";

export class QueueController {
    private readonly data: Data;
    private readonly client: Client;
    private inQueue: QueueUser[] = [];
    private generating: boolean = false;
    private pingMe: Map<string, PingMeUser> = new Map<string, PingMeUser>();
    private activeGames: GameController[] = [];
    private locked = false;


    constructor(data: Data, client: Client) {
        this.client = client;
        this.data = data;
    }

    public async load() {
        // TODO: implement loading of persisted data
    }

    private async queueCheckTask(time: number, guild: Guild) {
        for (let user of this.inQueue) {
            if (user.expireTime < time) {
                await this.removeUser(user.dbID, true);
            } else if (user.expireTime == (time + 180)) {
                const member = await guild.members.fetch(user.discordID);
                if (!member.dmChannel) {
                    await member.createDM(true);
                }
                const dbUser = await cacheController.getUserById(user.dbID) as UserInt;
                if (dbUser.dmQueue) {
                    try {
                        await member.dmChannel!.send("Your queue time expires in 3 minutes. If you wish to re ready please do so");
                    } catch (e) {
                        await logWarn(`Could not dm user -${dbUser.id}`, this.client);
                    }
                }
            }
        }
        if (this.inQueue.length >= tokens.PlayerCount && !this.generating) {
            this.generating = true;
            await this.createMatch();
            this.generating = false;
        }
    }

    private async gameTickTask(game: GameController) {
        try {
            await game.tick();
        } catch (e) {
            console.error(e);
        }

        if (game.isProcessed() && game.hasEnded()) {
            shuffleArray(game.getRequeue());
            const arrayClone: ObjectId[] = JSON.parse(JSON.stringify(game.getRequeue()));
            game.clearRequeue();
            this.activeGames.forEach((gameItr, i) => {if (gameItr.matchNumber == game.matchNumber) this.activeGames.splice(i, 1)});
            this.data.getMapManager().addPlayed(game.getMap());
            for (let user of arrayClone) {
                const dbUser = await cacheController.getUserById(user) as UserInt;
                const member = await game.guild.members.fetch(dbUser.id);
                const response = await this.addUser(dbUser, 15);
                if (!member.dmChannel) {
                    await member.createDM(true);
                }
                if (dbUser.dmAuto) {
                    try {
                        await member.dmChannel!.send(`Auto Ready:\n${response.message}`);
                    } catch (e) {
                        await logWarn(`Could not dm user -${dbUser.id}`, this.client);
                    }
                }
            }
        }
    }

    private async pingMeTask(guild: Guild, time: number) {
        for (let user of this.pingMe.values()) {
            if (this.inQueueNumber() >= user.inQueue && !user.pinged) {
                const member = await guild.members.fetch(user.id);
                if (member) {
                    try {
                        let channel = member.dmChannel;
                        if (!channel) {
                            channel = await member.createDM(true);
                        }
                        await channel.send(`<@${user.id}> there are in ${user.inQueue} queue`);
                    } catch (e) {
                        await logWarn(`Could not DM user-${user.id}`, this.client);
                    }
                }
                user.pinged = true;
            }
            if (time > user.expireTime && user.expireTime >= 0) {
                this.pingMe.delete(user.id);
            }
            if (this.inQueueNumber() < user.inQueue) {
                user.pinged = false;
            }
        }
    }

    public async tick() {
        try {
            const now = moment().unix();
            const guild = this.client.guilds.cache.get(discordTokens.GuildID)!;

            await this.queueCheckTask(now, guild);

            for (let game of this.activeGames) {
                await this.gameTickTask(game);
            }

            await this.pingMeTask(guild, now);
        } catch (error) {
            console.error(error);
        }
    }

    private getRegion(users: QueueUser[]) {
        let regionTotal = 0;
        let APAC = false;
        let EU = false;
        let NA = false;
        let NAW = false;
        for (let user of users) {
            switch (user.region) {
                case Regions.APAC: regionTotal -= 2; APAC = true; break;
                case Regions.EUE: regionTotal += 2; EU = true; break;
                case Regions.EUW: regionTotal += 1; EU = true; break;
                case Regions.NAE: NA = true; break;
                case Regions.NAW: regionTotal -= 1; NA = true; NAW = true; break;
            }
        }
        let region;
        if (regionTotal <= -7) {
            region = "NAW";
        } else if (regionTotal <= -5) {
            region = "NAC";
        } else if (regionTotal <= 5) {
            region = "NAE";
        } else if (regionTotal <= 9) {
            region = "EUE";
        } else {
            region = "EUW";
        }
        if (NAW && EU) {
            region = "NAE";
        }
        if (NAW && EU && APAC) {
            region = "NAC";
        }
        return region;
    }

    async createMatch() {
        this.generating = true;
        let users: QueueUser[] = []
        while (users.length < tokens.PlayerCount && this.inQueueNumber() > 0) {
            users.push(this.inQueue.shift()!)
        }
        const teams = await makeTeams(users);
        const guild = await this.client.guilds.fetch(discordTokens.GuildID);

        const gameUsers: GameUser[] = [];
        for (let user of teams.teamA) {
            const discordMember = await guild.members.fetch(user.discord)
            gameUsers.push({
                accepted: false,
                discordMember: discordMember,
                dbID: user.db,
                team: 0,
                uniqueID: user.uniqueID,
                name: user.name,
                region: user.region,
                mmr: user.mmr
            });
        }
        for (let user of teams.teamB) {
            const discordMember = await guild.members.fetch(user.discord)
            gameUsers.push({
                accepted: false,
                discordMember: discordMember,
                dbID: user.db,
                team: 1,
                uniqueID: user.uniqueID,
                name: user.name,
                region: user.region,
                mmr: user.mmr
            });
        }

        try {
            const gameNum = await this.data.getID()
            const region = this.getRegion(users);
            const dbGame = await cacheController.createGame(teams.teamA, teams.teamB, gameNum, region);
            let server = await this.data.getServer(region as Regions);
            const guild = await this.client.guilds.fetch(discordTokens.GuildID) as Guild;
            let game = new GameController(this.data, this.client, guild, gameNum, [], dbGame.creationDate, region, server, gameUsers);
            this.activeGames.push(game);
        } catch (e) {
            this.priorityQueue(users);
            console.error(e);
        }
    }

    public priorityQueue(users: QueueUser[]) {
        let oldUsers: QueueUser[] = JSON.parse(JSON.stringify(this.inQueue));
        let newUsers: QueueUser[] = JSON.parse(JSON.stringify(users));
        this.inQueue = newUsers.concat(oldUsers);
    }

    public addPingMe(userId: string, inQueue: number, expire_time: number) {
        if (expire_time < 0) {
            this.pingMe.set(userId, {
                id: userId,
                inQueue: inQueue,
                expireTime: -1,
                pinged: false,
            });
        } else if (expire_time == 0) {
            this.pingMe.delete(userId);
        } else {
            this.pingMe.set(userId, {
                id: userId,
                inQueue: inQueue,
                expireTime: moment().unix() + expire_time * 60,
                pinged: false,
            });
        }

    }

    public inGame(userId: string): boolean {
        for (let game of this.activeGames) {
            for (let user of game.getUsers()) {
                if (user.discordMember.id == userId) {
                    return true;
                }
            }
        }
        return false;
    }

    public async addUser(user: UserInt, time: number): Promise<InternalResponse> {
        const now = moment().unix()
        // Check queue locked
        if (this.locked) {
            return {success: false, message: "The queue is currently locked"};
        }
        // Check if user is frozen
        if (user.frozen) {
            return {success: false, message: "You are currently frozen, please resolve any open tickets"};
        }
        // Check if user is on cooldown
        if (user.banUntil < now && user.banUntil > 0) {
            return {success: false, message: `You are currently banned for another ${grammaticalTime(user.banUntil - now)}`};
        }
        // Check if is in game
        if (this.inGame(user.id)) {
            return {success: false, message: "You are currently in a game"};
        }
        for (let queueUser of this.inQueue) {
            if (queueUser.discordID == user.id) {
                queueUser.expireTime = now + time * 60;
                await logReady(user.id, time, this.client);
                return {success: true, message: `You have readied up for another ${time} minutes`};
            }
        }
        const stats = await cacheController.getStatsByUserId(user._id);
        if (stats) {
            this.inQueue.push({
                dbID: user._id,
                discordID: user.id,
                expireTime: now + time * 60,
                name: user.name,
                region: user.region,
                mmr: stats.mmr,
                uniqueID: user.steamID,
            });
            const channel = await this.client.channels.fetch(discordTokens.QueueChannel) as TextChannel;
            await logReady(user.id, time, this.client);
            await channel.send(`${user.name} has readied up for ${time} minutes`);
            return {success: true, message: `You have readied up for ${time} minutes`};
        } else {
            return {success: false, message: "Something went wrong"};
        }
    }

    public async removeUser(userId: ObjectId, noMessage: boolean) {
        let removed = false
        for (let i = 0; i < this.inQueue.length; i++) {
            const user = this.inQueue[i];
            if (String(user.dbID) == String(userId)) {
                this.inQueue.splice(i, 1);
                const channel = await this.client.channels.fetch(discordTokens.QueueChannel) as TextChannel;
                if (!noMessage) {
                    await channel.send(`${user.name} has unreadied`);
                }
                await logUnready(user.discordID, this.client);
                removed = true;
            }
        }
        return removed;
    }

    public inQueueNumber() {
        return this.inQueue.length;
    }

    public getGameByChannel(channelId: string): InternalResponse {
        for (let game of this.activeGames) {
            if (game.hasChannel(channelId)) {
                return {success: true, message: "Found Game", next: true, data: game};
            }
        }
        return {success: false, message: "Could not find game, please contact a moderator"};
    }

    public getGameByUserID(id: ObjectId): InternalResponse {
        for (let game of this.activeGames) {
            if (game.hasUser(id)) {
                return {success: true, message: "Found Game", next: true, data: game};
            }
        }
        return {success: false, message: "Could not find game, please contact a moderator"}
    }

    public getQueueStr() {
        let queueStr = `[**SND**] - ${this.inQueue.length} in Queue:\n`;
        let names = []
        let regionCounts: Map<string, number> = new Map<string, number>();
        regionCounts.set("NAE", 0);
        regionCounts.set("NAW", 0);
        regionCounts.set("EUW", 0);
        regionCounts.set("EUE", 0);
        regionCounts.set("APAC", 0);
        for (let user of this.inQueue) {
            names.push(user.name);
            const check = regionCounts.get(user.region.toString());
            if (check) {
                regionCounts.set(user.region.toString(), check + 1);
            } else {
                regionCounts.set(user.region.toString(), 1);
            }
        }
        return queueStr + grammaticalList(names) + `\nNA: ${regionCounts.get("NAE")! + regionCounts.get("NAW")!}, EU: ${regionCounts.get("EUE")! + regionCounts.get("EUW")!}, and APAC: ${regionCounts.get("APAC")}`;
    }

    public getGameData(): APIEmbed[] {
        const embeds: APIEmbed[] = []
        for (let game of this.activeGames) {
            embeds.push(gameEmbed(game));
        }
        return embeds;
    }

    public clear() {
        this.inQueue = [];
    }

    public getInfo() {
        let gameData: GameData[] = [];
        for (let game of this.activeGames) {
            gameData.push(game.getInfo());
        }
        let userData: string[] = []
        for (let user of this.inQueue) {
            userData.push(`<@${user.discordID}>`)
        }
        return {
            inQueue: userData,
            games: gameData,
        }
    }

    public toggleLocked() {
        this.locked = !this.locked;
        return this.locked;
    }

    public getSpeakingPermission(channelID: string, member: GuildMember) {
        for (let game of this.activeGames) {
            for (let user of game.getUsers()) {
                if (user.discordMember.id == member.id) {
                    if (user.team == 0 && channelID == game.getVoteData().teamAVCID) {
                        return {canSpeak: true, canJoin: true};
                    } else if (user.team == 1 && channelID == game.getVoteData().teamAVCID) {
                        return {canSpeak: false, canJoin: false};
                    }
                    if (user.team == 1 && channelID == game.getVoteData().teamBVCID) {
                        return {canSpeak: true, canJoin: true};
                    } else if (user.team == 0 && channelID == game.getVoteData().teamBVCID) {
                        return {canSpeak: false, canJoin: false};
                    }
                }
            }
        }
        return {canSpeak: false, canJoin: true};
    }
}