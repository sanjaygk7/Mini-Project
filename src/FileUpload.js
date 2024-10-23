import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import emailjs from 'emailjs-com';
import './FileUpload.css';
import './Home.css';

const FileUpload = ({ setVideoUrl }) => {
  const [file, setFile] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
    setErrorMessage('');
    setAudioUrl(null);
    setShowSuccess(false);
  };

  const saveAudioToServer = async (audioBlob) => {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'extracted-audio.mp3');

    try {
      const response = await fetch('http://localhost:5000/api/upload-audio', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to save audio file');
      }

      const data = await response.json();
      return data.path;
    } catch (error) {
      console.error('Error saving audio:', error);
      throw error;
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setErrorMessage('Please select a file to upload.');
      return;
    }

    setUploading(true);
    try {
      const audioBlob = await extractAudio(file);
      if (audioBlob) {
        // Save to server
        await saveAudioToServer(audioBlob);
        
        // Create a URL for preview in browser
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);

        // Show success message
        setShowSuccess(true);
        
        // Hide success message after 5 seconds
        setTimeout(() => {
          setShowSuccess(false);
        }, 5000);
      }
    } catch (error) {
      console.error('Error processing file:', error);
      setErrorMessage('Error processing file. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const extractAudio = (videoFile) => {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.src = URL.createObjectURL(videoFile);
      video.preload = 'metadata';

      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const dest = audioContext.createMediaStreamDestination();
      let audioSource = null;
      let mediaRecorder = null;
      const chunks = [];

      video.onloadedmetadata = async () => {
        try {
          video.play();
          video.muted = true;

          audioSource = audioContext.createMediaElementSource(video);
          audioSource.connect(dest);
          
          mediaRecorder = new MediaRecorder(dest.stream);
          mediaRecorder.start();

          mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) chunks.push(e.data);
          };

          mediaRecorder.onstop = () => {
            const audioBlob = new Blob(chunks, { type: 'audio/mp3' });
            resolve(audioBlob);
            
            video.pause();
            audioSource.disconnect();
            audioContext.close();
          };

          video.onended = () => {
            mediaRecorder.stop();
          };

        } catch (error) {
          reject(error);
        }
      };

      video.onerror = (error) => {
        reject(error);
      };
    });
  };

  return (
    <div className="flex flex-col min-h-screen">
      <div className="container">
        <div className="lectureEase">
          <h1 className="text-4xl font-bold mb-4">LectureEase</h1>
        </div>
        <div className="login">
          <Link to="/login" className="bg-white text-blue-500 font-bold py-2 px-4 rounded">
            Login
          </Link>
        </div>
      </div>

      <div className="flex flex-col items-center justify-center flex-grow p-4">
        <div className="headd">
          <span>Upload Your Lecture Video Here</span>
        </div>
        <div className="upload-container">
          <input
            type="file"
            onChange={handleFileChange}
            accept="video/mp4"
            className="file-input"
          />
          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="choosefile"
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        </div>

        {showSuccess && (
          <div className="mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-md max-w-md">
            <div className="flex items-center">
              <svg 
                className="w-5 h-5 mr-2" 
                fill="currentColor" 
                viewBox="0 0 20 20"
              >
                <path 
                  fillRule="evenodd" 
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" 
                  clipRule="evenodd" 
                />
              </svg>
              <span className="font-medium">Video successfully uploaded and audio extracted!</span>
            </div>
          </div>
        )}

        {audioUrl && (
          <div className="mt-4">
            <audio controls src={audioUrl}>
              Your browser does not support the audio element.
            </audio>
          </div>
        )}

        {errorMessage && (
          <div className="error-container">
            <div className="error-message">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                viewBox="0 0 24 24" 
                fill="currentColor"
              >
                <path 
                  fillRule="evenodd" 
                  d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z" 
                  clipRule="evenodd" 
                />
              </svg>
              {errorMessage}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUpload;