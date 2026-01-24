# Agencer Voice Sales Demo

A voice-enabled demo where anyone can talk to an AI sales assistant for Agencer, powered by **Vapi** (voice platform) and **Claude Opus** (LLM).

## Quick Start

### Prerequisites

1. A [Vapi account](https://dashboard.vapi.ai) (free tier available)
2. Node.js (for deployment CLIs) - optional

### Step 1: Create the Vapi Assistant

#### Option A: Via Vapi Dashboard (Recommended)

1. Go to [dashboard.vapi.ai](https://dashboard.vapi.ai)
2. Click **Assistants** → **Create Assistant**
3. Configure the assistant:
   - **Name**: `Agencer Sales Assistant`
   - **Model Provider**: `Anthropic`
   - **Model**: `claude-opus-4-20250514` (or latest Claude Opus)
   - **Voice Provider**: `ElevenLabs`
   - **Voice**: `Rachel` (or any warm, professional voice)
   - **Transcriber**: `Deepgram Nova-2`
4. In **First Message**, paste:
   ```
   Hi, I'm Agencer. I'm your voice-first command center for AI. Instead of juggling ChatGPT, Claude, Gemini, and a dozen other tools, you just talk to me and I orchestrate everything. What brings you here today?
   ```
5. In **System Prompt**, paste the entire contents from the `model.messages[0].content` field in `vapi-config.json`
6. Click **Create**
7. Copy the **Assistant ID** from the URL or details panel

#### Option B: Via API

```bash
# Set your API key
export VAPI_API_KEY="your-private-api-key"

# Create the assistant
curl -X POST https://api.vapi.ai/assistant \
  -H "Authorization: Bearer $VAPI_API_KEY" \
  -H "Content-Type: application/json" \
  -d @vapi-config.json
```

The response will include the assistant ID.

### Step 2: Get Your Vapi Public Key

1. Go to [dashboard.vapi.ai](https://dashboard.vapi.ai)
2. Navigate to **Organization** → **API Keys**
3. Copy your **Public Key** (starts with `pk_...`)

### Step 3: Configure the App

Edit `app.js` and update the CONFIG object:

```javascript
const CONFIG = {
    VAPI_PUBLIC_KEY: 'pk_your_actual_public_key_here',
    ASSISTANT_ID: 'your_assistant_id_here'
};
```

### Step 4: Deploy

#### Option A: Vercel (Recommended)

```bash
# Install Vercel CLI if needed
npm install -g vercel

# Deploy
vercel --prod
```

You'll get a URL like `https://agencer-voice-demo.vercel.app`

#### Option B: Netlify

```bash
# Install Netlify CLI if needed
npm install -g netlify-cli

# Deploy
netlify deploy --prod --dir=.
```

#### Option C: GitHub Pages

1. Push this folder to a GitHub repository
2. Go to Settings → Pages
3. Set Source to the main branch
4. Your site will be at `https://yourusername.github.io/repo-name`

#### Option D: Local Testing

```bash
# Using Python
python3 -m http.server 8000

# Using Node.js
npx serve

# Then open http://localhost:8000
```

### Step 5: Share the URL

Send the deployed URL to anyone. They can:
1. Click the "Start Conversation" button
2. Allow microphone access
3. Start talking to Agencer

No login or account required.

## Project Structure

```
agencer-voice-demo/
├── index.html          # Main page with call button and transcript
├── style.css           # Dark theme styling with Agencer branding
├── app.js              # Vapi SDK integration and event handling
├── vapi-config.json    # Assistant configuration for Vapi API
├── deploy.sh           # Interactive deployment script
└── README.md           # This file
```

## Configuration Reference

### vapi-config.json

This file contains the full assistant configuration for creating via the Vapi API:

| Field | Description |
|-------|-------------|
| `model.provider` | LLM provider (`anthropic` for Claude) |
| `model.model` | Model ID (`claude-opus-4-20250514`) |
| `model.messages` | System prompt defining Agencer's personality |
| `voice.provider` | TTS provider (`11labs` for ElevenLabs) |
| `voice.voiceId` | ElevenLabs voice ID (Rachel: `21m00Tcm4TlvDq8ikWAM`) |
| `transcriber.provider` | STT provider (`deepgram`) |
| `transcriber.model` | Transcription model (`nova-2`) |
| `firstMessage` | What Agencer says when call starts |

### ElevenLabs Voice Options

Popular voices for sales/assistant roles:

| Voice | Voice ID | Style |
|-------|----------|-------|
| Rachel | `21m00Tcm4TlvDq8ikWAM` | Warm, professional female |
| Drew | `29vD33N1CtxCmqQRPOHJ` | Confident male |
| Clyde | `2EiwWnXFnvU5JabPnv8n` | Calm, mature male |
| Bella | `EXAVITQu4vr4xnSDxMaL` | Friendly female |

To change the voice, update `voice.voiceId` in `vapi-config.json` and recreate the assistant.

## Troubleshooting

### "Microphone access denied"
- Ensure the site is served over HTTPS (required for microphone access)
- Check browser permissions for the microphone

### "Failed to initialize"
- Verify your Vapi public key is correct
- Check browser console for detailed errors

### Call doesn't start
- Verify your assistant ID is correct
- Check that the assistant exists in your Vapi dashboard
- Ensure your Vapi account has sufficient credits

### No audio from assistant
- Check your device's audio output settings
- Try a different browser (Chrome recommended)
- Verify ElevenLabs is configured correctly in Vapi

## Costs

Vapi pricing is usage-based. Approximate costs per minute of conversation:

| Component | Cost |
|-----------|------|
| Deepgram STT | ~$0.01/min |
| Claude Opus | ~$0.10-0.30/min (varies by tokens) |
| ElevenLabs TTS | ~$0.05/min |
| **Total** | ~$0.15-0.45/min |

Check [Vapi Pricing](https://vapi.ai/pricing) for current rates.

## Security Notes

- The **public key** is safe to expose in client-side code
- Never expose your **private/secret key** in the frontend
- The assistant ID is safe to share
- All actual API calls (Anthropic, ElevenLabs, Deepgram) are made by Vapi's servers

## License

MIT
