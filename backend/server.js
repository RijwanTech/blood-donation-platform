const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const donorRoutes = require('./routes/donorRoutes.js');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

app.get("/", (req, res) => {
    res.send("aaAAAAA");
});

app.use('/api/donors', donorRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
