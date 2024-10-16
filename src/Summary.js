import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './Summary.css';

const Summary = () => {
  const [summary, setSummary] = useState(''); // Store the summary of the lecture
  const [translatedSummary, setTranslatedSummary] = useState(''); // Store translated summary
  const [language, setLanguage] = useState('en'); // Selected language for translation
  const location = useLocation();
  const navigate = useNavigate();

  // Fetch the summary once the component mounts
  useEffect(() => {
    const fetchSummary = async () => {
      const videoUrl = location.state?.videoUrl; // Extract videoUrl from state
      if (!videoUrl) {
        navigate('/upload'); // Redirect to upload page if no videoUrl
        return;
      }

      try {
        const response = await fetch('http://localhost:5000/api/summarize', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ videoUrl }), // Send videoUrl in request body
        });

        if (response.ok) {
          const data = await response.json();
          setSummary(data.summary); // Set the received summary
        } else {
          throw new Error('Failed to fetch summary');
        }
      } catch (error) {
        console.error('Error fetching summary:', error);
        // Handle error (show message to user)
      }
    };

    fetchSummary(); // Trigger summary fetch
  }, [location.state, navigate]);

  // Handle summary translation
  const handleTranslate = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: summary, targetLanguage: language }), // Send summary and target language
      });

      if (response.ok) {
        const data = await response.json();
        setTranslatedSummary(data.translatedText); // Set the translated text
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
      
      {/* Original Summary */}
      <div className="mb-4">
        <h3 className="text-xl font-semibold mb-2">Original Summary:</h3>
        <ul className="list-disc pl-5">
          {summary.split('\n').map((point, index) => (
            <li key={index}>{point}</li>
          ))}
        </ul>
      </div>
      
      {/* Translation Section */}
      <div className="mb-4">
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="mr-2 p-2 border rounded"
        >
          <option value="en">English</option>
          <option value="kn">Kannada</option>
          <option value="hi">Hindi</option>
        </select>

        <button 
          onClick={handleTranslate}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Translate
        </button>
      </div>

      {/* Translated Summary */}
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
      
      {/* Navigation to Chatbot */}
      <button 
        onClick={() => navigate('/chat', { state: { summaryId: location.state?.videoUrl } })} // Pass videoUrl to chatbot page
        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
      >
        Ask Questions
      </button>
    </div>
  );
};

export default Summary;
