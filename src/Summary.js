import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Summary.css';

const Summary = () => {
  const [summary, setSummary] = useState('');
  const [translatedSummary, setTranslatedSummary] = useState('');
  const [language, setLanguage] = useState('en');
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchSummary = async () => {
      const videoUrl = location.state?.videoUrl;
      if (!videoUrl) {
        navigate('/upload');
        return;
      }

      try {
        const response = await fetch('http://localhost:5000/api/summarize', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ videoUrl }),
        });

        if (response.ok) {
          const data = await response.json();
          setSummary(data.summary);
        } else {
          throw new Error('Failed to fetch summary');
        }
      } catch (error) {
        console.error('Error fetching summary:', error);
        // Handle error (show message to user)
      }
    };

    fetchSummary();
  }, [location.state, navigate]);

  const handleTranslate = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: summary, targetLanguage: language }),
      });

      if (response.ok) {
        const data = await response.json();
        setTranslatedSummary(data.translatedText);
      } else {
        throw new Error('Translation failed');
      }
    } catch (error) {
      console.error('Error translating summary:', error);
      // Handle error (show message to user)
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Lecture Summary</h2>
      <div className="mb-4">
        <h3 className="text-xl font-semibold mb-2">Original Summary:</h3>
        <ul className="list-disc pl-5">
          {summary.split('\n').map((point, index) => (
            <li key={index}>{point}</li>
          ))}
        </ul>
      </div>
      <div className="mb-4">
        <select 
          value={language} 
          onChange={(e) => setLanguage(e.target.value)}
          className="mr-2 p-2 border rounded"
        >
          <option value="es">Spanish</option>
          <option value="fr">French</option>
          <option value="de">German</option>
          {/* Add more language options as needed */}
        </select>
        <button 
          onClick={handleTranslate}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Translate
        </button>
      </div>
      {translatedSummary && (
        <div className="mb-4">
          <h3 className="text-xl font-semibold mb-2">Translated Summary:</h3>
          <ul className="list-disc pl-5">
            {translatedSummary.split('\n').map((point, index) => (
              <li key={index}>{point}</li>
            ))}
          </ul>
        </div>
      )}
      <button 
        onClick={() => navigate('/chat', { state: { summaryId: location.state?.videoUrl } })}
        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
      >
        Ask Questions
      </button>
    </div>
  );
};

export default Summary;
