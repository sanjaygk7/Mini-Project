import React, { useState, } from 'react';
import axios from 'axios';

const Summary = ({ videoUrl }) => {
  const [summary, setSummary] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSummarize = async () => {
    if (!videoUrl) {
      setError('No video URL provided. Please upload a video first.');
      return;
    }

    setLoading(true);
    setError(''); // Reset error before fetching summary
    try {
      const response = await axios.post('/api/summarize', { videoUrl });
      setSummary(response.data.summary || 'No summary available.');
    } catch (error) {
      console.error('Error fetching summary:', error);
      setError('Error fetching summary. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="summary">
      <h2>Video Summary</h2>
      {videoUrl ? (
        <>
          <button onClick={handleSummarize} disabled={loading}>
            {loading ? 'Loading...' : 'Get Summary'}
          </button>
          {summary && (
            <div>
              <h3>Summary:</h3>
              <p>{summary}</p>
            </div>
          )}
          {error && (
            <div className="text-red-500">{error}</div>
          )}
        </>
      ) : (
        <p>No video uploaded yet. Please upload a video first.</p>
      )}
    </div>
  );
};

export default Summary;
