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
    address: string,
    price: number,
}

export interface PeerNode {
    ipAddress: string,
    port: string,
}

export interface StatusDto {
    status: Status,
    message: string,
}

export interface AdressInfoReqDto {
    address: string,
}

export interface AdressInfoResDto {
    address: string,
    price: number,
    owned: boolean;
    previousOwner?: string,
}

export interface ValidPurchaseDto {
    valid: boolean,
}
