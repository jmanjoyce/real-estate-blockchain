import express from 'express';

const app = express();
const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Hello, this is your Express app with TypeScript!');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});