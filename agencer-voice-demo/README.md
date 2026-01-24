# Agencer Voice Demo

A voice-enabled web interface for talking to an AI sales assistant powered by Claude Opus 4.5 and ElevenLabs.

## Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up your API keys:**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and add your keys:
   - `ANTHROPIC_API_KEY` - Get from [Anthropic Console](https://console.anthropic.com/)
   - `ELEVENLABS_API_KEY` - Get from [ElevenLabs](https://elevenlabs.io/)

3. **Start the server:**
   ```bash
   npm start
   ```

4. **Open in your browser:**
   ```
   http://localhost:3000
   ```

5. **Click the microphone and start talking!**

## How It Works

- **Voice Input**: Uses the Web Speech API (browser's built-in speech recognition)
- **AI Brain**: Claude Opus 4.5 with the Agencer sales personality
- **Voice Output**: ElevenLabs text-to-speech for natural voice responses

## Features

- Real-time voice recording with visual feedback
- Multi-turn conversation with maintained context
- Streaming audio playback for quick responses
- Clean, minimal interface
- Mobile-friendly design

## API Endpoints

- `POST /api/chat` - Send text message, get AI response
- `POST /api/speak` - Convert text to speech audio
- `POST /api/reset` - Reset conversation history
- `GET /api/health` - Health check

## Browser Support

Requires a modern browser with Web Speech API support:
- Chrome (recommended)
- Edge
- Safari

## Customization

### Change the Voice

Edit `server.js` and change the `voiceId` in the `/api/speak` endpoint. Popular ElevenLabs voice IDs:
- `EXAVITQu4vr4xnSDxMaL` - Sarah (default, warm professional)
- `21m00Tcm4TlvDq8ikWAM` - Rachel (clear, confident)
- `AZnzlk1XvdvUeBnXmlld` - Domi (young, energetic)

### Modify the Personality

The system prompt is in `server.js` as `SYSTEM_PROMPT`. Edit it to change how Agencer responds.

## Troubleshooting

**Microphone not working?**
- Make sure you've granted microphone permissions
- Try using Chrome if on another browser
- Check that no other app is using the microphone

**No audio playback?**
- Verify your ElevenLabs API key is correct
- Check the browser console for errors

**AI not responding?**
- Verify your Anthropic API key is correct
- Check server logs for error messages
