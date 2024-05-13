import { GuildMember, Key } from "../models/backend";
import { GuildVaultResponse, Player } from "../models/shared";
import { dash_case_string } from "../models/types";
import { logFunction, retry } from "../utils";
import { BlizzardApi } from "./blizzard.service";
import { RaiderIoAPI } from './raiderio.service';

export class AppService {
    private blizzardApi: BlizzardApi;
    private raiderIoApi: RaiderIoAPI;

    constructor() {
        this.blizzardApi = new BlizzardApi();
        this.raiderIoApi = new RaiderIoAPI();
    }

    async loadGuildVault(realm_slug: dash_case_string, guild_slug: dash_case_string): Promise<GuildVaultResponse> {
        const guild = await this.blizzardApi.getGuildRoster(realm_slug, guild_slug);
        const player_data = await this.loadMembers(realm_slug, guild.members);
        const newest_data_timestamp = player_data.reduce((acc, cur) => Math.max(acc, cur.last_updated), guild.last_updated);

        return {
            guild_name: guild.guild_name,
            realm_name: guild.realm_name,
            players: player_data,
            last_updated: newest_data_timestamp
        };
    }

    async loadMembers(realm_slug: dash_case_string, members: GuildMember[]): Promise<Player[]> {
        let players: (Player | null)[] = [];
        const batch_workload = members.slice(0);
        const batch_size = 50;
        logFunction(this.loadMembers, `loading ${batch_workload.length} members`);

        while (batch_workload.length > 0) {
            const batch = batch_workload.splice(0, batch_size);
            logFunction(this.loadMembers, `loading batch ${members.length - batch_workload.length} / ${members.length}`)

            const batch_data: (Player | null)[] = await Promise.all(batch.map(async (member) => {
                try {
                    const keyData = await retry(() => this.raiderIoApi.getPlayerKeys(realm_slug, member.player_name.toLowerCase()));
                    const response: Player = {
                        rank: member.rank,
                        player_name: member.player_name,
                        player_class: member.player_class,
                        weekly_keys_done: keyData.weekly_keys_done,
                        prior_weekly_keys_done: keyData.prior_weekly_keys_done,
                        last_updated: keyData.last_updated,
                    };
                    return response;
                } catch (err) {
                    logFunction(this.loadMembers, `failed to load ${member.player_name} ${realm_slug}, skipping`)
                    return null;
                }
            }));

            players = players.concat(batch_data);
        }
        logFunction(this.loadMembers, `finished loading ${members.length}/${members.length} members`);
        return players.filter((p): p is Player => !!p);
    }
}
