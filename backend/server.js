const express = require('express');
const multer = require('multer');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { Storage } = require('@google-cloud/storage'); // Import Google Cloud Storage
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/videodb";
const client = new MongoClient(uri);

// Google Cloud Storage setup
const storage = new Storage({
  keyFilename: path.join(__dirname, 'path-to-your-service-account-key.json'), // Path to your service account key file
});
const bucketName = process.env.GCS_BUCKET_NAME || 'your-bucket-name'; // Replace with your bucket name
const bucket = storage.bucket(bucketName);

// File upload setup
const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  },
});

const upload = multer({ storage: multerStorage });

// Serve static files from the 'uploads' folder
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// JWT Secret Key
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Connect to MongoDB and start the server
async function run() {
  try {
    // Connect the client to the server
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db('videodb'); // Replace 'videodb' with your database name
    const videosCollection = db.collection('videos');
    const pdfsCollection = db.collection('pdfs');
    const usersCollection = db.collection('users');

    // Register a new user
    app.post('/api/register', async (req, res) => {
      const { username, password } = req.body;

      // Check if the user already exists
      const existingUser = await usersCollection.findOne({ username });
      if (existingUser) {
        return res.status(400).json({ error: 'Username already exists' });
      }

      // Check if the user is the first user (admin)
      const userCount = await usersCollection.countDocuments();
      const role = userCount === 0 ? 'admin' : 'user'; // First user is admin

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert the user into the database
      await usersCollection.insertOne({ username, password: hashedPassword, role });

      res.json({ message: 'User registered successfully', role });
    });

    // Login and generate JWT
    app.post('/api/login', async (req, res) => {
      const { username, password } = req.body;

      // Find the user in the database
      const user = await usersCollection.findOne({ username });

      if (!user) {
        return res.status(400).json({ error: 'User not found' });
      }

      // Compare the password
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        return res.status(400).json({ error: 'Invalid password' });
      }

      // Generate JWT
      const token = jwt.sign({ username: user.username, role: user.role }, JWT_SECRET, {
        expiresIn: '1h',
      });

      res.json({ token, role: user.role });
    });

    // Middleware to verify JWT
    const authenticate = (req, res, next) => {
      const token = req.headers['authorization'];

      if (!token) {
        return res.status(401).json({ error: 'Unauthorized: No token provided' });
      }

      jwt.verify(token, JWT_SECRET, (err, decoded) => {
        if (err) {
          return res.status(401).json({ error: 'Unauthorized: Invalid token' });
        }

        req.user = decoded;
        next();
      });
    };

    // Upload video endpoint (only for admin)
    app.post('/api/upload', authenticate, upload.single('video'), async (req, res) => {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Unauthorized: Only admin can upload videos.' });
      }

      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded.' });
      }

      const { title, description } = req.body;

      try {
        // Upload the file to Google Cloud Storage
        const blob = bucket.file(req.file.originalname);
        const blobStream = blob.createWriteStream({
          resumable: false,
        });

        blobStream.on('error', (err) => {
          console.error('Error uploading to Google Cloud Storage:', err);
          res.status(500).json({ error: 'Error uploading file.' });
        });

        blobStream.on('finish', async () => {
          // Make the file publicly accessible
          await blob.makePublic();

          // Get the public URL
          const fileUrl = `https://storage.googleapis.com/${bucketName}/${blob.name}`;

          // Save metadata in the database
          const video = {
            title,
            description,
            filePath: fileUrl, // Store the Google Cloud Storage URL
          };

          await videosCollection.insertOne(video);
          res.json({
            message: 'Video uploaded and metadata saved!',
            video,
          });
        });

        blobStream.end(req.file.buffer);
      } catch (error) {
        console.error('Error uploading video:', error);
        res.status(500).json({ error: 'Error uploading video.' });
      }
    });

    // Upload PDF endpoint (only for admin)
    app.post('/api/upload-pdf', authenticate, upload.single('pdf'), async (req, res) => {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Unauthorized: Only admin can upload PDFs.' });
      }

      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded.' });
      }

      const { title, description } = req.body;

      try {
        // Upload the file to Google Cloud Storage
        const blob = bucket.file(req.file.originalname);
        const blobStream = blob.createWriteStream({
          resumable: false,
        });

        blobStream.on('error', (err) => {
          console.error('Error uploading to Google Cloud Storage:', err);
          res.status(500).json({ error: 'Error uploading file.' });
        });

        blobStream.on('finish', async () => {
          // Make the file publicly accessible
          await blob.makePublic();

          // Get the public URL
          const fileUrl = `https://storage.googleapis.com/${bucketName}/${blob.name}`;

          // Save metadata in the database
          const pdf = {
            title,
            description,
            filePath: fileUrl, // Store the Google Cloud Storage URL
          };

          await pdfsCollection.insertOne(pdf);
          res.json({
            message: 'PDF uploaded and metadata saved!',
            pdf,
          });
        });

        blobStream.end(req.file.buffer);
      } catch (error) {
        console.error('Error uploading PDF:', error);
        res.status(500).json({ error: 'Error uploading PDF.' });
      }
    });

    // Fetch all videos (for all users)
    app.get('/api/videos', async (req, res) => {
      try {
        const videos = await videosCollection.find().toArray();
        res.json(videos); // Send JSON response
      } catch (error) {
        console.error('Error fetching videos:', error); // Debugging
        res.status(500).json({ error: 'Error fetching videos.' });
      }
    });

    // Fetch all PDFs (for all users)
    app.get('/api/pdfs', async (req, res) => {
      try {
        const pdfs = await pdfsCollection.find().toArray();
        res.json(pdfs); // Send JSON response
      } catch (error) {
        console.error('Error fetching PDFs:', error); // Debugging
        res.status(500).json({ error: 'Error fetching PDFs.' });
      }
    });

    // Delete a video (only for admin)
    app.delete('/api/videos/:id', authenticate, async (req, res) => {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Unauthorized: Only admin can delete videos.' });
      }

      const { id } = req.params;

      try {
        // Delete the video from the database
        const result = await videosCollection.deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) {
          return res.status(404).json({ error: 'Video not found' });
        }

        res.json({ message: 'Video deleted successfully' });
      } catch (error) {
        console.error('Error deleting video:', error);
        res.status(500).json({ error: 'Error deleting video' });
      }
    });

    // Delete a PDF (only for admin)
    app.delete('/api/pdfs/:id', authenticate, async (req, res) => {
      if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Unauthorized: Only admin can delete PDFs.' });
      }

      const { id } = req.params;

      try {
        // Delete the PDF from the database
        const result = await pdfsCollection.deleteOne({ _id: new ObjectId(id) });

        if (result.deletedCount === 0) {
          return res.status(404).json({ error: 'PDF not found' });
        }

        res.json({ message: 'PDF deleted successfully' });
      } catch (error) {
        console.error('Error deleting PDF:', error);
        res.status(500).json({ error: 'Error deleting PDF' });
      }
    });

    // Start the server
    app.listen(PORT, () => {
      console.log(`Server is running on https://3fb8-2401-4900-1c31-1fac-d8ff-87b1-7ad3-e997.ngrok-free.app:${PORT}`);
    });
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
  }
}

run().catch(console.dir);
module.exports = app;