import React, { useState } from 'react';
import { Link } from 'react-router-dom'; // Removed useNavigate as it's unused
import emailjs from 'emailjs-com';
import './FileUpload.css';
import './Home.css';

const FileUpload = ({ setVideoUrl }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleFileChange = (event) => {
    setFile(event.target.files[0]);
    setErrorMessage('');
  };

  const handleUpload = async () => {
    if (!file) {
      setErrorMessage('Please select a file to upload.');
      return;
    }

    setUploading(true);
    try {
      // Step 1: Extract audio from video file
      const audioBlob = await extractAudio(file);
      if (audioBlob) {
        // Step 2: Send audio to backend
        await sendAudioToBackend(audioBlob);
        setUploading(false);
      }
    } catch (error) {
      console.error('Error processing file:', error);
      setErrorMessage('Error processing file. Please try again.');
      setUploading(false);
    }
  };

  // Function to extract audio from video file
  const extractAudio = (videoFile) => {
    return new Promise((resolve, reject) => {
      const videoElement = document.createElement('video');
      videoElement.src = URL.createObjectURL(videoFile);
      videoElement.muted = true; 
      
      videoElement.onloadedmetadata = () => {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const source = audioContext.createMediaElementSource(videoElement);
        const destination = audioContext.createMediaStreamDestination();
        source.connect(destination);
        
        const mediaRecorder = new MediaRecorder(destination.stream);
        const chunks = [];
        
        mediaRecorder.ondataavailable = (e) => {
          chunks.push(e.data);
        };
        
        mediaRecorder.onstop = () => {
          const audioBlob = new Blob(chunks, { type: 'audio/mp3' });
          resolve(audioBlob);
        };
        
        videoElement.play();
        mediaRecorder.start();

        setTimeout(() => {
          mediaRecorder.stop();
        }, 5000);  // Adjust time as needed
      };

      videoElement.onerror = (e) => reject(e);
    });
  };

  // Function to send audio Blob to backend
  const sendAudioToBackend = async (audioBlob) => {
    const formData = new FormData();
    formData.append('audio', audioBlob, 'extracted-audio.mp3');

    try {
      const response = await fetch('http://localhost:5000/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        console.log('Audio file uploaded successfully');
      } else {
        throw new Error('Failed to upload audio file');
      }
    } catch (error) {
      console.error('Error uploading audio file:', error);
    }
  };

  // Function to send email
  const sendEmail = (e) => {
    e.preventDefault();

    emailjs.sendForm('service_ly5fdjl', 'template_gxwt9fl', e.target, 'CLGh0AkODgKZFeoFw')
      .then((result) => {
        console.log(result.text);
        alert('Message sent successfully!');
        e.target.reset();
      }, (error) => {
        console.log(error.text);
        alert('Failed to send message. Please try again.');
      });
  };

  return (
    <div className="flex flex-col min-h-screen">
      <div className="container">
        <div className="lectureEase">
          <h1 className="text-4xl font-bold mb-4">LectureEase</h1>
        </div>
        <div className="login">
          <Link
            to="/login"
            className="bg-white text-blue-500 font-bold py-2 px-4 rounded"
          >
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

      <section className='contacts'>
        <div className='container shadow flexSB'>
          <div className='left row'>
            <iframe
              src="https://www.google.com/maps"
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Canara Engineering College Map"
            ></iframe>
          </div>
          <div className='right row'>
            <h1>Contact us</h1>
            <p>We're open for any suggestion or just to have a chat</p>

            <div className='items'>
              <div className='box'>
                <h4>ADDRESS</h4>
                <p>CANARA ENGINEERING COLLEGE, Mangalore</p>
              </div>
              <div className='box'>
                <h4>EMAIL</h4>
                <p>info@cecproject.com</p>
              </div>
              <div className='box'>
                <h4>PHONE</h4>
                <p>+91 9876543210</p>
              </div>
            </div>

            <form onSubmit={sendEmail}>
              <input type="text" name="name" placeholder="Your Name" required />
              <input type="email" name="email" placeholder="Your Email" required />
              <textarea name="message" placeholder="Your Message" required></textarea>
              <button type="submit">Send Message</button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default FileUpload;

