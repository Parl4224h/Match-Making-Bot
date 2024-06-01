import * as process from "process";
import {TokensInt} from "../interfaces/config";
import {Regions} from "../database/models/UserModel";

const isProd = process.env.PROD == "1";

const dev: TokensInt = {
    AcceptTime: 5 * 60,
    BotToken: process.env.BOT_TOKEN_TEST ?? "no token",
    DB_URI: process.env.DB_URI_TEST ?? "no db uri",
    ClientId: process.env.CLIENT_ID_TEST ?? "no client id",
    Ranks: [
        {name: 'Master', threshold: 1950, roleID: "1207438740264583218"},
        {name: 'Diamond', threshold: 1821, roleID: "1207438740247814183"},
        {name: 'Platinum', threshold: 1701, roleID: "1207438740247814182"},
        {name: 'Gold', threshold: 1611, roleID: "1207438740247814181"},
        {name: 'Silver', threshold: 1551, roleID: "1207438740247814180"},
        {name: 'Bronze', threshold: 1470, roleID: "1207438740247814179"},
        {name: 'Iron', threshold: 1375, roleID: "1207438740247814178"},
        {name: 'Copper', threshold: 1300, roleID: "1207438740247814177"},
        {name: 'Wood', threshold: -99999, roleID: "1207438740247814176"},
    ],
    ReductionGames: 10,
    ScoreLimit: 10,
    Servers: [],
    SubmitCooldown: 0,
    PingTime: 60,
    PlayerCount: 2,
    VoteTime: 3,
    VoteSize: 7,
};

const prod: TokensInt = {
    AcceptTime: 5 * 60,
    BotToken: process.env.BOT_TOKEN ?? 'no bot token',
    ClientId: process.env.CLIENT_ID ?? "no client id",
    DB_URI: process.env.DB_URI ?? "no db uri",
    Ranks: [
        {name: 'Master', threshold: 1950, roleID: ""},
        {name: 'Diamond', threshold: 1821, roleID: ""},
        {name: 'Platinum', threshold: 1701, roleID: ""},
        {name: 'Gold', threshold: 1611, roleID: ""},
        {name: 'Silver', threshold: 1551, roleID: ""},
        {name: 'Bronze', threshold: 1470, roleID: ""},
        {name: 'Iron', threshold: 1375, roleID: ""},
        {name: 'Copper', threshold: 1300, roleID: ""},
        {name: 'Wood', threshold: -99999, roleID: ""},
    ],
    ReductionGames: 10,
    ScoreLimit: 10,
    Servers: [{
        ip: "127.0.0.1",
        port: 9100,
        password: process.env.RCON_PASSWORD ?? "no pass",
        name: "PMM NAE ONE",
        region: Regions.NAE,
    }],
    SubmitCooldown: 600,
    PingTime: 60,
    PlayerCount: 10,
    VoteTime: 35,
    VoteSize: 7,
};

export default isProd ? prod : dev;
