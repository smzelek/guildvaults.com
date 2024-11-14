import React from 'react';
import { colorizeKeyLevel } from "../../utils";
import './KeyImg.scss';
import { Key } from '../../models/shared';

export const KeyImg = (props: { vaultKey: Key }) => {
    return (
        <div title={`${props.vaultKey.dungeon} +${props.vaultKey.key_level} ${props.vaultKey.timed ? '(Timed)' : '(Untimed)'}`.trim()}
            className={`key key--img ${props.vaultKey.timed ? 'key--timed' : ''}`}
            style={{ backgroundImage: `url("${props.vaultKey.icon}")` }}
        >
            <span style={{ color: colorizeKeyLevel(props.vaultKey.key_level) }}>
                {props.vaultKey.key_level}
            </span>
        </div>
    );
};
