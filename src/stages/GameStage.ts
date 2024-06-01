import {GameController} from "../controllers/GameController";

export default class {
    protected readonly game: GameController;
    protected tickCount = 0;
    protected working = false;

    constructor(game: GameController) {
        this.game = game;
    }

    public async next() {
        await this.game.next();
    }

    public async start() {

    }

    public async save() {
        // TODO: do all saving of game state
    }

    public async tick() {
        this.tickCount++;
    }

    public async cleanup() {

    }

    public async gameEnd() {

    }

    public getVotes(): Map<string, string[]> {
        return new Map<string, string[]>();
    }

    public setVotes(id: string, votes: string[]) {
        // TODO: setup the loading of persisted data
    }

    public getMaxVotes() {
        return 0;
    }
    public async updateVoteCounts() {

    }
}

