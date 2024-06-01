import {ObjectId} from "mongoose";
import UserModel, {UserInt} from "../database/models/UserModel";
import {GuildMember, PartialGuildMember, User} from "discord.js";
import StatsModel, {StatsInt} from "../database/models/StatsModel";
import GameModel, {GameInt} from "../database/models/GameModel";
import {playerInfo} from "../interfaces/Queue";
import moment from "moment-timezone";
import MapModel, {MapInt} from "../database/models/MapModel";
import MessageModel, {MessageInt} from "../database/models/MessageModel";
import ActionModel, {ActionInt, Actions} from "../database/models/ActionModel";
import WarnModel, {WarnInt} from "../database/models/WarnModel";

export class CacheController {
    // Caches
    private userCache: Map<ObjectId, UserInt> = new Map<ObjectId, UserInt>();
    private statsCache: Map<ObjectId, StatsInt> = new Map<ObjectId, StatsInt>();
    private gameCache: Map<ObjectId, GameInt> = new Map<ObjectId, GameInt>();
    private mapCache: Map<ObjectId, MapInt> = new Map<ObjectId, MapInt>();
    private messageCache: Map<ObjectId, MessageInt> = new Map<ObjectId, MessageInt>();
    private actionsCache: Map<ObjectId, ActionInt> = new Map<ObjectId, ActionInt>();
    private warningCache: Map<ObjectId, WarnInt> = new Map<ObjectId, WarnInt>();

    // Id maps
    private discordIDtoUserID: Map<string, ObjectId> = new Map<string, ObjectId>();
    private steamIDtoUserID: Map<string, ObjectId> = new Map<string, ObjectId>();
    private userIDtoStatsID: Map<ObjectId, ObjectId> = new Map<ObjectId, ObjectId>();
    private matchNumberToGameID: Map<number, ObjectId> = new Map<number, ObjectId>();
    private mapNameToMapID: Map<string, ObjectId> = new Map<string, ObjectId>();
    private messageIDtoMessageID: Map<string, ObjectId> = new Map<string, ObjectId>();


    // Cache functions
    /**
     * Updates cache if document is passed
     * @param {StatsInt | undefined | null} stats - stats document or falsy value
     * @returns {StatsInt | null} - stats document if exists otherwise null
     * @private
     */
    private cacheStats(stats: StatsInt | undefined | null): StatsInt | null {
        if (stats) {
            this.statsCache.set(stats._id, stats);
            this.userIDtoStatsID.set(stats.userId, stats._id);
            return stats;
        }
        return null;
    }
    /**
     * Updates cache if user document is passed
     * @param {UserInt | undefined | null} user - user document if otherwise falsy values
     * @returns {UserInt | null} - user document if exists otherwise null
     * @private
     */
    private cacheUser(user: UserInt | undefined | null): UserInt | null {
        if (user) {
            this.userCache.set(user._id, user);
            this.discordIDtoUserID.set(user.id, user._id);
            this.steamIDtoUserID.set(user.steamID, user._id);
            return user;
        }
        return null;
    }
    /**
     * Updates cache if game document is passed
     * @param {GameInt | undefined | null} game - game document if otherwise falsy values
     * @returns {GameInt | null} - game document if exists otherwise null
     * @private
     */
    private cacheGame(game: GameInt | undefined | null): GameInt | null {
        if (game) {
            this.gameCache.set(game._id, game);
            return game;
        }
        return null;
    }
    /**
     * Updates cache if map document is passed
     * @param {MapInt | undefined | null} map map document otherwise falsy value
     * @returns {MapInt | null} map document if exists otherwise null
     * @private
     */
    private cacheMap(map: MapInt | undefined | null): MapInt | null {
        if (map) {
            this.mapCache.set(map._id, map);
            this.mapNameToMapID.set(map.name, map._id);
            return map;
        }
        return null;
    }
    /**
     * Updates cache if message document is passed
     * @param {MessageInt | undefined | null} message message document otherwise falsy value
     * @return {MessageInt | null} message document if exists otherwise null
     * @private
     */
    private cacheMessage(message: MessageInt | undefined | null): MessageInt | null {
        if (message) {
            this.messageCache.set(message._id, message);
            this.messageIDtoMessageID.set(message.id, message._id);
            return message;
        }
        return null;
    }
    /**
     * Updates cache if action document is passed
     * @param {ActionInt | undefined | null} action message document otherwise falsy value
     * @return {ActionInt | null} action document if exists otherwise null
     * @private
     */
    private cacheAction(action: ActionInt | undefined | null): ActionInt | null {
        if (action) {
            this.actionsCache.set(action._id, action);
            return action;
        }
        return null;
    }
    /**
     * Updates cache if warning document is passed
     * @param {WarnInt | undefined | null} warn warn document otherwise falsy value
     * @return {WarnInt | null} warn document if exists otherwise null
     * @private
     */
    private cacheWarn(warn: WarnInt | undefined | null): WarnInt | null {
        if (warn) {
            this.warningCache.set(warn._id, warn);
            return warn;
        }
        return null;
    }

