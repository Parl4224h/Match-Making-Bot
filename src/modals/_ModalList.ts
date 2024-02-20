import {Modal} from "../interfaces/Modal";
import {Collection} from "discord.js";
// Modal imports


// List of all modals to use
const modalList: Modal[] = [];
let ModalMap: Collection<string, Modal> = new Collection<string, Modal>();

// Create map of all modals
for (let modal of modalList) {
    ModalMap.set(modal.id, modal);
}

export const ModalList = ModalMap;
