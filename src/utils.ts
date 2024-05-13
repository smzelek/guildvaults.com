import { subHours, addHours, subDays, hoursToMilliseconds } from "date-fns";
import { formatted_string } from "./models/types";
import { Key, Player } from "./models/shared";

const WEEKLY_RESET_DAY_UTC = 2;
const DAYS_IN_A_WEEK = 7;
const WEEKLY_RESET_HOUR_UTC = 15;
const ONE_MINUTE_IN_MS = 60000;
export const SLOT1_REQ = 1;
export const SLOT2_REQ = 4;
export const SLOT3_REQ = 8;

const vaultRewards: Record<number, { ilvl: number, track: string }> = {
    2: { ilvl: 454, track: "Champion 1/8" }, // common
    3: { ilvl: 457, track: "Champion 2/8" },
    4: { ilvl: 460, track: "Champion 3/8" },
    5: { ilvl: 460, track: "Champion 3/8" }, // uncommon
    6: { ilvl: 463, track: "Champion 4/8" },
    7: { ilvl: 463, track: "Champion 4/8" },
    8: { ilvl: 467, track: "Hero 1/6" }, // rare
    9: { ilvl: 467, track: "Hero 1/6" },
    10: { ilvl: 470, track: "Hero 2/6" },
    11: { ilvl: 470, track: "Hero 2/6" },
    12: { ilvl: 473, track: "Hero 3/6" }, // epic
    13: { ilvl: 473, track: "Hero 3/6" },
    14: { ilvl: 473, track: "Hero 3/6" },
    15: { ilvl: 476, track: "Hero 4/6" },
    16: { ilvl: 476, track: "Hero 4/6" },
    17: { ilvl: 476, track: "Hero 4/6" },
    18: { ilvl: 480, track: "Myth 1/4" }, // legendary
    19: { ilvl: 480, track: "Myth 1/4" },
    20: { ilvl: 483, track: "Myth 2/4" },
};

export const rewardForLevel = (keyLevel: number) => {
    return vaultRewards[clampRewardLevel(keyLevel)];
}

export const clampRewardLevel = (keyLevel: number) => Math.max(2, Math.min(keyLevel, 20));

export const colorizeRewardLevel = (keyLevel: number): string => {
    const clampedLevel = clampRewardLevel(keyLevel);
    const currentReward = rewardForLevel(clampedLevel);

    // Make color highlights equivalent when key levels give the same reward
    const highestEquivalentKey = Object.entries(vaultRewards).reverse().find(([level, reward]) => reward.track === currentReward.track);
    const roundedUpKey = +highestEquivalentKey![0];

    return colorizeKeyLevel(roundedUpKey);
}

export const colorizeKeyLevel = (keyLevel: number): string => {
    const ranks = {
        0: 'common',
        4: 'uncommon',
        8: 'rare',
        13: 'epic',
        18: 'legendary',
        25: 'mythic'
    };
    const rankKeys = Object.keys(ranks).map(r => +r);
    const ranksDescending = [...rankKeys].sort((r1, r2) => r2 - r1);
    const ranksAscending = [...rankKeys].sort((r1, r2) => r1 - r2);

    const rankGradients: Record<string, [[number, number, number], [number, number, number]]> = {
        'common': [[255, 255, 255], [255, 255, 255]],
        'uncommon': [[212, 247, 194], [84, 247, 0]],
        'rare': [[98, 179, 249], [0, 129, 220]],
        'epic': [[186, 133, 255], [136, 46, 253]],
        'legendary': [[255, 201, 121], [245, 149, 6]],
        'mythic': [[241, 120, 95], [244, 69, 134]],
    };

    const rgb = (() => {
        const rankStart = ranksDescending.find(r => r <= keyLevel) as keyof typeof ranks;
        const rankEnd = ranksAscending.find(r => r > keyLevel) ?? rankStart + 5; // for mythic
        const rank = ranks[rankStart] as keyof typeof rankGradients;

        const progress = (Math.min(keyLevel, rankEnd) - rankStart) / (rankEnd - rankStart); // flatten to [0....1]
        const gradient = rankGradients[rank];
        return pickHexAlongGradient(gradient, progress);
    })();

    return `rgb(${rgb[0]},${rgb[1]},${rgb[2]})`;
}

export const pickHexAlongGradient = (gradient: [[number, number, number], [number, number, number]], percent: number): [number, number, number] => {
    const [color2, color1] = gradient;
    var w1 = percent;
    var w2 = 1 - w1;
    var rgb = [
        Math.round(color1[0] * w1 + color2[0] * w2),
        Math.round(color1[1] * w1 + color2[1] * w2),
        Math.round(color1[2] * w1 + color2[2] * w2)
    ];
    return rgb as [number, number, number];
}

