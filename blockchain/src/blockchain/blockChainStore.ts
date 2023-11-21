
import { Block, PeerNode, TransactionData } from '../common';
import BlockChain from './blockChain';
import WebSocket from 'ws';


/**
 * 
 * TODO for part 2 of proj
 * Figure out peer synchronization logic. 
 * Implement all peer to peer communication 
 * Figure out data tranfer objects between peers.
 * Figure out enviorment variable
 * Think more carefully about IP adress representation.
 * Figure out how to pass IP adress information into the 
 * also set up DC on backend
 * 
 * 
 * Part 3 will deal with 
 * Hooking up front end with multiple nodes and have reset block chains not running
 * (remove peer add peer)
 * 
 * Part 4, 
 * Make this project a stateless applicatation using mongo (extra hard haha)
 * we will see.
 * 
 */


/**
 * 
 * @param req 
 * @param res 
 */
export const mineNewBlock = (req: any, res: any) => {
    var blockChain: BlockChain = require('../app');
    blockChain.newBlock();
    res.send('mining started');
}

/**
 * Used to synchronize pending transactions this function will serve to retrieve
 * all pending transaction from other blocks in the block chain
 * 
 * @returns 
 */
export const getPendingTransactions = ():TransactionData[] => {
    return [];
}

/**
 * This function will send new Transaction data for replication on 
 * a different machine.
 * 
 * 
 * @param data 
 */
export const sendNewTransaction = (data: TransactionData[], peer: PeerNode) => {

}

/**
 * Function will take new transaction data and replicate it locally.
 * 
 * 
 * @param req 
 * @param res 
 */
export const replicateTransaction = (req: any, res: any) => {

}

/**
 * Method will call all peernodes and wait for them to send chain. It will the return all the
 * blocks in the chain
 * 
 * @param data 
 * @returns 
 */
export const getPeerChain = (data: PeerNode[]): Block[][] => {
    return [];
}

/**
 * This will just send the current information when a concensus algorithim is started
 * 
 * @param block 
 */
export const sendChain = (block: BlockChain) => {

}



/**
 * 
 */
export const synchronizePeers = (peers: PeerNode[]) => {

}


/**
 * 
 * @param req 
 * @param res 
 */
export const purchase = (req: any, res: any) => {
    var blockChain: BlockChain = require('../app');
    const { name, adress, price } = req.body;
    const transaction: TransactionData = {
        newOwner: name,
        adress: adress,
        price: price,
    }
    blockChain.addTransaction(transaction);
    res.send('Recieved');
}


/**
 * This is probably duplicate and can probably be removed
 * @param req 
 * @param res 
 */
export const addTransaction = (req: any, res: any) => {
    var blockChain = require('../app');
    const data: TransactionData = JSON.parse(JSON.stringify(req.body));
    blockChain.addTransaction(data);
    res.send('Transaction Started');

}


export const startBlockChain = (req: any, res: any) => {
    var blockChain = require('../app');
    console.log(blockChain);
    const transaction: TransactionData = {
        newOwner: 'jared',
        adress: 'cool adress',
        price: 0
    }
    blockChain.addTransaction(transaction);
    // if (blockChain != undefined){
    //     res.send('Failure');
    //     return
    // }
    
    blockChain = new BlockChain([]);
    console.log(blockChain);
    res.send('Success');

}