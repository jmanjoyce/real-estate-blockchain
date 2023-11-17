import express from 'express';
import routes from './routes/routes';

const app = express();
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

app.use('/api', routes );
