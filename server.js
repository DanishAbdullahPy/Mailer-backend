const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

// Environment Variables Check
console.log('🔍 Environment Variables Check:');
console.log('GMAIL_USER:', process.env.GMAIL_USER ? 'SET' : 'NOT SET');
console.log('GMAIL_PASS:', process.env.GMAIL_PASS ? 'SET (length: ' + process.env.GMAIL_PASS.length + ')' : 'NOT SET');
console.log('PORT:', process.env.PORT);

const emailRoutes = require('./routes/email');

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration for production
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://your-frontend-url.vercel.app'] // We'll update this
    : ['http://localhost:3000'],
  credentials: true
}));

app.use(express.json());

// Routes
app.use('/api', emailRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Email Sender API is running!' });
});

// For Vercel, we need to export the app
if (process.env.NODE_ENV === 'production') {
  module.exports = app;
} else {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
