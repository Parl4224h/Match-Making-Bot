import {Regions} from "../database/models/UserModel";

export interface DiscordTokensInt {
    Admins: string[]; // Array of all RoleIDs for admin roles, used for command permissions
    BotOwner: string; // UserID of the owner of the bot, is used for access to certain commands
    DoNotPingRole: string; // RoleID for the do not ping role
    Emoji: {
        Win: string,
        Loss: string,
        Draw: string,
    }
    GameLogChannel: string; // ChannelID of the channel to log game events in
    GeneralChannel: string, // ChannelID of general channel
    GuildID: string; // GuildID of the guild the bot will be used in
    LogChannel: string; // ChannelID in MasterGuild to log all events to
    MasterGuild: string; // GuildID to log all bot events to, can be same as guild bot is used in
    MatchCategory: string; // ChannelID of the category that matches occur in
    Moderators: string[]; // Array of all RoleIDs for moderator roles, used for command permissions
    ModRole: string; // RoleID of the moderator role
    MutedRole: string; // RoleID of the muted role
    PingToPlayRole: string; // RoleID of the ping to play role
    PlayerRole: string; // RoleID of the player role
    QueueChannel: string; // ChannelID of the queue channel
    QueueLogChannel: string; // ChannelID of the queue logging channel
    RegionRoles: {
        NAE: string,
        NAW: string,
        EUE: string,
        EUW: string,
        APAC: string,
    }, // RoleIDs for each region role
    RegionSelectChannel: string; // ChannelID of the region select channel
    ScoreboardChannel: string; // ChannelID of the scoreboard channel
    ScoreChannel: string; // ChannelID of the match results channel
}

export interface TokensInt {
    AcceptTime: number; // Time in seconds for a user to accept the game
    BotToken: string; // Token provided by discord to allow bot to access the gateway
    ClientId: string; // ID of the bot/client
    DB_URI: string; // URI of the database to connect to
    Ranks: {
        name: string,
        threshold: number;
        roleID: string;
    }[]; // Ranks for the ranking system
    ReductionGames: number, // Number of games for a ban reduction to occur
    ScoreLimit: number, // Max number of rounds a team can win
    Servers: {
        ip: string,
        port: number,
        password: string,
        name: string,
        region: Regions
    }[]; // Servers for games to be played on
    SubmitCooldown: number; // Time in seconds before scores should be accepted
    PingTime: number; // Time in seconds to ping users before they are abandoned for failing to accept
    PlayerCount: number; // Number of players in a game
    VoteTime: number; // Time in seconds that are allocated per vote stage
    VoteSize: number; // Number of maps to put into first vote stage
}