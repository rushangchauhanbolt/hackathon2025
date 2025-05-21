import express, { Request, Response } from 'express';

const app = express();
const port = 3000;

app.use(express.json()); // To parse JSON body

app.post('/submit', (req: Request, res: Response) => {
  const data = req.body;
  console.log('Received:', data);
  res.status(200).json({ challenge: data.challenge, received: data });
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});