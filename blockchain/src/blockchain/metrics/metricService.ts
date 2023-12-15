import MetricStore, { NetworkEvent } from "./metricStore";

export const metricMiddlewate = (req: any, res: any, next: any) => {
    var metricStore: MetricStore = require('../../app').metricStore;
    let data = '';
    req.on('data', (chunk: any) => {
        data += chunk;
    });

    req.on('end', () => {
        const requestBodySize = Buffer.byteLength(data, 'utf8');
        const event: NetworkEvent = {
            timeStamp: new Date(),
            payloadSize: requestBodySize,
        }
        metricStore.addEvent(event);
    });

    req.on('error', (err: any) => {
        console.error('Error reading request data:', err);
        //res.sendStatus(400); // Bad request if there's an error reading data
    });
    next(); 

}

export const dumpNetData = async (req: any, res: any) => {
    var metricStore: MetricStore = require('../../app').metricStore;
    const metric: any = await metricStore.dumpNetorkInfo();
    res.json(metric);
    
}

export const resetMetricData = (req: any, res: any) => {
    var metricStore: MetricStore = require('../../app').metricStore;
    metricStore.resetMetrics();
    res.send("success");

    

}



