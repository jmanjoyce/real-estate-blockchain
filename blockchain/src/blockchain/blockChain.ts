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
            console.log('Connected to MongoDB');
            
            this.TransactionModel.deleteMany({}).then(()=>{
                console.log('Collection cleared');
            }).catch(()=>{
                console.error('Error clearing collection:');
            })

                
            
        });

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
        console.log('adding transaction');
        // this.pendingTransactionData.push(data);
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
                // Could use some 
                const maxReplication = 1; // This could be enviorment variable

                const numReplication = Math.min(peerNodes.length, maxReplication);
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
        // this.peers.push(newPeer);
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
        const pendingTran = await this.TransactionModel.find({});
        console.log("all pending info", pendingTran);
        const pendingRes: TransactionData[] = await this.TransactionModel.find({
            pending: true,
        })
        console.log("mathced",pendingRes);
        return pendingRes;
    }

    async updatePendingTransactions(processedTransactions: TransactionData[]) {
        const promises = processedTransactions.map(async transaction => {
            try {
                // Update the conditions based on how you identify a transaction (using multiple fields)
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
            console.log('All transactions processed!');
        } catch (error) {
            console.error('Error processing transactions:', error);
        }



    }

    validateBlock(blockChain: Block[]): boolean {

        var lastBlock = blockChain[0];
        let i = 1;
        while (i < blockChain.length) {
            var currBlock = blockChain[i];
            const lastHash = BlockChain.hash(lastBlock);
            if (currBlock.previousHash != lastHash) {
                return false;
            }
            // Would also need to check valid nonce;
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

    async resolveConflicts(): Promise<void> {

        return new Promise<void>(async (resolve, reject) => {
            try {
                const peers: PeerNode[] = await this.PeerNodeModel.find({});
                const peerChains: Block[][] = await getPeerChains(peers);

                //console.log('peer chains', peerChains);
                let max = await this.BlockModel.countDocuments({});

                let maxI = -1;
                peerChains.forEach((chain: Block[], i) => {
                    if (chain.length > max && this.validateBlock(chain)) {
                        maxI = i;
                        max = chain.length;
                    }
                });
                const newChain: Block[] = peerChains[maxI];

                if (newChain) {

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

                resolve(); // Resolve the promise if everything succeeded
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
                        count: { $sum: 1 },
                        earliestTimestamp: { $min: '$timestamp' },
                        docs: { $push: '$$ROOT' }
                    }
                },
                {
                    $project: {
                        documents: {
                            $filter: {
                                input: '$docs',
                                as: 'doc',
                                cond: { $ne: ['$$doc.timestamp', '$earliestTimestamp'] }
                            }
                        }
                    }
                },
                {
                    $unwind: '$documents'
                }
            ])
                .then(async results => {
                    const idsToDelete = results.map(item => item.documents._id);
                    try {
                        const dupQuery = { _id: { $in: idsToDelete } };
                        const transactions: TransactionData[] = await this.TransactionModel.find(dupQuery);
                        await this.TransactionModel.deleteMany(dupQuery);
                        const peers:PeerNode[] = await this.PeerNodeModel.find({});
                        console.log('transactions to be removed', transactions);
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
        // Get transaction data from neighbors; (maybe) so we don't have to synchronize block
        console.log('starting mining');
        console.log('getting new transactions from peers');

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

        await this.checkAndRemoveDuplicateAddress();


        const pendingTransactionsDoc = await this.TransactionModel.find({ pending: true });
        const pendingTransactions: TransactionData[] = pendingTransactionsDoc;


        const newBlock = new this.BlockModel({
            index: newIndex,
            timeStamp: new Date(),
            information: pendingTransactionsDoc.map(transaction => transaction._id),
            previousHash: previousHash,
            nonce: newNonce
        });

        // Step 3: Update Transaction Status to Non-Pending
        try {
            // Update the status of pending transactions to non-pending
            await this.TransactionModel.updateMany({ _id: { $in: pendingTransactionsDoc.map(t => t._id) } }, { pending: false });

            await newBlock.save();

            console.log('New block created and pending transactions updated.');
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
        const numSynchronization = 1;
        const peersForSynchronization: PeerNode[] | undefined = pickRandomElements(peers, numSynchronization);
        if (peersForSynchronization) {
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

}

export default BlockChain;