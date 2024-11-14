import { test, describe } from 'node:test';
import assert from 'node:assert';
import { getCurrentResetStart, getPriorResetStart } from '../utils';

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
