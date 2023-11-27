import { Status } from "./blockchain/blockChain";


export interface Block {
    index: number, 
    timeStamp: Date,
    information: TransactionData[],
    previousHash: string,
    nonce?: string,
}

export interface TransactionData {
    id?:string,
    previousOwner?: string,
    newOwner: string,
    adress: string,
    price: number,
}

export interface PeerNode {
    ipAdress: string,
    port: string,
}

export interface StatusDto {
    status: Status,
    message: string,
}
