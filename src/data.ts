import {Client} from "discord.js";


/**
 * Acts as the coordinating structure for any data shared between
 */
export class Data {
    readonly client: Client;
    private loaded: boolean = false;

    constructor(bot: Client) {
        this.client = bot;
    }


    public async load() {
        // Will load data for bot here
    }

    public setLoaded(state: boolean) {
        this.loaded = state;
    }
}