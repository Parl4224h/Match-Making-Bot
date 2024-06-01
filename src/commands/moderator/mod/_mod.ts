import {addMap} from "./mapManagement/addMap";
import {setInPool} from "./mapManagement/setInPool";
import {playRates} from "./botStats/playRates";
import {rankDist} from "./botStats/rankDistribution";
import {scoreDist} from "./botStats/scoreDistribution";
import {easyTime} from "./matchManagement/easyTime";
import {forceAbandon} from "./matchManagement/forceAbandon";
import {forceScore} from "./matchManagement/forceScore";
import {nullify} from "./matchManagement/nullify";
import {actions} from "./userManagement/actions";
import {adjustMMR} from "./userManagement/adjustMMR";
import {cooldown} from "./userManagement/cooldown";
import {freeze} from "./userManagement/freeze";
import {mute} from "./userManagement/mute";
import {removeCooldown} from "./userManagement/removeCooldown";
import {reverseCooldown} from "./userManagement/reverseCooldown";
import {setRegion} from "./userManagement/setRegion";
import {transferUser} from "./userManagement/transferUser";
import {warn} from "./userManagement/warn";
import {warnings} from "./userManagement/warnings";
import {removeWarning} from "./userManagement/removeWarning";
import {Command, SubCommand} from "../../../interfaces/Command";
import {SlashCommandBuilder} from "@discordjs/builders";
import {onSubCommand} from "../../../events/onSubCommand";
import {logError} from "../../../utility/loggers";
import discordTokens from "../../../config/discordTokens";
import {commandPermission} from "../../../utility/commandPermission";
import {mapStatus} from "./mapManagement/mapStatus";

const subCommandListTemp: SubCommand[] = [
    playRates, rankDist, scoreDist, // botStats
    addMap, setInPool, mapStatus, // mapManagement
    easyTime, forceAbandon, forceScore, nullify, // matchManagement
    actions, adjustMMR, cooldown, freeze, mute, removeCooldown, removeCooldown, reverseCooldown, setRegion, transferUser, warn, warnings, // userManagement
];
let SubCommandMap: Map<string, SubCommand> = new Map<string, SubCommand>();
for (let subCommand of subCommandListTemp) {
    SubCommandMap.set(subCommand.name, subCommand);
}

const SubCommandList = SubCommandMap;

export const _mod: Command = {
    data: new SlashCommandBuilder()
        .setName('mod')
        .setDescription('Moderator Commands')
        .addSubcommand(playRates.data)
        .addSubcommand(rankDist.data)
        .addSubcommand(scoreDist.data)
        .addSubcommand(addMap.data)
        .addSubcommand(setInPool.data)
        .addSubcommand(easyTime.data)
        .addSubcommand(forceAbandon.data)
        .addSubcommand(forceScore.data)
        .addSubcommand(nullify.data)
        .addSubcommand(actions.data)
        .addSubcommand(adjustMMR.data)
        .addSubcommand(cooldown.data)
        .addSubcommand(freeze.data)
        .addSubcommand(mute.data)
        .addSubcommand(removeCooldown.data)
        .addSubcommand(removeWarning.data)
        .addSubcommand(reverseCooldown.data)
        .addSubcommand(setRegion.data)
        .addSubcommand(transferUser.data)
        .addSubcommand(warn.data)
        .addSubcommand(warnings.data)
        .addSubcommand(mapStatus.data)
    ,
    run: async (interaction, data) => {
        try {
            const command = SubCommandList.get(interaction.options.getSubcommand())!
            await onSubCommand(interaction, command, data, await commandPermission(interaction, command));
        } catch (e) {
            await logError(e, interaction);
        }
    },
    name: 'mod',
    allowedRoles: discordTokens.Moderators,
    autocompleteHandler: async (interaction, data) => {
        const command = SubCommandList.get(interaction.options.getSubcommand())!;
        if (command.autocomplete) {
            await command.autocomplete(interaction, data);
        }
    }
}