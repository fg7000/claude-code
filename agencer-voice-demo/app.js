/**
 * Agencer Voice Demo - Vapi SDK Integration
 *
 * This app connects to Vapi's voice AI platform to enable
 * real-time voice conversations with the Agencer sales assistant.
 */

// Configuration - Replace with your actual values
const CONFIG = {
    // Your Vapi public key (get from https://dashboard.vapi.ai)
    VAPI_PUBLIC_KEY: 'YOUR_VAPI_PUBLIC_KEY',

    // Your assistant ID (created via Vapi dashboard or API)
    ASSISTANT_ID: 'YOUR_ASSISTANT_ID'
};

// DOM Elements
const callButton = document.getElementById('call-button');
const statusEl = document.getElementById('status');
const statusText = statusEl.querySelector('.status-text');
const transcriptEl = document.getElementById('transcript');
const volumeIndicator = document.getElementById('volume-indicator');

// State
let vapi = null;
let isCallActive = false;

/**
 * Initialize the Vapi SDK
 */
async function initVapi() {
    try {
        // Dynamically import Vapi from CDN
        const { default: Vapi } = await import('https://cdn.jsdelivr.net/npm/@vapi-ai/web@latest/+esm');

        vapi = new Vapi(CONFIG.VAPI_PUBLIC_KEY);

        // Set up event listeners
        setupEventListeners();

        console.log('Vapi initialized successfully');
        updateStatus('ready', 'Ready to connect');

    } catch (error) {
        console.error('Failed to initialize Vapi:', error);
        updateStatus('error', 'Failed to initialize');
        showError('Failed to load voice SDK. Please refresh the page.');
    }
}

/**
 * Set up Vapi event listeners
 */
function setupEventListeners() {
    // Call started
    vapi.on('call-start', () => {
        console.log('Call started');
        isCallActive = true;
        callButton.classList.add('active');
        volumeIndicator.classList.add('active');
        updateStatus('connected', 'Connected');
        clearTranscript();
    });

    // Call ended
    vapi.on('call-end', () => {
        console.log('Call ended');
        isCallActive = false;
        callButton.classList.remove('active');
        volumeIndicator.classList.remove('active');
        updateStatus('ready', 'Ready to connect');
    });

    // Speech started (assistant is speaking)
    vapi.on('speech-start', () => {
        console.log('Assistant speaking');
    });

    // Speech ended
    vapi.on('speech-end', () => {
        console.log('Assistant stopped speaking');
    });

    // Volume level updates
    vapi.on('volume-level', (volume) => {
        updateVolumeIndicator(volume);
    });

    // Messages (transcripts, function calls, etc.)
    vapi.on('message', (message) => {
        console.log('Message received:', message);
        handleMessage(message);
    });

    // Errors
    vapi.on('error', (error) => {
        console.error('Vapi error:', error);
        handleError(error);
    });
}

/**
 * Handle incoming messages
 */
function handleMessage(message) {
    // Handle transcript messages
    if (message.type === 'transcript') {
        addTranscriptMessage(
            message.role,
            message.transcript,
            message.transcriptType === 'partial'
        );
    }

    // Handle conversation updates
    if (message.type === 'conversation-update') {
        // Full conversation update - could be used for sync
        console.log('Conversation updated:', message.conversation);
    }
}

/**
 * Handle errors
 */
function handleError(error) {
    const errorMessage = error.message || error.error?.message || 'An error occurred';

    // Check for specific error types
    if (errorMessage.includes('permission') || errorMessage.includes('microphone')) {
        showError('Microphone access denied. Please allow microphone access and try again.');
    } else if (errorMessage.includes('network') || errorMessage.includes('connection')) {
        showError('Connection error. Please check your internet connection.');
    } else {
        showError(errorMessage);
    }

    updateStatus('error', 'Error occurred');

    // Reset state
    isCallActive = false;
    callButton.classList.remove('active');
    volumeIndicator.classList.remove('active');
}

