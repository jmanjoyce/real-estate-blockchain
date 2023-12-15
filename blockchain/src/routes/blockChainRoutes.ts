import express from "express";
import { confirmMining,
    getChain,
    getCurrentPendingTransaction,
    getPendingTransactions,
    mineNewBlock,
    purchase,
    recieveBroadCast,
    recieveNewBroadCast,
    removePending,
    replicateTransaction,
    resolveConflicts,
    startBlockChain} from '../blockchain/blockChainService'
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
router.get('/currentBlock', getChain);

/**
 * 
 */
router.post('/synchronize', resolveConflicts);


/**
 * 
 */
router.get('/pendingTransactions', getCurrentPendingTransaction);

/**
 * 
 */
router.post('/newBroadCast', recieveNewBroadCast);

/**
 * 
 */
router.post('/broadCast', recieveBroadCast);

/**
 * 
 */
router.post('/removePending', removePending);



export default router;