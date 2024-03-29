import {GameController} from "../controllers/GameController";

export default class {
    protected readonly game: GameController;
    protected tickCount = 0;
    protected working = false;

    constructor(game: GameController) {
        this.game = game;
    }

    public next() {
        this.game.next();
    }

    public async start() {

    }

    public async tick() {
        this.tickCount++;
    }

    public async cleanup() {

    }

    public async gameEnd() {

    }
}

export class voteStage {
    async addVote() {

    }
    removeVote() {

    }
}
