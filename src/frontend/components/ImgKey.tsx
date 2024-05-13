import React from 'react';
import { colorizeKeyLevel } from "../../utils";
import './ImgKey.scss';
import { DungeonCode } from '../../models/shared';

export const ImgKey = (props: { keyLevel: number, dungeon: DungeonCode, timed: boolean }) => {
    const { keyLevel, dungeon, timed } = props;

    const getImageClassForDungeon = (dungeonCode: DungeonCode): string => {
        switch (dungeonCode) {
            case "FALL":
                return "doti-fall";
            case "RISE":
                return "doti-rise";
            case "BRH":
                return "black-rook-hold";
            case "TOTT":
                return "throne-of-the-tides";
            case "DHT":
                return "darkheart-thicket";
            case "EB":
                return "the-everbloom";
            case "WM":
                return "waycrest-manor";
            case "AD":
                return "atal-dazar";
            default:
                return "";
        }
    }

    const getNameForDungeon = (dungeonCode: DungeonCode): string => {
        switch (dungeonCode) {
            case "FALL":
                return "Dawn of the Infinite: Galakrond's Fall";
            case "RISE":
                return "Dawn of the Infinite: Murozond's Rise";
            case "BRH":
                return "Black Rook Hold";
            case "TOTT":
                return "Throne of the Tides";
            case "DHT":
                return "Darkheart Thicket";
            case "EB":
                return "The Everbloom";
            case "WM":
                return "Waycrest Manor";
            case "AD":
                return "Atal'Dazar";
            default:
                return "";
        }
    }

    return (
        <div title={`${getNameForDungeon(dungeon)} +${keyLevel} ${timed ? '(Timed)' : '(Untimed)'}`.trim()}
            className={`key key--img ${getImageClassForDungeon(dungeon)} ${timed ? 'key--timed' : ''}`}>
            <span style={{ color: colorizeKeyLevel(keyLevel) }}>
                {keyLevel}
            </span>
        </div>
    );
};
