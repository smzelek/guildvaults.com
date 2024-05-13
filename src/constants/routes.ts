import { dash_case_string } from "../models/types";
import { constrain } from '../utils';

export const BLIZZARD_API_ROUTES = constrain({
    guildRoster: (
        realm_slug: dash_case_string,
        guild_slug: dash_case_string
    ) => `https://us.api.blizzard.com/data/wow/guild/${realm_slug}/${guild_slug}/roster?namespace=profile-us&locale=en_US`,
    playerKeystoneProfile: (
        realm_slug: dash_case_string,
        player_name: dash_case_string
    ) => `https://us.api.blizzard.com/profile/wow/character/${realm_slug}/${player_name}/mythic-keystone-profile?namespace=profile-us&locale=en_US`,
    oauth: () => 'https://oauth.battle.net/token',
    realmsUS: () => 'https://us.api.blizzard.com/data/wow/realm/index?namespace=dynamic-us&locale=en_US',
});

export const RAIDERIO_API_ROUTES = constrain({
    playerKeystoneProfile: (
        realm_slug: dash_case_string,
        player_name: dash_case_string
    ) => `https://raider.io/api/v1/characters/profile?region=us&realm=${realm_slug}&name=${player_name}&fields=mythic_plus_weekly_highest_level_runs%2Cmythic_plus_previous_weekly_highest_level_runs`,
});
