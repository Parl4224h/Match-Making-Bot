import {Client} from "discord.js";
import {GameUser} from "./interfaces/Internal";
import {MapManager} from "./utility/match.util";
import {Regions} from "./database/models/UserModel";
import {GameServer} from "./utility/server.util";
import tokens from "./config/tokens";
import {QueueController} from "./controllers/QueueController";
import {QueueUser} from "./interfaces/Queue";
import moment from "moment-timezone";
import {ObjectId} from "mongoose";
import cron from 'node-cron';
import {getRank, roleRemovalCallback} from "./utility/rank.util";
import cacheController from "./controllers/CacheController";
import discordTokens from "./config/discordTokens";
import {StatsInt} from "./database/models/StatsModel";
import {logWarn} from "./utility/loggers";
import CounterModel from "./database/models/CounterModel";


/**
 * Acts as the coordinating structure for any data shared between
 */
export class Data {
    readonly client: Client;
    private loaded: boolean = false;
    private readonly mapManager: MapManager;
    private servers: GameServer[] = [];
    private readonly queue: QueueController;
    private nextPingToPlay: number = 0;

    // Tasks
    private tickLoop = cron.schedule('*/1 * * * * *', async () => {
        // Every second
        await this.tick()
    });
    private roleUpdateLoop = cron.schedule("0 * * * *", async () => {
        // Every hour
        await this.updateRoles();
    });
    private banCounterLoop = cron.schedule("*/10 * * * *", async () => {
        // Every 10 minutes
        await this.banReduction();
    })

    constructor(bot: Client, mapManager: MapManager) {
        this.client = bot;
        this.mapManager = mapManager;
        for (let server of tokens.Servers) {
            this.servers.push(new GameServer(server.ip, server.port, server.password, server.name, server.region));
        }
        this.queue  = new QueueController(this, bot);
    }

    private async tick() {
        await this.queue.tick();
    }

    private async updateRoles() {
        const users = await cacheController.getUsers();
        const guild = await this.client.guilds!.fetch(discordTokens.GuildID);
        for (let user of users) {
            if (user.transferred) {
                continue;
            }
            const stats = await cacheController.getStatsById(user._id) as StatsInt;
            const member = await guild.members.fetch(user.id);
            if (member) {
                member.roles.cache.forEach((value) => {
                    roleRemovalCallback(value, member)
                });
                if (stats.gamesPlayed >= 10) {
                    const rank = getRank(stats.mmr);
                    await member.roles.add(rank.roleID);
                }
            }
        }
    }

    private async banReduction() {
        const now = moment().unix()
        const users = await cacheController.getUsers();
        const guild = await this.client.guilds.fetch(discordTokens.GuildID);
        for (let user of users) {
            if (user.muteUntil <= now && user.muteUntil > 0) {
                try {
                    const member = await guild.members.fetch(user.id);
                    await member.roles.remove(discordTokens.MutedRole);
                } catch (e) {
                    await logWarn("User is no longer in server", this.client);
                }
            }
            if (user.banUntil <= now) {
                // Check for two week reduction
                if (user.lastReductionAbandon + 60 * 60 * 24 * 14 <= now) {
                    if (user.banCounterAbandon > 0) {
                        user.banCounterAbandon--;
                        user.lastReductionAbandon = now;
                        user.gamesPlayedSinceReductionAbandon = 0;
                        user = await cacheController.updateUser(user);
                    }
                }
                if (user.lastReductionFail + 60 * 60 * 24 * 14 <= now) {
                    if (user.banCounterFail > 0) {
                        user.banCounterFail--;
                        user.lastReductionFail = now;
                        user.gamesPlayedSinceReductionFail = 0;
                        user = await cacheController.updateUser(user);
                    }
                }
                // Check for game count reduction
                if (user.gamesPlayedSinceReductionAbandon >= tokens.ReductionGames) {
                    if (user.banCounterAbandon > 0) {
                        user.banCounterAbandon--;
                        user.lastReductionAbandon = now;
                        user.gamesPlayedSinceReductionAbandon = 0;
                        user = await cacheController.updateUser(user);
                    }
                }
                if (user.gamesPlayedSinceReductionFail >= tokens.ReductionGames) {
                    if (user.banCounterFail > 0) {
                        user.banCounterFail--;
                        user.lastReductionFail = now;
                        user.gamesPlayedSinceReductionFail = 0;
                        user = await cacheController.updateUser(user);
                    }
                }
            }
        }
    }

    public getQueue() {
        return this.queue;
    }

    public async load() {
        await this.mapManager.load()
    }

    public async getID() {
        const filter = {_id: "5V5_COUNTER"};
        const counter = (await CounterModel.findOne(filter)) || (await CounterModel.create({
            _id: "5V5_COUNTER",
            value: 0,
        }));
        const update = {value: (counter.value + 1)}
        const newCounter = await CounterModel.findOneAndUpdate(filter, update, {new: true, upsert: true});
        return newCounter.value;
    }

    public setLoaded(state: boolean) {
        this.loaded = state;
    }

    public async getMessage(message: string): Promise<string> {
        // TODO: add message fetching by transfer to cacheController.ts
        return "";
    }

    public getMapManager() {
        return this.mapManager;
    }

    public async getServer(region: Regions) {
        for (let server of this.servers) {
            if (!server.isInUse() && server.region == region) {
                await server.connect();
                return server;
            }
        }
        return null;
    }

    public getGameByChannel(channelID: string) {
        return this.queue.getGameByChannel(channelID);
    }

    public getGameByUserID(userID: ObjectId) {
        return this.queue.getGameByUserID(userID);
    }

    public reReady(users: GameUser[]) {
        const queueUsers: QueueUser[] = [];
        const now = moment().unix();
        for (let user of users) {
            queueUsers.push({
                dbID: user.dbID,
                discordID: user.discordMember.id,
                expireTime: now + 15 * 60,
                name: user.name,
                region: user.region,
                mmr: user.mmr,
                uniqueID: user.uniqueID,
            });
        }
        this.queue.priorityQueue(queueUsers);
    }

    public getPingToPlay(): boolean {
        const now = moment().unix();
        if (this.nextPingToPlay <= now) {
            this.nextPingToPlay = now + tokens.PingTime * 60;
            return true;
        }
        return false;
    }

    public getPingTime() {
        return this.nextPingToPlay;
    }
}