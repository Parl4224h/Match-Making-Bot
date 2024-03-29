import * as process from "process";
import {TokensInt} from "../interfaces/config";

const isProd = process.env.PROD == "1";

const dev: TokensInt = {
    AcceptTime: 5 * 60,
    BotToken: process.env.BOT_TOKEN ?? 'no bot token',
    ClientId: process.env.CLIENT_ID ?? "no client id",
    DB_URI: process.env.DB_URI ?? "no db uri",
    PingTime: 60,
    VoteTime: 10,
};

const prod: TokensInt = {
    AcceptTime: 5 * 60,
    BotToken: process.env.BOT_TOKEN ?? 'no bot token',
    ClientId: process.env.CLIENT_ID ?? "no client id",
    DB_URI: process.env.DB_URI ?? "no db uri",
    PingTime: 60,
    VoteTime: 35,
};

export default isProd ? prod : dev;
