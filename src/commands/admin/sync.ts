import { SlashCommandBuilder } from "@discordjs/builders";
import { Command } from "../../interfaces/Command";
import {logError} from "../../utility/loggers";
import { REST } from "@discordjs/rest";
import {CommandList} from "../_CommandList";
import { Routes } from "discord-api-types/v9";
import tokens from "../../config/tokens";
import discordTokens from "../../config/discordTokens";

export const sync: Command = {
    data: new SlashCommandBuilder()
        .setName("sync")
        .setDescription("Syncs commands with the serverUtil"),
    run: async (interaction) => {
        try {
            await interaction.deferReply({ephemeral: true});
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
            await interaction.followUp({content: "Commands synced!"})
        } catch (e) {
            await logError(e, interaction);
        }
    },
    name: 'sync',
    allowedUsers: [discordTokens.BotOwner],
    allowedRoles: discordTokens.Admins,
}