import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './Home';
import FileUpload from './FileUpload';
import Summary from './Summary';
// import Chatbot from './Chatbot';

import './index.css';

const App = () => {
  const [videoUrl, setVideoUrl] = useState(null);

  return (
    <Router>
      <div className="min-h-screen bg-gray-100 flex">
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/upload" element={<FileUpload setVideoUrl={setVideoUrl} />} />
            <Route path="/summary" element={<Summary videoUrl={videoUrl} />} />
          </Routes>
        </div>
        {/* <div className="w-1/3 p-4 border-l">
          <Chatbot />
        </div> */}
        
      </div>
    </Router>
  );
};

export default App;
