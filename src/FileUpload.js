import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './FileUpload.css';

const FileUpload = () => {
  const [file, setFile] = useState(null); // State to store the selected file
  const [uploading, setUploading] = useState(false); // State to track upload status
  const [errorMessage, setErrorMessage] = useState(''); // State to handle errors
  const navigate = useNavigate();

  // Handle file selection
  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
    setErrorMessage(''); // Clear any previous error when a new file is selected
  };

  // Handle the file upload process
  const handleUpload = async () => {
    if (!file) {
      setErrorMessage('Please select a file to upload.');
      return;
    }

    setUploading(true); // Start the uploading state
    const formData = new FormData();
    formData.append('video', file);

    try {
      const response = await fetch('http://localhost:5000/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const result = await response.json();
        const videoUrl = result.videoUrl; // Get the video URL from the response
        navigate('/summary', { state: { videoUrl } }); // Navigate to summary page with video URL
      } else {
        throw new Error('Upload failed. Please try again.');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      setErrorMessage('Error uploading file. Please try again.');
    } finally {
      setUploading(false); // Stop the uploading state
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h2 className="text-2xl font-bold mb-4">Upload Your Lecture Video</h2>
      <input 
        type="file" 
        onChange={handleFileChange} 
        accept="video/mp4"
        className="mb-4"
      />
      <button 
        onClick={handleUpload}
        disabled={!file || uploading}
        className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
      >
        {uploading ? 'Uploading...' : 'Upload'}
      </button>

      {/* Error Message Display */}
      {errorMessage && (
        <div className="mt-4 text-red-500 font-semibold">
          {errorMessage}
        </div>
      )}
    </div>
  );
};

export default FileUpload;
