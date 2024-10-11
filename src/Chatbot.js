import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import './Chatbot.css';

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const newMessage = { text: input, sender: 'user' };
    setMessages(prev => [...prev, newMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          message: input,
          summaryId: location.state?.summaryId 
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(prev => [...prev, { text: data.reply, sender: 'bot' }]);
      } else {
        throw new Error('Failed to get response');
      }
    } catch (error) {
      console.error('Error in chat:', error);
      setMessages(prev => [...prev, { text: 'Sorry, I encountered an error. Please try again.', sender: 'bot' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4 h-screen flex flex-col">
      <h2 className="text-2xl font-bold mb-4">Ask Questions About the Lecture</h2>
      <div className="flex-grow overflow-auto mb-4 border rounded p-4">
        {messages.map((message, index) => (
          <div 
            key={index} 
            className={`mb-2 ${message.sender === 'user' ? 'text-right' : 'text-left'}`}
          >
            <span 
              className={`inline-block p-2 rounded-lg ${
                message.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200'
              }`}
            >
              {message.text}
            </span>
          </div>
        ))}
        {loading && <div className="text-center">Bot is typing...</div>}
        <div ref={chatEndRef} />
      </div>
      <div className="flex">
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          className="flex-grow mr-2 p-2 border rounded"
          placeholder="Type your question here..."
        />
        <button 
          onClick={handleSend}
          disabled={loading}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default Chatbot;