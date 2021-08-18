const express = require('express');

const STUDY = require('./data/study');

const app = express();

/**
 * Allow CORS and setup allowed query types
 */
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept"
    );
    res.setHeader(
        "Access-Control-Allow-Methods",
        "GET"
    );
    next();
});

app.get('/api/study', (req, res, next) =>
    res.status(200).json(STUDY));

module.exports = app;
