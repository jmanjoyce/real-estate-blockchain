import { Block, PeerNode, TransactionData } from '../common';
import { createHash, randomBytes } from 'crypto';
import { pickRandomElements } from './utils';
import { replicateTransaction, replicateNewTransaction, initialBroadCast } from './blockChainStore';
const os = require('os');

class BlockChain {

    blocks: Block[];
    pendingTransactionData: TransactionData[];
    peers: PeerNode[];
    node: PeerNode;
    rootNode: PeerNode | undefined;

    constructor(peers: PeerNode[]){
        this.blocks = [];
        this.pendingTransactionData = [];
        this.peers = peers ?? [];
        this.node = {
            // ipAdress: os.networkInterfaces()['eth0'][0].address,
            ipAdress: 'localhost',
            port: process.env.PORT ?? '3000',
        }

        if (process.env.ROOT_NAME !== undefined && 
            process.env.ROOT_PORT !== undefined) {
            // Root variable set means is root
            this.rootNode = {
                ipAdress: process.env.ROOT_NAME,
                port: process.env.ROOT_PORT,
            }
            initialBroadCast(this.node, this.rootNode);
            
        
        }
        

        console.log(this.node, 's');
    }

    addTransaction(data: TransactionData){
        this.pendingTransactionData.push(data);
        if (this.peers.length > 0){
            // Could use some 
            const maxReplication = 2;
            const numReplication = Math.min(this.peers.length, maxReplication);
            const peerForReplication: PeerNode[] | undefined = pickRandomElements(this.peers, numReplication);
            if (peerForReplication){
                replicateNewTransaction([data], peerForReplication);
            }
        }
        
    }

    addPeer(newPeer: PeerNode){
        this.peers.push(newPeer);

    }

    getPeers():PeerNode[]{
        return this.peers;
    }

    getPendingTransaction(): TransactionData[]{
        return this.pendingTransactionData;
    }

    newBlock(){
        // Get transaction data from neighbors; (maybe) so we don't have to synchronize block
        
        const prevBlock: Block | undefined = this.blocks.length > 0?  this.blocks[this.blocks.length - 1]:undefined;
        const newNonce: string = prevBlock? this.mine(prevBlock):BlockChain.nonce();
        const previousHash: string = prevBlock? BlockChain.hash(prevBlock) : "0000";
        const newBlock: Block = {
            index: this.blocks.length,
            timeStamp: new Date(),
            information: this.pendingTransactionData,
            previousHash: previousHash,
            nonce: newNonce,
        }
        this.pendingTransactionData = []
        this.blocks.push(newBlock);
    }

    replicateTransaction(data: TransactionData[]){
        const transactionSet: Set<TransactionData> = new Set(this.pendingTransactionData);
        data.forEach(transaction => {
            transactionSet.add(transaction);
        })
        this.pendingTransactionData = [...transactionSet];
    }

    static hash(block: Block, nonce?:string) {
        const blockString:string = JSON.stringify(block, Object.keys(block).sort());
        return createHash("sha256").update(blockString + (nonce?? '')).digest("hex");
    }

    static nonce(): string{
        return createHash("sha256").update(randomBytes(32)).digest("hex");
    }

    mine(lastBlock:Block, difficulty: number = 4): string{
        while (true) {
            const newNonce = BlockChain.nonce();
            if (BlockChain.hash(lastBlock, newNonce).slice(0,difficulty) === "0".repeat(difficulty)){
                console.log('Mining Complete', newNonce);
                return newNonce;
            }

        }

    }

}

export default BlockChain;