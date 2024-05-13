import { DungeonCode } from "./shared";
import { formatted_string, dash_case_string, milliseconds_since_epoch_timestamp } from "./types";

export interface Guild {
    guild_name: formatted_string;
    realm_name: formatted_string;
    realm_slug: dash_case_string;
    members: GuildMember[];
    last_updated: milliseconds_since_epoch_timestamp;
}

export interface GuildMember {
    player_name: formatted_string;
    player_class: formatted_string;
    rank: number;
}

export interface PlayerKeystoneProfile {
    weekly_keys_done: Key[];
    prior_weekly_keys_done: Key[];
    last_updated: milliseconds_since_epoch_timestamp;
}

export interface Key {
    dungeon_name: DungeonCode;
    timed: boolean;
    key_level: number;
}
