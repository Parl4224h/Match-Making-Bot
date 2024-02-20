import { Client } from "discord.js";
import {Data} from "../data";
import {logInfo} from "../utility/loggers";
import {connectDatabase} from "../database/connectDatabase";
import discordTokens from "../config/discordTokens";
import {REST} from "@discordjs/rest";
import tokens from "../config/tokens";
import {CommandList} from "../commands/_CommandList";
import { Routes } from "discord-api-types/v9";

function delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
}

export const onReady = async (BOT: Client, data: Data, sync: boolean) => {
    await connectDatabase(BOT);
    await data.load();
    await BOT.guilds.cache.get(discordTokens.GuildID)!.members.fetch();
    // Not all data is cached by client on start, unblocks the main tick loop
    data.setLoaded(true);
    if (sync) {
        const rest = new REST({ version: "9" }).setToken(
            tokens.BotToken as string
        );
        // Create payload for command sync
        const commandData = CommandList.map((command) => command.data.toJSON());
        await rest.put(
            // Strings are assignable to snowflake library is typed wrong at this point
            Routes.applicationGuildCommands(
                tokens.ClientId,
                discordTokens.GuildID,
            ),
            { body: commandData }
        );
    }
    await logInfo("Discord ready!", BOT);
};