import React, { useState } from 'react';
import axios from 'axios';

const Chatbot = () => {
  const [message, setMessage] = useState('');
  const [reply, setReply] = useState('');

  const handleChat = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/chat', { message });
      setReply(response.data.reply);
    } catch (error) {
      console.error('Error in chatbot interaction:', error);
    }
  };

  return (
    <div className="chatbot">
      <h2>Chatbot</h2>
      <form onSubmit={handleChat}>
        <input
          type="text"
          placeholder="Ask me anything..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <button type="submit">Send</button>
      </form>
      {reply && (
        <div className="chatbot-reply">
          <h3>Reply:</h3>
          <p>{reply}</p>
        </div>
      )}
    </div>
  );
};

export default Chatbot;
