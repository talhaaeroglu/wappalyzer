const express = require('express');
const bodyParser = require('body-parser');
const { exec } = require('child_process');

const app = express();
app.use(bodyParser.json());

app.get('/analyze', (req, res) => {
  const url = req.query.url;

  if (!url) {
    return res.status(400).json({ error: 'URL parameter is required' });
  }

  exec(`docker exec -i wappalyzer-api wappalyzer --json ${url}`, (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return res.status(500).json({ error: 'An error occurred while analyzing the website' });
    }

    try {
      const wappalyzerOutput = JSON.parse(stdout);
      res.json(wappalyzerOutput);
    } catch (e) {
      console.error(`Error parsing Wappalyzer output: ${e}`);
      res.status(500).json({ error: 'An error occurred while parsing Wappalyzer output' });
    }
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
