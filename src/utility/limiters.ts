import {RateLimiter} from "discord.js-rate-limiter";

export const acceptLimiter = new RateLimiter(1, 20000);