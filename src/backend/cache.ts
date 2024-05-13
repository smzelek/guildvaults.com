import { dash_case_string } from '../models/types';
import { constrain, logFunction } from '../utils';

export const CACHE_KEYS = constrain({
    guild: (
        realm_slug: dash_case_string,
        guild_slug: dash_case_string
    ) => `BLIZZARD_GUILD__${realm_slug}_${guild_slug}`,
    raiderIoPlayerProfile: (
        realm_slug: dash_case_string,
        player_name: dash_case_string
    ) => `RAIDERIO_PLAYER-PROFILE__${realm_slug}_${player_name}`,
    blizzardPlayerProfile: (
        realm_slug: dash_case_string,
        player_name: dash_case_string
    ) => `BLIZZARD_PLAYER-PROFILE__${realm_slug}_${player_name}`,
    realms: () => `BLIZZARD_REALMS`,
    accessToken: () => 'BLIZZARD_ACCESS_TOKEN',
});

export class SimpleCache {
    private cache: Map<string, any>;

    constructor() {
        this.cache = new Map();
    }

    set(key: string, value: any, ttl: number) {
        if (ttl > 2147483646 || ttl < 1 || Number.isNaN(ttl)) {
            throw 'Invalid TTL for Cache';
        }

        logFunction(this.set, `Caching ${key} for ${ttl}`)

        this.cache.set(key, value);
        setTimeout(function (this: SimpleCache) {
            this.cache.delete(key);
            logFunction(this.set, `Evicting ${key} after ${ttl}`)
        }.bind(this), ttl)
    }

    get(key: string) {
        if (this.cache.has(key)) {
            logFunction(this.get, `Retrieving ${key}`)
        }
        return this.cache.get(key);
    }
} 
