
import { Block, PeerNode, TransactionData } from '../common';
import BlockChain from './blockChain';
import WebSocket from 'ws';
import axios from 'axios';


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
 * Docker compose Enviorment variable can use envior
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
export const getPendingTransactions = async (peerNodes: PeerNode[]): Promise<TransactionData[]> => {
    const transactionSet: Set<TransactionData> = new Set();
    const promises = peerNodes.map((node) => {
        const url = `http://${node.ipAdress}/${node.port}/block/pendingTransactions`;
        axios.get(url)
            .then(res => {
                if (res.status == 200) {
                    const transactions: TransactionData[] = res.data.map((item: any) => ({
                        id: item?.id,
                        previousOwner: item?.previousOwner,
                        price: item.price,
                        adress: item.adress,
                        newOwner: item.newOwner,
                    }));
                    transactions.forEach((transaction: TransactionData) => {
                        transactionSet.add(transaction);
                    })
                } else {
                    console.log("Problem collection data from ", url);
                }
            }).catch(error => {
                console.error("Error getting pending transaction from peer nodes: ", error);
            })


    });
    await Promise.all(promises);
    return [...transactionSet];
}

/**
 * This function will send new Transaction data for replication on 
 * a different machine.
 * 
 * 
 * @param data 
 */
export const replicateNewTransaction = async (data: TransactionData[], peers: PeerNode[]) => {
    peers.forEach(node => {
        const url = `http://${node.ipAdress}/${node.port}/block/replicateTransaction`;
        axios.post(url, data);

    })

}

/**
 * 
 */
export const deleteSavedTransactions = () => {

}

/**
 * Function will take new transaction data and replicate it locally.
 * 
 * 
 * @param req 
 * @param res 
 */
export const replicateTransaction = (req: any, res: any) => {
    var blockChain: BlockChain = require('../app');
    const transactions: TransactionData[] = req.data.map((transaction: TransactionData) => {
        return {
            previousOwner: transaction.previousOwner,
            price: transaction.price,
            newOwner: transaction.newOwner,
            id: transaction.id,
            adress: transaction.adress,
        }

    })
    blockChain.replicateTransaction(transactions);

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
 * Sends out all the current pending transaction we have
 * 
 */
export const getCurrentPendingTransaction = (req: any, res: any) => {
    var blockChain = require('../app');
    const pendingTransaction: TransactionData[] = blockChain.getCurrentPendingTransaction();
    res.json(pendingTransaction);

}

/**
 * Recieves regular non-new broadcast and updates it's list of peers.
 * 
 * @param req 
 * @param res 
 */
export const recieveBroadCast = (req: any, res: any) => {
    var blockChain = require('../app');
    const body = req.body;
    const newNode: PeerNode = {
        ipAdress: body.ipAdress,
        port: body.port,
    }
    blockChain.addPeer(newNode);
    res.send("Broadcast recieved");


}

/**
 * Each new server will recieve the IP adress of a root server so
 * it can call this method on the root server
 * 
 * @param req 
 * @param res 
 */
export const recieveNewBroadCast = (req: any, res: any) => {
    var blockChain = require('../app');
    const knownPeers: PeerNode[] = blockChain.getPeers();
    const body = req.body;
    const newNode: PeerNode = {
        ipAdress: body.ipAdress,
        port: body.port,
    }
    blockChain.addPeer(newNode);
    res.json(knownPeers);
}

/**
 * New server will broadcast to the root server to get all knew known servers
 * it will then tell the known servers info.
 * 
 * I have no idea what will happen if this happens at the same time.
 * It will be need to be thought through.
 * 
 * 
 * @param nodeInfo 
 * @param rootPeer 
 */
export const initialBroadCast = async (nodeInfo: PeerNode, rootPeer: PeerNode) => {
    var blockChain = require('../app');
    try {
        const url = `http://${rootPeer.ipAdress}/${rootPeer.port}/block/newBroadcast`;
        const fetchedNewPeers = await axios.post(url, nodeInfo)
            .then(res => {
                if (res.status == 200) {
                    const newPeers: PeerNode[] = res.data.map((item: any) => ({
                        port: item.port,
                        ipAdress: item.ipAdress,
                    }));
                    return newPeers;
                } else {
                    console.log("Problem contacting reach server on initial broadcast ", url);
                    throw new Error("Server responded with status code other than 200");
                }
            }).catch(error => {
                console.error("Error getting initial broadcast from nodes ", error);
                throw error; // Rethrow the error to be caught by the outer try-catch block
            });

        console.log(fetchedNewPeers);
        if (fetchedNewPeers.length > 0) {
            fetchedNewPeers.forEach(peer => {
                const url2 = `http://${peer.ipAdress}/${peer.port}/block/broadcast`;
                blockChain.addPeer(peer);
                axios.post(url2, nodeInfo).catch(error => {
                    console.log(`Problem contacting server broadcast `, url2);
                });
            })
        }

    } catch (error) {
        console.error("Error occurred while fetching new peers: ", error);
       
    }

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

}