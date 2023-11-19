
import { TransactionData } from '../common';
import BlockChain from './blockChain'


export const mineNewBlock = () => {
    var blockChain: BlockChain = require('../app');
    blockChain.newBlock();

}

export const addPeer = () => {

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