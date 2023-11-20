import express from 'express';
import routes from './routes/routes';
import BlockChain from './blockchain/blockChain'
import cors from 'cors';

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


app.use('/', routes);
