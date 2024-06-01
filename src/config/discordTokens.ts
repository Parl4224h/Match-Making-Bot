import * as process from "process";
import {DiscordTokensInt} from "../interfaces/config";

const isProd = process.env.PROD == "1";

const dev: DiscordTokensInt = {
    Admins: ["1207438740264583226", "1207438740264583224"],
    BotOwner: "484100069688344606",
    DoNotPingRole: "1207438740226703448",
    Emoji: {
        Win: "<:win:1236336021659193405>",
        Loss: "<:loss:1236336020572864533>",
        Draw: "<:draw:1236336019595596008>",
    },
    GameLogChannel: "1207438742399361132",
    GeneralChannel: "",
    GuildID: "1207438740226703440",
    LogChannel: "1207439265345044550",
    MasterGuild: "1058879957461381251",
    MatchCategory: "1207438740943802447",
    Moderators: ["1207438740264583226", "1207438740264583224", "1207438740264583223"],
    ModRole: "1207438740264583223",
    MutedRole: "1207438740247814174",
    PingToPlayRole: "1207438740226703446",
    PlayerRole: "1207438740226703447",
    QueueChannel: "1207438741254443061",
    QueueLogChannel: "1207438742877507626",
    RegionRoles: {
        NAE: "1207438740226703445",
        NAW: "1207438740226703444",
        EUE: "1207438740226703443",
        EUW: "1207438740226703442",
        APAC: "1207438740226703441",
    },
    RegionSelectChannel: "1207438740943802444",
    ScoreboardChannel: "1207438741254443065",
    ScoreChannel: "1207438741254443064",
};

const prod: DiscordTokensInt = {
    Admins: [],
    BotOwner: "484100069688344606",
    DoNotPingRole: "",
    Emoji: {
        Win: "",
        Loss: "",
        Draw: "",
    },
    LogChannel: "",
    GameLogChannel: "",
    GeneralChannel: "",
    GuildID: "",
    MasterGuild: "1058879957461381251",
    MatchCategory: "",
    Moderators: [],
    ModRole: "",
    MutedRole: "",
    PingToPlayRole: "",
    PlayerRole: "",
    QueueChannel: "",
    QueueLogChannel: "",
    RegionRoles: {
        NAE: "",
        NAW: "",
        EUE: "",
        EUW: "",
        APAC: "",
    },
    RegionSelectChannel: "",
    ScoreboardChannel: "",
    ScoreChannel: "",
};

export default isProd ? prod : dev;
