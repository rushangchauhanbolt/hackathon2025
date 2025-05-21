import express, { Request, Response } from 'express';

const app = express();
const hostname = '0.0.0.0'; // <--- Required for Railway
const port = process.env.PORT || 3000;

app.use(express.json()); // To parse JSON body

app.post('/', (req: Request, res: Response) => {
  console.log("🚀 ~ app.post ~ req:", req)
  const data = req.body;
  console.log('Received:', data);
  res.status(200).json({ challenge: data.challenge, received: data });
});

app.listen(port, () => {
  console.log(`Server running on http://${hostname}:${port}`);
});