    // Get functions
    /**
     *
     * @param id {ObjectId} - ID of the document to find
     * @returns {Promise<StatsInt | null>} - returns stats document if found otherwise null
     * @public
     */
    public async getStatsById(id: ObjectId): Promise<StatsInt | null> {
        // Check cache
        let stats: StatsInt | undefined | null = this.statsCache.get(id);
        if (!stats) {
            stats = await StatsModel.findById(id);
        }
        return this.cacheStats(stats);
    }
    /**
     *
     * @param id {ObjectId} - ID of the user to find stats document by
     * @returns {Promise<StatsInt | null>} - returns stats document if found otherwise null
     * @public
     */
    public async getStatsByUserId(id: ObjectId): Promise<StatsInt | null> {
        // Check cache
        let statsID = this.userIDtoStatsID.get(id);
        if (statsID) {
            return this.getStatsById(statsID);
        } else {
            const stats = await StatsModel.findOne({userId: id});
            return this.cacheStats(stats);
        }
    }

    public async getStats(): Promise<StatsInt[]> {
        const found = await StatsModel.find({}).sort({ mmr: -1 });
        const stats: StatsInt[] = [];
        for (let stat of found) {
            stats.push(stat);
        }
        return stats;
    }
    /**
     * Return the stats documents of all ranked players
     */
    public async getRankedUsers(): Promise<StatsInt[]> {
        const stats = await StatsModel.find({gamesPlayed: {'$gte': 10}});
        for (let stat of stats) {
            this.cacheStats(stat);
        }
        return stats;
    }
    /**
     * Gets a user by documentId
     * @param id {ObjectId} - ID of document to return
     * @returns {Promise<UserInt | null>} - Returns user document if found otherwise null
     * @public
     */
    public async getUserById(id: ObjectId): Promise<UserInt | null> {
        // Check cache
        let user: UserInt | undefined | null = this.userCache.get(id);
        if (!user) {
            // Query db if not found
            user = await UserModel.findById(id);
        }
        // Cache and return
        return this.cacheUser(user);
    }
    /**
     * Gets a user by discord user or guildMember
     * @param user {GuildMember | PartialGuildMember | User} - Discord user/guildMember to find document from
     * @returns {Promise<UserInt>} - Returns user document if found otherwise null
     * @public
     */
    public async getUserByUser(user: GuildMember | PartialGuildMember | User): Promise<UserInt> {
        // Check discord id to document id cache
        let id = this.discordIDtoUserID.get(user.id);
        if (id) {
            // If id exists get user
            const dbUser = await this.getUserById(id);
            // Set as non-null as user documents must exist if they do not can error as it is an indication of a larger issue
            return dbUser!;
        }
        // Check if document exists in db
        const dbUser = await UserModel.findOne({id: user.id});
        if (dbUser) {
            // Return if exists
            return dbUser;
        }
        // Create user if user does not exist
        return this.createUser(user.id, user.displayName);
    }
    /**
     * Gets a user by their steamID
     * @param steamID {string} - SteamID to find user document with
     * @returns {Promise<UserInt | null>} - Returns user document if found otherwise null
     * @public
     */
    public async getUserBySteamID(steamID: string): Promise<UserInt | null> {
        // Check threadId to documentId cache
        let id = this.steamIDtoUserID.get(steamID);
        if (id) {
            // If exists return through get by id
            return this.getUserById(id);
        } else {
            // Query db if not in cache
            const user = await UserModel.findOne({steamId: steamID});
            // Cache and return
            return this.cacheUser(user);
        }
    }
    /**
     * Get all users
     */
    public async getUsers(): Promise<UserInt[]> {
        const found = await UserModel.find({});
        for (let user of found) {
            this.cacheUser(user);
        }
        return found;
    }
    /**
     * Gets a game by its id
     * @param id {ObjectId} - id of game document to find
     * @returns {Promise<UserInt | null>} - Returns game document if found otherwise null
     * @public
     */
    public async getGameByID(id: ObjectId): Promise<GameInt | null> {
        // Check cache
        let game: GameInt | undefined | null = this.gameCache.get(id);
        if (!game) {
            // Query db if not found
            game = await GameModel.findById(id);
        }
        // Cache and return
        return this.cacheGame(game);
    }
    /**
     * Gets a game by its match number
     * @param matchNumber {number} - matchNumber of game document to find
     * @returns {Promise<GameInt | null>} - Returns game document if found otherwise null
     * @public
     */
    public async getGameByMatchNumber(matchNumber: number): Promise<GameInt | null> {
        // Check match number to documentId cache
        let id = this.matchNumberToGameID.get(matchNumber);
        if (id) {
            // If exists return through get by id
            return this.getGameByID(id);
        } else {
            // Query db if not in cache
            const game = await GameModel.findOne({matchId: matchNumber});
            // Cache and return
            return this.cacheGame(game);
        }
    }
    /**
     * Returns all games that were completed
     */
    public async getCompletedGames(): Promise<GameInt[]> {
        const games = await GameModel.find({nullified: false, abandoned: false, scoreA: {'$gte': 0}, scoreB: {'$gte': 0}});
        for (let game of games) {
            this.cacheGame(game);
        }
        return games;
    }
    /**
     * Gets a map by documentId
     * @param id {ObjectId} - ID of document to return
     * @returns {Promise<MapInt | null>} - Returns map document if found otherwise null
     * @public
     */
    public async getMapByID(id: ObjectId): Promise<MapInt | null> {
        // Check cache
        let map: MapInt | undefined | null = this.mapCache.get(id);
        if (!map) {
            // Query db if not found
            map = await MapModel.findById(id);
        }
        // Cache and return
        return this.cacheMap(map);
    }
    /**
     * Gets a map by its name
     * @param mapName {string} - name of map to find
     * @returns {Promise<MapInt | null>} - Returns game document if found otherwise null
     * @public
     */
    public async getMapByName(mapName: string): Promise<MapInt | null> {
        // Check map name to documentId cache
        let id = this.mapNameToMapID.get(mapName);
        if (id) {
            // If exists return through get by id
            return this.getMapByID(id);
        } else {
            // Query db if not in cache
            const map = await MapModel.findOne({name: mapName});
            // Cache and return
            return this.cacheMap(map);
        }
    }
    /**
     * Returns all map documents and caches them
     */
    public async getMaps(): Promise<MapInt[]> {
        const maps = await MapModel.find();
        const mapArr: MapInt[] = [];
        for (let map of maps) {
            mapArr.push(this.cacheMap(map)!);
        }
        return mapArr;
    }
    /**
     * Gets a message by documentId
     * @param id {ObjectId} - ID of document to return
     * @returns {Promise<MessageInt | null>} - Returns message document if found otherwise null
     * @public
     */
    public async getMessageByDocumentID(id: ObjectId): Promise<MessageInt | null> {
        // Check cache
        let message: MessageInt | undefined | null = this.messageCache.get(id);
        if (!message) {
            // Query db if not found
            message = await MessageModel.findById(id);
        }
        // Cache and return
        return this.cacheMessage(message);
    }
    /**
     * Gets a message by its id
     * @param id {string} - ID of document to return
     * @returns {Promise<MessageInt | null>} - Returns message document if found otherwise null
     * @public
     */
    public async getMessageByID(id: string): Promise<MessageInt | null> {
        // Check map name to documentId cache
        let docID = this.messageIDtoMessageID.get(id);
        if (docID) {
            // If exists return through get by id
            return this.getMessageByDocumentID(docID);
        } else {
            // Query db if not in cache
            const message = await MessageModel.findOne({id: id});
            // Cache and return
            return this.cacheMessage(message);
        }
    }
    /**
     * Gets an action by documentId
     * @param id {ObjectId} - ID of document to return
     * @returns {Promise<ActionInt | null>} - Returns action document if found otherwise null
     */
    public async getActionByID(id: ObjectId): Promise<ActionInt | null> {
        // Check cache
        let action: ActionInt | undefined | null = this.actionsCache.get(id);
        if (!action) {
            // Query db if not found
            action = await ActionModel.findById(id);
        }
        // Cache and return
        return this.cacheAction(action);
    }
    /**
     * Gets the actions for the specified id
     * @param id userID of the user to find actions for
     */
    public async getActions(id: string): Promise<ActionInt[]> {
        const found = await ActionModel.find({userId: id});
        for (let action of found) {
            this.cacheAction(action);
        }
        return found;
    }
    /**
     * Gets an warning by documentID
     * @param {ObjectId} id documentID of warning to find
     */
    public async getWarning(id: ObjectId): Promise<WarnInt | null> {
        // Check cache
        let warn: WarnInt | undefined | null = this.warningCache.get(id);
        if (!warn) {
            // Query db if not found
            warn = await WarnModel.findById(id);
        }
        // Cache and return
        return this.cacheWarn(warn);
    }
    /**
     * Gets the warning associated with the provided user
     * @param {ObjectId} id documentID of the user to get warnings for
     */
    public async getWarnings(id: ObjectId): Promise<WarnInt[]> {
        const found = await WarnModel.find({userId: id});
        for (let warn of found) {
            this.cacheWarn(warn);
        }
        return found;
    }

