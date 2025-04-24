const express = require('express');
const cors = require('cors');
const { nhlClutch } = require('./database');

const app = express();
app.use(cors());

app.get('/nhl-clutch', (req, res) => {
    const data = nhlClutch();
    res.json(data);
});

app.listen(3000, () => console.log('Server running on port 3000'));