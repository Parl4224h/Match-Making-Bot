import {AutocompleteInteraction, Interaction} from "discord.js";
import {logError} from "../utility/loggers";
import {Data} from "../data";
import {CommandList} from "../commands/_CommandList";
import {commandPermission, getChannels} from "../utility/commandPermission";
import {ButtonList} from "../buttons/_ButtonList";
import {SelectMenuList} from "../selectMenus/_SelectMenuList";
import {ModalList} from "../modals/_ModalList";
import {Command} from "../interfaces/Command";

export const onInteraction = async (interaction: Interaction, data: Data) => {
    try {
        // Get interaction information for command, button, etc
        let foundInteraction;
        if (interaction.isChatInputCommand()) {
            foundInteraction = CommandList.get(interaction.commandName)!;
        } else if (interaction.isButton()) {
            foundInteraction = ButtonList.get(interaction.customId)!;
        } else if (interaction.isStringSelectMenu()) {
            foundInteraction = SelectMenuList.get(interaction.customId)!;
        } else if (interaction.isModalSubmit()) {
            foundInteraction = ModalList.get(interaction.customId)!;
        } else if (interaction.isAutocomplete()) {
            foundInteraction = CommandList.get(interaction.commandName)!;
        }
        // Check permission type, instanceof check is to allow for reply to exist (not needed for runtime, just prevents error highlighting)
        if (foundInteraction && !(interaction instanceof AutocompleteInteraction)) {
            const permission = await commandPermission(interaction, foundInteraction);
            if (permission.limited) {
                await interaction.reply({ephemeral: true, content: "Please wait before doing this again"});
            } else if (permission.channel) {
                await interaction.reply({
                    ephemeral: true,
                    content: `Please use this interaction in a valid channel\nValid channels: ${getChannels(foundInteraction.allowedChannels!)}`
                });
            } else if (permission.valid) {
                // Ignore is to prevent error highlighting, the interaction will always be the correct type for the run function due to how it is found
                // @ts-ignore
                await foundInteraction.run(interaction, data);
            } else {
                await interaction.reply({
                    ephemeral: true,
                    content: "You do not have permission to use this interaction"
                });
            }
        } else if (interaction instanceof AutocompleteInteraction) {
            interaction = interaction as AutocompleteInteraction;
            foundInteraction = foundInteraction as Command;
            if (foundInteraction.autocompleteHandler) {
                await foundInteraction.autocompleteHandler(interaction, data);
            } else if (foundInteraction.autocomplete) {
                await foundInteraction.autocomplete(interaction, data);
            }
        } else {
            await logError("End Point not found for interaction", interaction);
        }
    } catch (e) {
        await logError(e, interaction);
        console.error(e);
    }
}