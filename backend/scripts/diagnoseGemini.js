// =====================================================
// scripts/diagnoseGemini.js
//
// Standalone diagnostic tool for the Gemini integration.
// Run this directly on the machine where the backend runs
// (it uses the exact same @google/genai SDK and .env file):
//
//   node scripts/diagnoseGemini.js
//
// It NEVER prints the API key. It reports, in plain text:
//   - whether GEMINI_API_KEY is present/well-formed
//   - which generateContent-capable models this key/project
//     can actually see (via the real ListModels API call)
//   - whether the currently configured model works
//   - the exact, non-secret Google error (status code, Google's
//     error "status" enum, and error message) if something fails
//
// Share the printed output (it contains no secrets) if you need
// further help diagnosing a project/billing/key issue.
// =====================================================

require('dotenv').config();
const { GoogleGenAI } = require('@google/genai');

const CONFIGURED_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash';

const line = (char = '-') => console.log(char.repeat(60));

const printGoogleError = (error) => {
  console.log('HTTP status   :', error?.status ?? 'N/A');
  let parsed = null;
  try {
    parsed = JSON.parse(String(error?.message || ''));
  } catch (_e) {
    // Not JSON — print the raw (non-secret) message instead.
  }
  if (parsed?.error) {
    console.log('Google status :', parsed.error.status ?? 'N/A');
    console.log('Google code   :', parsed.error.code ?? 'N/A');
    console.log('Google message:', parsed.error.message ?? 'N/A');
  } else {
    console.log('Raw message   :', error?.message || 'Unknown error');
  }
};

async function main() {
  line('=');
  console.log('GEMINI DIAGNOSTIC REPORT');
  line('=');

  // ---------------------------------------------------
  // 1. API key presence (never print the key itself)
  // ---------------------------------------------------
  const key = (process.env.GEMINI_API_KEY || '').trim();
  console.log('\n[1] GEMINI_API_KEY presence');
  line();
  console.log('Present       :', Boolean(key));
  console.log('Length        :', key.length);
  console.log('Prefix (safe) :', key ? key.slice(0, 4) + '...' : 'N/A');

  if (!key) {
    console.log('\n=> STOP: GEMINI_API_KEY is missing from backend/.env. Set it and re-run this script.');
    process.exit(1);
  }

  const ai = new GoogleGenAI({ apiKey: key });

  // ---------------------------------------------------
  // 2. List models this key/project can actually see
  // ---------------------------------------------------
  console.log('\n[2] Models available to this API key (via real ListModels call)');
  line();

  let availableModels = [];
  try {
    const pager = await ai.models.list();
    for await (const model of pager) {
      const actions = model.supportedActions || [];
      const id = String(model.name || '').replace(/^models\//, '');
      if (actions.includes('generateContent')) {
        availableModels.push(id);
        console.log(' -', id);
      }
    }
    if (availableModels.length === 0) {
      console.log('(none — this key/project has NO models that support generateContent)');
    }
  } catch (error) {
    console.log('FAILED to list models.');
    printGoogleError(error);
    console.log(
      '\n=> This usually means: invalid API key, Generative Language API not enabled ' +
        'for the project, or a network/firewall block reaching generativelanguage.googleapis.com.'
    );
  }

  // ---------------------------------------------------
  // 3. Try the currently configured model
  // ---------------------------------------------------
  console.log(`\n[3] Testing configured model: "${CONFIGURED_MODEL}"`);
  line();

  let configuredModelWorks = false;
  try {
    const response = await ai.models.generateContent({
      model: CONFIGURED_MODEL,
      contents: 'Reply with the single word: OK',
      config: { maxOutputTokens: 16 },
    });
    console.log('Result        : SUCCESS');
    console.log('Model output  :', (response?.text || '').trim());
    configuredModelWorks = true;
  } catch (error) {
    console.log('Result        : FAILED');
    printGoogleError(error);
  }

  // ---------------------------------------------------
  // 4. If the configured model failed, try the first
  //    available one from step 2 as a sanity check
  // ---------------------------------------------------
  if (!configuredModelWorks && availableModels.length > 0) {
    const fallback = availableModels.find((m) => m.toLowerCase().includes('flash')) || availableModels[0];
    console.log(`\n[4] Testing a discovered fallback model: "${fallback}"`);
    line();
    try {
      const response = await ai.models.generateContent({
        model: fallback,
        contents: 'Reply with the single word: OK',
        config: { maxOutputTokens: 16 },
      });
      console.log('Result        : SUCCESS');
      console.log('Model output  :', (response?.text || '').trim());
      console.log(
        `\n=> "${CONFIGURED_MODEL}" is not usable by this key/project, but "${fallback}" IS. ` +
          'The backend will auto-discover and use this model at runtime — no manual code change needed.'
      );
    } catch (error) {
      console.log('Result        : FAILED');
      printGoogleError(error);
      console.log('\n=> Even a model this key reported as available failed to generate content.');
      console.log('   This points to quota/billing/network, not a model-naming problem.');
    }
  }

  line('=');
  console.log('END OF REPORT — no secrets were printed above; safe to share.');
  line('=');
}

main().catch((error) => {
  console.error('Diagnostic script crashed unexpectedly:');
  console.error(error);
  process.exit(1);
});
