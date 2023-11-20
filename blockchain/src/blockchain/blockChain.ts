import { Block, TransactionData } from '../common';
import { createHash, randomBytes } from 'crypto';

class BlockChain {

    blocks: Block[];
    pendingTransactionData: TransactionData[];
    peers: string[];

    constructor(peers: string[]){
        this.blocks = [];
        this.pendingTransactionData = [];
        this.peers = peers ?? [];
    }

    addTransaction(data: TransactionData){
        this.pendingTransactionData.push(data);
        console.log(this);
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