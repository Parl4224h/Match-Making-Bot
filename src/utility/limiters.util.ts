import {RateLimiter} from "discord.js-rate-limiter";

export const readyLimiter = new RateLimiter(3, 10000);