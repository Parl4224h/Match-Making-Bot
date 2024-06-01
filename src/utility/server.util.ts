import Server from "rcon-pavlov";
import {Regions} from "../database/models/UserModel";

export class GameServer extends Server {
    private inUse: boolean = false;
    private matchNumber: number = 0;
    public readonly name: string;
    public readonly region: Regions

    constructor(ip: string, port: number, password: string, name: string, region: Regions) {
        super(ip, port, password, 4);
        this.name = name;
        this.region = region;
    }

    public registerServer(matchNumber: number) {
        this.inUse = true;
        this.matchNumber = matchNumber;
    }

    public async unregisterServer() {
        this.inUse = false;
        this.matchNumber = 0;
        await this.updateServerName(this.name)
    }

    public isInUse() {
        return this.inUse;
    }
}
