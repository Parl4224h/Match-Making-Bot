import {Command} from "../interfaces/Command";
import {Collection} from "discord.js";
// Command imports
import {sync} from "./admin/sync";

// List of all commands to be used
const commandList: Command[] = [sync];
let CommandMap: Collection<string, Command> = new Collection<string, Command>();

// Create map of all commands
for (let command of commandList) {
    CommandMap.set(command.name, command);
}

export const CommandList = CommandMap;
