import { Block, PeerNode, TransactionData, TransactionWithTimeStamp } from '../common';
import { createHash, randomBytes } from 'crypto';
import { pickRandomElements } from './utils';
import { replicateTransaction, replicateNewTransaction, initialBroadCast, getPeerChains, succesfulMine, synchronizeChains, getPendingTransactions, removePendingTransactionFromPeers } from './blockChainService';
import mongoose from 'mongoose';
import { Status } from '../common';
const os = require('os');

class BlockChain {

    node: PeerNode;
    rootNode: PeerNode | undefined;
    status: Status;
    replicationNum: number;
    private readonly BlockModel: mongoose.Model<Block>;
    private readonly TransactionModel: mongoose.Model<TransactionData>;
    private readonly PeerNodeModel: mongoose.Model<PeerNode>

    constructor(peers: PeerNode[]) {

        const connectionUrl = `mongodb://${process.env.BLOCK_DB}`;
        const conn: mongoose.Connection = mongoose.createConnection(connectionUrl, {});
        

        const peerNodeSchema = new mongoose.Schema<PeerNode>({
            ipAddress: { type: String, required: true },
            port: { type: String, required: true }
        })

        const transactionSchema = new mongoose.Schema<TransactionData>({
            id: { type: String, required: true },
            previousOwner: { type: String, required: false },
            newOwner: { type: String, required: true },
            address: { type: String, required: true },
            price: { type: Number, required: true },
            pending: { type: Boolean, required: true },
            date: { type: Date, required: true }
        })

        const blockSchema = new mongoose.Schema<Block>({
            index: { type: Number, required: true },
            timeStamp: { type: Date, required: true },
            information: [{ type: mongoose.Schema.Types.ObjectId, ref: 'TransactionData' }],
            previousHash: { type: String, required: true },
            nonce: { type: String, required: true },
        });


        this.PeerNodeModel = conn.model<PeerNode>('PeerNode', peerNodeSchema);
        this.BlockModel = conn.model<Block>('Block', blockSchema);
        this.TransactionModel = conn.model<TransactionData>('TransactionData', transactionSchema);

        conn.on('error', console.error.bind(console, 'Block MongoDB connection error:'));
        conn.once('open', () => {
            console.log('Connected to MongoDB Block');
            
            this.PeerNodeModel.deleteMany({}).then(()=>{
                console.log('Collection cleared');
            }).catch(()=>{
                console.error('Error clearing collection:');
            })

                
            
        });

        this.replicationNum = parseInt(process.env.NUM_REPLICAS ?? '1');

        this.node = {
            ipAddress: process.env.IP ?? 'localhost',
            port: process.env.PORT ?? '3000',
        }

        if (process.env.ROOT_IP !== undefined &&
            process.env.ROOT_PORT !== undefined) {
           
            this.rootNode = {
                ipAddress: process.env.ROOT_IP,
                port: process.env.ROOT_PORT,
            }
            this.status = Status.READY;
        } else {
            this.status = Status.RUNNING;
        }
    }


    getStatus(): Status {
        return this.status;
    }

    async getPeerNode(): Promise<PeerNode[]> {
        const peersRes = await this.PeerNodeModel.find({});
        return peersRes.map(peer => {
            return peer.toObject();
        });
    }

    async lookUpAdress(address: string): Promise<TransactionWithTimeStamp | null> {
        const res: TransactionWithTimeStamp[] = [];


        try {
            // Find the most recent block that contains transactions with the given address
            const block = await this.BlockModel.findOne({ information: { $elemMatch: { address } } })
                .sort({ timeStamp: -1 });

            if (block) {
                const transactionsInBlock = await this.TransactionModel.find({
                    _id: { $in: block.information },
                    address // Filter transactions by address
                }).sort({ _id: -1 }).limit(1); // Sort transactions by ID in descending order and limit to 1

                if (transactionsInBlock.length > 0) {
                    const mostRecentTransaction: TransactionData = transactionsInBlock[0].toObject(); // Get the most recent transaction

                    const blockTimeStamp: Date = block.timeStamp;
                    const transactionWithTimeStamp: TransactionWithTimeStamp = {
                        transaction: mostRecentTransaction,
                        timeStamp: blockTimeStamp,
                    }
                    return transactionWithTimeStamp;

                } else {
                    return null;

                }
            } else {
                return null;
            }


        } catch (error) {
            console.error('Error finding transactions:', error);
            throw error;

        }
    }

