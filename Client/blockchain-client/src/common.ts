export interface Node {
    ipAddress: string,
    port: string,
    location: string,
    status: Status,
}

export interface Purchase {
    name: string,
    address: string,
    price: number,

}
export interface TransactionData {
    id: string,
    previousOwner?: string,
    newOwner: string,
    address: string,
    price: number,
}

export enum Status {
    READY = 'Ready',
    RUNNING = 'Running',
    OFFLINE = 'Offline',
}

export interface StatusDto {
    status: Status,
    message: string,
}

export interface AdressInfoReqDto {
    address: string,
}

export interface AdressInfo {
    address: string,
    price: number,
    owned: boolean;
    previousOwner?: string,
}

export interface ValidPurchaseDto {
    valid: boolean,
}

export interface SignInAtmp {
    username: string,
    password: string,
}


export enum Permission {
    SUPERUSER = "SUPERUSER",
    USER = "USER",
}


export interface NewUserDto {
    name: string,
    username: string,
    password: string,
    permission: Permission,
    nodes?: string[],
}

export interface SignInResDto {
    success: boolean;
    message: string;
    token?: string;
}