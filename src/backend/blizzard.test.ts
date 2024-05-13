import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert';
import { BlizzardApi, KeystoneRunResponse } from './blizzard.service';
import { getCurrentResetStart, getPriorResetStart } from '../utils';

describe('function: isRunFromCurrentReset', () => {
    describe('before reset time', () => {
        beforeEach(() => {
            Date.now = () => new Date('2023-11-21T14:59:59.000Z').getTime();
        });

        const cases: [string, boolean, string][] = [
            ['2023-11-21T05:00:00.000Z', true, 'early on reset tuesday'],
            ['2023-11-20T05:00:00.000Z', true, 'monday'],
            ['2023-11-19T05:00:00.000Z', true, 'sunday'],
            ['2023-11-18T05:00:00.000Z', true, 'saturday'],
            ['2023-11-17T05:00:00.000Z', true, 'friday'],
            ['2023-11-16T05:00:00.000Z', true, 'thursday'],
            ['2023-11-15T05:00:00.000Z', true, 'wednesday'],
            ['2023-11-14T16:00:00.000Z', true, 'prior tuesday, post-reset'],
            ['2023-11-14T05:00:00.000Z', false, 'prior tuesday, pre-reset'],
        ];

        cases.forEach(([date, exp, label]: [string, boolean, string]) => {
            test(label, async function () {
                const run: Partial<KeystoneRunResponse> = {
                    completed_timestamp: new Date(date).getTime()
                }
                assert.equal(BlizzardApi.isRunFromCurrentReset(run as KeystoneRunResponse), exp);
            });
        });
    });

    describe('at reset time', () => {
        beforeEach(() => {
            Date.now = () => new Date('2023-11-21T15:00:00.000Z').getTime();
        });

        const cases: [string, boolean, string][] = [
            ['2023-11-21T05:00:00.000Z', false, 'early on reset tuesday'],
            ['2023-11-20T05:00:00.000Z', false, 'monday'],
            ['2023-11-19T05:00:00.000Z', false, 'sunday'],
            ['2023-11-18T05:00:00.000Z', false, 'saturday'],
            ['2023-11-17T05:00:00.000Z', false, 'friday'],
            ['2023-11-16T05:00:00.000Z', false, 'thursday'],
            ['2023-11-15T05:00:00.000Z', false, 'wednesday'],
            ['2023-11-14T16:00:00.000Z', false, 'prior tuesday, post-reset'],
            ['2023-11-14T05:00:00.000Z', false, 'prior tuesday, pre-reset'],
        ];

        cases.forEach(([date, exp, label]: [string, boolean, string]) => {
            test(label, async function () {
                const run: Partial<KeystoneRunResponse> = {
                    completed_timestamp: new Date(date).getTime()
                }
                assert.equal(BlizzardApi.isRunFromCurrentReset(run as KeystoneRunResponse), exp);
            });
        });
    });

    describe('after reset time', () => {
        beforeEach(() => {
            Date.now = () => new Date('2023-11-21T15:59:59.000Z').getTime();
        });

        const cases: [string, boolean, string][] = [
            ['2023-11-21T05:00:00.000Z', false, 'early on reset tuesday'],
            ['2023-11-20T05:00:00.000Z', false, 'monday'],
            ['2023-11-19T05:00:00.000Z', false, 'sunday'],
            ['2023-11-18T05:00:00.000Z', false, 'saturday'],
            ['2023-11-17T05:00:00.000Z', false, 'friday'],
            ['2023-11-16T05:00:00.000Z', false, 'thursday'],
            ['2023-11-15T05:00:00.000Z', false, 'wednesday'],
            ['2023-11-14T16:00:00.000Z', false, 'prior tuesday, post-reset'],
            ['2023-11-14T05:00:00.000Z', false, 'prior tuesday, pre-reset'],
        ];

        cases.forEach(([date, exp, label]: [string, boolean, string]) => {
            test(label, async function () {
                const run: Partial<KeystoneRunResponse> = {
                    completed_timestamp: new Date(date).getTime()
                }
                assert.equal(BlizzardApi.isRunFromCurrentReset(run as KeystoneRunResponse), exp);
            });
        });
    });
});

describe('function: getCurrentResetStart / function: getPriorResetStart', () => {
    test('on tuesday, before reset', () => {
        Date.now = () => new Date('2023-11-21T14:59:59.000Z').getTime();
        const [current, prior] = [
            new Date('2023-11-14T15:00:00.000Z'),
            new Date('2023-11-07T15:00:00.000Z')
        ];
        assert.deepEqual(getCurrentResetStart(), current);
        assert.deepEqual(getPriorResetStart(), prior);
    });

    test('on tuesday, at reset', () => {
        Date.now = () => new Date('2023-11-21T15:00:00.000Z').getTime();
        const [current, prior] = [
            new Date('2023-11-21T15:00:00.000Z'),
            new Date('2023-11-14T15:00:00.000Z')
        ];
        assert.deepEqual(getCurrentResetStart(), current);
        assert.deepEqual(getPriorResetStart(), prior);
    });

    test('on tuesday, after reset', () => {
        Date.now = () => new Date('2023-11-21T15:59:59.000Z').getTime();
        const [current, prior] = [
            new Date('2023-11-21T15:00:00.000Z'),
            new Date('2023-11-14T15:00:00.000Z')
        ];
        assert.deepEqual(getCurrentResetStart(), current);
        assert.deepEqual(getPriorResetStart(), prior);
    });
});
