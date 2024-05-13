import { minutesToMilliseconds } from "date-fns";
import { RAIDERIO_API_ROUTES } from "../constants/routes";
import { formatted_string } from "../models/types";
import { SLOT3_REQ, logFunction } from "../utils";
import { CACHE_KEYS, SimpleCache } from "./cache"
import { PlayerKeystoneProfile } from "../models/backend";
import { DungeonCode } from "../models/shared";

export interface RaiderIOPlayerProfileResponse {
    name: formatted_string;
    race: formatted_string;
    class: formatted_string;
    active_spec_name: formatted_string;
    active_spec_role: formatted_string;
    gender: string;
    faction: string;
    achievement_points: number;
    honorable_kills: number;
    thumnail_url: string;
    region: string;
    realm: formatted_string;
    last_crawled_at: string;
    profile_url: string;
    profile_banner: string;
    mythic_plus_weekly_highest_level_runs: KeystoneRun[];
    mythic_plus_previous_weekly_highest_level_runs: KeystoneRun[];
}

interface KeystoneRun {
    dungeon: formatted_string;
    short_name: DungeonCode;
    mythic_level: number;
    completed_at: Date;
    clear_time_ms: number;
    par_time_ms: number;
    num_keystone_upgrades: number;
    map_challenge_mode_id: number;
    zone_id: number;
    score: number;
    affixes: Affix[];
    url: string;
}

interface Affix {
    id: number;
    name: formatted_string;
    description: formatted_string;
    icon: string;
    wowhead_url: string;
}

export class RaiderIoAPI {
    private cache: SimpleCache;

    constructor() {
        this.cache = new SimpleCache();
    }

    async getPlayerKeys(realm_slug: string, player_name: string): Promise<PlayerKeystoneProfile> {
        logFunction(this.getPlayerKeys, { realm_slug, player_name });
        const cachedPlayer = this.cache.get(CACHE_KEYS.raiderIoPlayerProfile(realm_slug, player_name))
        if (cachedPlayer) {
            return cachedPlayer;
        }

        const res = await fetch(RAIDERIO_API_ROUTES.playerKeystoneProfile(realm_slug, player_name));
        if (!res.ok) {
            throw `Failed to getPlayerKeys, ${res.status}`
        }
        const player = await res.json();
        const mappedPlayer = RaiderIoAPI.mapPlayerResponse(player);

        this.cache.set(CACHE_KEYS.raiderIoPlayerProfile(realm_slug, player_name), mappedPlayer, minutesToMilliseconds(30));
        return mappedPlayer;
    }

    static mapPlayerResponse(response: RaiderIOPlayerProfileResponse): PlayerKeystoneProfile {
        return {
            weekly_keys_done: (response.mythic_plus_weekly_highest_level_runs)
                .map(r => ({
                    dungeon_name: r.short_name,
                    key_level: r.mythic_level,
                    timed: r.clear_time_ms < r.par_time_ms,
                })).sort((a, b) => b.key_level - a.key_level).slice(0, SLOT3_REQ),
            prior_weekly_keys_done: (response.mythic_plus_previous_weekly_highest_level_runs)
                .map(r => ({
                    dungeon_name: r.short_name,
                    key_level: r.mythic_level,
                    timed: r.clear_time_ms < r.par_time_ms,
                })).sort((a, b) => b.key_level - a.key_level).slice(0, SLOT3_REQ),
            last_updated: new Date(response.last_crawled_at).getTime()
        };
    }

    static classIdToString(id: number): string {
        switch (id) {
            case 1:
                return "Warrior";
            case 2:
                return "Paladin";
            case 3:
                return "Hunter";
            case 4:
                return "Rogue";
            case 5:
                return "Priest";
            case 6:
                return "Death Knight";
            case 7:
                return "Shaman";
            case 8:
                return "Mage";
            case 9:
                return "Warlock";
            case 10:
                return "Monk";
            case 11:
                return "Druid";
            case 12:
                return "Demon Hunter";
            case 13:
                return "Evoker";
            default:
                return "";
        }
    }
}