    // Create functions
    /**
     * Creates a new blank user
     * @param {string} id - The user's discord id
     * @param {string} displayName - The user's display name
     * @returns {Promise<UserInt>} - Returns the newly created document
     * @public
     */
    public async createUser(id: string, displayName: string): Promise<UserInt> {
        const user = await UserModel.create({
            id: id,
            name: displayName,
            banUntil: 0,
            lastBan: 0,
            banCounterAbandon: 0,
            banCounterFail: 0,
            dmMatch: true,
            dmQueue: true,
            dmAuto: true,
            lastReductionAbandon: 0,
            gamesPlayedSinceReductionAbandon: 0,
            lastReductionFail: 0,
            gamesPlayedSinceReductionFail: 0,
            requeue: true,
            frozen: false,
        });
        return this.cacheUser(user)!;
    }
    /**
     * Creates a new game document
     * @param {playerInfo[]} teamA Array of players on teamA with info
     * @param {playerInfo[]} teamB Array of players on teamB with info
     * @param {number} matchNumber Number of the match
     * @param {string} region Region the match should be played in
     */
    public async createGame(teamA: playerInfo[], teamB: playerInfo[], matchNumber: number, region: string): Promise<GameInt> {
        const teamAIds: ObjectId[] = [];
        const teamBIds: ObjectId[] = [];

        teamA.forEach(c => teamAIds.push(c.db));
        teamB.forEach(c => teamBIds.push(c.db));
        const users = teamAIds.concat(teamBIds)

        const game = await GameModel.create({
            matchId: matchNumber,
            map: "",
            sides: ["", ""],
            scoreA: -1,
            scoreB: -1,
            users: users,
            teamA: teamAIds,
            teamB: teamBIds,
            creationDate: moment().unix(),
            endDate: 0,
            winner: -1,
            teamAChanges: [],
            teamBChanges: [],
            abandoned: false,
            nullified: false,
            mmrDiff: -1,
            region: region,
        });

        return this.cacheGame(game)!;
    }
    /**
     * Creates a new map document
     * @param {string} name Name of map to create
     * @param {string} resourceID Identifier of the map to create
     * @param {boolean} inPool Whether the map should be placed into the pool
     * @param {string} imageURL imageURL for the map
     * @param {string} [calloutMap] Link to callout map is optional
     */
    public async createMap(name: string, resourceID: string, inPool: boolean, imageURL: string, calloutMap: string = 'none'): Promise<MapInt> {
        const map = await MapModel.create({
            name: name,
            resourceID: resourceID,
            inPool: inPool,
            imageURL: imageURL,
            calloutMap: calloutMap,
        });
        return this.cacheMap(map)!;
    }
    /**
     * Creates a new action document for a moderator action
     * @param {Actions} action action type
     * @param {string} modID userID of the mod that did the action
     * @param {reason} reason reason for the action
     * @param {string} actionData extra information about the action
     */
    public async createAction(action: Actions, modID: string, reason: string, actionData: string) {
        const newAction = await ActionModel.create({
            action: action,
            modId: modID,
            userId: modID,
            reason: reason,
            time: moment().unix(),
            actionData: actionData,
        });
        return this.cacheAction(newAction)!;
    }
    /**
     * Creates a new action document for a user ie cooldown
     * @param {Actions} action action type
     * @param {string} modID userID of the mod that did the action
     * @param {string} userID userID of the user the action was performed on
     * @param {reason} reason reason for the action
     * @param {string} actionData extra information about the action
     */
    public async createActionUser(action: Actions, modID: string, userID: string, reason: string, actionData: string) {
        const newAction =  await ActionModel.create({
            action: action,
            modId: modID,
            userId: userID,
            reason: reason,
            time: moment().unix(),
            actionData: actionData,
        });
        return this.cacheAction(newAction)!;
    }
    /**
     * Creates a new warn document
     * @param {ObjectId} userID documentID of user that received the warning
     * @param {string} reason reason for the warning
     * @param {string} modID userID of the mod who issued the warning
     */
    public async createWarn(userID: ObjectId, reason: string, modID: string): Promise<WarnInt> {
        const newWarn = await WarnModel.create({
            userId: userID,
            reason: reason,
            time: moment().unix(),
            modId: modID,
            removed: false,
        });
        return this.cacheWarn(newWarn)!;
    }

