import express from "express";
import { addPeer, getPendingTransactions, mineNewBlock, purchase, replicateTransaction, startBlockChain } from '../blockchain/blockChainStore'
import BlockChain from "../blockchain/blockChain";


const router = express.Router();


router.get('/', (req, res) => {
    res.send('Basic');
  });

/**
 * 
 */
router.post('/replicateTransaction', replicateTransaction);

/**
 * 
 */
router.get('/pendingTransaction', getPendingTransactions);

export default router;