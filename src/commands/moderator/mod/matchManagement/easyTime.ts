import {SlashCommandSubcommandBuilder} from "discord.js";
import {easyTimeMessage, userOption} from "../../../../utility/options.util";
import {SubCommand} from "../../../../interfaces/Command";
import {logError} from "../../../../utility/loggers";
import discordTokens from "../../../../config/discordTokens";
import {GameController} from "../../../../controllers/GameController";

export const easyTime: SubCommand = {
    data: new SlashCommandSubcommandBuilder()
        .setName('easy_time')
        .setDescription("Sends a message to join with a built in discord timestamp")
        .addUserOption(userOption("User to mention in message"))
        .addStringOption(easyTimeMessage),
    run: async (interaction, data) => {
        try {
            const gameResponse = data.getGameByChannel(interaction.channelId);
            if (gameResponse.success) {
                const game = gameResponse.data as GameController;
                const user = interaction.options.getUser('user', true);
                const timestamp = game.finalGenTime + 10 * 60;
                const message = interaction.options.getString('message');
                if (message) {
                    await interaction.reply({ephemeral: false, content: message.replace('{user}', `<@${user.id}>`).replace("{time}", `<t:${timestamp}:R>`)});
                } else {
                    await interaction.reply({ephemeral: false, content: `<@${user.id}> <t:${timestamp}:R> you will be abandoned if you do not join the game`});
                }
            } else {
                await interaction.reply({ephemeral: true, content: gameResponse.message});
            }
        } catch (e) {
            await logError(e, interaction);
        }
    },
    name: 'easy_time',
    allowedRoles: discordTokens.Moderators,
}