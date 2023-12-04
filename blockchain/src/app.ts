import express from 'express';
import clientRoutes from './routes/clientRoutes';
import BlockChain from './blockchain/blockChain'
import cors from 'cors';
import serverRoutes from './routes/blockChainRoutes';
import { initialBroadCast } from './blockchain/blockChainStore';
import mongoose from 'mongoose';

const app = express();

app.use(express.json());

app.use(cors());

app.use(express.urlencoded({ extended: true }));


const PORT = 3000;
app.listen(3000, () => {
  console.log(`Server running on port ${PORT}`);
});



// Connect to MongoDB

mongoose.connect('mongodb://mongodb:27017/app', {  });
    
const db: mongoose.Connection = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});



var blockChain: BlockChain = new BlockChain([]);

// This is not a super programmatic way to start this, some weird things were going on so I 
// did it for debugging/
// initialBroadCast(blockChain); // Could be a starting method inside a route
module.exports = blockChain;


app.use('/', clientRoutes);
app.use('/block', serverRoutes);
