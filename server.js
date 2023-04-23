require('dotenv').config();
const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const mime = require('mime');
const Album = require('./models/model.js');

const app = express();
const port = process.env.PORT;

app.use(
  express.json(),
  express.static(path.join(__dirname, '.'))
);

// connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.log('Error connecting to MongoDB', err));

// serve index.html from src/html folder
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, './index.html'));
});

// get all albums - works
app.get('/api/albums', async (req, res) => {
  const albums = await Album.find();
  if (!albums) return res.status(404).send('No albums found');
  res.json(albums);
});

// get album by title - works
app.get('/api/albums/:title', async (req, res) => {
  if (!req.params.title) return res.status(400).send('Missing required fields');
  try {
    const album = await Album.findOne({ title: req.params.title });
    if (!album) return res.status(404).send('Album not found');
    res.json(album);
  } catch (err) {
    res.status(404).send(err.message);
  }
});

// add new album - works
app.post('/api/albums', async (req, res) => {
  // check if required fields are missing or empty
  if (!req.body.title || !req.body.artist || !req.body.year || req.body.title === '' || req.body.artist === '' || req.body.year === '') return res.status(400).send('Missing required fields');
  // look for duplicate album
  const findDuplicate = await Album.findOne({ title: req.body.title, artist: req.body.artist, year: req.body.year });
  if (findDuplicate) return res.status(409).send('Conflict: Album already exists');

  try {
    const newAlbum = await Album.create({
      title: req.body.title,
      artist: req.body.artist,
      year: req.body.year
    });
    res.status(201).json(newAlbum);
  } catch (err) {
    res.status(404).send(err.message);
  }
});

// update album - works
app.put('/api/albums/:id', async (req, res) => {
  if (!req.params.id) return res.status(400).send('Missing required fields');
  try {
    const updatedAlbum = await Album.findByIdAndUpdate(req.params.id, {
      title: req.body.title,
      artist: req.body.artist,
      year: req.body.year
    }, { new: true });
    if (!updatedAlbum) return res.status(404).send('Album not found');
    res.status(201).json(updatedAlbum);
  } catch (err) {
    res.status(404).send(err.message);
  }
});

// delete album - works
app.delete('/api/albums/:id', async (req, res) => {
  if (!req.params.id) return res.status(400).send('Missing required fields');
  try {
    const deletedAlbum = await Album.findByIdAndDelete(req.params.id);
    if (!deletedAlbum) return res.status(404).send('Album not found');
    res.status(201).json(deletedAlbum);
  } catch (err) {
    res.status(404).send(err.message);
  }
});

app.listen(port, () => console.log(`Server listening on port ${port}`));