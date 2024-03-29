import {Client} from "discord.js";
import {GameUser} from "./interfaces/Internal";


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

    public async getMessage(message: string): Promise<string> {
        return "";
    }

    public async addAbandoned(users: GameUser[]) {
        // TODO: add logic
    }
}