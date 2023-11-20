import express from "express";
import { addPeer, mineNewBlock, purchase, startBlockChain } from '../blockchain/blockChainStore'
import BlockChain from "../blockchain/blockChain";


const router = express.Router();


router.get('/', (req, res) => {
    res.send('Basic');
  });

/**
 * 
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

/**
 * 
 */
router.get('/addPeer', addPeer );


export default router;