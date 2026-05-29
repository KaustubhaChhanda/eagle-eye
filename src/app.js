const express = require('express');
const cors = require('cors');

const locationRoutes = require('./routes/location');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', locationRoutes);

// basic health
app.get('/health', (req, res) => res.json({ status: 'ok' }));

module.exports = app;
