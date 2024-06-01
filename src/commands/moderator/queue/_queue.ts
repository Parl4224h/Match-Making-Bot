import {Command, SubCommand} from "../../../interfaces/Command";
import {SlashCommandBuilder} from "@discordjs/builders";
import {onSubCommand} from "../../../events/onSubCommand";
import {commandPermission} from "../../../utility/commandPermission";
import discordTokens from "../../../config/discordTokens";
import {logError} from "../../../utility/loggers";
import {clear} from "./clear";
import {lock} from "./lock";
import {remove} from "./remove";
import {info} from "./info";

const subCommandListTemp: SubCommand[] = [clear, info, lock, remove]
let SubCommandMap: Map<string, SubCommand> = new Map<string, SubCommand>();
for (let subCommand of subCommandListTemp) {
    SubCommandMap.set(subCommand.name, subCommand);
}

const SubCommandList = SubCommandMap;

export const _queue: Command = {
    data: new SlashCommandBuilder()
        .setName('queue')
        .setDescription('does the queue stuff')
        .addSubcommand(clear.data)
        .addSubcommand(info.data)
        .addSubcommand(lock.data)
        .addSubcommand(remove.data),
    run: async (interaction, data) => {
        try {
            const command = SubCommandList.get(interaction.options.getSubcommand())!
            await onSubCommand(interaction, command, data, await commandPermission(interaction, command));
        } catch (e) {
            await logError(e, interaction);
        }
    },
    name: 'queue',
    allowedRoles: discordTokens.Moderators,
}