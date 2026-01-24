// Agencer Voice Demo - Frontend Logic

class AgencerVoice {
  constructor() {
    this.micButton = document.getElementById('micButton');
    this.resetButton = document.getElementById('resetButton');
    this.statusEl = document.getElementById('status');
    this.conversationEl = document.getElementById('conversation');

    this.isRecording = false;
    this.isProcessing = false;
    this.recognition = null;
    this.audioContext = null;
    this.currentAudio = null;
    this.sessionId = this.generateSessionId();

    this.init();
  }

  generateSessionId() {
    return 'session_' + Math.random().toString(36).substring(2, 15);
  }

  init() {
    // Check for speech recognition support
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      this.setStatus('Speech recognition not supported in this browser', 'error');
      this.micButton.classList.add('disabled');
      return;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = false;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';

    this.recognition.onstart = () => {
      this.isRecording = true;
      this.micButton.classList.add('recording');
      this.setStatus('Listening...', 'recording');
    };

    this.recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0].transcript)
        .join('');

      // Show interim results
      if (event.results[0].isFinal) {
        this.handleUserMessage(transcript);
      }
    };

    this.recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      this.stopRecording();

      if (event.error === 'no-speech') {
        this.setStatus('No speech detected. Try again.', '');
      } else if (event.error === 'not-allowed') {
        this.setStatus('Microphone access denied. Please allow microphone access.', 'error');
      } else {
        this.setStatus('Error: ' + event.error, 'error');
      }
    };

    this.recognition.onend = () => {
      this.isRecording = false;
      this.micButton.classList.remove('recording');
      if (!this.isProcessing) {
        this.setStatus('Ready', '');
      }
    };

    // Event listeners
    this.micButton.addEventListener('click', () => this.toggleRecording());
    this.resetButton.addEventListener('click', () => this.resetConversation());

    // Initialize audio context on first user interaction
    document.addEventListener('click', () => {
      if (!this.audioContext) {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      }
    }, { once: true });
  }

  toggleRecording() {
    if (this.isProcessing) return;

    if (this.isRecording) {
      this.stopRecording();
    } else {
      this.startRecording();
    }
  }

  startRecording() {
    // Stop any playing audio
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio = null;
    }

    try {
      this.recognition.start();
    } catch (error) {
      console.error('Error starting recognition:', error);
    }
  }

  stopRecording() {
    try {
      this.recognition.stop();
    } catch (error) {
      console.error('Error stopping recognition:', error);
    }
  }

  async handleUserMessage(text) {
    if (!text.trim()) return;

    this.isProcessing = true;
    this.micButton.classList.add('disabled');

    // Add user message to conversation
    this.addMessage(text, 'user');

    // Show thinking state
    this.setStatus('Thinking...', 'thinking');
    const thinkingMessage = this.addThinkingMessage();

    try {
      // Get response from Claude
      const response = await this.chat(text);

      // Remove thinking message
      thinkingMessage.remove();

      // Add assistant message
      this.addMessage(response, 'assistant');

      // Speak the response
      this.setStatus('Speaking...', 'speaking');
      await this.speak(response);

      this.setStatus('Ready', '');
    } catch (error) {
      console.error('Error:', error);
      thinkingMessage.remove();
      this.addMessage('Sorry, I encountered an error. Please try again.', 'assistant');
      this.setStatus('Error occurred', 'error');
      setTimeout(() => this.setStatus('Ready', ''), 2000);
    } finally {
      this.isProcessing = false;
      this.micButton.classList.remove('disabled');
    }
  }

  async chat(message) {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        sessionId: this.sessionId,
      }),
    });

    if (!response.ok) {
      throw new Error('Chat API error');
    }

    const data = await response.json();
    return data.response;
  }

  async speak(text) {
    return new Promise(async (resolve, reject) => {
      try {
        const response = await fetch('/api/speak', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ text }),
        });

        if (!response.ok) {
          throw new Error('Speak API error');
        }

        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);

        this.currentAudio = new Audio(audioUrl);

        this.currentAudio.onended = () => {
          URL.revokeObjectURL(audioUrl);
          this.currentAudio = null;
          resolve();
        };

        this.currentAudio.onerror = (error) => {
          URL.revokeObjectURL(audioUrl);
          this.currentAudio = null;
          reject(error);
        };

        await this.currentAudio.play();
      } catch (error) {
        reject(error);
      }
    });
  }

  addMessage(text, role) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}`;

    const labelDiv = document.createElement('div');
    labelDiv.className = 'message-label';
    labelDiv.textContent = role === 'user' ? 'You' : 'Agencer';

    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.textContent = text;

    messageDiv.appendChild(labelDiv);
    messageDiv.appendChild(contentDiv);

    this.conversationEl.appendChild(messageDiv);
    this.scrollToBottom();

    return messageDiv;
  }

  addThinkingMessage() {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message assistant thinking-message';

    const labelDiv = document.createElement('div');
    labelDiv.className = 'message-label';
    labelDiv.textContent = 'Agencer';

    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.innerHTML = '<div class="loading-dots"><span></span><span></span><span></span></div>';

    messageDiv.appendChild(labelDiv);
    messageDiv.appendChild(contentDiv);

    this.conversationEl.appendChild(messageDiv);
    this.scrollToBottom();

    return messageDiv;
  }

  scrollToBottom() {
    this.conversationEl.scrollTop = this.conversationEl.scrollHeight;
  }

  setStatus(text, state) {
    this.statusEl.textContent = text;
    this.statusEl.className = 'status';
    if (state) {
      this.statusEl.classList.add(state);
    }
  }

  async resetConversation() {
    // Stop any ongoing processes
    if (this.isRecording) {
      this.stopRecording();
    }
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio = null;
    }

    // Reset on server
    try {
      await fetch('/api/reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId: this.sessionId }),
      });
    } catch (error) {
      console.error('Error resetting conversation:', error);
    }

    // Generate new session
    this.sessionId = this.generateSessionId();

    // Clear conversation UI
    this.conversationEl.innerHTML = `
      <div class="message assistant">
        <div class="message-content">
          Click the microphone below to start talking with Agencer.
        </div>
      </div>
    `;

    this.setStatus('Ready', '');
    this.isProcessing = false;
    this.micButton.classList.remove('disabled');
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.agencer = new AgencerVoice();
});