    setStatus(status: Status) {
        this.status = status;
    }

    removePending(transactions: TransactionData[]): Promise<string>{
        return new Promise<string>(async (resolve,reject)=> {
            try {
                
                const promises = transactions.map(transaction => {
                    // Removes pending transactions
                    const query= {
                        id: transaction.id,
                        pending: true,
                        
                    }
                    return this.TransactionModel.deleteMany(query);
                })
                await Promise.all(promises);
                resolve('Success')
            } catch (err) {
                reject();

            }


        })
        
        
    }




    async addTransaction(data: TransactionData): Promise<string> {
        
        try {
            const existing = await this.TransactionModel.find({
                address: data.address,
                pending: true,
            })
            if (existing.length > 0) {
                return "Address already processing";
            }
            console.log('saving address');
            // Pre processing to prevent address here
            const pendingTransactionDoc = new this.TransactionModel({
                id: data.id,
                previousOwner: data.previousOwner,
                newOwner: data.newOwner,
                address: data.address,
                price: data.price,
                pending: true,
                date: data.date,
            })
            await pendingTransactionDoc.save();
            const peersDoc = await this.PeerNodeModel.find({});
            const peerNodes: PeerNode[] = peersDoc;
            if (peerNodes.length > 0) {
                
                const maxReplication = this.replicationNum; // This could be enviorment variable

                const numReplication = Math.min(peerNodes.length, maxReplication);
                console.log('numrep',numReplication);
                const peerForReplication: PeerNode[] | undefined = pickRandomElements(peerNodes, numReplication);
                if (peerForReplication) {
                    replicateNewTransaction([data], peerForReplication);
                }
            }
            return "success";
        } catch (err) {
            console.error(err);
            return "Error saving transaction"

        }

    }

    addPeer(newPeer: PeerNode) {
        
        const peerDoc = new this.PeerNodeModel({
            ipAddress: newPeer.ipAddress,
            port: newPeer.port
        })
        peerDoc.save();

    }

    async getPeers(): Promise<PeerNode[]> {
        const peers = await this.PeerNodeModel.find({});
        return peers.map(peer => peer.toObject())
    }

    async getPendingTransaction(): Promise<TransactionData[]> {
        const pendingRes: TransactionData[] = await this.TransactionModel.find({
            pending: true,
        })
        
        return pendingRes;
    }

    async updatePendingTransactions(processedTransactions: TransactionData[]) {
        const promises = processedTransactions.map(async transaction => {
            try {
                // query by id
                const query = {
                    id: transaction.id,

                };

                await this.TransactionModel.findOneAndUpdate(
                    query,
                    transaction,
                    { upsert: true } // Upsert: insert if not present
                );
            } catch (error) {
                console.error('Error adding transaction:', error);
            }
        });
        try {
            await Promise.all(promises);
        } catch (error) {
            console.error('Error processing transactions:', error);
        }



    }

    setNumRep(numRep: number){
        this.replicationNum = numRep;
    }

    validateBlock(blockChain: Block[]): boolean {

        var lastBlock = blockChain[0];
        let i = 1;
        while (i < blockChain.length) {
            var currBlock = blockChain[i];
            // Checl valid proof and valid nonce
            const lastHash = BlockChain.hash(lastBlock);
            if (currBlock.previousHash != lastHash) {
                return false;
            }
            
            if (!this.validProof(lastBlock, lastBlock.nonce!)) {
                return false;
            }

        }
        return true;




    }

