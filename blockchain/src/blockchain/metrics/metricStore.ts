import mongoose from "mongoose"

// import { createHash, randomBytes } from 'crypto';
// import { response } from "express";

export interface NetworkEvent {
    timeStamp: Date,
    payloadSize: number,
}

class MetricStore {

    private readonly MetricModel: mongoose.Model<NetworkEvent>;
   
    constructor() {

        const connectionUrl = `mongodb://${process.env.USER_DB}/metric`;
        const conn: mongoose.Connection = mongoose.createConnection(connectionUrl, {});
        conn.on('error', console.error.bind(console, 'MongoDB connection error:'));
        conn.once('open', () => {
            console.log('Connected to MongoDB');
        });
        const networkEventSchema = new mongoose.Schema<NetworkEvent>({
            timeStamp: { type: Date, required: true },
            payloadSize: { type: Number, required: true }
        })
        this.MetricModel = conn.model<NetworkEvent>('NetworkEvent', networkEventSchema);
    }

    addEvent(event: NetworkEvent) {
        const doc = new this.MetricModel({
            timeStamp: event.timeStamp,
            payloadSize: event.payloadSize,
        })
        doc.save();
    }

    resetMetrics(){
        this.MetricModel.deleteMany({});
    }

    async dumpNetorkInfo(): Promise<any>{
        return new Promise<any>(async (res, rej)=>{
            try {
                this.MetricModel.aggregate([
                    {
                      $group: {
                        _id: null,
                        totalPayloadSize: { $sum: '$payloadSize' }
                      }
                    }
                  ])
                  .then(async result => {
                    const totalNumberOfReq: number = await this.MetricModel.countDocuments();
                    const totalPayloadSize: number = (result && result.length > 0) ? result[0].totalPayloadSize : 0;
                    console.log('Total Payload Size:', totalPayloadSize);
                    console.log('Total Number of Network Requests', totalNumberOfReq);
                    res({totalPayloadSize, totalNumberOfReq});
                  })
                  .catch(err => {
                    console.error('Error:', err);
                    return null;
                  });
            } catch (err: any) {
                console.log(err);
                rej();

            }
        })
          
    }

   

}

export default MetricStore;
