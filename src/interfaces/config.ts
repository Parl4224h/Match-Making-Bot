export interface DiscordTokensInt {
    Admins: string[]; // Array of all RoleIDs for admin roles, used for command permissions
    BotOwner: string; // UserID of the owner of the bot, is used for access to certain commands
    GameLogChannel: string; // ChannelID of the channel to log game events in
    GuildID: string; // GuildID of the guild the bot will be used in
    LogChannel: string; // ChannelID in MasterGuild to log all events to
    MasterGuild: string; // GuildID to log all bot events to, can be same as guild bot is used in
    MatchCategory: string; // ChannelID of the category that matches occur in
    Moderators: string[]; // Array of all RoleIDs for moderator roles, used for command permissions
    ModRole: string; // RoleID of the moderator role
    MutedRole: string // RoleID of the muted role
}

export interface TokensInt {
    AcceptTime: number; // Time in seconds for a user to accept the game
    BotToken: string; // Token provided by discord to allow bot to access the gateway
    ClientId: string; // ID of the bot/client
    DB_URI: string; // URI of the database to connect to
    PingTime: number; // Time in seconds to ping users before they are abandoned for failing to accept
    VoteTime: number; // Time in seconds that are allocated per vote stage
}