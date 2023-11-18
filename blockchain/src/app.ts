import express from 'express';
import routes from './routes/routes';
import BlockChain from './blockchain/blockChain'

const app = express();
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});



var blockChain: BlockChain = new BlockChain();
module.exports = blockChain;


app.use('/', routes);
