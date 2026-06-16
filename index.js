import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { app as firebaseApp } from './firebase-config.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const port = process.env.PORT || 8080;

// Serve static files from the repository root
app.use(express.static(__dirname));

app.get('/', (req, res) => {
  res.send('Hello from my web app initialized with Firebase!');
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
});