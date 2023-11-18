

export interface Block {
    index: number, 
    timeStamp: Date,
    information: TransactionData[],
    previousHash: string,
    nonce?: string,
}

export interface TransactionData {
    previousOwner?: string,
    newOwner: string,
    adress: string,
    price: number,

}