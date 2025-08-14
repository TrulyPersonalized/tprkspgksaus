const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());

const GITHUB_CLIENT_ID = 'Ov23liY1IeBA190abpYU';
const GITHUB_CLIENT_SECRET = 'd0f95b587cc5b947b823cb0784fc02c733961f38';

app.get('/authenticate/:code', async (req, res) => {
  try {
    const response = await axios.post('https://github.com/login/oauth/access_token', {
      client_id: GITHUB_CLIENT_ID,
      client_secret: GITHUB_CLIENT_SECRET,
      code: req.params.code
    }, {
      headers: {
        Accept: 'application/json'
      }
    });
    
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
