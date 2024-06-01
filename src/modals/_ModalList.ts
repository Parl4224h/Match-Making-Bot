import {Modal} from "../interfaces/Modal";
import {Collection} from "discord.js";
import {pingMe} from "./pingMe";
// Modal imports


// List of all modals to use
const modalList: Modal[] = [pingMe];
let ModalMap: Collection<string, Modal> = new Collection<string, Modal>();

// Create map of all modals
for (let modal of modalList) {
    ModalMap.set(modal.id, modal);
}

export const ModalList = ModalMap;
