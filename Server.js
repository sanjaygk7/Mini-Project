const express = require('express');
const multer = require('multer');
const axios = require('axios');
const path = require('path');
const cors = require('cors');
const fs = require('fs');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Hugging Face API Key
const HUGGINGFACE_API_KEY = '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';

// OpenAI API Key
const OPENAI_API_KEY = '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';

// File Upload Setup (Multer)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = 'D:/Projects/StudyEase/Final/uploads';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true }); // Create directory if it doesn't exist
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    if (file.mimetype.startsWith('audio/')) {
      cb(null, `audio-${Date.now()}${path.extname(file.originalname)}`);
    } else {
      cb(null, `${Date.now()}${path.extname(file.originalname)}`);
    }
  },
});

const upload = multer({ storage });

// Audio Upload Endpoint
app.post('/api/upload-audio', upload.single('audio'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No audio file uploaded' });
  }

  const audioPath = req.file.path;
  res.json({ 
    success: true, 
    message: 'Audio file saved successfully',
    path: audioPath 
  });
});

// File Upload Endpoint (for other files)
app.post('/api/upload', upload.single('video'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const videoUrl = `/uploads/${req.file.filename}`;
  res.json({ videoUrl });
});

// Summarization Endpoint
app.post('/api/summarize', async (req, res) => {
  const { transcript } = req.body;

  if (!transcript) {
    return res.status(400).json({ error: 'No transcript provided for summarization.' });
  }

  try {
    const response = await axios.post(
      'https://api-inference.huggingface.co/models/facebook/bart-large-cnn',
      {
        inputs: transcript,
      },
      {
        headers: {
          Authorization: `Bearer ${HUGGINGFACE_API_KEY}`,
        },
      }
    );

    const summary = response.data[0].summary_text;
    res.json({ summary });
  } catch (error) {
    console.error('Error generating summary:', error);
    res.status(500).json({ error: 'Failed to summarize video' });
  }
});

// Chatbot Endpoint
app.post('/api/chat', async (req, res) => {
  const { message } = req.body;

  try {
    // Retry logic for OpenAI API
    const getChatbotResponse = async () => {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: message }],
        },
        {
          headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data.choices[0].message.content;
    };

    const maxRetries = 5;
    let attempts = 0;
    let reply;

    while (attempts < maxRetries) {
      try {
        reply = await getChatbotResponse();
        break;
      } catch (error) {
        if (error.response && error.response.status === 503) {
          attempts++;
          console.log(`Attempt ${attempts} failed. Retrying...`);
          await new Promise(res => setTimeout(res, 2000));
        } else {
          throw error;
        }
      }
    }

    if (!reply) {
      return res.status(503).json({ error: 'Chatbot is currently unavailable. Please try again later.' });
    }

    res.json({ reply });
  } catch (error) {
    console.error('Error in chatbot:', error);
    res.status(500).json({ error: 'Chatbot response failed' });
  }
});

// Handle Audio Files List Request
app.get('/api/audio-files', (req, res) => {
  const uploadPath = 'D:/Projects/StudyEase/Final/uploads';
  try {
    if (!fs.existsSync(uploadPath)) {
      return res.json({ files: [] });
    }
    
    const files = fs.readdirSync(uploadPath)
      .filter(file => file.startsWith('audio-'))
      .map(file => ({
        name: file,
        path: `${uploadPath}/${file}`,
        url: `/uploads/${file}`
      }));
    
    res.json({ files });
  } catch (error) {
    console.error('Error reading audio files:', error);
    res.status(500).json({ error: 'Failed to retrieve audio files' });
  }
});

// Serve static files
app.use('/uploads', express.static('D:/Projects/StudyEase/Final/uploads'));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});