import { Block, PeerNode, TransactionData } from '../common';
import { createHash, randomBytes } from 'crypto';
import { pickRandomElements } from './utils';
import { replicateTransaction, replicateNewTransaction, initialBroadCast, getPeerChains, succesfulMine } from './blockChainStore';
const os = require('os');

class BlockChain {

    blockChain: Block[];
    pendingTransactionData: TransactionData[];
    peers: PeerNode[];
    node: PeerNode;
    rootNode: PeerNode | undefined;

    constructor(peers: PeerNode[]) {
        this.blockChain = [];
        this.pendingTransactionData = [];
        this.peers = peers ?? [];
        this.node = {
            // ipAdress: os.networkInterfaces()['eth0'][0].address,
            ipAdress: process.env.IP ?? 'localhost',
            port: process.env.PORT ?? '3000',
        }

        if (process.env.ROOT_IP !== undefined &&
            process.env.ROOT_PORT !== undefined) {
            // Root variable set means is root
            this.rootNode = {
                ipAdress: process.env.ROOT_IP,
                port: process.env.ROOT_PORT,
            }
        }
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
            const maxReplication = 2;
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

    async resolveConflicts(){

        var newChain: undefined| Block[] = undefined

        const peerChains: Block[][] = await getPeerChains(this.peers);
        let max = this.blockChain.length
        peerChains.forEach((chain: Block[]) => {
            if (chain.length > max && this.validateBlock(chain)){
                newChain = chain;
            }

        })
        if (newChain){
            this.blockChain = newChain;
        }
    }

    async newBlock() {
        // Get transaction data from neighbors; (maybe) so we don't have to synchronize block
        console.log('starting mining');
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
        
        this.pendingTransactionData = [];
        this.blockChain.push(newBlock);
        succesfulMine(this.peers, newBlock.information);
        
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