    // Update functions
    /**
     * Updates a map in the database
     * @param {MapInt} map map to update
     */
    public async updateMap(map: MapInt): Promise<MapInt> {
        const newMap = await MapModel.findByIdAndUpdate(map._id, map, {upsert: true, returnDocument: 'after'});
        return this.cacheMap(newMap)!;
    }
    /**
     * Updates a map in the database
     * @param {MessageInt} message message to update
     */
    public async updateMessage(message: MessageInt): Promise<MessageInt> {
        const newMessage = await MessageModel.findByIdAndUpdate(message._id, message, {upsert: true, returnDocument: 'after'});
        return this.cacheMessage(newMessage)!;
    }
    /**
     * Update a game in the database
     * @param {GameInt} game game to update
     */
    public async updateGame(game: GameInt): Promise<GameInt> {
        const newGame = await GameModel.findByIdAndUpdate(game._id, game, {upsert: true, returnDocument: 'after'});
        return this.cacheGame(newGame)!;
    }
    /**
     * Update a user in the database
     * @param {UserInt} user user to update
     */
    public async updateUser(user: UserInt): Promise<UserInt> {
        const newUser = await UserModel.findByIdAndUpdate(user._id, user, {upsert: true, returnDocument: 'after'});
        return this.cacheUser(newUser)!;
    }
    /**
     * Update a stat in the database
     * @param {StatsInt} stats stats document to update
     */
    public async updateStats(stats: StatsInt): Promise<StatsInt> {
        const newStat = await StatsModel.findByIdAndUpdate(stats._id, stats, {upsert: true, returnDocument: 'after'});
        return this.cacheStats(newStat)!;
    }
    /**
     * Update a warning in the database
     * @param {WarnInt} warn warning document to update
     */
    public async updateWarn(warn: WarnInt): Promise<WarnInt> {
        const newWarn = await WarnModel.findByIdAndUpdate(warn._id, warn, {upsert: true, returnDocument: 'after'});
        return this.cacheWarn(newWarn)!;
    }
    /**
     * Update a action in the database
     * @param {ActionInt} action action document to update
     */
    public async updateAction(action: ActionInt): Promise<ActionInt> {
        const newAction = await ActionModel.findByIdAndUpdate(action._id, action, {upsert: true, returnDocument: 'after'});
        return this.cacheAction(newAction)!;
    }

}

export default new CacheController();
