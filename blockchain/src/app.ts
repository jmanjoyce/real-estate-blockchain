import express from 'express';
import clientRoutes from './routes/clientRoutes';
import BlockChain from './blockchain/blockChain'
import cors from 'cors';
import serverRoutes from './routes/blockChainRoutes';
import { initialBroadCast } from './blockchain/blockChainService';
import mongoose from 'mongoose';
import UserStore from './blockchain/userStore';

const app = express();

app.use(express.json());

const corsOptions = {
  origin: '*', // Allow requests from all origins
};

app.use(cors(corsOptions));

app.use(express.urlencoded({ extended: true }));


const PORT = 3000;
app.listen(3000, () => {
  console.log(`Server running on port ${PORT}`);
});

// Connect to MongoDB





var blockChain: BlockChain = new BlockChain([]);
var userStore: UserStore = new UserStore();

// This is not a super programmatic way to start this, some weird things were going on so I 
// did it for debugging/
// initialBroadCast(blockChain); // Could be a starting method inside a route
module.exports = {
  blockChain: blockChain,
  userStore: userStore
};


app.use('/', clientRoutes);
app.use('/block', serverRoutes);
