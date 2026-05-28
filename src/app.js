const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.use('/api/v1', apiRoutes);

app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'online', 
        system: 'Mirrors API Core',
        timestamp: new Date() 
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Mirrors Core System Online. Tuning in on port ${PORT}`);
});