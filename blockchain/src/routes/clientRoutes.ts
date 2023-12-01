import express from "express";
import { dump, getAdressInfo, getAllPending, getStatus, mineNewBlock, purchase, startBlockChain, validatePurchase } from '../blockchain/blockChainStore'
import BlockChain from "../blockchain/blockChain";


const router = express.Router();


router.get('/', (req, res) => {
    res.send('Basic');
  });

/**
 * has some id information that might be pernient to asking a different block
 * to mine.
 */
router.post('/mineNewBlock', mineNewBlock);

/**
 * 
 */
router.post('/purchase', purchase);

/**
 * 
 */
router.get('/start', startBlockChain);

/**
 * 
 */
router.get('/dump', dump);

/**
 * 
 */
router.get('/status', getStatus);


/**
 * 
 */
router.get('/allPendingTransaction', getAllPending)


// This should probably be changed to get with a query
/**
 * 
 */
router.post('/addressInfo', getAdressInfo);


/**
 * 
 */
router.post('/validatePurchase', validatePurchase);

// /**
//  * 
//  */
// router.get('/startBlockChain', startBlockChain );





export default router;