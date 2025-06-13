let success = true;
var session = null;
const kFeatureFlagError = 'Prompt API is not available.';
const kNoModelError =
  'Prompt API is available but no model is available. Please check console logs for the model availability.';
let languageModel = null;
if (window.ai && window.ai.languageModel) {
  languageModel = window.ai.languageModel;
} else if (window.LanguageModel) {
  languageModel = window.LanguageModel;
} else {
  error('Prompt API is not available.');
}

let modelReady = false;
let modelDownloadInProgress = false;

async function createNewSession() {
  try {
    var initialPrompt = document.getElementById('initialPrompt').value;
    const sessionConfig = {
      temperature: 1.0,
      topK: 1,
      maxTokens: 4096,
      monitor(m) {
        m.addEventListener('downloadprogress', (e) => {
          // update the progress bar with latest download status
          document.getElementById('modelDownloadProgress').value =
            (e.loaded / e.total) * 100;
          if (e.loaded == e.total) {
            document.getElementById('modelDownloadProgress').value = 100;
            console.log('Download complete');
          }
        });
      },
    };
    if (initialPrompt !== '') {
      sessionConfig.initialPrompts = [
        { role: 'system', content: initialPrompt },
      ];
    }
    session = await languageModel.create(sessionConfig);
    document.getElementById('modelDownloadProgress').value = 100;
    modelReady = true;
  } catch (e) {
    error('Cannot create session now - ' + e);
  }
}

function error(str) {
  // Show the first error.
  if (success) {
    document.getElementById('error').innerText = str;
    success = false;
  }
  throw new Error(str);
}

async function checkDownload() {
  let result = await (languageModel.capabilities
    ? languageModel.capabilities()
    : languageModel.availability());
  if (result == 'unavailable' || result.available == 'no') {
    console.log('Model is unavailable');
    error(kNoModelError);
  } else if (
    result == 'downloadable' ||
    result == 'downloading' ||
    result.available == 'after-download'
  ) {
    console.log('Model is downloading...');
    modelDownloadInProgress = true;
    window.setTimeout(checkDownload, 1000);
  } else if (result == 'available' || result.available == 'readily') {
    console.log('Model is available');
    modelReady = true;
    modelDownloadInProgress = false;
    await createNewSession();
  }
}

// Only trigger model download/session creation in response to user action
async function ensureModelReady() {
  if (modelReady) return true;
  let result = await (languageModel.capabilities
    ? languageModel.capabilities()
    : languageModel.availability());
  if (result == 'unavailable' || result.available == 'no') {
    error(kNoModelError);
    return false;
  } else if (
    result == 'downloadable' ||
    result == 'downloading' ||
    result.available == 'after-download'
  ) {
    if (!modelDownloadInProgress) {
      // Always attach monitor to update progress bar
      languageModel.create({
        temperature: 1.0,
        topK: 1,
        monitor(m) {
          m.addEventListener('downloadprogress', (e) => {
            document.getElementById('modelDownloadProgress').value =
              (e.loaded / e.total) * 100;
            if (e.loaded == e.total) {
              document.getElementById('modelDownloadProgress').value = 100;
              console.log('Download complete');
            }
          });
        },
      });
      modelDownloadInProgress = true;
    }
    checkDownload();
    return false;
  } else if (result == 'available' || result.available == 'readily') {
    await createNewSession();
    return true;
  } else {
    error('Cannot create model now - ' + (result.available || result));
    return false;
  }
}

document
  .getElementById('initialPrompt')
  .addEventListener('change', async function () {
    try {
      if (session) session.destroy();
      let ready = await ensureModelReady();
      if (ready) {
        await createNewSession();
      }
    } catch (e) {
      error('Cannot create session now - ' + e);
    }
  });

var update_element = null;
var current_cps = 0;
var initial_delay = null;
var start_time = null;

var post_prefill_time = null;
var post_prefill_c = null;
var post_prefill_t = null;

var cps_element = document.getElementById('cps');
var tps_element = document.getElementById('tps');
var latency_element = document.getElementById('latency');
var token_count = 0;
var current_tps = 0;
async function main(input) {
  update_element.scrollIntoView(false);
  let stream = null;
  try {
    stream = session.promptStreaming(input);
  } catch (e) {
    error('Cannot create stream now - ' + e);
  }
  try {
    for await (const chunk of stream) {
      update_element.innerText += chunk;
      token_count++;
      // Wait for prefill to complete before we estimate tokens per second.
      if (token_count >= 2) {
        if (post_prefill_time) {
          const seconds = Math.floor((Date.now() - post_prefill_time) / 1000);
          current_cps = Math.round(
            (update_element.innerText.length - post_prefill_c) / seconds,
          );
          current_tps = Math.round((token_count - post_prefill_t) / seconds);
        } else {
          post_prefill_time = Date.now();
          post_prefill_c = update_element.innerText.length;
          post_prefill_t = token_count;
        }
      }
      if (initial_delay == null) {
        initial_delay = Date.now() - start_time;
        latency_element.innerText = initial_delay;
      }
      cps_element.innerText = current_cps;
      tps_element.innerText = current_tps;
      console.log(
        `${session.tokensSoFar}/${session.maxTokens} (${session.tokensLeft} left)`,
      );
    }
  } catch (e) {
    error('Stream error - ' + e);
  }
}

async function onSend() {
  let ready = await ensureModelReady();
  if (!ready) return; // Wait for model to be ready
  const inputText = document.getElementById('input').value;
  const prompt = inputText;
  let input = document.createElement('p');
  input.setAttribute('class', 'from-me');
  input.innerText = inputText;
  document.getElementsByClassName('imessage')[0].appendChild(input);
  let reply = document.createElement('p');
  reply.setAttribute('class', 'from-them');
  document.getElementsByClassName('imessage')[0].appendChild(reply);
  update_element = reply;
  reply.innerText = '';
  start_time = Date.now();
  token_count = 0;
  post_prefill_time = null;
  post_prefill_c = null;
  post_prefill_t = null;
  main(prompt);
}
document.getElementById('send').onclick = onSend;
document.getElementById('okay').style.display = 'block';
document.getElementById('input').addEventListener('keypress', (e) => {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    onSend();
  }
});
