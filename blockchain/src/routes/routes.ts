import express from "express";

const router = express.Router();

router.get('/', (req, res) => {
    res.send('Hello, this is your Express app with TypeScript!');
  });


export default router;