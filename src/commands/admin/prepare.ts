import {Command} from "../../interfaces/Command";
import {SlashCommandBuilder} from "@discordjs/builders";
import {regionSelectView, signUpView, readyViewOne, readyViewTwo, readyViewThree} from "../../views/static.views";
import cacheController from "../../controllers/CacheController";
import {logError} from "../../utility/loggers";
import discordTokens from "../../config/discordTokens";

export const prepare: Command = {
    data: new SlashCommandBuilder()
        .setName('prepare')
        .setDescription('prepares static views')
        .addStringOption(option => option
            .setName('view')
            .setDescription('view to prepare')
            .setRequired(true)
            .addChoices(
                {name: 'Ready', value: 'snd_ready'},
                {name: "Sign Up", value: "signup"},
                {name: "Info", value: "info"},
                {name: "Region", value: 'region'},
                {name: "Leaderboard", value: "leaderboard"},
                {name: "Delete Extra Roles", value: "delete"}
            )
        ),
    run: async (interaction) => {
        try {
            await interaction.deferReply({ephemeral: true});
            const view = interaction.options.getString('view')!
            switch (view) {
                case 'snd_ready': {
                    const ready = await cacheController.getMessageByID('ready');
                    await interaction.channel!.send({components: [readyViewOne(), readyViewTwo(), readyViewThree()], content: ready!.body});
                    await interaction.followUp({ephemeral: true, content: 'prepared snd _ready up view'});
                } break;
                case 'signup': {
                    const signup = await cacheController.getMessageByID("signup")
                    await interaction.channel!.send({components: [signUpView()], content: signup!.body});
                    await interaction.followUp({ephemeral: true, content: 'prepared sign up view'});
                } break;
                case 'info': {
                    const info = await cacheController.getMessageByID('info');
                    await interaction.channel!.send({content: `${info!.title}\n\n${info!.body}`});
                    await interaction.followUp({ephemeral: true, content: 'prepared info view'});
                } break;
                case 'region': {
                    const region = await cacheController.getMessageByID('region');
                    await interaction.channel!.send({components: [regionSelectView()], content: region!.body});
                    await interaction.followUp({ephemeral: true, content: 'prepared region select view'});
                } break;
                case 'leaderboard': {
                    await interaction.channel!.send({content: "Leaderboard place holder"});
                    await interaction.followUp({ephemeral: true, content: "prepared leaderboard"});
                } break;
                case 'delete': {
                    const roles = await interaction.guild!.roles.fetch();
                    for (let role of roles.values()) {
                        if (role.name.includes('match') || role.name.includes('team')) {
                            await role.delete()
                        }
                    }
                    await interaction.followUp({ephemeral: true, content: 'deleted extra roles'});
                } break;
                default: break;
            }
        } catch (e) {
            await logError(e, interaction)
        }
    },
    name: 'prepare',
    allowedRoles: discordTokens.Admins,
}