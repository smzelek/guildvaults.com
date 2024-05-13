import { formatted_string, milliseconds_since_epoch_timestamp } from "./types";

export type DungeonCode = "DHT" | "FALL" | "RISE" | "TOTT" | "EB" | "AD" | "WM" | "BRH";

export interface GuildVaultResponse {
    guild_name: formatted_string;
    realm_name: formatted_string;
    players: Player[];
    last_updated: milliseconds_since_epoch_timestamp;
}

export interface Player {
    player_name: formatted_string;
    player_class: formatted_string;
    rank: number;
    weekly_keys_done: Key[];
    prior_weekly_keys_done: Key[];
    last_updated: milliseconds_since_epoch_timestamp;
}

export interface Key {
    dungeon_name: DungeonCode;
    timed: boolean;
    key_level: number;
}


export interface ApiErrorResponse extends ApiResponse {
    error: string | object;
};

export interface ApiSuccessResponse<T extends string | object> extends ApiResponse {
    data: T;
};

export interface ApiResponse {
    meta: {
        status: number;
        count?: number;
        version: string;
    };
}
