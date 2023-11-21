
import { Block, PeerNode, TransactionData } from '../common';
import BlockChain from './blockChain';
import WebSocket from 'ws';


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
 * This function will send
 * 
 * 
 * @param data 
 */
export const sendNewTransaction = (data: TransactionData[]) => {

}

export const replicateTransaction = (req: any, res: any) => {
    
}

/**
 * 
 * @param data 
 * @returns 
 */
export const getPeerChain = (data: PeerNode[]): Block[][] => {
    return [];
}

/**
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





export const purchase = (req: any, res: any) => {
    console.log(req.body);
    var blockChain: BlockChain = require('../app');
    const { name, adress, price } = req.body;
    const transaction: TransactionData = {
        newOwner: name,
        adress: adress,
        price: price,
    }
    blockChain.addTransaction(transaction);
    console.log('added block');
    res.send('Recieved');
}

export const addPeer = () => {
    // Todo Implement
}

export const addTransaction = (req: any, res: any) => {
    var blockChain = require('../app');
    console.log(req.body);
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