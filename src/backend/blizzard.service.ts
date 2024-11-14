import { hoursToMilliseconds } from 'date-fns';
import { BLIZZARD_API_ROUTES } from '../constants/routes';
import { CACHE_KEYS, SimpleCache } from './cache';
import { daysToMilliseconds, logFunction } from '../utils';
import { dash_case_string, formatted_string } from '../models/types';
import { Guild } from "../models/backend";
import { BLIZZARD_CLIENT_ID, BLIZZARD_CLIENT_SECRET } from './env';

type AccessToken = {
    access_token: string;
    token_type: string;
    expires_in: number; // seconds
    sub: string;
}

interface PlayerMythicKeystoneProfileResponse {
    character: {
        id: number;
        name: formatted_string;
        realm: {
            name: formatted_string;
            slug: dash_case_string;
        }
    };
    current_period: {
        best_runs: KeystoneRunResponse[];
    }
}

export interface KeystoneRunResponse {
    completed_timestamp: number;
    dungeon: {
        id: number;
        name: formatted_string;
    },
    duration: number;
    is_completed_within_time: boolean;
    keystone_level: number;
};

interface GuildRosterResponse {
    guild: {
        id: number;
        name: formatted_string;
        realm: {
            name: formatted_string;
            slug: dash_case_string;
        }
    };
    members: {
        character: {
            id: number;
            level: number;
            name: formatted_string;
            realm: {
                slug: dash_case_string;
            };
            playable_class: {
                id: number;
            };
        };
        rank: number;
    }[];
}

export class BlizzardApi {
    private cache: SimpleCache;

    constructor() {
        this.cache = new SimpleCache();
    }

    async getAccessToken(): Promise<string> {
        console.log(BLIZZARD_CLIENT_ID())
        const cachedToken = this.cache.get(CACHE_KEYS.accessToken())
        if (cachedToken) {
            return cachedToken;
        }

        const basicAuthToken = Buffer.from(`${BLIZZARD_CLIENT_ID()}:${BLIZZARD_CLIENT_SECRET()}`).toString('base64');
        const formData = new FormData();
        formData.append('grant_type', 'client_credentials');
        const res = await fetch(BLIZZARD_API_ROUTES.oauth(), {
            method: 'POST',
            body: formData,
            headers: {
                'Authorization': `Basic ${basicAuthToken}`
            }
        });
        if (!res.ok) {
            throw `Failed to getAccessToken, ${res.status}`
        }
        const json: AccessToken = await res.json();

        this.cache.set(CACHE_KEYS.accessToken(), json.access_token, json.expires_in * 1000);
        return json.access_token;
    }

    async getUSRealmsList() {
        const cachedRealms = this.cache.get(CACHE_KEYS.realms())
        if (cachedRealms) {
            return cachedRealms;
        }

        const token = await this.getAccessToken();
        const res = await fetch(BLIZZARD_API_ROUTES.realmsUS(), {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        if (!res.ok) {
            throw `Failed to getUSRealmsList, ${res.status}`
        }
        const realms = await res.json();

        this.cache.set(CACHE_KEYS.realms(), realms, daysToMilliseconds(20));
        return realms;
    }

    async getGuildRoster(realm_slug: dash_case_string, guild_slug: dash_case_string): Promise<Guild> {
        logFunction(this.getGuildRoster, { realm_slug, guild_slug });

        const guild = await (async () => {
            const cachedGuild = this.cache.get(CACHE_KEYS.guild(realm_slug, guild_slug))
            if (cachedGuild) {
                return cachedGuild;
            }
            const token = await this.getAccessToken();
            const res = await fetch(BLIZZARD_API_ROUTES.guildRoster(realm_slug, guild_slug), {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (!res.ok) {
                throw `Failed to getGuildRoster, ${res.status}`
            }
            const guild = await res.json();
            this.cache.set(CACHE_KEYS.guild(realm_slug, guild_slug), guild, hoursToMilliseconds(24));
            return guild;
        })();

        const mappedGuild = BlizzardApi.mapGuildResponse(guild);
        return mappedGuild;
    }

    static mapGuildResponse(response: GuildRosterResponse): Guild {
        const highestLevelMember = response.members.reduce((acc, m) => Math.max(acc, m.character.level), 0);
        return {
            guild_name: response.guild.name,
            realm_name: response.guild.realm.name,
            realm_slug: response.guild.realm.slug,
            members: response.members
                .filter(m => m.character.level === highestLevelMember)
                .filter(p => p.rank <= 6)
                .map((m) => ({
                    player_name: m.character.name,
                    player_class: BlizzardApi.classIdToString(m.character.playable_class.id),
                    rank: m.rank,
                }))
                .sort((a, b) => a.player_name.localeCompare(b.player_name)),
            last_updated: Date.now()
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
