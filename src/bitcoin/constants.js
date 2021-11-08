/* @flow */

// import { now } from "../lib/util"
const { BitcoinUtil } = require('../lib/util2')
const bUtil = new BitcoinUtil()

export type TransactionType = {|
    sender : string,
    receiver : string,
    amount : number,
    fee : number
|};

export type BlockType = {|
    miner : string, // Miner ID
    parentid : ?string, // Parent block
    id : string,
    index : number,
    time : number,
    elapsed : number, // Time elapsed sine last block
    transactions : Array<TransactionType>,
    difficulty : number, // Difficulty value
    reward : number
|};

export const BLOCK_TIME = 1000;

export const REWARD_HALVING_SCHEDULE = 20;

export const BLOCK_SIZE_LIMIT = 10;

export const GENESIS_BLOCK : BlockType = {
    parentid:     null,
    id:           'GENESIS',
    miner:        'SATOSHI',
    index:        1,
    time:         bUtil.now(),
    elapsed:      0,
    transactions: [],
    difficulty:   1,
    reward:       1024
};

export const PRICE_FORMULA = (days : number) : number =>
    10 ** (2.9065 * Math.log(days) - 19.493);