    async getBlockChain(): Promise<Block[]> {
        const blockChain = await this.BlockModel.find({}).sort({ index: 1 });
        return blockChain.map(chain => chain.toObject());

    }

    /**
     * Resolve conflicts is run to synchronize blockchain
     * 
     * @returns 
     */
    async resolveConflicts(): Promise<void> {

        return new Promise<void>(async (resolve, reject) => {
            try {
                const peers: PeerNode[] = await this.PeerNodeModel.find({});
                const peerChains: Block[][] = await getPeerChains(peers);

                console.log("retrieved chains", peerChains);
                let max = await this.BlockModel.countDocuments({});
                console.log("max", max);
                let maxI = -1;
                peerChains.forEach((chain: Block[], i) => {
                    if (chain.length > max && this.validateBlock(chain)) {
                        maxI = i;
                        max = chain.length;
                    }
                });
                const newChain: Block[] = peerChains[maxI];

                if (newChain) {
                    console.log("new chain");

                    const promises = newChain.map((block: Block) => {
                        const query = {
                            index: block.index
                        }
                        return this.BlockModel.findOneAndUpdate(
                            query,
                            block,
                            { upsert: true } // Upsert: insert if not present
                        );
                    })
                    await Promise.all(promises);
                }

                resolve(); 
            } catch (error) {
                reject(error); // Reject the promise if there's an error
            }
        });
    }

    async updateTransactionDataFromPeers(): Promise<void> {
        return new Promise<void>(async (resolve, reject) => {
            try {
                const peers: PeerNode[] = await this.PeerNodeModel.find({});
                const newTransactionData: TransactionData[] = await getPendingTransactions(peers);
                this.updatePendingTransactions(newTransactionData);
                resolve();
            } catch (err) {
                reject(err);
            }
        })

    }

    async containsTransactionAddress(address: string): Promise<boolean> {

        const query = {
            address: address,
            pending: true,
        }
        const res = await this.TransactionModel.find(query);
        return res.length > 0;


    }

    async checkAndRemoveDuplicateAddress(): Promise<void> {
        
        // Aggregation pipeline to find and delete duplicates with later timestamps
        return new Promise<void>(async (resolve,reject)=>{
            this.TransactionModel.aggregate([
                {
                    $match: {
                      pending: { $ne: false }
                    }
                  },
                  {
                    $group: {
                      _id: '$address',
                      latestTimestamp: { $max: '$timestamp' }, // Get the latest timestamp for each address
                      docs: { $push: '$$ROOT' }
                    }
                  },
                  {
                    $project: {
                      latestDocument: {
                        $filter: {
                          input: '$docs',
                          as: 'doc',
                          cond: { $eq: ['$$doc.timestamp', '$latestTimestamp'] } // Keep documents with the latest timestamp
                        }
                      }
                    }
                  },
                  {
                    $unwind: '$latestDocument'
                  }
            ])
                .then(async results => {
                    const idsToDelete = results.map(item => item.documents._id);
                    try {
                        const dupQuery = { _id: { $in: idsToDelete } };
                        const transactions: TransactionData[] = await this.TransactionModel.find(dupQuery);
                        console.log('tran',transactions);

                        await this.TransactionModel.deleteMany(dupQuery);
                        const peers:PeerNode[] = await this.PeerNodeModel.find({});
                        removePendingTransactionFromPeers(peers, transactions);
                        resolve();


                    } catch (err){
                        console.error('problem doing getting items to delete',err );
                        reject();

                    }
                    
                })
                .catch(err => {
                    console.error('Error processing aggregation:', err);
                    reject();
                });
        })
        
    }

