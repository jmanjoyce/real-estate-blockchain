
import { AdressInfoResDto, Block, NewReplication, PeerNode, Status, StatusDto, TransactionData, TransactionWithTimeStamp, ValidPurchaseDto } from '../common';
import BlockChain from './blockChain';
import axios from 'axios';
import { generateRandomPrice } from './utils';
import { v4 as uuidv4 } from 'uuid';



/**
 * 
 * @param req 
 * @param res 
 */
export const mineNewBlock = (req: any, res: any) => {
    var blockChain: BlockChain = require('../app').blockChain;
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
        const localPendingTransactions: TransactionData[] = await self.getPendingTransaction();
        localPendingTransactions.forEach(transaction => {
            if (!idSet.has(transaction.id)){
                idSet.add(transaction.id);
                pendingTransaction.push(transaction);
            }
        })
    }
    const promises = peerNodes.map((node) => {
        console.log('node');
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
        axios.post(url, data).then(()=>{
            console.log('sent replicated');
        }).catch(err => {
            console.log(err);
        })
    })

}

/**
 * 
 * @param peers 
 * @param transactions 
 */
export const removePendingTransactionFromPeers = (peers: PeerNode[], transactions: TransactionData[]) => {
    peers.forEach(node => {
        
        const url = `http://${node.ipAddress}:${node.port}/block/removePending`;
        console.log('url',url);
        axios.post(url, transactions).then().catch(err => {
            console.error('problem sending data to peer', err.code);
        })
    })


}

/**
 * 
 * @param req 
 * @param res 
 */
export const removePending = async (req: any, res: any) => {
    var blockchain: BlockChain = require('../app').blockChain;
    const transactionToRemove: TransactionData[] = req.body;
    console.log('removing', transactionToRemove);
    const result: string = await blockchain.removePending(transactionToRemove);
    res.send(result);


}


/**
 * Function will take new transaction data and replicate it locally.
 * 
 * 
 * @param req 
 * @param res 
 */
export const replicateTransaction = (req: any, res: any) => {
    var blockChain: BlockChain = require('../app').blockChain;
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
 * Sends out all the current pending transaction we have
 * 
 */
export const getCurrentPendingTransaction = async (req: any, res: any) => {
    var blockChain: BlockChain = require('../app').blockChain;
    const pendingTransaction: TransactionData[] = await blockChain.getPendingTransaction();
    res.json(pendingTransaction);

}

/**
 * Recieves regular non-new broadcast and updates it's list of peers.
 * 
 * @param req 
 * @param res 
 */
export const recieveBroadCast = (req: any, res: any) => {
    var blockChain = require('../app').blockChain;
    
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
    var blockChain: BlockChain = require('../app').blockChain;
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
        console.log('sending', node);
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
    var blockChain: BlockChain = require('../app').blockChain;
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
export const recieveNewBroadCast =async  (req: any, res: any) => {
    var blockChain: BlockChain = require('../app').blockChain;
    
    const knownPeers: PeerNode[] = await blockChain.getPeers();
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
     
        const fetchedNewPeers = await axios.post(url, nodeInfo)
            .then(res => {
                if (res.status == 200) {
                    console.log('data', res.data);
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
                throw error; 
            });

        console.log('fetched peers', fetchedNewPeers);
        blockChain.setStatus(Status.RUNNING);
        if (fetchedNewPeers.length > 0) {
            fetchedNewPeers.forEach(peer => {
                const url2 = `http://${peer.ipAddress}:${peer.port}/block/broadcast`;
               

                blockChain.addPeer(peer);
                axios.post(url2, nodeInfo).catch(error => {
                    console.log(`Problem contacting server broadcast `, url2);
                });
            })
        }

    } catch (error) {
        console.error("Error occurred while fetching new peers: ");

    }

}

/**
 * 
 * @param req 
 * @param res 
 */
export const getChain = async (req: any, res: any) => {
    var blockChain: BlockChain = require('../app').blockChain;
    const chain = await blockChain.getBlockChain();
    res.json(chain);

}



/**
 * 
 * This is the main purchase method.
 * 
 * @param req 
 * @param res 
 */
export const purchase =async (req: any, res: any) => {
    var blockChain: BlockChain = require('../app').blockChain;
    const { name, address, price } = req.body;
    console.log(req.body);
    const uuid = uuidv4();
    const transaction: TransactionData = {
        previousOwner: undefined,
        id: uuid,
        newOwner: name,
        address: address,
        price: price,
        pending: true,
        date: new Date(),
    }
    const ress = await blockChain.addTransaction(transaction);
    res.send(ress);
}


/**
 * 
 * @param req 
 * @param res 
 */
export const addTransaction = async (req: any, res: any) => {
    var blockChain: BlockChain = require('../app').blockChain;
    const data: TransactionData = JSON.parse(JSON.stringify(req.body));
    const result = await blockChain.addTransaction(data);
    res.send(result);

}

/**
 * 
 * @param req 
 * @param res 
 */
export const startBlockChain = async (req: any, res: any) => {
    var blockChain: BlockChain = require('../app').blockChain;
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
    var blockChain: BlockChain = require('../app').blockChain;
    const status: StatusDto = {
        status: blockChain.getStatus(),
        message: '',
    }
    res.json(status);
}

/**
 * Debugging middleware, prints all database information
 * to the console
 * 
 * @param req 
 * @param res 
 */
export const dump = async (req: any, res: any) => {
    var blockChain: BlockChain = require('../app').blockChain;
    const blocks: Block[] = await  blockChain.getBlockChain();
    const pendingTransaction: TransactionData[] = await blockChain.getPendingTransaction();
    const peers: PeerNode[] = await blockChain.getPeers();
    console.log('peers',peers);
    console.log('transactions', pendingTransaction);
    console.log('blocks', blocks); 
    res.send('succesfully');
    

}

/**
 * 
 * @param req 
 * @param res 
 */
export const getAllPending = async (req: any, res: any) => {
    var blockChain: BlockChain = require('../app').blockChain;
    const peers: PeerNode[] =  await blockChain.getPeers();
    const pendingTransaction: TransactionData[] = await getPendingTransactions(peers, blockChain);
    res.json(pendingTransaction);

}

/**
 * 
 * @param req 
 * @param res 
 */
export const getAdressInfo = async (req: any, res: any) => {
    var blockChain: BlockChain = require('../app').blockChain;
    const address: string = req.body.address;
    const info: TransactionWithTimeStamp | null = await blockChain.lookUpAdress(address);
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
    var blockChain: BlockChain = require('../app').blockChain;
    const address: string = req.body.address;
    await blockChain.updateTransactionDataFromPeers();
    const result: boolean = ! (await blockChain.containsTransactionAddress(address));
    const valid : ValidPurchaseDto = {
        valid: result,
    }
    res.json(valid);

}

/**
 * Service deletes blockchain completely
 * 
 * @param req 
 * @param res 
 */
export const resetForTest = (req: any, res: any) => {
    var blockChain: BlockChain = require('../app').blockChain;
    blockChain.deleteBlock();
    res.send('success')


}

/**
 * 
 * @param req 
 * @param res 
 */
export const changeReplication = (req: any, res: any) => {
    var blockChain: BlockChain = require('../app').blockChain;
    const newRep: NewReplication = req.body;
    console.log(newRep.newReplication);
    blockChain.setNumRep(newRep.newReplication);
    res.send('success');


}
