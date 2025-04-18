require('dotenv').config();
const express = require('express');
const axios = require('axios');
const app = express();
const port = 3000;

console.log("Loaded API Key:", process.env.GROQ_API_KEY);  // Debug check

app.get('/', (req, res) => {
  res.send('Server is up and running!');
});

const getEnemyStatsFromGroqLLM = async (level) => {
  try {
    const groqAPIUrl = 'https://api.groq.com/openai/v1/chat/completions';

    const requestBody = {
      model: 'llama-3.3-70b-versatile',
      messages: [
        {
          role: 'user',
          content: `Generate unique JSON for 4 enemies: skeleton, eye, mushroom, goblin at level ${level}. Include health, damage, and orb value for each. Format as JSON.`
        }
      ],
      max_tokens: 200,
      temperature: 0.9,
      top_p: 0.9
    };

    const response = await axios.post(groqAPIUrl, requestBody, {
      headers: {
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const content = response.data.choices[0].message.content;
    const cleaned = content.replace(/```json|```/g, '').trim();  // Clean code blocks
    return JSON.parse(cleaned);

  } catch (error) {
    console.error("Error fetching data from Groq LLM:", error.response?.data || error.message);
    return null;
  }
};

app.get('/enemy-stats/:level', async (req, res) => {
    const level = parseInt(req.params.level, 10);
  
    if (isNaN(level)) {
      return res.status(400).json({ error: 'Invalid level' });
    }
  
    const enemyStats = await getEnemyStatsFromGroqLLM(level);
  
    if (enemyStats) {
      // Return stats for all enemies
      return res.json(enemyStats);
    } else {
      return res.status(500).json({ error: 'Failed to fetch enemy stats from Groq LLM' });
    }
});  

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
