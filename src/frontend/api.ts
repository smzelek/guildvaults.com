import { GuildVaultResponse } from "../models/shared";
import { dash_case_string, formatted_string } from "../models/types";
import { API_URL } from "./env";

export const loadData = async (realm_slug: dash_case_string, guild_name: formatted_string): Promise<GuildVaultResponse | undefined> => {
    try {
        const res = (await fetch(`${API_URL}/guild_vault/${realm_slug}/${guild_name}`));
        const json = await res.json();
        return await json.data;
    } catch (e) {
        return undefined;
    }
}
