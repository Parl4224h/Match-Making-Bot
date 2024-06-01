import {SlashCommandSubcommandBuilder} from "discord.js";
import {SubCommand} from "../../../../interfaces/Command";
import {reason} from "../../../../utility/options.util";
import {GameController} from "../../../../controllers/GameController";
import {logError} from "../../../../utility/loggers";
import discordTokens from "../../../../config/discordTokens";
import cacheController from "../../../../controllers/CacheController";
import {Actions} from "../../../../database/models/ActionModel";

export const nullify: SubCommand = {
    data: new SlashCommandSubcommandBuilder()
        .setName('nullify')
        .setDescription('Nullifies a match')
        .addStringOption(reason),
    run: async (interaction, data) => {
        try {
            const gameResponse = data.getGameByChannel(interaction.channelId);
            if (gameResponse.success) {
                const game = gameResponse.data as GameController;

                const res = await game.nullify();
                if (res) {
                    await cacheController.createAction(Actions.Nullify, interaction.user.id, interaction.options.getString('reason', true), `Game ${game.matchNumber} nullified`);
                    await interaction.reply("game nullified");
                } else {
                    await interaction.reply({ephemeral: true, content: "Failed to nullify game"});
                }
            } else {
                await interaction.reply({ephemeral: true, content: gameResponse.message});
            }
        } catch (e) {
            await logError(e, interaction);
        }
    },
    name: 'nullify',
    allowedRoles: discordTokens.Moderators,
}