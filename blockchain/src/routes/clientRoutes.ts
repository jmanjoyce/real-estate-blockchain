import express from "express";
import { mineNewBlock, purchase, startBlockChain } from '../blockchain/blockChainStore'
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
router.get('/startBlockChain', startBlockChain );




export default router;