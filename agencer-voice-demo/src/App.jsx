import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useConversation } from '@elevenlabs/react';

function App() {
  const [messages, setMessages] = useState([]);
  const [agentId, setAgentId] = useState('');
  const [isConfigured, setIsConfigured] = useState(false);
  const [error, setError] = useState(null);
  const [inputVolume, setInputVolume] = useState(0);
  const [outputVolume, setOutputVolume] = useState(0);
  const messagesEndRef = useRef(null);
  const volumeIntervalRef = useRef(null);

  // ElevenLabs Conversational AI hook
  const conversation = useConversation({
    onConnect: () => {
      console.log('Connected to ElevenLabs');
      setError(null);
    },
    onDisconnect: () => {
      console.log('Disconnected from ElevenLabs');
      stopVolumeMonitoring();
    },
    onMessage: (message) => {
      console.log('Message received:', message);
      // Handle different message types from the conversation
      if (message.type === 'transcript' || message.source) {
        const role = message.source === 'user' ? 'user' : 'assistant';
        const text = message.message || message.text || message.transcript;
        if (text) {
          setMessages((prev) => {
            // Check if this is an update to an in-progress message
            const lastMsg = prev[prev.length - 1];
            if (lastMsg && lastMsg.role === role && !lastMsg.isFinal) {
              // Update the last message
              return [
                ...prev.slice(0, -1),
                { ...lastMsg, text, isFinal: message.isFinal !== false }
              ];
            }
            // Add new message
            return [...prev, { role, text, isFinal: message.isFinal !== false, id: Date.now() }];
          });
        }
      }
    },
    onError: (err) => {
      console.error('Conversation error:', err);
      setError(err.message || 'An error occurred');
    },
    onModeChange: (mode) => {
      console.log('Mode changed:', mode);
    },
  });

  const { status, isSpeaking } = conversation;

  // Start volume monitoring when connected
  const startVolumeMonitoring = useCallback(() => {
    if (volumeIntervalRef.current) return;
    volumeIntervalRef.current = setInterval(() => {
      try {
        const input = conversation.getInputVolume?.() || 0;
        const output = conversation.getOutputVolume?.() || 0;
        setInputVolume(input);
        setOutputVolume(output);
      } catch {
        // Ignore errors during volume monitoring
      }
    }, 100);
  }, [conversation]);

  const stopVolumeMonitoring = useCallback(() => {
    if (volumeIntervalRef.current) {
      clearInterval(volumeIntervalRef.current);
      volumeIntervalRef.current = null;
    }
    setInputVolume(0);
    setOutputVolume(0);
  }, []);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Cleanup on unmount
  useEffect(() => {
    return () => stopVolumeMonitoring();
  }, [stopVolumeMonitoring]);

  // Start conversation
  const handleStart = useCallback(async () => {
    if (!agentId.trim()) {
      setError('Please enter an Agent ID');
      return;
    }

    setError(null);
    setMessages([]);

    try {
      await conversation.startSession({
        agentId: agentId.trim(),
        connectionType: 'webrtc',
      });
      startVolumeMonitoring();
    } catch (err) {
      console.error('Failed to start conversation:', err);
      setError(err.message || 'Failed to connect. Check your Agent ID.');
    }
  }, [agentId, conversation, startVolumeMonitoring]);

  // End conversation
  const handleEnd = useCallback(async () => {
    try {
      await conversation.endSession();
      stopVolumeMonitoring();
    } catch (err) {
      console.error('Failed to end conversation:', err);
    }
  }, [conversation, stopVolumeMonitoring]);

  // Handle Enter key in input
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !isConfigured) {
      e.preventDefault();
      setIsConfigured(true);
    }
  }, [isConfigured]);

  // Get current state for display
  const getStatusInfo = () => {
    if (status === 'connected') {
      if (isSpeaking) {
        return { text: 'Agencer is speaking...', className: 'speaking' };
      }
      return { text: 'Listening...', className: 'listening' };
    }
    return { text: 'Ready to connect', className: '' };
  };

  const statusInfo = getStatusInfo();
  const isConnected = status === 'connected';

  // Initial setup screen
  if (!isConfigured) {
    return (
      <div className="container">
        <header>
          <h1>Agencer</h1>
          <p className="subtitle">Voice-First AI Orchestration</p>
        </header>

        <main className="setup-screen">
          <div className="setup-card">
            <h2>Connect Your Agent</h2>
            <p className="setup-description">
              Enter your ElevenLabs Agent ID to start a voice conversation.
              <br />
              <a href="https://elevenlabs.io/app/conversational-ai" target="_blank" rel="noopener noreferrer">
                Create an agent in the ElevenLabs dashboard
              </a>
            </p>

            <div className="input-group">
              <label htmlFor="agentId">Agent ID</label>
              <input
                type="text"
                id="agentId"
                value={agentId}
                onChange={(e) => setAgentId(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="e.g., abc123def456..."
                autoFocus
              />
            </div>

            <button
              className="primary-button"
              onClick={() => setIsConfigured(true)}
              disabled={!agentId.trim()}
            >
              Continue
            </button>

            <div className="setup-help">
              <h3>How to get your Agent ID:</h3>
              <ol>
                <li>Go to <a href="https://elevenlabs.io/app/conversational-ai" target="_blank" rel="noopener noreferrer">ElevenLabs Conversational AI</a></li>
                <li>Create a new agent or select an existing one</li>
                <li>Configure it with Claude as the LLM</li>
                <li>Copy the Agent ID from the agent settings</li>
              </ol>
            </div>
          </div>
        </main>

        <footer>
          <p>Powered by ElevenLabs Conversational AI & Claude Opus 4.5</p>
        </footer>
      </div>
    );
  }

  return (
    <div className="container">
      <header>
        <h1>Agencer</h1>
        <p className="subtitle">Voice-First AI Orchestration</p>
      </header>

      <main>
        <div className="conversation">
          {messages.length === 0 && !isConnected && (
            <div className="message assistant">
              <div className="message-content welcome">
                Click the button below to start talking with Agencer.
              </div>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div key={msg.id || idx} className={`message ${msg.role}`}>
              <div className="message-label">
                {msg.role === 'user' ? 'You' : 'Agencer'}
              </div>
              <div className={`message-content ${!msg.isFinal ? 'interim' : ''}`}>
                {msg.text}
              </div>
            </div>
          ))}

          <div ref={messagesEndRef} />
        </div>

        {error && (
          <div className="error-banner">
            {error}
          </div>
        )}

        <div className="controls">
          <div className={`status ${statusInfo.className}`}>
            {statusInfo.text}
          </div>

          {/* Volume indicators */}
          {isConnected && (
            <div className="volume-indicators">
              <div className="volume-bar">
                <span className="volume-label">Mic</span>
                <div className="volume-track">
                  <div
                    className="volume-fill input"
                    style={{ width: `${Math.min(inputVolume * 100, 100)}%` }}
                  />
                </div>
              </div>
              <div className="volume-bar">
                <span className="volume-label">Speaker</span>
                <div className="volume-track">
                  <div
                    className="volume-fill output"
                    style={{ width: `${Math.min(outputVolume * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          <button
            className={`mic-button ${isConnected ? 'active' : ''} ${isSpeaking ? 'speaking' : ''}`}
            onClick={isConnected ? handleEnd : handleStart}
            aria-label={isConnected ? 'End conversation' : 'Start conversation'}
          >
            {isConnected ? (
              <svg className="mic-icon" viewBox="0 0 24 24" fill="currentColor">
                <rect x="4" y="4" width="16" height="16" rx="2" />
              </svg>
            ) : (
              <svg className="mic-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                <line x1="12" y1="19" x2="12" y2="23"/>
                <line x1="8" y1="23" x2="16" y2="23"/>
              </svg>
            )}
            <div className="pulse-ring"></div>
          </button>

          <button
            className="secondary-button"
            onClick={() => {
              if (isConnected) handleEnd();
              setIsConfigured(false);
              setMessages([]);
              setError(null);
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 20v-6M6 20V10M18 20V4"/>
            </svg>
            Change Agent
          </button>
        </div>
      </main>

      <footer>
        <p>Powered by ElevenLabs Conversational AI & Claude Opus 4.5</p>
      </footer>
    </div>
  );
}

export default App;
