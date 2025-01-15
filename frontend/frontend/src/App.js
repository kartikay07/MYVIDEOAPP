import React, { useState, useEffect } from 'react';
import axios from 'axios';
import SliderAlert from './components/SliderAlert'; // Import the SliderAlert component
import Slider from 'react-slick'; // Import a slider library (e.g., react-slick)
import 'slick-carousel/slick/slick.css'; // Slider CSS
import 'slick-carousel/slick/slick-theme.css'; // Slider theme CSS
import './styles.css'; // Import the custom CSS file for animations
import { FaInstagram, FaFacebook, FaGithub, FaLinkedin, FaTwitter } from 'react-icons/fa';

const App = () => {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [videos, setVideos] = useState([]);
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfTitle, setPdfTitle] = useState('');
  const [pdfDescription, setPdfDescription] = useState('');
  const [pdfs, setPdfs] = useState([]);
  const [role, setRole] = useState(null); // User role (admin/user)
  const [token, setToken] = useState(null); // JWT token
  const [username, setUsername] = useState(''); // Username for login/signup
  const [password, setPassword] = useState(''); // Password for login/signup
  const [isLogin, setIsLogin] = useState(true); // Toggle between login and signup
  const [activeSection, setActiveSection] = useState('videos'); // Toggle between videos and PDFs

  // State for slider alert
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState(''); // 'success' or 'error'
  const [showAlert, setShowAlert] = useState(false);

  // Show slider alert
  const showSliderAlert = (message, type) => {
    setAlertMessage(message);
    setAlertType(type);
    setShowAlert(true);
  };

  // Hide slider alert
  const hideSliderAlert = () => {
    setShowAlert(false);
  };

  // Fetch videos and PDFs when the component mounts
  useEffect(() => {
    if (token) {
      fetchVideos();
      fetchPdfs();
    }
  }, [token]);

  // Handle file input change for videos
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // Handle file input change for PDFs
  const handlePdfFileChange = (e) => {
    setPdfFile(e.target.files[0]);
  };

  // Handle video upload
  const handleUpload = async () => {
    if (!file || !title || !description) {
      showSliderAlert('Please fill all fields and select a file.', 'error');
      return;
    }

    const formData = new FormData();
    formData.append('video', file);
    formData.append('title', title);
    formData.append('description', description);

    try {
      const response = await axios.post('https://3fb8-2401-4900-1c31-1fac-d8ff-87b1-7ad3-e997.ngrok-free.app/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: token,
        },
      });

      showSliderAlert('Video uploaded successfully!', 'success');
      fetchVideos(); // Refresh the video list
    } catch (error) {
      console.error('Error uploading video:', error);
      showSliderAlert('Error uploading video.', 'error');
    }
  };

  // Handle PDF upload
  const handlePdfUpload = async () => {
    if (!pdfFile || !pdfTitle || !pdfDescription) {
      showSliderAlert('Please fill all fields and select a PDF file.', 'error');
      return;
    }

    const formData = new FormData();
    formData.append('pdf', pdfFile);
    formData.append('title', pdfTitle);
    formData.append('description', pdfDescription);

    try {
      const response = await axios.post('https://3fb8-2401-4900-1c31-1fac-d8ff-87b1-7ad3-e997.ngrok-free.app/api/upload-pdf', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: token,
        },
      });

      showSliderAlert('PDF uploaded successfully!', 'success');
      fetchPdfs(); // Refresh the PDF list
    } catch (error) {
      console.error('Error uploading PDF:', error);
      showSliderAlert('Error uploading PDF.', 'error');
    }
  };

  // Fetch all videos
  const fetchVideos = async () => {
    try {
      const response = await axios.get('https://3fb8-2401-4900-1c31-1fac-d8ff-87b1-7ad3-e997.ngrok-free.app/api/videos');
      setVideos(response.data);
    } catch (error) {
      console.error('Error fetching videos:', error);
    }
  };

  // Fetch all PDFs
  const fetchPdfs = async () => {
    try {
      const response = await axios.get('https://3fb8-2401-4900-1c31-1fac-d8ff-87b1-7ad3-e997.ngrok-free.app/api/pdfs');
      setPdfs(response.data);
    } catch (error) {
      console.error('Error fetching PDFs:', error);
    }
  };

  // Handle video deletion (only for admin)
  const handleDelete = async (id) => {
    try {
      await axios.delete(`https://3fb8-2401-4900-1c31-1fac-d8ff-87b1-7ad3-e997.ngrok-free.app/api/videos/${id}`, {
        headers: {
          Authorization: token,
        },
      });

      showSliderAlert('Video deleted successfully!', 'success');
      fetchVideos(); // Refresh the video list
    } catch (error) {
      console.error('Error deleting video:', error);
      showSliderAlert('Error deleting video.', 'error');
    }
  };

  // Handle PDF deletion (only for admin)
  const handlePdfDelete = async (id) => {
    try {
      await axios.delete(`https://3fb8-2401-4900-1c31-1fac-d8ff-87b1-7ad3-e997.ngrok-free.app/api/pdfs/${id}`, {
        headers: {
          Authorization: token,
        },
      });

      showSliderAlert('PDF deleted successfully!', 'success');
      fetchPdfs(); // Refresh the PDF list
    } catch (error) {
      console.error('Error deleting PDF:', error);
      showSliderAlert('Error deleting PDF.', 'error');
    }
  };

  // Handle login
  const handleLogin = async () => {
    if (!username || !password) {
      showSliderAlert('Please enter both username and password.', 'error');
      return;
    }

    try {
      const response = await axios.post('https://3fb8-2401-4900-1c31-1fac-d8ff-87b1-7ad3-e997.ngrok-free.app/api/login', {
        username,
        password,
      });

      setToken(response.data.token);
      setRole(response.data.role);
      showSliderAlert('Login successful!', 'success');
    } catch (error) {
      console.error('Error logging in:', error);
      showSliderAlert('Error logging in.', 'error');
    }
  };

  // Handle signup
  const handleSignup = async () => {
    if (!username || !password) {
      showSliderAlert('Please enter both username and password.', 'error');
      return;
    }

    try {
      const response = await axios.post('https://3fb8-2401-4900-1c31-1fac-d8ff-87b1-7ad3-e997.ngrok-free.app/api/register', {
        username,
        password,
      });

      showSliderAlert(`Signup successful! You are a ${response.data.role}. Please log in.`, 'success');
      setIsLogin(true); // Switch to login form after signup
    } catch (error) {
      console.error('Error signing up:', error);
      showSliderAlert('Error signing up.', 'error');
    }
  };

  // Handle logout
  const handleLogout = () => {
    setToken(null);
    setRole(null);
    setVideos([]);
    setPdfs([]);
    showSliderAlert('Logged out successfully!', 'success');
  };

  // Slider settings for the middle section
  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Slider Alert */}
      {showAlert && (
        <SliderAlert
          message={alertMessage}
          type={alertType}
          onClose={hideSliderAlert}
        />
      )}

      {/* Header */}
      <header className="bg-gray-800 shadow-lg p-2">
        <div className="container flex justify-between items-end">
          {/* Logo and Text Group (aligned to the left) */}
          <div className="flex items-center space-x-4">
            {/* Logo (larger size) */}
            <div className="w-[60px] h-[60px] bg-gray-800 rounded-lg flex items-center justify-center overflow-hidden">
              {/* Logo with effects */}
              <div className="shape relative w-[40px] h-[40px] bg-blue-500 transform-style-preserve-3d rounded-full shadow-lg overflow-hidden">
                <img
                  src="https://www.nicepng.com/png/full/6-69959_blue-graduation-cap-png-graduation-hat-png-blue.png"
                  alt="Logo"
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 scale-100 w-[80%] h-[80%] z-20 transform-style-preserve-3d rounded-full shadow-lg overflow-hidden"
                />
              </div>
            </div>

            {/* Guruvayur and Academy Text (stacked vertically) */}
            <div className="flex flex-col items-start">
              <h1 className="text-xl font-poppins font-semibold whitespace-nowrap">Guruvayur</h1>
              <h1 className="text-xl font-poppins font-semibold whitespace-nowrap">Academy</h1>
            </div>
          </div>

          {/* Login/Signup Form Group (aligned to the right) */}
          <div className="ml-200">
            {!token ? (
              <div className="flex flex-col sm:flex-row items-center justify-end space-y-4 sm:space-y-0 sm:space-x-4">
  <input
    type="text"
    placeholder="Username"
    value={username}
    onChange={(e) => setUsername(e.target.value)}
    className="p-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
  />
  <input
    type="password"
    placeholder="Password"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    className="p-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:w-auto"
  />
  {isLogin ? (
    <>
      <button
        onClick={handleLogin}
        disabled={!username || !password}
        className={`bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-300 w-full sm:w-auto ${
          !username || !password ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        Login
      </button>
      <button
        onClick={() => setIsLogin(false)}
        className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition duration-300 w-full sm:w-auto"
      >
        Signup
      </button>
    </>
  ) : (
    <>
      <button
        onClick={handleSignup}
        disabled={!username || !password}
        className={`bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 transition duration-300 w-full sm:w-auto ${
          !username || !password ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        Signup
      </button>
      <button
        onClick={() => setIsLogin(true)}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition duration-300 w-full sm:w-auto"
      >
        Login
      </button>
    </>
  )}
</div>
            ) : (
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition duration-300"
              >
                Logout
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Middle Section with Slider Images (Conditional Rendering) */}
      {!token && (
        <div className="my-10">
          <Slider {...sliderSettings}>
            <div>
              <img
                src="https://github.com/kartikay07/myimg/blob/main/zeeconvert-com%20(1).jpg?raw=true"
                alt="Slide 1"
                className="w-full h-auto object-contain "
              />
            </div>
            <div>
              <img
                src="https://github.com/kartikay07/myimg/blob/main/zeeconvert-com%20(2).jpg?raw=true"
                alt="Slide 2"
                className="w-full h-auto object-contain"
              />
            </div>
            <div>
              <img
                src="https://github.com/kartikay07/myimg/blob/main/zeeconvert-com%20(3).jpg?raw=true"
                alt="Slide 3"
                className="w-full h-auto object-contain"
              />
            </div>
            <div>
              <img
                src="https://github.com/kartikay07/myimg/blob/main/zeeconvert-com.gif?raw=true"
                alt="Slide 4"
                className="w-full h-auto object-contain"
              />
            </div>
          </Slider>
        </div>
      )}

      {/* Main Content */}
      {token && (
        <main className="container mx-auto p-4">
          {/* Section Toggle Buttons */}
          <div className="flex justify-center space-x-4 mb-8">
            <button
              onClick={() => setActiveSection('videos')}
              className={`px-6 py-2 rounded-lg ${
                activeSection === 'videos'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
              }`}
            >
              Videos
            </button>
            <button
              onClick={() => setActiveSection('pdfs')}
              className={`px-6 py-2 rounded-lg ${
                activeSection === 'pdfs'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
              }`}
            >
              PDFs
            </button>
          </div>

          {/* Upload Video Form (only for admin) */}
          {role === 'admin' && activeSection === 'videos' && (
            <div className="bg-gray-800 p-6 rounded-lg shadow-md mb-8">
              <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                Upload a New Video
              </h2>
              <input
                type="text"
                placeholder="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full mb-4 p-3 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <textarea
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full mb-4 p-3 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="file"
                accept="video/*"
                onChange={handleFileChange}
                className="mb-4 w-full p-2 rounded-lg bg-gray-700 text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-500 file:text-white hover:file:bg-blue-600 transition duration-300"
              />
              <button
                onClick={handleUpload}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-lg shadow-lg hover:from-blue-600 hover:to-purple-600 hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                Upload Video
              </button>
            </div>
          )}

          {/* Upload PDF Form (only for admin) */}
          {role === 'admin' && activeSection === 'pdfs' && (
            <div className="bg-gray-800 p-6 rounded-lg shadow-md mb-8">
              <h2 className="text-2xl font-bold mb-4 bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                Upload a New PDF
              </h2>
              <input
                type="text"
                placeholder="Title"
                value={pdfTitle}
                onChange={(e) => setPdfTitle(e.target.value)}
                className="w-full mb-4 p-3 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <textarea
                placeholder="Description"
                value={pdfDescription}
                onChange={(e) => setPdfDescription(e.target.value)}
                className="w-full mb-4 p-3 rounded-lg bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                type="file"
                accept="application/pdf"
                onChange={handlePdfFileChange}
                className="mb-4 w-full p-2 rounded-lg bg-gray-700 text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-blue-500 file:text-white hover:file:bg-blue-600 transition duration-300"
              />
              <button
                onClick={handlePdfUpload}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-lg shadow-lg hover:from-blue-600 hover:to-purple-600 hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                Upload PDF
              </button>
            </div>
          )}

          {/* Video Grid (for all users) */}
          {activeSection === 'videos' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {videos.map((video) => (
                <div
                  key={video._id}
                  className="bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 transform hover:scale-105"
                >
                  {/* Video Thumbnail */}
                  <video
                    controls
                    src={`https://3fb8-2401-4900-1c31-1fac-d8ff-87b1-7ad3-e997.ngrok-free.app${video.filePath}`}
                    className="w-full h-48 object-cover hover:scale-105 transition-transform duration-300"
                  />

                  {/* Video Details */}
                  <div className="p-4">
                    {/* Video Title with Gradient Text */}
                    <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent border-b-2 border-purple-500 pb-2">
                      {video.title}
                    </h3>

                    {/* Video Description with Improved Readability */}
                    <p className="text-gray-300 text-sm leading-relaxed mb-4">
                      {video.description}
                    </p>

                    {/* Delete Button with Hover Animation (only for admin) */}
                    {role === 'admin' && (
                      <div className="p-4">
                        <button
                          onClick={() => handleDelete(video._id)}
                          className="w-full bg-gradient-to-r from-red-500 to-pink-500 text-white px-6 py-3 rounded-lg shadow-lg hover:shadow-xl hover:from-red-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-5 h-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span>Delete Video</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* PDF Grid (for all users) */}
          {activeSection === 'pdfs' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {pdfs.map((pdf) => (
                <div
                  key={pdf._id}
                  className="bg-gray-800 rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 transform hover:scale-105"
                >
                  {/* PDF Details */}
                  <div className="p-4">
                    {/* PDF Title with Gradient Text */}
                    <h3 className="text-2xl font-bold mb-2 bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent border-b-2 border-purple-500 pb-2">
                      {pdf.title}
                    </h3>

                    {/* PDF Description with Improved Readability */}
                    <p className="text-gray-300 text-sm leading-relaxed mb-4">
                      {pdf.description}
                    </p>

                    {/* View PDF Link */}
                    <a
                      href={`https://3fb8-2401-4900-1c31-1fac-d8ff-87b1-7ad3-e997.ngrok-free.app${pdf.filePath}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-400"
                    >
                      View PDF
                    </a>

                    {/* Delete Button with Hover Animation (only for admin) */}
                    {role === 'admin' && (
                      <div className="p-4">
                        <button
                          onClick={() => handlePdfDelete(pdf._id)}
                          className="w-full bg-gradient-to-r from-red-500 to-pink-500 text-white px-6 py-3 rounded-lg shadow-lg hover:shadow-xl hover:from-red-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 flex items-center justify-center space-x-2"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-5 h-5"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span>Delete PDF</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      )}

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-8">
        <div className="container mx-auto text-center">
          <div className="flex justify-center space-x-6 mb-4">
            {/* Instagram */}
            <a
              href="https://www.instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition duration-300"
            >
              <FaInstagram className="w-6 h-6" />
            </a>

            {/* Facebook */}
            <a
              href="https://www.facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition duration-300"
            >
              <FaFacebook className="w-6 h-6" />
            </a>

            {/* GitHub */}
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition duration-300"
            >
              <FaGithub className="w-6 h-6" />
            </a>

            {/* LinkedIn */}
            <a
              href="https://www.linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition duration-300"
            >
              <FaLinkedin className="w-6 h-6" />
            </a>

            {/* Twitter */}
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-white transition duration-300"
            >
              <FaTwitter className="w-6 h-6" />
            </a>
          </div>

          <p className="text-sm text-gray-400">
            &copy; 2025 Guruvayur Academy. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;