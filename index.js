import express from 'express';
import { app as firebaseApp } from './firebase-config.js';

const app = express();
const port = process.env.PORT || 8080;

app.get('/', (req, res) => {
  res.send('Hello from my web app initialized with Firebase!');
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
});