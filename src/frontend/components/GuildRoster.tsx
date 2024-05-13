import React, { useEffect, useMemo, useState } from 'react';
import { GuildVaultResponse } from "../../models/shared";
import { SLOT1_REQ, SLOT2_REQ, SLOT3_REQ, getClassForPlayerClass, getCurrentResetStart, getPriorResetStart, sortPlayers } from '../../utils';
import { VaultSlot } from './VaultSlot';
import { dash_case_string } from '../../models/types';
import * as api from '../api';
import './GuildRoster.scss';
import { format } from 'date-fns';

export const GuildRoster = ({ realm, guild }: { realm: dash_case_string, guild: dash_case_string }) => {
    const [data, setData] = useState<GuildVaultResponse>();
    const [period, setPeriod] = useState<'current' | 'previous'>('current');

    const periodDate = useMemo(() => {
        const date = (() => {
            if (period === 'current') {
                return getCurrentResetStart();
            }
            return getPriorResetStart();
        })();

        return format(date, 'EEEE, MMM do')
    }, [period]);

    const propertyForPeriod = period === 'current' ? 'weekly_keys_done' : 'prior_weekly_keys_done';
    const sortedPlayers = useMemo(() => {
        return sortPlayers([...(data?.players ?? [])], propertyForPeriod);
    }, [data, period])

    useEffect(() => {
        (async () => {
            const data = await api.loadData(realm, guild);
            setData(data);
        })();
    }, []);

    if (!data) {
        return (
            <div className="loading-container" >
                <div className='loading-background'>
                    <span>Summoning guild data from</span>
                    <div className="spinner" />
                    <span>the Twisting Nether...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="guild">
            <h2 className="guild__title">
                <span className='guild__title--name'>
                    &lt;{data.guild_name}&gt;
                </span>
                <span className="separator" />
                <span className='guild__title--realm'>
                    {data.realm_name}
                </span>
            </h2>
            <div className="roster">
                <div className="roster__navigation">
                    <div className='spacer' />
                    <button className={`paginator ${period === 'previous' && 'active'}`} onClick={() => setPeriod('previous')}>
                        <span className='paginator--arrow'>&lt;</span><span className='paginator--text'>last week</span>
                    </button>
                    <span className="period">
                        runs for {periodDate} reset
                    </span>
                    <button className={`paginator ${period === 'current' && 'active'}`} onClick={() => setPeriod('current')}>
                        <span className='paginator--text'>this week</span><span className='paginator--arrow'>&gt;</span>
                    </button>
                    <div className='spacer' />
                </div>
                <div className="roster__scroll-wrapper">
                    <div className="header-row header-row--checkbox"></div>
                    <div className="header-row">Player</div>
                    <div className="header-row">
                        {SLOT1_REQ} M+
                    </div>
                    <div className="header-row">
                        {SLOT2_REQ} M+
                    </div>
                    <div className="header-row">
                        {SLOT3_REQ} M+
                    </div>
                    {sortedPlayers.map((p, i) => {
                        const fullVault = p[propertyForPeriod].length >= SLOT3_REQ;
                        const maxVault = fullVault && p[propertyForPeriod]?.[SLOT3_REQ - 1]?.key_level >= 20;
                        const greatVault = fullVault && p[propertyForPeriod]?.[SLOT3_REQ - 1]?.key_level >= 18;

                        return (<div className="row" key={p.player_name}>
                            <div className="cell cell--checkbox">
                                {maxVault ? "👑" : greatVault ? "⭐" : fullVault ? "✅" : ''}
                            </div>
                            <div className="cell cell--player">
                                <span className={getClassForPlayerClass(p.player_class)}>
                                    {p.player_name}
                                </span>
                            </div>
                            <div className="cell">
                                <VaultSlot tierStart={0} tierEnd={SLOT1_REQ} keys={p[propertyForPeriod]} />
                            </div>
                            <div className="cell">
                                <VaultSlot tierStart={SLOT1_REQ} tierEnd={SLOT2_REQ} keys={p[propertyForPeriod]} />
                            </div>
                            <div className="cell">
                                <VaultSlot tierStart={SLOT2_REQ} tierEnd={SLOT3_REQ} keys={p[propertyForPeriod]} />
                            </div>
                        </div>);
                    })}
                </div>
            </div>
        </div>
    );
}
