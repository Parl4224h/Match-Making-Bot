import * as process from "process";
import {DiscordTokensInt} from "../interfaces/config";

const isProd = process.env.PROD == "1";

const dev: DiscordTokensInt = {
    Admins: [],
    BotOwner: "",
    GuildID: "",
    LogChannel: "",
    MasterGuild: "",
    Moderators: [],
};

const prod: DiscordTokensInt = {
    Admins: [],
    BotOwner: "",
    LogChannel: "",
    GuildID: "",
    MasterGuild: "",
    Moderators: [],
};

export default isProd ? prod : dev;
