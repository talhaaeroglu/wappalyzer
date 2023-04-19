const express = require('express');
const bodyParser = require('body-parser');
const { exec } = require('child_process');
const crypto = require('crypto');

const app = express();
app.use(bodyParser.json());

app.get('/analyze', (req, res) => {
  const url = req.query.url;

  if (!url) {
    return res.status(400).json({ error: 'URL parameter is required' });
  }

  const containerName = `wappalyzer-${crypto.randomBytes(4).toString('hex')}`;

  exec(
    `docker run --rm --name ${containerName} wappalyzer/cli wappalyzer --json ${url}`,
    (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        return res
          .status(500)
          .json({ error: 'An error occurred while analyzing the website', stderr: stderr });
      }

      try {
        const wappalyzerOutput = JSON.parse(stdout);
        res.json(wappalyzerOutput);
      } catch (e) {
        console.error(`Error parsing Wappalyzer output: ${e}`);
        res
          .status(500)
          .json({ error: 'An error occurred while parsing Wappalyzer output' });
      }
    }
  );
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
