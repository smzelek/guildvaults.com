import * as dotenv from 'dotenv';
import { readFileSync } from 'fs';
import path from 'path';

(() => {
    try {
        const env_vars = dotenv.parse(process.env.AWS_SECRETS_STRING || readFileSync(path.join(__dirname, "../../.env")).toString());
        dotenv.populate(process.env as any, env_vars);
    } catch (e) {
        console.error('No env vars set')
    }
})();

export const BLIZZARD_CLIENT_ID = () => process.env.BLIZZARD_CLIENT_ID;
export const BLIZZARD_CLIENT_SECRET = () => process.env.BLIZZARD_CLIENT_SECRET;
