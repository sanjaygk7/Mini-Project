import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './Home';
import FileUpload from './FileUpload';
import Summary from './Summary';
import Chatbot from './Chatbot';
import './index.css';

const App = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/upload" element={<FileUpload />} />
          <Route path="/summary" element={<Summary />} />
          <Route path="/chat" element={<Chatbot />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;