    async newBlock() {
    
        console.log('STARTED MINING NEW BLOCK');

        
       
        
        await this.updateTransactionDataFromPeers();
        await this.resolveConflicts();

        


        const getPrevBlock = async (): Promise<Block | undefined> => {
            const size = await this.BlockModel.countDocuments();
            if (size > 0) {
                const blockWithMaxIndex = await this.BlockModel.findOne().sort({ index: -1 });
                return blockWithMaxIndex?.toObject();
            }
            return undefined;

        }
        const prevBlock: Block | undefined = await getPrevBlock();
        const newIndex: number = prevBlock ? prevBlock.index + 1 : 0;
        const newNonce: string = prevBlock ? this.mine(prevBlock) : BlockChain.nonce();
        const previousHash: string = prevBlock ? BlockChain.hash(prevBlock) : "0000";


        const transac1 = await this.TransactionModel.find({});
        console.log('all2', transac1);

        await this.checkAndRemoveDuplicateAddress();

        const transac = await this.TransactionModel.find({});
        console.log('all', transac);


        const pendingTransactionsDoc = await this.TransactionModel.find({ pending: true });
        const pendingTransactions: TransactionData[] = pendingTransactionsDoc;
        console.log('p', pendingTransactionsDoc);


        const newBlock = new this.BlockModel({
            index: newIndex,
            timeStamp: new Date(),
            information: pendingTransactionsDoc.map(transaction => transaction._id),
            previousHash: previousHash,
            nonce: newNonce
        });

       
        // Update Transaction Status to Non-Pending
        try {
            // Update the status of pending transactions to non-pending
            const b4 = await this.TransactionModel.find({});
            console.log('b4', b4);
            await this.TransactionModel.updateMany({ _id: { $in: pendingTransactionsDoc.map(t => t._id) } }, { pending: false });
            const a3 = await this.TransactionModel.find({});
            console.log('ba', a3);

            await newBlock.save();

            
        } catch (error) {
            console.error('Error:', error);
        }

        if (prevBlock == undefined) {
            console.log('initial block mined');
        }

        // Reset our current pending transactions 
        // calls update pending transactions to prevent concurrency issues


        // Alert peers the pending transactions have been done.
        const peers: PeerNode[] = await this.PeerNodeModel.find({});
        succesfulMine(peers, pendingTransactions);

        // Ask one peer to sychronize with us for replication purposes
        const maxReplication = this.replicationNum; 

        const numSynchronization = Math.min(peers.length, maxReplication);
        const peersForSynchronization: PeerNode[] | undefined = pickRandomElements(peers, numSynchronization);
        if (peersForSynchronization) {
            // We ask chains to synchronize for replication note we do not give them the blockchain
            // They synchronize themselves
            synchronizeChains(peersForSynchronization);
        }

    }

    async replicateTransaction(data: TransactionData[]): Promise<void> {

        return new Promise<void>(async (resolve, reject) => {
            try {
                const promises = data.map((transaction: TransactionData) => {
                    const query = {
                        id: transaction.id,
                        pending: true,
                    }
                    return this.TransactionModel.findOneAndUpdate(
                        query,
                        transaction,
                        { upsert: true } // Upsert: insert if not present
                    );
                })
                await Promise.all(promises);
                resolve();
            } catch (err) {
                console.error(err);
                reject();

            }

        })

    }

    static hash(block: Block, nonce?: string) {
        const blockString: string = JSON.stringify(block, Object.keys(block).sort());
        return createHash("sha256").update(blockString + (nonce ?? '')).digest("hex");
    }

    static nonce(): string {
        return createHash("sha256").update(randomBytes(32)).digest("hex");
    }

    mine(lastBlock: Block): string {
        while (true) {
            const newNonce = BlockChain.nonce();
            if (this.validProof(lastBlock, newNonce)) {
                console.log('Mining Complete', newNonce);
                return newNonce;
            }

        }
    }

    validProof(lastBlock: Block, nonce: string, difficulty: number = 4): boolean {
        return BlockChain.hash(lastBlock, nonce).slice(0, difficulty) === "0".repeat(difficulty)
    }

    /**
     * removes all transactions and blocks from blockchain
     */
    deleteBlock(){
        this.BlockModel.deleteMany({}).then(()=>{
            console.log('deleted blockmodel documents');
        })
        this.TransactionModel.deleteMany({}).then(()=> {
            console.log('deleted transaction model docuemnts');
        })

    }

}

export default BlockChain;