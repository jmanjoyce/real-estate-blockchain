
import { Block, PeerNode, StatusDto, TransactionData } from '../common';
import BlockChain from './blockChain';
import axios from 'axios';
import { Status } from './blockChain';

/**
 * 
 * TODO for part 2
 * Test Mining, synchronization, replication. ECT
 * Currently working on setting up testing for machines mining and starting stopping
 * Optional Implementation of stopping machine.
 * 
 * 
 * Part 3 
 * Implement testing features on front end. Seems like a good idea to have a page wit
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
        const url = `http://${node.ipAdress}:${node.port}/block/pendingTransactions`;
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

        const url = `http://${node.ipAdress}:${node.port}/block/replicateTransaction`;
        console.log('replicating new transaction ', url)
        axios.post(url, data).then().catch(err => {
            console.log(err);
        })
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
    console.log('replicating transactions');
    const transactions: TransactionData[] = req.body.map((transaction: TransactionData) => {
        return {
            previousOwner: transaction.previousOwner,
            price: transaction.price,
            newOwner: transaction.newOwner,
            id: transaction.id,
            adress: transaction.adress,
        }

    })
    blockChain.replicateTransaction(transactions);
    res.send('replicated transactions');

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
    //console.log('recieving regular broadcast');
    const body = req.body;
    const newNode: PeerNode = {
        ipAdress: body.ipAdress,
        port: body.port,
    }
    blockChain.addPeer(newNode);
    res.send("Broadcast recieved");

}

/**
 * 
 * @param req 
 * @param res 
 */
export const resolveConflicts = (req: any, res: any) => {
    var blockChain: BlockChain = require('../app');
    blockChain.resolveConflicts();

}

/**
 * 
 * @param peers 
 */
export const synchronizeChains = (peers: PeerNode[])=>{
    peers.forEach(node => {
        const url = `http://${node.ipAdress}:${node.port}/block/synchronize`;
        axios.post(url).then().catch(err => {
            console.log(err);
        })
    })

}

/**
 * Succesful Mine broadcast to peers that is has mined a block with
 * a bunch of new transaction
 */
export const succesfulMine = async (peers: PeerNode[], minedTransactions: TransactionData[]) => {
    const promises = peers.map((node) => {
        const url = `http://${node.ipAdress}:${node.port}/block/confirmMining`;
        axios.post(url, minedTransactions).then().catch(err => {
            console.log(err);
        })
    });
    await Promise.all(promises);
}

/**
 * 
 * @returns 
 */
export const getPeerChains = async (peerNodes: PeerNode[]): Promise<Block[][]> => {
    const chains: Block[][] = [];
    const promises = peerNodes.map((node) => {
        const url = `http://${node.ipAdress}:${node.port}/block/currentBlock`;
        return axios.get(url)
            .then(res => {
                if (res.status == 200) {
                    try {
                        const block: Block[] = res.data.map((item: any) => ({
                            index: item.index,
                            timeStamp: new Date(item.timeStamp),
                            previousHash: item.previousHash,
                            nonce: item.nonce,
                            information: item.information.map((data: TransactionData) => ({
                                id: data.id,
                                previousOwner: data.previousOwner,
                                newOwner: data.newOwner,
                                adress: data.adress,
                                price: data.price,
                            }))
                        }));
                        chains.push(block);
                    } catch (err) {
                        console.log('error processing blockchain');
                        // return [];
                    }

                } else {
                    console.log("Problem collection data from ", url);
                }
            }).catch(error => {
                
                console.error("Error getting pending transaction from peer nodes: ", error);
            })


    });
    await Promise.all(promises);
    return chains;


}

/**
 * Takes the new transaction 
 * 
 */
export const confirmMining = (req: any, res: any) => {
    var blockChain: BlockChain = require('../app');
    const body = req.body;
    const transactionData: TransactionData[] = body.map((transaction: TransactionData) => {
        return {
            previousOwner: transaction.previousOwner,
            price: transaction.price,
            newOwner: transaction.newOwner,
            id: transaction.id,
            adress: transaction.adress,

        }
    })
    blockChain.updatePendingTransactions(transactionData);

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
    //console.log('recieving new broadcast');
    const knownPeers: PeerNode[] = blockChain.getPeers();
    res.json(knownPeers);
    const body = req.body;
    const newNode: PeerNode = {
        ipAdress: body.ipAdress,
        port: body.port,
    }
    blockChain.addPeer(newNode);

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
export const initialBroadCast = async (blockChain: BlockChain) => {
    if (process.env.ROOT_IP === undefined &&
        process.env.ROOT_PORT === undefined) {
        return;
    }
    const nodeInfo: PeerNode = blockChain.node;
    const rootPeer: PeerNode = blockChain.rootNode!;
    try {

        const url = `http://${rootPeer.ipAdress}:${rootPeer.port}/block/newBroadcast`;
        //console.log(blockChain);
        // Temp for debugging
        //console.log('initial broadcast url', url);
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

        console.log('fetched peers', fetchedNewPeers);
        blockChain.setStatus(Status.RUNNING);
        if (fetchedNewPeers.length > 0) {
            fetchedNewPeers.forEach(peer => {
                const url2 = `http://${peer.ipAdress}:${peer.port}/block/broadcast`;
                //console.log('second url called', url2, peer);

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
export const getChain = (req: any, res: any) => {
    var blockChain: BlockChain = require('../app');
    const chain = blockChain.getBlockChain();
    res.json(chain);

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

/**
 * 
 * @param req 
 * @param res 
 */
export const startBlockChain = async (req: any, res: any) => {
    var blockChain: BlockChain = require('../app');
    if (blockChain.getStatus() == Status.RUNNING){
        const msg: StatusDto = {
            status: Status.RUNNING,
            message: 'Blockchain already started'
        }
        res.json(msg);
    } else {
        await initialBroadCast(blockChain).then(()=>{
            const msg: StatusDto = {
                status: Status.RUNNING,
                message: 'Blockchain started',
            }
            res.json(msg);
        }).catch(err => {
            const msg: StatusDto = {
                status: blockChain.getStatus(),
                message: 'Problem starting blockchain',
            }
            res.json(msg);
        }); 
        
    }
    
}

/**
 * 
 * @param req 
 * @param res 
 */
export const getStatus = (req: any, res: any) => {
    var blockChain: BlockChain = require('../app');
    const status: StatusDto = {
        status: blockChain.getStatus(),
        message: '',
    }
    res.json(status);
}