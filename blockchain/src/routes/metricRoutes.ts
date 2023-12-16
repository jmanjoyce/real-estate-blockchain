import express from "express";
import { dumpNetData, resetMetricData } from "../blockchain/metrics/metricService";


const router = express.Router();


router.get('/', (req, res) => {
    res.send('Basic');
  });

/**
 * has some id information that might be pernient to asking a different block
 * to mine.
 */
router.get('/getMetrics', dumpNetData);



/**
 * 
 */
router.get('/reset',resetMetricData );






export default router;