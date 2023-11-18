import express from "express";
import { addPeer, mineNewBlock, startBlockChain } from '../blockchain/blockChainStore'
import BlockChain from "../blockchain/blockChain";

const router = express.Router();

router.get('/', (req, res) => {
    res.send('Basic');
  });

/**
 * 
 */
router.get('/mineNewBlock', mineNewBlock);

/**
 * 
 */
router.get('/startBlockChain', startBlockChain );

/**
 * 
 */
router.get('/addPeer', addPeer );


export default router;