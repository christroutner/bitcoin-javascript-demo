/* eslint-disable */
import { useEffect, useState } from 'react';

import { BitcoinNode } from '../bitcoin/node';
import { hashAndPack, unpackHash, verifySignatureAndUnpack } from '../lib/crypto';

// import { asyncMap, randomEntry } from '../lib/util';
const { BitcoinUtil } = require('../lib/util2')
const bUtil = new BitcoinUtil()

const MAX_ID_LENGTH = 10;

const getPublicID = (publicKey) => {
  return publicKey.length < MAX_ID_LENGTH ? publicKey : JSON.parse(atob(publicKey)).n.replace(/[^a-zA-Z0-9]/g, '').slice(0, MAX_ID_LENGTH)
}

export function useNodes() {
  const [ nodes, setNodes ] = useState([])
  const [ blocks, setBlocks ] = useState([]);
  const [ balances, setBalances ] = useState({});
  const [ mempool, setMempool ] = useState([]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(async () => {
    const rawNodes = [];
    const nodes = [];

    for (const _ of new Array(5).fill()) {
      const node = BitcoinNode();
      node.mine();
      rawNodes.push(node);
      nodes.push({
        id: getPublicID(await node.getPublicKey())
      });
    }

    setNodes(nodes);

    let sent = {};
    let blockcount = 1;

    setInterval(async () => {
      const firstNode = rawNodes[0];

      const blockChain = firstNode.getBlockChain();
      const longestChain = blockChain.getBlocks().getRoot().getLongestChain();
      const rawBalances = await blockChain.getBalances();

      const blocks = [];
      for (const node of longestChain) {
        const { miner, parentid, id, time, transactions, difficulty, reward } = node.getValue();

        const txns = [];

        for (const transaction of transactions) {
          const { sender, receiver, amount, fee } = transaction;
          txns.push({
            sender: getPublicID(sender),
            receiver: getPublicID(receiver),
            amount,
            fee
          })
        }

        const hash = unpackHash(await hashAndPack(node.getValue()))

        blocks.unshift({
          miner: getPublicID(miner),
          parentid,
          id,
          time,
          transactions: txns,
          difficulty,
          reward,
          hash
        })
      }
      setBlocks(blocks);

      const mempool = await bUtil.asyncMap(
        firstNode.getMemPool(),
          async (signedTransaction) => {
            const { sender, receiver, amount, fee } = await verifySignatureAndUnpack(signedTransaction);
            return { sender: getPublicID(sender), receiver: getPublicID(receiver), amount, fee }
        }
      )
      setMempool(mempool);

      const balances = {};
      for (const [ account, balance ] of Object.entries(rawBalances)) {
          balances[getPublicID(account)] = balance;
      }
      setBalances(balances)

      const len = blockChain.getBlocks().getRoot().getLongestChain().length;
      if (len > blockcount) {
        blockcount = len;
        sent = {};
      }

      const sender = bUtil.randomEntry(rawNodes);
      const senderPublicKey = await sender.getPublicKey();

      if (sent[senderPublicKey]) {
        return;
      }
      sent[senderPublicKey] = true;

      let receiver;
      while (!receiver || receiver === sender) {
        receiver = bUtil.randomEntry(rawNodes);
      }
      const receiverPublicKey = await receiver.getPublicKey();

      const balance = rawBalances[senderPublicKey];

      if (!balance) {
        return;
      }

      const amount = Math.floor(Math.random() * balance * 0.5);
      const fee = Math.max(1, Math.floor(Math.random() * amount * 0.03));

      await sender.send(receiverPublicKey, amount, fee);
    }, 500);
  }, []);

  return { nodes, blocks, balances, mempool }
}
