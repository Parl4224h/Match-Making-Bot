import {Button} from "../interfaces/Button";
import {Collection} from "discord.js";
// Button imports

// List of all buttons
const buttonList: Button[] = [];
let ButtonMap: Collection<string, Button> = new Collection<string, Button>();

// Create map of all buttons
for (let command of buttonList) {
    ButtonMap.set(command.id, command);
}

export const ButtonList = ButtonMap;