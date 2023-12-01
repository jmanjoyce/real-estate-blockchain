import { Block, PeerNode, TransactionData } from '../common';
import { createHash, randomBytes } from 'crypto';
import { pickRandomElements } from './utils';
import { replicateTransaction, replicateNewTransaction, initialBroadCast, getPeerChains, succesfulMine, synchronizeChains, getPendingTransactions } from './blockChainStore';
const os = require('os');


export enum Status {
    READY,
    RUNNING,
    OFFLINE,
}

export interface TransactionWithTimeStamp{
    transaction: TransactionData,
    timeStamp: Date,
}


class BlockChain {

    blockChain: Block[];
    pendingTransactionData: TransactionData[];
    peers: PeerNode[];
    node: PeerNode;
    rootNode: PeerNode | undefined;
    status: Status;

    constructor(peers: PeerNode[]) {
        this.blockChain = [];
        this.pendingTransactionData = [];
        this.peers = peers ?? [];
        this.node = {
            // ipAddress: os.networkInterfaces()['eth0'][0].address,
            ipAddress: process.env.IP ?? 'localhost',
            port: process.env.PORT ?? '3000',
        }
        
        if (process.env.ROOT_IP !== undefined &&
            process.env.ROOT_PORT !== undefined) {
            // Root variable set means is root
            this.rootNode = {
                ipAddress: process.env.ROOT_IP,
                port: process.env.ROOT_PORT,
            }
            this.status = Status.READY;
        } else {
            this.status = Status.RUNNING;
        }
    }

    getStatus(): Status{
        return this.status;

    }

    lookUpAdress(address: string): TransactionWithTimeStamp | null {
        const res: TransactionWithTimeStamp[] = [];

        // TODO this can be definitely be written more concisely, it's hacky.
        // Method is returning with the first match it finds. needs to be written better
        this.blockChain.reverse().some((block: Block) => {
            const timeStamp = block.timeStamp;
            block.information.some(transaction => {
                console.log('transaction addr', transaction.address);
                if (transaction.address == address){
                    const match: TransactionWithTimeStamp = { 
                        timeStamp: timeStamp,
                        transaction: transaction
                   }
                   res.push(match);
                   return true;
                }
                return false;
            })
            if (res.length > 0 ){
                return true;
            }
            return false;
        });
        return res.length > 0? res[0]: null;
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

    

    addTransaction(data: TransactionData) {
        console.log('adding transaction');
        this.pendingTransactionData.push(data);
        if (this.peers.length > 0) {
            // Could use some 
            const maxReplication = 1; // This could be enviorment variable
            const numReplication = Math.min(this.peers.length, maxReplication);
            const peerForReplication: PeerNode[] | undefined = pickRandomElements(this.peers, numReplication);
            if (peerForReplication) {
                replicateNewTransaction([data], peerForReplication);
            }
        }

    }

    addPeer(newPeer: PeerNode) {
        this.peers.push(newPeer);

    }

    getPeers(): PeerNode[] {
        return this.peers;
    }

    getPendingTransaction(): TransactionData[] {
        return this.pendingTransactionData;
    }

    updatePendingTransactions(processedTransactions: TransactionData[]) {
        const processedSet: Set<TransactionData> = new Set(processedTransactions);
        this.pendingTransactionData = this.pendingTransactionData
            .filter(entry => {
                !processedSet.has(entry)
            });

    }

    validateBlock(blockChain: Block[]): boolean{

        var lastBlock = blockChain[0];
        
        let i = 1;
        while (i < blockChain.length) {
            var currBlock = blockChain[i];
            const lastHash = BlockChain.hash(lastBlock);
            if (currBlock.previousHash != lastHash){
                return false;
            }
            // Would also need to check valid nonce;
            if (!this.validProof(lastBlock, lastBlock.nonce!)){
                return false;
            }

        }
        return true;

        


    }

    getBlockChain(): Block[]{
        return this.blockChain;
    }

    async resolveConflicts(): Promise<void>{

        return new Promise<void>(async (resolve, reject) => {
            try {
                const peerChains: Block[][] = await getPeerChains(this.peers);

                //console.log('peer chains', peerChains);
                let max = this.blockChain.length;
                let newChain: Block[] | undefined = undefined;
    
                peerChains.forEach((chain: Block[]) => {
                    if (chain.length > max && this.validateBlock(chain)) {
                        newChain = chain;
                    }
                });
    
                if (newChain) {
                    this.blockChain = newChain;
                }
    
                resolve(); // Resolve the promise if everything succeeded
            } catch (error) {
                reject(error); // Reject the promise if there's an error
            }
        });
    }

    async updateTransactionDataFromPeers(): Promise<void>{
        return new Promise<void>(async (resolve,reject)=> {
            try {
                const newTransactionData: TransactionData[] = await getPendingTransactions(this.peers);
                this.updatePendingTransactions(newTransactionData);
                resolve();
            } catch  (err) {
                reject(err);
            }
        })

    }

    containsTransactionAddress(address:string): boolean {
        const transactionAddressSet: Set<string> = new Set(this.pendingTransactionData.map(transaction => {
            return transaction.address;
        }));
        return transactionAddressSet.has(address);

    }

    async newBlock() {
        // Get transaction data from neighbors; (maybe) so we don't have to synchronize block
        console.log('starting mining');
        console.log('getting new transactions from peers');
        // const newTransactionData: TransactionData[] = await getPendingTransactions(this.peers);
        // this.updatePendingTransactions(newTransactionData);
        await this.updateTransactionDataFromPeers();
        await this.resolveConflicts();
        const prevBlock: Block | undefined = this.blockChain.length > 0 ? this.blockChain[this.blockChain.length - 1] : undefined;
        const newNonce: string = prevBlock ? this.mine(prevBlock) : BlockChain.nonce();
        const previousHash: string = prevBlock ? BlockChain.hash(prevBlock) : "0000";
        const newBlock: Block = {
            index: this.blockChain.length,
            timeStamp: new Date(),
            information: this.pendingTransactionData,
            previousHash: previousHash,
            nonce: newNonce,
        }
        if (prevBlock == undefined){
            console.log('initial block mined');
        }
        
        // Reset our current pending transactions 
        // calls update pending transactions to prevent concurrency issues
        this.updatePendingTransactions(newBlock.information);
        this.blockChain.push(newBlock);

        // Alert peers the pending transactions have been done.
        succesfulMine(this.peers, newBlock.information);

        // Ask one peer to sychronize with us for replication purposes
        const numSynchronization = 1;
        const peersForSynchronization: PeerNode[] | undefined = pickRandomElements(this.peers,numSynchronization );
            if (peersForSynchronization) {
                synchronizeChains(peersForSynchronization);
            }
        
    }

    replicateTransaction(data: TransactionData[]) {
        const transactionSet: Set<TransactionData> = new Set(this.pendingTransactionData);
        data.forEach(transaction => {
            transactionSet.add(transaction);
        })
        this.pendingTransactionData = [...transactionSet];
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

    validProof(lastBlock: Block, nonce: string, difficulty: number =4): boolean{
        return BlockChain.hash(lastBlock, nonce).slice(0, difficulty) === "0".repeat(difficulty)
    }

}

export default BlockChain;