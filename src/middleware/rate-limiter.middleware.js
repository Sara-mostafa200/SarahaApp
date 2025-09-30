import {rateLimit} from "express-rate-limit";
import MongoStore from "rate-limit-mongo";

export const limiter = rateLimit({
    store: new MongoStore({
    uri : process.env.DB_URL || "mongodb+srv://sara:S123456@cluster0.kjqzcig.mongodb.net/sarahaApp",
    collectionName:'rateLimiter',
    expireTimeMs:15*60*1000,
    }),
	windowMs: 15 * 60 * 1000,
	limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
	standardHeaders: 'draft-8', // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
	legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
	ipv6Subnet: 56,
    
})