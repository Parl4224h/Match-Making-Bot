import GameStage from "../stages/GameStage";
import {AcceptStage} from "../stages/game/accept.stage";
import {Client, Guild} from "discord.js";
import {Data} from "../data";
import {GameUser} from "../interfaces/Internal";

export class GameController {
    public readonly data: Data;
    public readonly client: Client;
    public readonly matchNumber: number;
    public readonly guild: Guild;

    // Variables for stage handling
    private currentStage: GameStage;
    private firstTick: boolean;
    private stage = 0;
    private stages: GameStage[] = [new AcceptStage(this),  ];

    // Variables for match handling
    private abandoned = false;
    private users: GameUser[] = [];

    constructor(data: Data, client: Client, guild: Guild, matchNumber: number, stageNumber: number = 0, firstTick: boolean = true) {
        this.data = data;
        this.client = client;
        this.guild = guild;
        this.matchNumber = matchNumber;
        this.currentStage = this.stages[stageNumber];
        this.firstTick = firstTick;
    }

    public next() {
        const newStage = this.stage += 1;
        if (newStage > this.stages.length) {
            throw new Error("Next exceeded the number of stage");
        } else {
            this.stage = newStage;
            this.currentStage = this.stages[this.stage];
            this.firstTick = true;
            return;
        }
    }

    public async tick() {
        let cleanup = false;
        // Transfer first tick var to local in loop in case the other tasks take longer than 1 second
        if (this.firstTick) {
            this.firstTick = false;
            cleanup = true;
        }
        await this.currentStage.tick();
        if (cleanup) {
            await this.stages[this.stage - 1].cleanup();
        }
    }

    public async abandon(userID: string, acceptFail: boolean, forced: boolean): Promise<boolean> {
        let user: GameUser | null = null;
        for (let userCheck of this.users) {
            if (userCheck.discordMember.id == userID) {
                user = userCheck;
            }
        }
        if (!user) {
            return false
        } else {
            // TODO: Add abandon logic
            return true
        }
    }


    public getAbandoned() {
        return this.abandoned;
    }

    public getUsers() {
        return this.users;
    }
}
