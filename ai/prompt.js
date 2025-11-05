/**
 * Microsoft Edge Prompt API Test Page
 * 
 * This is a test page to demonstrate usage of Microsoft Edge's built-in Prompt API
 * for local AI language model functionality. The API allows downloading and
 * running language models locally in the browser without sending data to
 * external servers.
 *  * Key features:
 * - Detects Microsoft Edge Prompt API availability
 * - Handles model downloads with progress tracking (when supported)
 * - Provides user activation requirement for downloads
 * - Shows estimated progress when detailed progress isn't available
 * - Handles session creation and text generation
 */

let session;
let languageModel;
let modelReady = false;
let modelDownloadInProgress = false;
let success = true;
let currentStream = null; // Track current streaming session
let modelLoadStartTime = null; // Track when model loading starts
let modelLoadLatencySet = false; // Ensure latency is only set once

const kNoModelError = 'Model not available. You can try downloading a model from the Microsoft Edge settings page.';

// UI Helper Functions for Modern Interface
function updateStatus(status, message, type = 'info') {
  const statusDot = document.getElementById('statusDot');
  const statusText = document.getElementById('statusText');

  // Update status indicator
  statusDot.className = 'status-dot';
  if (type === 'success') {
    statusDot.classList.add('ready');
  } else if (type === 'error') {
    statusDot.classList.add('error');
  }

  statusText.textContent = message;
}

function showError(message) {
  updateStatus('error', 'Error occurred', 'error');

  // Update the status badge tooltip with error details
  const statusBadge = document.getElementById('statusBadge');
  statusBadge.title = `Error: ${message}`;
}

function showSuccess(message) {
  updateStatus('ready', message, 'success');

  // Update the status badge tooltip
  const statusBadge = document.getElementById('statusBadge');
  statusBadge.title = `Status: ${message}`;
}

function updateMetrics(cps, tps, latency = null) {
  document.getElementById('cps').textContent = cps;
  document.getElementById('tps').textContent = tps;

  // Only update latency if provided and not already set
  if (latency !== null && !modelLoadLatencySet) {
    document.getElementById('latency').textContent = latency;
    modelLoadLatencySet = true;
  }
}

function showProgress(show = true) {
  const progressContainer = document.getElementById('progressContainer');
  progressContainer.style.display = show ? 'block' : 'none';
}

function showDownloadPrompt(show = true) {
  const downloadPrompt = document.getElementById('downloadPrompt');
  downloadPrompt.style.display = show ? 'block' : 'none';
}

function updateProgress(percentage, message = '', speed = '') {
  const progressBar = document.getElementById('modelDownloadProgress');
  const progressPercentage = document.getElementById('progressPercentage');
  const downloadBytes = document.getElementById('modelDownloadBytes');
  const downloadSpeed = document.getElementById('downloadSpeed');

  progressBar.value = percentage;
  // Hide percentage display - we only want to show bytes downloaded/total bytes
  progressPercentage.style.display = 'none';

  if (message) downloadBytes.textContent = message;
  if (speed) downloadSpeed.textContent = speed;
}

