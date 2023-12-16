import MetricStore, { NetworkEvent } from "./metricStore";

export const metricMiddlewate = (req: any, res: any, next: any) => {
    var metricStore: MetricStore = require('../../app').metricStore;
    // let data = '';
    // req.on('data', (chunk: any) => {
    //     data += chunk;
    //     console.log('')
    // });
    console.log('middleware');
    let requestBodySize = 0; // Initialize size counter

    req.on('data', (chunk: any) => {
        requestBodySize += chunk.length; // Increment size for each chunk received
    });
    try {
        var length = 0;
        if (req.method === 'POST') {
            length = req.get('Content-Length');
        } else {
            length = 0;
        }
        const contentLength = length;
        // console.log(contentLength);

        const event: NetworkEvent = {
            timeStamp: new Date(),
            payloadSize: contentLength,
        }
        metricStore.addEvent(event);
    } catch (err) {
        console.error('issue logging');
    }


    req.on('error', (err: any) => {
        console.error('Error reading request data:');
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