export const getClassForPlayerClass = (player_class: formatted_string) => {
    switch (player_class) {
        case "Warrior":
            return "warrior";
        case "Paladin":
            return "paladin";
        case "Hunter":
            return "hunter";
        case "Rogue":
            return "rogue";
        case "Priest":
            return "priest";
        case "Death Knight":
            return "death-knight";
        case "Shaman":
            return "shaman";
        case "Mage":
            return "mage";
        case "Warlock":
            return "warlock";
        case "Monk":
            return "monk";
        case "Druid":
            return "druid";
        case "Demon Hunter":
            return "demon-hunter";
        case "Evoker":
            return "evoker";
        default:
            return "";
    }
}

export const getCurrentResetStart = () => {
    const now = subHours(new Date(Date.now()), WEEKLY_RESET_HOUR_UTC);
    const dayOfWeekUTC = now.getUTCDay();
    const daysSinceResetDayUTC = (dayOfWeekUTC + DAYS_IN_A_WEEK - WEEKLY_RESET_DAY_UTC) % DAYS_IN_A_WEEK;

    const startOfTodayUTC = Date.UTC(
        now.getUTCFullYear(),
        now.getUTCMonth(),
        now.getUTCDate(),
        0, 0, 0, 0);

    return addHours(subDays(startOfTodayUTC, daysSinceResetDayUTC), WEEKLY_RESET_HOUR_UTC);
}

export const getPriorResetStart = () => {
    const currentReset = getCurrentResetStart();
    const priorReset = subDays(currentReset, 7);
    return priorReset;
}


export const logFunction = (caller: (...args: any[]) => any, message: unknown): void => {
    console.log(JSON.stringify({
        fn: caller.name,
        message
    }, (_, v) => v === undefined ? null : v))
};

export const isLessThanXMinutesAgo = (within_minutes: number, timestamp: number) => {
    const in_milliseconds = within_minutes * ONE_MINUTE_IN_MS;
    const now = Date.now();
    return timestamp + in_milliseconds > now;
};

export const daysToMilliseconds = (days: number) => hoursToMilliseconds(24) * days;

export const retry = async<T>(fnThatMayError: () => Promise<T>, tries = 1): Promise<T> => {
    try {
        return await fnThatMayError();
    }
    catch (e) {
        logFunction(fnThatMayError, e?.toString())
        if (tries < 3) {
            return retry(fnThatMayError, tries + 1);
        }
        throw 'Failed after 3 retries.';
    }
}

const vaultRating = (p: Player, propertyForPeriod: 'weekly_keys_done' | 'prior_weekly_keys_done') => {
    const fullVault = p[propertyForPeriod].length >= SLOT3_REQ;
    const maxVault = fullVault && p[propertyForPeriod]?.[SLOT3_REQ - 1]?.key_level >= 20;
    const greatVault = fullVault && p[propertyForPeriod]?.[SLOT3_REQ - 1]?.key_level >= 18;

    return maxVault ? 3 : greatVault ? 2 : fullVault ? 1 : 0;
}

export const sortPlayers = (players: Player[], propertyForPeriod: 'weekly_keys_done' | 'prior_weekly_keys_done') => {
    // Keys are already sorted by level
    // Players are already sorted by name
    const kthBestRating = (keys: Key[], k: number) => keys[k - 1]?.key_level || 0;

    return players
        .sort((p1, p2) => kthBestRating(p2[propertyForPeriod], SLOT3_REQ) - kthBestRating(p1[propertyForPeriod], SLOT3_REQ)) // sort by 8th best key
        .sort((p1, p2) => kthBestRating(p2[propertyForPeriod], SLOT2_REQ) - kthBestRating(p1[propertyForPeriod], SLOT2_REQ)) // sort by 4th best key
        .sort((p1, p2) => kthBestRating(p2[propertyForPeriod], SLOT1_REQ) - kthBestRating(p1[propertyForPeriod], SLOT1_REQ)) // sort by 1st best key
        .sort((p1, p2) => Math.min(Math.max(p2[propertyForPeriod].length, SLOT2_REQ), SLOT3_REQ) - Math.min(Math.max(p1[propertyForPeriod].length, SLOT2_REQ), SLOT3_REQ)) // sort by has 3 slots
        .sort((p1, p2) => Math.min(Math.max(p2[propertyForPeriod].length, SLOT1_REQ), SLOT2_REQ) - Math.min(Math.max(p1[propertyForPeriod].length, SLOT1_REQ), SLOT2_REQ)) // sort by has 2 slots
        .sort((p1, p2) => Math.min(Math.max(p2[propertyForPeriod].length, 0), SLOT1_REQ) - Math.min(Math.max(p1[propertyForPeriod].length, 0), SLOT1_REQ)) // sort by has 1 slot
        .sort((p1, p2) => vaultRating(p2, propertyForPeriod) - vaultRating(p1, propertyForPeriod));
}

export const constrain = <T extends Record<string, (...args: any[]) => string>>(t: T): T => {
    return t;
}