function addMessage(content, isUser = false) {
  const chatMessages = document.getElementById('chatMessages');

  // Remove welcome message if it exists
  const welcomeMessage = chatMessages.querySelector('.welcome-message');
  if (welcomeMessage) {
    welcomeMessage.remove();
  }

  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${isUser ? 'user' : 'ai'}`;

  const avatar = document.createElement('div');
  avatar.className = 'message-avatar';
  avatar.textContent = isUser ? '👤' : '🤖';

  const messageContent = document.createElement('div');
  messageContent.className = 'message-content';
  messageContent.textContent = content;

  messageDiv.appendChild(avatar);
  messageDiv.appendChild(messageContent);

  chatMessages.appendChild(messageDiv);
  chatMessages.scrollTop = chatMessages.scrollHeight;

  return messageContent; // Return content div for updating
}

function setupConfigToggle() {
  const configToggle = document.getElementById('configToggle');
  const configContent = document.querySelector('.config-content');
  let isExpanded = true;

  configToggle.addEventListener('click', () => {
    isExpanded = !isExpanded;
    configContent.style.display = isExpanded ? 'block' : 'none';
    configToggle.textContent = isExpanded ? 'Hide' : 'Show';
  });
}

function setupTextareaAutoResize() {
  const textarea = document.getElementById('input');

  textarea.addEventListener('input', function () {
    this.style.height = 'auto';
    // Get minimum height based on mobile/desktop
    const isMobile = window.innerWidth <= 768;
    const minHeight = isMobile ? 48 : 44;
    const maxHeight = isMobile ? 100 : 120;
    const newHeight = Math.max(minHeight, Math.min(this.scrollHeight, maxHeight));
    this.style.height = newHeight + 'px';
  });
}

function setupSliders() {
  const temperatureSlider = document.getElementById('temperatureSlider');
  const temperatureValue = document.getElementById('temperatureValue');
  const topKSlider = document.getElementById('topKSlider');
  const topKValue = document.getElementById('topKValue');

  // Temperature slider
  temperatureSlider.addEventListener('input', (e) => {
    temperatureValue.textContent = parseFloat(e.target.value).toFixed(1);
  });

  // Top-K slider
  topKSlider.addEventListener('input', (e) => {
    topKValue.textContent = e.target.value;
  });
}

function getSliderValues() {
  return {
    temperature: parseFloat(document.getElementById('temperatureSlider').value),
    topK: parseInt(document.getElementById('topKSlider').value)
  };
}

// Create session with proper progress monitoring
async function createSession() {
  try {
    // Start tracking model load time if not already started
    if (!modelLoadStartTime) {
      modelLoadStartTime = performance.now();
    }

    var initialPrompt = document.getElementById('initialPrompt').value;

    // Check status before creating session
    let preStatus = await (languageModel.capabilities
      ? languageModel.capabilities()
      : languageModel.availability());

    // Get current slider values
    const sliderValues = getSliderValues();

    // Only include monitor if download might be needed
    const needsDownload = preStatus == 'downloadable' ||
      preStatus == 'downloading' ||
      (preStatus.available && preStatus.available == 'after-download');

    const sessionConfig = {
      temperature: sliderValues.temperature,
      topK: sliderValues.topK,
      maxTokens: 4096
    };    // Only add monitor if download is actually needed
    if (needsDownload) {
      sessionConfig.monitor = function (m) {
        console.log('Monitor function called, setting up progress handlers');        // Set up progress event handlers
        let progressShown = false;
        let progressReceived = false;
        let validApiDataReceived = false;        // Set the ondownloadprogress handler
        m.ondownloadprogress = function (e) {
          console.log('Download progress event received:', e);
          progressReceived = true;

          if (!progressShown) {
            // Only show progress when we actually start downloading
            showProgress(true);
            updateStatus('downloading', 'Downloading...', 'info');
            progressShown = true;
          }

          if (e && e.loaded !== undefined) {
            const loaded = e.loaded;
            const total = e.total || 0;

            console.log(`Progress: loaded=${loaded}, total=${total}, lengthComputable=${e.lengthComputable}`);

            // Check if API is returning percentage-based progress (0-1 range)
            // where total=1 represents 100% and loaded is a fraction between 0 and 1
            const isPercentageBasedProgress = total === 1 && loaded >= 0 && loaded <= 1;

            if (isPercentageBasedProgress && e.lengthComputable) {
              if (!validApiDataReceived) {
                console.log('✅ Valid API progress data received (percentage-based: 0-1 range)');
                validApiDataReceived = true;
              }

              // Convert from 0-1 range to 0-100 percentage
              const percentage = loaded * 100;

              updateProgress(percentage, `Downloading model: ${percentage.toFixed(1)}%`);

              // Mark complete when API indicates completion (loaded >= 1.0 or very close)
              if (loaded >= 0.99) {
                updateProgress(100, `Download complete`);
                modelReady = true;
                modelDownloadInProgress = false;

                // Set the model loading latency when download completes
                if (modelLoadStartTime && !modelLoadLatencySet) {
                  const loadLatency = Math.round(performance.now() - modelLoadStartTime);
                  updateMetrics(0, 0, loadLatency);
                }

                showSuccess('AI model is ready! You can start chatting.');
                showProgress(false);
              }
            } else {
              // API data doesn't match expected format - log and let fallback estimation handle it
              console.log(`Unexpected progress data format: total=${total}, loaded=${loaded} - using fallback estimation`);
            }
          }
        };

        // Show initial progress state
        if (!progressShown) {
          showProgress(true);
          updateStatus('downloading', 'Downloading...', 'info');
          updateProgress(0, 'Starting download...');
          progressShown = true;
        }
      };
    }

    if (initialPrompt !== '') {
      sessionConfig.initialPrompts = [
        { role: 'system', content: initialPrompt },
      ];
    }

    session = await languageModel.create(sessionConfig);

    // Check status after creating session
    let postStatus = await (languageModel.capabilities
      ? languageModel.capabilities()
      : languageModel.availability());

    if (postStatus === 'available' || postStatus.available === 'readily') {
      // Model is ready
      modelReady = true;

      // Set the model loading latency (only once)
      if (modelLoadStartTime && !modelLoadLatencySet) {
        const loadLatency = Math.round(performance.now() - modelLoadStartTime);
        updateMetrics(0, 0, loadLatency);
      } updateStatus('ready', 'Model Ready', 'success');
      showSuccess('AI model is ready! You can start chatting.');
      showProgress(false);
    }

  } catch (e) {
    // Re-throw with more context if this is a user activation error
    if (e.message && (e.message.includes('user activation') || e.message.includes('user gesture'))) {
      throw new Error('User activation required for model download. Please try clicking again.');
    }
    throw new Error('Cannot create session now - ' + e.message);
  }
}

function error(str) {
  // Show the first error.
  if (success) {
    showError(str);
    success = false;
  }
  throw new Error(str);
}

// Check model availability without triggering download
async function checkModelAvailability() {
  try {
    let result = await (languageModel.capabilities
      ? languageModel.capabilities()
      : languageModel.availability());

    console.log('Initial model availability check:', result);

    if (result == 'unavailable' || result.available == 'no') {
      showError(kNoModelError);
    } else if (
      result == 'downloadable' ||
      result == 'downloading' ||
      result.available == 'after-download'
    ) {
      if (result == 'downloading') {
        // Download already in progress from another session
        // Show progress bar immediately
        console.log('Model is already downloading - showing progress immediately');
        showDownloadPrompt(false);
        showProgress(true);
        updateStatus('downloading', 'Downloading...', 'info');
        updateProgress(0, 'Download in progress...');
        monitorOngoingDownload();
      } else {
        // Model needs to be downloaded - show download prompt
        showDownloadPrompt(true);
        updateStatus('download-needed', 'Download required', 'info');
        console.log('Model needs download - showing download prompt');
      }

      // Start monitoring for state changes
      startModelStateMonitoring();
    } else if (result == 'available' || result.available == 'readily') {
      modelReady = true;
      updateStatus('ready', 'Model Ready', 'success');
      showSuccess('AI model is ready! You can start chatting.');
    }
  } catch (e) {
    console.error('Error checking model availability:', e);
    showError('Error checking model availability - ' + e.message);
  }
}

// Monitor download progress when download was started by another page/session
async function monitorOngoingDownload() {
  // Just show initial downloading state - let the session monitor handle actual progress
  updateProgress(0, 'Download in progress...');
  console.log('Monitoring ongoing download - delegating to session monitor for progress tracking');
}

// Continuously monitor model state changes
let stateMonitorInterval = null;

async function startModelStateMonitoring() {
  // Don't start multiple monitors
  if (stateMonitorInterval) {
    return;
  }

  console.log('Starting model state monitoring...');

  stateMonitorInterval = setInterval(async () => {
    try {
      const result = await (languageModel.capabilities
        ? languageModel.capabilities()
        : languageModel.availability());

      console.log('Model state check:', result);      // Check if model became available
      if (!modelReady && (result == 'available' || result.available == 'readily')) {
        console.log('Model became available! Updating UI...');
        modelReady = true;
        showSuccess('AI model is ready! You can start chatting.');
        updateStatus('ready', 'Model Ready', 'success');
        showProgress(false); // Hide any progress bars
        showDownloadPrompt(false); // Hide download prompt

        // Clear download start time since download is complete
        localStorage.removeItem('modelDownloadStartTime');

        // Stop monitoring since model is ready
        stopModelStateMonitoring();
      }// Check if model started downloading
      else if (result == 'downloading') {
        console.log('Model is downloading...');
        updateStatus('downloading', 'Downloading...', 'info');

        // Store download start time if not already stored
        if (!localStorage.getItem('modelDownloadStartTime')) {
          localStorage.setItem('modelDownloadStartTime', Date.now().toString());
          console.log('Stored download start time for ongoing download tracking');
        }

        // Hide download prompt and show progress
        showDownloadPrompt(false);

        // Always show progress when downloading state is detected
        const progressContainer = document.getElementById('progressContainer');
        if (progressContainer.style.display === 'none' || !progressContainer.style.display) {
          console.log('Showing progress container for downloading state');
          showProgress(true);
          updateProgress(0, 'Download in progress...');
          monitorOngoingDownload();
        }
      }
      // Check if model needs download
      else if (result == 'downloadable' || result.available == 'after-download') {
        console.log('Model needs download...');
        updateStatus('download-needed', 'Download required', 'info');
        showDownloadPrompt(true);
        showProgress(false);
      }

    } catch (e) {
      console.error('Error monitoring model state:', e);
      // Don't stop monitoring on error, just log it
    }
  }, 3000); // Check every 3 seconds
}

function stopModelStateMonitoring() {
  if (stateMonitorInterval) {
    console.log('Stopping model state monitoring');
    clearInterval(stateMonitorInterval);
    stateMonitorInterval = null;
  }
}

// Main initialization function
async function onPrompt() {
  try {
    // Check if session already exists and is ready
    if (session && modelReady) {
      return; // Session already created and ready
    }

    // Check current status without showing progress yet
    let preStatus = await (languageModel.capabilities
      ? languageModel.capabilities()
      : languageModel.availability());

    // Only show progress if model actually needs to be downloaded
    const needsDownload = preStatus == 'downloadable' ||
      preStatus == 'downloading' ||
      (preStatus.available && preStatus.available == 'after-download');

    // Create session (this will trigger download if needed and show progress automatically)
    await createSession();

  } catch (e) {
    error('Send error - ' + e.message);
  }
}

async function onSend() {
  const textElement = document.getElementById('input');

  try {
    // Check if we need to create session first
    if (!session || !modelReady) {
      await onPrompt();
    }

    // Now proceed with sending the message
    const input = textElement.value.trim();
    if (!input) return;

    // Show stop button, hide send button
    document.getElementById('send').style.display = 'none';
    document.getElementById('stop').style.display = 'block';    // Add user message to chat
    addMessage(input, true);    // Clear input and reset height
    textElement.value = '';
    // Reset height with proper mobile/desktop sizing
    const isMobile = window.innerWidth <= 768;
    const minHeight = isMobile ? 48 : 44;
    textElement.style.height = minHeight + 'px';

    // Add AI response placeholder
    const aiResponseContent = addMessage('...', false);    // Initialize metrics tracking
    const start = performance.now();
    let fullResponse = '';
    let chunkCount = 0; try {
      // Start the stream - this is where the model actually begins processing
      console.log('Starting stream with session:', !!session, 'input length:', input.length);
      const stream = session.promptStreaming(input);
      currentStream = stream; // Track the current stream

      for await (const chunk of stream) {
        // Check if stream was stopped
        if (!currentStream) break;

        fullResponse += chunk;
        chunkCount++; if (chunkCount === 1) {
          // First chunk - no need to calculate latency here anymore
          // Latency is now set once when model loads
        }

        // Update response display in chat
        aiResponseContent.textContent = fullResponse;

        // Scroll to bottom
        const chatMessages = document.getElementById('chatMessages');
        chatMessages.scrollTop = chatMessages.scrollHeight;        // Calculate and display performance metrics
        const elapsed = (performance.now() - start) / 1000;
        const cps = Math.round(fullResponse.length / elapsed);
        const tps = Math.round(chunkCount / elapsed);

        updateMetrics(cps, tps); // Don't update latency during streaming
      }
    } finally {
      // Always reset buttons when streaming is done
      currentStream = null;
      document.getElementById('stop').style.display = 'none';
      document.getElementById('send').style.display = 'block';
    }
  } catch (e) {
    console.error('Send error details:', {
      error: e,
      message: e.message,
      stack: e.stack,
      session: !!session,
      modelReady: modelReady,
      input: input
    });
    showError('Send error - ' + e.message);
    // Reset buttons on error
    currentStream = null;
    document.getElementById('stop').style.display = 'none';
    document.getElementById('send').style.display = 'block';
  }
}

// Function to stop the current streaming
function onStop() {
  if (currentStream) {
    try {
      // Abort the stream if possible
      if (currentStream.controller && currentStream.controller.abort) {
        currentStream.controller.abort();
      }
      currentStream = null;

      // Hide stop button and show send button
      document.getElementById('stop').style.display = 'none';
      document.getElementById('send').style.display = 'block';
    } catch (e) {
      console.error('Error stopping stream:', {
        error: e,
        message: e.message,
        currentStream: !!currentStream
      });
    }
  }
}

// Initialize when page loads
window.addEventListener('load', async () => {  // Set up UI components
  setupConfigToggle();
  setupTextareaAutoResize();
  setupSliders();

  // Set initial textarea height based on device
  const textarea = document.getElementById('input');
  const isMobile = window.innerWidth <= 768;
  const minHeight = isMobile ? 48 : 44;
  textarea.style.height = minHeight + 'px';

  // Start tracking model load time from page load
  modelLoadStartTime = performance.now();

  // Check if the Prompt API is available
  if (!('LanguageModel' in window)) {
    showError('Enable Microsoft Edge AI features in edge://flags to use this demo.');
    return;
  }
  try {
    console.log('Initializing LanguageModel...');
    languageModel = window.LanguageModel;

    // Check model availability
    console.log('Checking model availability...');
    await checkModelAvailability();

    if (modelReady) {
      console.log('Model is ready!');
      showSuccess('AI model is ready! You can start chatting.');
    }    // Set up event listeners for buttons
    document.getElementById('send').addEventListener('click', onSend);
    document.getElementById('stop').addEventListener('click', onStop); document.getElementById('downloadBtn').addEventListener('click', async () => {
      console.log('Download button clicked - attempting to start download');
      try {
        // Show immediate feedback
        showDownloadPrompt(false);
        showProgress(true);
        updateProgress(0, 'Preparing download...');
        updateStatus('downloading', 'Starting download...', 'info');

        await onPrompt(); // This will trigger the download with user activation
      } catch (e) {
        console.error('Error starting download:', e);
        showError('Failed to start download: ' + e.message);
        showDownloadPrompt(true); // Show prompt again on error
        showProgress(false); // Hide progress on error
      }
    });

    // Add Enter key support for input textarea
    document.getElementById('input').addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        onSend();
      }
    });
  } catch (e) {
    console.error('Initialization error details:', {
      error: e,
      message: e.message,
      stack: e.stack,
      hasLanguageModel: !!window.LanguageModel
    });
    showError('Initialization error - ' + e.message);
  }
});

// Clean up monitoring when page unloads
window.addEventListener('beforeunload', () => {
  stopModelStateMonitoring();
});
