require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser'); // Optional, depending on your needs

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const app = express();
const port = process.env.PORT;

// CORS middleware
app.use(cors({ origin: ['http://192.168.0.6:5173', 'http://localhost:5173', 'http://127.0.0.1:5173', 'http://192.168.0.6:5173'] }));

app.use(bodyParser.json());

//Serve static files from the 'public' directory
app.use(express.static('public'));

// MVC Structure routing
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const genericRoutes = require('./routes/genericRoutes');
const songRoutes = require('./routes/songRoutes');
const communityRoutes = require('./routes/communityRoutes');
const studioRouter = require('./routes/studioRoutes');
const storeRouter = require('./routes/storeRoutes');

app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/app', genericRoutes);
app.use('/song', songRoutes);
app.use('/community', communityRoutes);
app.use('/studio', studioRouter);
app.use('/store', storeRouter);

// Error handling middleware (optional)
// app.use((err, req, res, next) => {
//     console.error(err.stack);
//     res.status(500).send('Something went wrong!');
// });

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

