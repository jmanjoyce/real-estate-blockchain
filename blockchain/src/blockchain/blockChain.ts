import { Block, PeerNode, TransactionData, TransactionWithTimeStamp } from '../common';
import { createHash, randomBytes } from 'crypto';
import { pickRandomElements } from './utils';
import { replicateTransaction, replicateNewTransaction, initialBroadCast, getPeerChains, succesfulMine, synchronizeChains, getPendingTransactions } from './blockChainService';
import mongoose from 'mongoose';
import { Status } from '../common';
const os = require('os');



// const transactionSchema = new mongoose.Schema<TransactionData>({
//     id: { type: String, required: true },
//     previousOwner: { type: String, required: false },
//     newOwner: { type: String, required: true },
//     address: { type: String, required: true},
//     price: { type: Number, required: true},
// })

//const TransactionModel: mongoose.Model<TransactionData> = mongoose.model<TransactionData>('TransactionData', transactionSchema);

// const blockSchema = new mongoose.Schema<Block>({
//     index: {type: Number, required: true},
//     timeStamp: {type: Date, required: true},
//     information: [{ type: mongoose.Schema.Types.ObjectId, ref: 'TransactionData' }],
//     previousHash:{type: String, required: true},
//     nonce: {type : String, required: true},
// });

//const BlockModel: mongoose.Model<Block> = mongoose.model<Block>('Block', blockSchema);



class BlockChain {

    blockChain: Block[];
    pendingTransactionData: TransactionData[];
    peers: PeerNode[];
    node: PeerNode;
    rootNode: PeerNode | undefined;
    status: Status;
    private readonly BlockModel: mongoose.Model<Block>;
    private readonly TransactionModel: mongoose.Model<TransactionData>;
    private readonly PeerNodeModel: mongoose.Model<PeerNode>

    constructor(peers: PeerNode[]) {

        const connectionUrl = `mongodb://${process.env.BLOCK_DB}/app`;
        const conn: mongoose.Connection = mongoose.createConnection(connectionUrl, {  });
        conn.on('error', console.error.bind(console, 'MongoDB connection error:'));
        conn.once('open', () => {
            console.log('Connected to MongoDB');
        });

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
            pending: { type: Boolean, required: true }
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

        this.blockChain = [];
        this.pendingTransactionData = [];
        this.peers = peers ?? [];
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

        // TODO this can be definitely be written more concisely, it's hacky.
        // Method is returning with the first match it finds. needs to be written better
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
            return null;
        }

        // this.blockChain.reverse().some((block: Block) => {
        //     const timeStamp = block.timeStamp;
        //     block.information.some(transaction => {
        //         console.log('transaction addr', transaction.address);
        //         if (transaction.address == address){
        //             const match: TransactionWithTimeStamp = { 
        //                 timeStamp: timeStamp,
        //                 transaction: transaction
        //            }
        //            res.push(match);
        //            return true;
        //         }
        //         return false;
        //     })
        //     if (res.length > 0 ){
        //         return true;
        //     }
        //     return false;
        // });
        // return res.length > 0? res[0]: null;
    }

    setStatus(status: Status) {
        this.status = status;
    }

    // initialBroadCast() {
    //     if (process.env.ROOT_IP !== undefined &&
    //         process.env.ROOT_PORT !== undefined) {
    //         initialBroadCast(this.node, this.rootNode!);
    //     }


    // }

    async addTransaction(data: TransactionData) {
        console.log('adding transaction');
        this.pendingTransactionData.push(data);
        const pendingTransactionDoc = new this.TransactionModel({
            id: data.id,
            previousOwner: data.previousOwner,
            newOwner: data.newOwner,
            address: data.address,
            price: data.price,
            pending: true,
        })
        pendingTransactionDoc.save();
        const peersDoc = await this.PeerNodeModel.find({});
        const peerNodes = peersDoc.map(peer => peer.toObject());
        if (peerNodes.length > 0) {
            // Could use some 
            const maxReplication = 1; // This could be enviorment variable

            const numReplication = Math.min(peerNodes.length, maxReplication);
            const peerForReplication: PeerNode[] | undefined = pickRandomElements(peerNodes, numReplication);
            if (peerForReplication) {
                replicateNewTransaction([data], peerForReplication);
            }
        }

    }

    addPeer(newPeer: PeerNode) {
        this.peers.push(newPeer);
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
        const pendingRes = await this.TransactionModel.find({
            pending: true,
        })
        return pendingRes.map(tran => tran.toObject());
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
                const peerChains: Block[][] = await getPeerChains(this.peers);

                //console.log('peer chains', peerChains);
                let max = await this.BlockModel.countDocuments({});
                //let newChain: Block[] | undefined = undefined;
                //let i
                let maxI = -1;
                peerChains.forEach((chain: Block[], i) => {
                    if (chain.length > max && this.validateBlock(chain)) {
                        maxI = i;
                        max = chain.length;
                    }
                });
                const newChain: Block[] = peerChains[maxI];

                if (newChain) {
                    //this.blockChain = newChain;
                    // newChain.forEach((block: Block) => {
                    //     //const i: number = chain.index;
                    //     const query = {
                    //         index: block.index
                    //     }
                    //     this.BlockModel.findOneAndUpdate({
                    //         query,
                    //         block,
                    //         { upsert: true}
                    //     })

                    // })
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
                const newTransactionData: TransactionData[] = await getPendingTransactions(this.peers);
                this.updatePendingTransactions(newTransactionData);
                resolve();
            } catch (err) {
                reject(err);
            }
        })

    }

    async containsTransactionAddress(address: string): Promise<boolean> {
        // const transactionAddressSet: Set<string> = new Set(this.pendingTransactionData.map(transaction => {
        //     return transaction.address;
        // }));
        // return transactionAddressSet.has(address);
        const query = {
            address: address,
            pending: true,
        }
        const res = await this.TransactionModel.find(query);
        return res.length > 0;


    }

    async newBlock() {
        // Get transaction data from neighbors; (maybe) so we don't have to synchronize block
        console.log('starting mining');
        console.log('getting new transactions from peers');
        // const newTransactionData: TransactionData[] = await getPendingTransactions(this.peers);
        // this.updatePendingTransactions(newTransactionData);
        await this.updateTransactionDataFromPeers();
        await this.resolveConflicts();


        const prevBlockG = async (): Promise<Block | undefined> => {
            const size = await this.BlockModel.countDocuments();
            if (size > 0) {
                const blockWithMaxIndex = await this.BlockModel.findOne().sort({ index: -1 });
                return blockWithMaxIndex?.toObject();
            }
            return undefined;

        }
        const prevBlock: Block | undefined = await prevBlockG();
        const newIndex: number = prevBlock ? prevBlock.index + 1 : 0;
        const newNonce: string = prevBlock ? this.mine(prevBlock) : BlockChain.nonce();
        const previousHash: string = prevBlock ? BlockChain.hash(prevBlock) : "0000";


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
        //this.updatePendingTransactions(newBlock.information);
        //this.blockChain.push(newBlock);

        // Alert peers the pending transactions have been done.
        const peers: PeerNode[] = await this.PeerNodeModel.find({});
        succesfulMine(peers, pendingTransactions);

        // Ask one peer to sychronize with us for replication purposes
        const numSynchronization = 1;
        const peersForSynchronization: PeerNode[] | undefined = pickRandomElements(this.peers, numSynchronization);
        if (peersForSynchronization) {
            synchronizeChains(peersForSynchronization);
        }

    }

    async replicateTransaction(data: TransactionData[]): Promise<void> {
        
        return new Promise<void>(async (resolve, reject)=> {
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