import {StringSelectMenu} from "../interfaces/SelectMenu";
import {Collection} from "discord.js";
// selectMenu imports


// List of all selectMenus to use
const selectMenuList: StringSelectMenu[] = []
let SelectMenuMap: Collection<string, StringSelectMenu> = new Collection<string, StringSelectMenu>();

// Create map of all selectMenus
for (let selectMenu of selectMenuList) {
    SelectMenuMap.set(selectMenu.id, selectMenu);
}

export const SelectMenuList = SelectMenuMap;
