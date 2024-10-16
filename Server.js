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
const OPENAI_API_KEY = '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'; // Replace with your actual OpenAI API key

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
  const { videoUrl, transcript } = req.body; // Expecting a transcript to be passed

  if (!transcript) {
    return res.status(400).json({ error: 'No transcript provided for summarization.' });
  }

  try {
    // Call Hugging Face API for summarization
    const response = await axios.post(
      'https://api-inference.huggingface.co/models/facebook/bart-large-cnn',
      {
        inputs: transcript, // Send the transcript directly
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
          model: 'gpt-3.5-turbo', // Use your preferred model
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

    const maxRetries = 5; // Set the maximum number of retries
    let attempts = 0;
    let reply;

    while (attempts < maxRetries) {
      try {
        reply = await getChatbotResponse();
        break; // Exit loop if successful
      } catch (error) {
        if (error.response && error.response.status === 503) {
          attempts++;
          console.log(`Attempt ${attempts} failed. Retrying...`);
          await new Promise(res => setTimeout(res, 2000)); // Wait 2 seconds before retrying
        } else {
          throw error; // Re-throw other errors
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

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
