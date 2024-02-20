export interface DiscordTokensInt {
    Admins: string[]; // Array of all RoleIDs for admin roles, used for command permissions
    BotOwner: string; // UserID of the owner of the bot, is used for access to certain commands
    GuildID: string; // GuildID of the guild the bot will be used in
    LogChannel: string; // ChannelID in MasterGuild to log all events to
    MasterGuild: string; // GuildID to log all bot events to, can be same as guild bot is used in
    Moderators: string[]; // Array of all RoleIDs for moderator roles, used for command permissions
}

export interface TokensInt {
    BotToken: string; // Token provided by discord to allow bot to access the gateway
    ClientId: string; // ID of the bot/client
    DB_URI: string; // URI of the database to connect to
}