/**
 * Start or end a call
 */
async function toggleCall() {
    if (!vapi) {
        showError('Voice SDK not initialized. Please refresh the page.');
        return;
    }

    if (isCallActive) {
        // End the call
        try {
            vapi.stop();
        } catch (error) {
            console.error('Error stopping call:', error);
        }
    } else {
        // Start a new call
        try {
            updateStatus('connecting', 'Connecting...');
            callButton.disabled = true;

            // Start the call with the assistant ID
            await vapi.start(CONFIG.ASSISTANT_ID);

            callButton.disabled = false;
        } catch (error) {
            console.error('Error starting call:', error);
            callButton.disabled = false;
            handleError(error);
        }
    }
}

/**
 * Update the status indicator
 */
function updateStatus(state, text) {
    statusEl.className = 'status ' + state;
    statusText.textContent = text;
}

/**
 * Update volume indicator based on audio level
 */
function updateVolumeIndicator(volume) {
    const bars = volumeIndicator.querySelectorAll('.volume-bar');
    const normalizedVolume = Math.min(1, Math.max(0, volume));

    bars.forEach((bar, index) => {
        const threshold = (index + 1) / bars.length;
        const height = normalizedVolume > threshold * 0.8
            ? 8 + (normalizedVolume * 24)
            : 8;
        bar.style.height = `${height}px`;
    });
}

/**
 * Add a message to the transcript
 */
function addTranscriptMessage(role, text, isPartial = false) {
    // Remove placeholder if present
    const placeholder = transcriptEl.querySelector('.transcript-placeholder');
    if (placeholder) {
        placeholder.remove();
    }

    // Check if we should update an existing partial message
    const existingPartial = transcriptEl.querySelector(`.transcript-message.${role}.partial`);

    if (existingPartial) {
        // Update existing partial message
        existingPartial.querySelector('.text').textContent = text;
        if (!isPartial) {
            existingPartial.classList.remove('partial');
        }
    } else if (isPartial) {
        // Create new partial message
        const messageEl = createTranscriptElement(role, text, true);
        transcriptEl.appendChild(messageEl);
    } else {
        // Create final message
        const messageEl = createTranscriptElement(role, text, false);
        transcriptEl.appendChild(messageEl);
    }

    // Scroll to bottom
    transcriptEl.scrollTop = transcriptEl.scrollHeight;
}

/**
 * Create a transcript message element
 */
function createTranscriptElement(role, text, isPartial) {
    const div = document.createElement('div');
    div.className = `transcript-message ${role}${isPartial ? ' partial' : ''}`;

    const roleLabel = role === 'assistant' ? 'Agencer' : 'You';

    div.innerHTML = `
        <div class="role">${roleLabel}</div>
        <div class="text">${escapeHtml(text)}</div>
    `;

    return div;
}

/**
 * Clear the transcript
 */
function clearTranscript() {
    transcriptEl.innerHTML = '<div class="transcript-placeholder">Your conversation will appear here...</div>';
}

/**
 * Show an error message
 */
function showError(message) {
    // Remove any existing error
    const existingError = document.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }

    const errorEl = document.createElement('div');
    errorEl.className = 'error-message';
    errorEl.textContent = message;

    // Insert after the call container
    const callContainer = document.querySelector('.call-container');
    callContainer.parentNode.insertBefore(errorEl, callContainer.nextSibling);

    // Auto-remove after 5 seconds
    setTimeout(() => {
        errorEl.remove();
    }, 5000);
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Event Listeners
callButton.addEventListener('click', toggleCall);

// Handle page visibility changes
document.addEventListener('visibilitychange', () => {
    if (document.hidden && isCallActive) {
        // Optionally end call when page is hidden
        // vapi.stop();
    }
});

// Handle before unload
window.addEventListener('beforeunload', (event) => {
    if (isCallActive) {
        // End the call cleanly
        vapi.stop();
    }
});

// Initialize on load
document.addEventListener('DOMContentLoaded', initVapi);
