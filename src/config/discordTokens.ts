import * as process from "process";
import {DiscordTokensInt} from "../interfaces/config";

const isProd = process.env.PROD == "1";

const dev: DiscordTokensInt = {
    Admins: [],
    BotOwner: "",
    GameLogChannel: "",
    GuildID: "",
    LogChannel: "",
    MasterGuild: "",
    MatchCategory: "",
    Moderators: [],
    ModRole: "",
    MutedRole: "",
};

const prod: DiscordTokensInt = {
    Admins: [],
    BotOwner: "",
    LogChannel: "",
    GameLogChannel: "",
    GuildID: "",
    MasterGuild: "",
    MatchCategory: "",
    Moderators: [],
    ModRole: "",
    MutedRole: "",
};

export default isProd ? prod : dev;
