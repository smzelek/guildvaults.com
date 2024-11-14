import React from 'react';
import { rewardForLevel, colorizeRewardLevel } from "../../utils";
import { KeyImg } from './KeyImg';
import './VaultSlot.scss';
import { Key } from '../../models/shared';

export const VaultSlot = (props: { keys: Key[], tierStart: number, tierEnd: number }) => {
    const { keys, tierStart, tierEnd } = props;
    const slotKeys = keys.slice(tierStart, tierEnd);
    const worst = slotKeys.slice(0).sort((k1, k2) => k1.key_level - k2.key_level)[0];

    const header = (() => {
        if (keys.length < tierEnd) {
            return (
                <div className="slot-header slot-incomplete">
                    <span className='slot-incomplete--count'>
                        {`${keys.length} / ${tierEnd}`}
                    </span>
                    <span className='slot-incomplete--text'>
                        &nbsp;completed
                    </span>
                </div>
            );
        }

        const reward = rewardForLevel(worst.key_level)

        return (
            <div className="slot-header key">
                <span className="key--ilvl" style={{ color: colorizeRewardLevel(worst.key_level) }}>
                    {reward.ilvl}
                </span>
                <span className="key--track" style={{ color: colorizeRewardLevel(worst.key_level) }}>
                    &nbsp;({reward.track})
                </span>
            </div>
        );
    })();

    const keyTier = (() => {
        return (
            <div className="key-tier">
                {slotKeys.map((k, i) => <KeyImg key={i} vaultKey={k} />)}
            </div>
        )
    })();

    if (keys.length === 0) {
        return (
            <div className='vault-slot'>
                {header}
            </div>
        )
    }

    return (
        <div className='vault-slot'>
            {header}
            {keyTier}
        </div>
    )
}
