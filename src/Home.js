import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-4xl font-bold mb-4">Welcome to LectureSum</h1>
      <p className="text-xl mb-8 text-center max-w-2xl">
        Upload your lecture videos, get instant summaries, translate to any language, 
        and ask questions about the content using our intelligent chatbot.
      </p>
      <Link 
        to="/upload" 
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Get Started
      </Link>
    </div>
  );
};

export default Home;