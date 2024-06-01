import {Command} from "../interfaces/Command";
import {Collection} from "discord.js";
// Command imports
import {sync} from "./admin/sync";
import {_mod} from "./moderator/mod/_mod";
import {games} from "./queue/games";
import {graph} from "./queue/graph";
import {lfg} from "./queue/lfg";
import {pingMe} from "./queue/pingMe";
import {pingPlayers} from "./queue/pingPlayers";
import {ratingChange} from "./queue/ratingChange";
import {ready} from "./queue/ready";
import {setRequeue} from "./queue/setRequeue";
import {stats} from "./queue/stats";
import {unready} from "./queue/unready";
import {checkDms} from "./admin/checkDms";
import {echo} from "./admin/echo";
import {prepare} from "./admin/prepare";
import {_queue} from "./moderator/queue/_queue";
import {categoryDelete} from "./moderator/categoryDelete";
import {restart} from "./moderator/restart";
import {checkBan} from "./checkBan";
import {dmOptions} from "./dmOptions";
import {register} from "./register";

// List of all commands to be used
const commandList: Command[] = [sync, checkDms, echo, prepare, // Admin commands
    _mod, _queue, categoryDelete, restart, // Moderator Commands
    games, graph, lfg, pingMe, pingPlayers, ratingChange, ready, setRequeue, stats, unready, // Queue commands
    checkBan, dmOptions, register, // General commands
];
let CommandMap: Collection<string, Command> = new Collection<string, Command>();

// Create map of all commands
for (let command of commandList) {
    CommandMap.set(command.name, command);
}

export const CommandList = CommandMap;
