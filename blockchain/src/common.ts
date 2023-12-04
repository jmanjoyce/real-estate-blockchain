import { Status } from "./blockchain/blockChain";
import { signIn } from "./blockchain/userStore";


export interface Block {
    index: number, 
    timeStamp: Date,
    information: TransactionData[],
    previousHash: string,
    nonce?: string,
}

export interface TransactionData {
    id:string,
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

export interface User {
    name: string,
    username: string,
    passwordHash: string,
    salt: string,
    permission: Permission,
    balance: number,
    nodes?: PeerNode[],
}

export interface NewUserDto {
    name: string,
    username: string,
    password: string,
    permission: Permission,
    nodes?: PeerNode[],
}

export enum Permission {
    SUPERUSER = "SUPERUSER",
    USER = "USER",
}

export interface SingInDto {
    username: string,
    password: string,
}

export interface SingInResDto {
    success: boolean;
    message: string;
    token?: string;
}