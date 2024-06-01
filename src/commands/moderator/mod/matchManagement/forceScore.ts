import {SlashCommandSubcommandBuilder} from "discord.js";
import {reason, score} from "../../../../utility/options.util";
import {SubCommand} from "../../../../interfaces/Command";
import {GameController} from "../../../../controllers/GameController";
import {logError} from "../../../../utility/loggers";
import discordTokens from "../../../../config/discordTokens";
import cacheController from "../../../../controllers/CacheController";
import {Actions} from "../../../../database/models/ActionModel";

export const forceScore: SubCommand = {
    data: new SlashCommandSubcommandBuilder()
        .setName('force_score')
        .setDescription('Force submit scores for a match')
        .addIntegerOption(score('team_a'))
        .addIntegerOption(score('team_b'))
        .addStringOption(reason),
    run: async (interaction, data) => {
        try {
            const gameResponse = data.getGameByChannel(interaction.channelId);
            if (gameResponse.success) {
                const game = gameResponse.data as GameController;
                const response = game.forceScore(interaction.options.getInteger('team_a', true), interaction.options.getInteger('team_b', true));
                await interaction.reply({ephemeral: response.success, content: response.message});
                if (response.success) {
                    await cacheController.createAction(Actions.ForceScore, interaction.user.id, interaction.options.getString('reason', true), response.message);
                }
            } else {
                await interaction.reply({ephemeral: true, content: gameResponse.message});
            }
        } catch (e) {
            await logError(e, interaction);
        }
    },
    name: 'force_score',
    allowedRoles: discordTokens.Moderators,
}