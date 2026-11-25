'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { test } = require('node:test');
const speech = require('./speech-audio.js');

test('Bundled MP3 speech samples exist on disk and match SPEECH_SAMPLES metadata', () => {
  for (const sample of Object.values(speech.SPEECH_SAMPLES)) {
    const mp3Path = path.join(__dirname, sample.file);
    assert.equal(fs.existsSync(mp3Path), true, `missing bundled MP3: ${sample.file}`);
    const stat = fs.statSync(mp3Path);
    assert.ok(stat.size > 10000, `expected non-trivial MP3 size for ${sample.file}, got ${stat.size}`);
  }
});

test('computeWordAccuracy scores exact, partial, and empty transcripts accurately', () => {
  const exact = speech.computeWordAccuracy('Hello world, on-device AI!', 'hello world on device ai');
  assert.equal(exact.accuracyPct, 100);
  assert.equal(exact.werPct, 0);

  const partial = speech.computeWordAccuracy('one two three four', 'one two five four');
  assert.equal(partial.accuracyPct, 75);
  assert.equal(partial.edits, 1);
});

test('transcribeAudioBufferWithSpeechRecognition streams MediaStreamTrack and collects final transcript', async () => {
  let startedWithTrack = null;

  class FakeSpeechRecognition {
    static async available(opts) {
      assert.deepEqual(opts.langs, ['en-US']);
      assert.equal(opts.processLocally, true);
      return 'available';
    }
    start(track) {
      startedWithTrack = track;
      setTimeout(() => {
        if (this.onaudiostart) this.onaudiostart();
        if (this.onresult) {
          this.onresult({
            results: [
              Object.assign([{ transcript: 'Microsoft Edge runs speech recognition' }], { isFinal: true }),
            ],
          });
        }
      }, 5);
    }
    stop() {
      if (this.onend) this.onend();
    }
  }

  class FakeAudioContext {
    constructor() {
      this.currentTime = 0;
      this.state = 'running';
    }
    createMediaStreamDestination() {
      return {
        stream: {
          getAudioTracks: () => [{ kind: 'audio', stop() {} }],
        },
      };
    }
    createBufferSource() {
      return {
        buffer: null,
        onended: null,
        connect() {},
        disconnect() {},
        start() {
          setTimeout(() => {
            if (this.onended) this.onended();
          }, 10);
        },
      };
    }
    async close() {}
  }

  const avail = await speech.checkSpeechAvailability({ lang: 'en-US', processLocally: true }, { SpeechRecognition: FakeSpeechRecognition });
  assert.equal(avail.status, 'available');

  const res = await speech.transcribeAudioBufferWithSpeechRecognition(
    { duration: 2.5, sampleRate: 16000 },
    {
      SpeechRecognition: FakeSpeechRecognition,
      AudioContext: FakeAudioContext,
      trailingSilenceMs: 10,
    }
  );
  assert.ok(startedWithTrack && startedWithTrack.kind === 'audio');
  assert.equal(res.transcript, 'Microsoft Edge runs speech recognition');
  assert.ok(res.totalMs >= 1);
});
