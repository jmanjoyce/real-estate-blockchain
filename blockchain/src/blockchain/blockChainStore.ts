
import { AdressInfoResDto, Block, PeerNode, StatusDto, TransactionData, ValidPurchaseDto } from '../common';
import BlockChain, { TransactionWithTimeStamp } from './blockChain';
import axios from 'axios';
import { Status } from './blockChain';
import { generateRandomPrice } from './utils';
import { v4 as uuidv4 } from 'uuid';


/**
 * 
 * TODO for part 3
 * In depth testing of mining and replication functionality. This includes synchronization
 * Optional Implementation of stopping machine.
 * 
 * Need to validate pending purchase, can't have same adress already being purchased
 * 
 * Part 3 
 * Need feedback for purchases and validation, need to consider pending purchases.
 * 
 * Part 4, 
 * Make this project a stateless applicatation using mongo
 * 
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
export const getPendingTransactions = async (peerNodes: PeerNode[], self: BlockChain | undefined = undefined): Promise<TransactionData[]> => {
    const idSet: Set<string> = new Set();
    const pendingTransaction: TransactionData[] = [];

    // If we want to add transactions of included peer
    if (self){
        const localPendingTransactions: TransactionData[] = self.getPendingTransaction();
        localPendingTransactions.forEach(transaction => {
            if (!idSet.has(transaction.id)){
                idSet.add(transaction.id);
                pendingTransaction.push(transaction);
            }
        })
    }
    const promises = peerNodes.map((node) => {
        const url = `http://${node.ipAddress}:${node.port}/block/pendingTransactions`;
        return axios.get(url)
            .then(res => {
                if (res.status == 200) {
                    //console.log(res.data);
                    const transactions: TransactionData[] = res.data.map((item: any) => ({
                        id: item.id,
                        previousOwner: item?.previousOwner,
                        price: item.price,
                        address: item.address,
                        newOwner: item.newOwner,
                    }));
                    transactions.forEach((transaction: TransactionData) => {
                        console.log('transaction', transaction.id);
                        if (!idSet.has(transaction.id)){
                            idSet.add(transaction.id);
                            pendingTransaction.push(transaction);
                        }
                    })
                } else {
                    console.log("Problem collection data from ", url);
                }
            }).catch(error => {
                console.error("Error getting pending transaction from peer nodes: ", error);
            })
    });
    
    await Promise.all(promises);
    return pendingTransaction;
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

        const url = `http://${node.ipAddress}:${node.port}/block/replicateTransaction`;
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
            address: transaction.address,
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
    var blockChain: BlockChain = require('../app');
    const pendingTransaction: TransactionData[] = blockChain.getPendingTransaction();
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
        ipAddress: body.ipAddress,
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
        const url = `http://${node.ipAddress}:${node.port}/block/synchronize`;
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
        const url = `http://${node.ipAddress}:${node.port}/block/confirmMining`;
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
        const url = `http://${node.ipAddress}:${node.port}/block/currentBlock`;
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
                                address: data.address,
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
            address: transaction.address,

        }
    })
    blockChain.updatePendingTransactions(transactionData);

}

/**
 * Each new server will recieve the IP address of a root server so
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
        ipAddress: body.ipAddress,
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
    blockChain.addPeer(rootPeer);
    try {

        const url = `http://${rootPeer.ipAddress}:${rootPeer.port}/block/newBroadcast`;
        //console.log(blockChain);
        // Temp for debugging
        //console.log('initial broadcast url', url);
        const fetchedNewPeers = await axios.post(url, nodeInfo)
            .then(res => {
                if (res.status == 200) {
                    const newPeers: PeerNode[] = res.data.map((item: any) => ({
                        port: item.port,
                        ipAddress: item.ipAddress,
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
                const url2 = `http://${peer.ipAddress}:${peer.port}/block/broadcast`;
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
    const { name, address, price } = req.body;
    console.log(req.body);
    const uuid = uuidv4();
    const transaction: TransactionData = {
        previousOwner: undefined,
        id: uuid,
        newOwner: name,
        address: address,
        price: price,
    }
    blockChain.addTransaction(transaction);
    res.send('Recieved Purchase');
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

/**
 * Debugging method
 * 
 * @param req 
 * @param res 
 */
export const dump = (req: any, res: any) => {
    var blockChain: BlockChain = require('../app');
    const blocks: Block[] = blockChain.getBlockChain();
    const pendingTransaction: TransactionData[] = blockChain.getPendingTransaction();
    const peers: PeerNode[] = blockChain.getPeers();
    console.log('peers',peers);
    console.log('transactions', pendingTransaction);
    console.log('blocks', blocks); 
    

}

/**
 * 
 * @param req 
 * @param res 
 */
export const getAllPending = async (req: any, res: any) => {
    var blockChain: BlockChain = require('../app');
    const peers: PeerNode[] = blockChain.getPeers();
    const pendingTransaction: TransactionData[] = await getPendingTransactions(peers, blockChain);
    res.json(pendingTransaction);

}

/**
 * 
 * @param req 
 * @param res 
 */
export const getAdressInfo = (req: any, res: any) => {
    var blockChain: BlockChain = require('../app');
    const address: string = req.body.address;
    const info: TransactionWithTimeStamp | null = blockChain.lookUpAdress(address);
    const response: AdressInfoResDto = {
        address: address,
        price: info? Math.floor(info.transaction.price * 1.2) : generateRandomPrice(),
        owned: info? true: false,
        previousOwner: info? info.transaction.newOwner: undefined,
    }
    
    res.json(response);

}

/**
 * 
 * @param req 
 * @param res 
 */
export const validatePurchase = async (req: any, res: any) => {
    var blockChain: BlockChain = require('../app');
    const address: string = req.body.address;
    await blockChain.updateTransactionDataFromPeers();
    const result: boolean = !blockChain.containsTransactionAddress(address);
    const valid : ValidPurchaseDto = {
        valid: result,
    }
    res.json(valid);
    
    
}
