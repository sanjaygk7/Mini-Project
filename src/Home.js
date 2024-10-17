import React from 'react';
import { Link } from 'react-router-dom';
import emailjs from 'emailjs-com';
import './Home.css';

const Home = () => {
  const map = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3889.139486474868!2d74.9819583750037!3d12.898751016471458!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba4a7ec7cde3f61%3A0x375b242f31af884c!2sCanara%20Engineering%20College!5e0!3m2!1sen!2sin!4v1727483165342!5m2!1sen!2sin';

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
    <>
      <div className="home">
        {/* First Section: LectureEase and Login */}
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

        {/* Second Section: Paragraph and Get Started Button */}
        <div className="content-section">
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
      </div>

      {/* Contact Section */}
      <section className='contacts'>
        <div className='container shadow flexSB'>
          <div className='left row'>
            <iframe 
              src={map} 
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
    </>
  );
};

export default Home;