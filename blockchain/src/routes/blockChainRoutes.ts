import express from "express";
import { confirmMining,
    getChain,
    getPendingTransactions,
    mineNewBlock,
    purchase,
    recieveBroadCast,
    recieveNewBroadCast,
    replicateTransaction,
    startBlockChain } from '../blockchain/blockChainStore'
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
router.post('/confirmMining', confirmMining);

/**
 * 
 */
router.get('/currentBlock', getChain)



/**
 * 
 */
router.get('/pendingTransactions', getPendingTransactions);

/**
 * 
 */
router.post('/newBroadCast', recieveNewBroadCast);

/**
 * 
 */
router.post('/broadCast', recieveBroadCast);

export default router;