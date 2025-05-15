// app.js - Complete authentication server without reCAPTCHA
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config(); // This should be early to load .env variables

const app = express();

// Middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: [
                "'self'",
                "'unsafe-inline'", 
                "'unsafe-eval'",   
                "https://js.appboycdn.com" 
            ],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"], 
            connectSrc: [
                "'self'",
                process.env.BRAZE_SDK_ENDPOINT ? `https://${process.env.BRAZE_SDK_ENDPOINT.replace(/^https?:\/\//,'')}` : null,
                'https://api.upmind.io'
            ].filter(Boolean),
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'self'"], 
        },
    },
}));
app.use(cors({
  origin: ['http://localhost:5173', 'https://analyd.com' /* Add your production frontend URL here */]
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.static(__dirname));
app.use(express.static('public'));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
});
app.use('/api/', limiter);

// Upmind service class
class UpmindService {
    constructor() {
        this.loginUrl = 'https://api.upmind.io/oauth/access_token';
        this.registerUrl = 'https://api.upmind.io/api/clients/register';
        this.headers = {
            'Content-Type': 'application/json',
            'Accept': '*/*',
            'Accept-Encoding': 'gzip, deflate, br, zstd',
            'Accept-Language': 'en-US,en;q=0.9',
            'Origin': 'https://analyd.com',
            'Referer': 'https://analyd.com/',
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/136.0.0.0 Safari/537.36'
        };
    }

    async register(userData) {
        try {
            const registrationData = {
                email: userData.email,
                firstname: userData.firstname,
                lastname: userData.lastname,
                phone: userData.phone || null,
                phone_code: userData.phone_code || null,
                phone_country_code: userData.phone_country_code || null,
                username: userData.username || userData.email,
                password: userData.password
            };
            console.log('Registration request:', JSON.stringify(registrationData, null, 2));
            const response = await axios.post(this.registerUrl, registrationData, { headers: this.headers });
            return response.data;
        } catch (error) {
            this.handleError(error);
        }
    }

    async login(username, password) {
        try {
            const response = await axios.post(this.loginUrl, {
                username, password, grant_type: 'password'
            }, { headers: this.headers });
            return response.data;
        } catch (error) {
            this.handleError(error);
        }
    }

    async refreshToken(refreshToken) {
        try {
            const response = await axios.post(this.loginUrl, {
                grant_type: 'refresh_token', refresh_token: refreshToken
            }, { headers: this.headers });
            return response.data;
        } catch (error) {
            this.handleError(error);
        }
    }

    handleError(error) {
        if (error.response) {
            const errorData = error.response.data;
            const errorMessage = errorData.error?.message || errorData.message || 'Authentication failed';
            const customError = new Error(errorMessage);
            customError.status = error.response.status;
            customError.data = errorData;
            throw customError;
        } else {
            const customError = new Error('Authentication request failed');
            customError.status = 500;
            throw customError;
        }
    }
}

const upmindService = new UpmindService();

// Routes
app.post('/api/auth/register', async (req, res, next) => {
    try {
        const { email, firstname, lastname, password, phone, phone_code, phone_country_code } = req.body;
        if (!email || !firstname || !lastname || !password) {
            return res.status(400).json({ success: false, error: 'Email, firstname, lastname, and password are required' });
        }
        const result = await upmindService.register({
            email, firstname, lastname, password, username: email, phone, phone_code, phone_country_code
        });
        res.json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
});

app.post('/api/auth/login', async (req, res, next) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ success: false, error: 'Username and password are required' });
        }
        const result = await upmindService.login(username, password);
        res.json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
});

app.post('/api/auth/refresh', async (req, res, next) => {
    try {
        const { refresh_token } = req.body;
        if (!refresh_token) {
            return res.status(400).json({ success: false, error: 'Refresh token is required' });
        }
        const result = await upmindService.refreshToken(refresh_token);
        res.json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.get('/api/braze-config', (req, res) => {
    const apiKey = process.env.BRAZE_API_KEY;
    const sdkEndpoint = process.env.BRAZE_SDK_ENDPOINT;
    if (!apiKey || !sdkEndpoint) {
        console.error('Braze API Key or SDK Endpoint is not configured in .env file or environment variables.');
        return res.status(500).json({ success: false, error: 'Braze configuration is missing on the server.' });
    }
    res.json({ success: true, apiKey: apiKey, sdkEndpoint: sdkEndpoint });
});

// Error handling
app.use((err, req, res, next) => {
    console.error('Global Error Handler:', err.message);
    if (err.stack) {
        console.error(err.stack);
    }
    const status = err.status || 500;
    res.status(status).json({
        success: false,
        error: err.message || 'An unexpected error occurred',
        details: err.data
    });
});

// Start server
console.log('App script initialized.');
console.log(`Current APP_ENV: ${process.env.APP_ENV}`);


if (!process.env.BRAZE_API_KEY || !process.env.BRAZE_SDK_ENDPOINT) {
    console.warn('\nWARNING: BRAZE_API_KEY or BRAZE_SDK_ENDPOINT is not set. Braze integration might not work correctly.\n');
} else {
    console.log('Braze API Key and SDK Endpoint are configured.');
}

// Check the APP_ENV environment variable
// If APP_ENV is 'local' or not set (default to local behavior), start the server.
// Otherwise, assume it's a Vercel-like environment.
if (process.env.APP_ENV === 'local' || !process.env.APP_ENV) {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server listening locally on port ${PORT}`);
        console.log(`Access it at: http://localhost:${PORT}`);
    });
} else {
    console.log(`Running in '${process.env.APP_ENV}' environment. Vercel (or similar) will handle port binding.`);
}

module.exports = app;