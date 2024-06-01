import {UserInt} from "../database/models/UserModel";
import cacheController from "../controllers/CacheController";

export const punishment = async (user: UserInt, acceptFail: boolean, severity: number, now: number): Promise<UserInt> => {
    switch (acceptFail ? user.banCounterFail + severity: user.banCounterAbandon + severity) {
        case 0: {
            user.lastBan = now;
            user.banUntil = now + 30 * 60;
            user.lastReductionAbandon = now;
            user.gamesPlayedSinceReductionAbandon = 0;
            user.lastReductionFail = now;
            user.gamesPlayedSinceReductionFail = 0;
        } break;
        case 1: {
            user.lastBan = now;
            user.banUntil = now + 8 * 60 * 60;
            user.lastReductionAbandon = now;
            user.gamesPlayedSinceReductionAbandon = 0;
            user.lastReductionFail = now;
            user.gamesPlayedSinceReductionFail = 0;
        } break;
        default: {
            user.lastBan = now;
            user.banUntil = now + 2 ** (user.banCounterAbandon - 1) * 12 * 60 * 60;
            user.lastReductionAbandon = now;
            user.gamesPlayedSinceReductionAbandon = 0;
            user.lastReductionFail = now;
            user.gamesPlayedSinceReductionFail = 0;
        } break;
    }
    if (acceptFail) {
        user.banCounterFail += severity + 1;
    } else {
        user.banCounterAbandon += severity + 1;
    }
    return cacheController.updateUser(user);
}