const express = require('express');
const morgan = require('morgan');
const { createProxyMiddleware } = require('http-proxy-middleware');
const { rateLimit } = require('express-rate-limit');
const axios = require('axios');

const app = express();

const PORT = 3004;

const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 100 request per 15 minites
	limit: 100, 
});

app.use(morgan("combined"));
app.use(limiter);

app.use('/bookingRequest', async (req, res, next) => {
    try {
        const response = await axios.get('http://localhost:3001/api/v1/isAuthenticated', {
            headers: {
                'x-access-token' : req.headers['x-access-token'],
            }
        });
        if(response.data.success) next();
        else res.status(401).json({
            message: "Unautherized",
        })
    } catch (error) {
        res.status(401).json({
            message: 'Unautherized',
        })
    }
});

app.use('/bookingRequest', createProxyMiddleware({
    target: 'http://localhost:3002/bookingRequest',
    changeOrigin: true
}));

app.listen(PORT, () => {
    console.log(`Server is running on PORT: ${PORT}`);
});