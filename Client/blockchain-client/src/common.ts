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
