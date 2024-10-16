const express = require('express');
const multer = require('multer');
const axios = require('axios');
const path = require('path');
const cors = require('cors');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Replace with your OpenAI API key
const OPENAI_API_KEY = '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';

// File Upload Setup (Multer)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (!fs.existsSync('uploads')) {
      fs.mkdirSync('uploads'); // Create uploads directory if it doesn't exist
    }
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// File Upload Endpoint
app.post('/api/upload', upload.single('video'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const videoUrl = `/uploads/${req.file.filename}`;
  res.json({ videoUrl });
});

// Summarization Endpoint
app.post('/api/summarize', async (req, res) => {
  const { videoUrl } = req.body;

  try {
    // Call OpenAI API for summarization
    const response = await axios.post(
      'https://api.openai.com/v1/completions',
      {
        model: 'text-davinci-003',
        prompt: `Summarize the lecture in this video: ${videoUrl}`,
        max_tokens: 150,
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const summary = response.data.choices[0].text.trim();
    res.json({ summary });
  } catch (error) {
    console.error('Error generating summary:', error);
    res.status(500).json({ error: 'Failed to summarize video' });
  }
});

// Translation Endpoint
app.post('/api/translate', async (req, res) => {
  const { text, targetLanguage } = req.body;

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/completions',
      {
        model: 'text-davinci-003',
        prompt: `Translate this text to ${targetLanguage}: ${text}`,
        max_tokens: 150,
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const translatedText = response.data.choices[0].text.trim();
    res.json({ translatedText });
  } catch (error) {
    console.error('Error translating text:', error);
    res.status(500).json({ error: 'Translation failed' });
  }
});

// Chatbot Endpoint
app.post('/api/chat', async (req, res) => {
  const { message } = req.body;

  try {
    // Call OpenAI API to generate a response
    const response = await axios.post(
      'https://api.openai.com/v1/completions',
      {
        model: 'text-davinci-003',
        prompt: `Answer the following question based on this lecture summary: ${message}`,
        max_tokens: 150,
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const reply = response.data.choices[0].text.trim();
    res.json({ reply });
  } catch (error) {
    console.error('Error in chatbot:', error);
    res.status(500).json({ error: 'Chatbot response failed' });
  }
});

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
