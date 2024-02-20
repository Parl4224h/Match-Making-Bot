import * as process from "process";
import {TokensInt} from "../interfaces/config";

const isProd = process.env.PROD == "1";

const dev: TokensInt = {
    BotToken: process.env.BOT_TOKEN ?? 'no bot token',
    ClientId: process.env.CLIENT_ID ?? "no client id",
    DB_URI: process.env.DB_URI ?? "no db uri",
};

const prod: TokensInt = {
    BotToken: process.env.BOT_TOKEN ?? 'no bot token',
    ClientId: process.env.CLIENT_ID ?? "no client id",
    DB_URI: process.env.DB_URI ?? "no db uri",
};

export default isProd ? prod : dev;
