import express from 'express';
import clientRoutes from './routes/clientRoutes';
import BlockChain from './blockchain/blockChain'
import cors from 'cors';
import serverRoutes from './routes/blockChainRoutes';

const app = express();

app.use(express.json());

app.use(cors());

app.use(express.urlencoded({ extended: true }));


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});



var blockChain: BlockChain = new BlockChain([]);
module.exports = blockChain;


app.use('/', clientRoutes);
app.use('/block', serverRoutes);
