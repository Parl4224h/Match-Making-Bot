import {SubCommand} from "../../../../interfaces/Command";
import {SlashCommandSubcommandBuilder} from "discord.js";
import {logError} from "../../../../utility/loggers";

export const mapStatus: SubCommand = {
    data: new SlashCommandSubcommandBuilder()
        .setName('map_status')
        .setDescription('Displays all maps known by the bot and their status'),
    run: async (interaction, data) => {
        try {
            const maps = data.getMapManager().getAllMaps();
            let message = '```';
            for (let map of maps) {
                message += `${map.name}-In Pool: ${map.inPool} ${map.resourceID}\nCallouts:${map.calloutMap}, Image:${map.imageURL}\n\n`;
            }
            message += `-------------------------
Last Played: ${data.getMapManager().getLastPlayed()}\`\`\``
            await interaction.reply({content: message});
        } catch (e) {
            await logError(e, interaction);
        }
    },
    name: 'map_status',
}