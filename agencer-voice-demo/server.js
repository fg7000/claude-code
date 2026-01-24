import express from 'express';
import cors from 'cors';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Serve static files from dist (production build)
app.use(express.static(join(__dirname, 'dist')));

/**
 * Generate a signed URL for private ElevenLabs agents
 *
 * This endpoint is only needed if your agent has authentication enabled.
 * For public agents, you can connect directly with just the agent ID.
 *
 * To use this:
 * 1. Set ELEVENLABS_API_KEY in your .env file
 * 2. Set ELEVENLABS_AGENT_ID in your .env file
 * 3. Enable authentication on your agent in the ElevenLabs dashboard
 */
app.get('/api/signed-url', async (req, res) => {
  try {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    const agentId = process.env.ELEVENLABS_AGENT_ID;

    if (!apiKey || !agentId) {
      return res.status(400).json({
        error: 'Missing ELEVENLABS_API_KEY or ELEVENLABS_AGENT_ID in environment',
      });
    }

    // Request a signed URL from ElevenLabs
    const response = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversation/get_signed_url?agent_id=${agentId}`,
      {
        method: 'GET',
        headers: {
          'xi-api-key': apiKey,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ElevenLabs signed URL error:', errorText);
      return res.status(response.status).json({
        error: 'Failed to get signed URL from ElevenLabs',
      });
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Signed URL error:', error);
    res.status(500).json({ error: 'Failed to generate signed URL' });
  }
});

/**
 * Generate a conversation token for WebRTC connections
 */
app.get('/api/conversation-token', async (req, res) => {
  try {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    const agentId = process.env.ELEVENLABS_AGENT_ID;

    if (!apiKey || !agentId) {
      return res.status(400).json({
        error: 'Missing ELEVENLABS_API_KEY or ELEVENLABS_AGENT_ID in environment',
      });
    }

    // Request a conversation token from ElevenLabs
    const response = await fetch(
      `https://api.elevenlabs.io/v1/convai/conversation/get_conversation_token?agent_id=${agentId}`,
      {
        method: 'GET',
        headers: {
          'xi-api-key': apiKey,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('ElevenLabs conversation token error:', errorText);
      return res.status(response.status).json({
        error: 'Failed to get conversation token from ElevenLabs',
      });
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Conversation token error:', error);
    res.status(500).json({ error: 'Failed to generate conversation token' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Serve the React app for all other routes (SPA support)
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`\n🎙️  Agencer Voice Demo Server running at http://localhost:${PORT}`);
  console.log('\n📋 Setup Instructions:');
  console.log('   1. Create an agent at https://elevenlabs.io/app/conversational-ai');
  console.log('   2. Configure it with Claude as the LLM');
  console.log('   3. Copy the Agent ID');
  console.log('   4. Paste it in the web interface\n');

  if (process.env.ELEVENLABS_AGENT_ID) {
    console.log(`   Pre-configured Agent ID: ${process.env.ELEVENLABS_AGENT_ID}\n`);
  }
});
