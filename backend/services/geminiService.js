// =====================================================
// services/geminiService.js
// Google Gemini AI service for Smart City Jamshoro
// =====================================================

const { GoogleGenAI } = require('@google/genai');
const ApiError = require('../utils/ApiError');

const isConfigured = () =>
  Boolean(
    process.env.GEMINI_API_KEY &&
    process.env.GEMINI_API_KEY.trim()
  );

const SYSTEM_CONTEXT = `
You are Smart City Jamshoro AI Assistant.

You help users with:

- Buying plots
- Selling plots
- Renting property
- Smart City Jamshoro information
- Real estate investment advice
- General property questions

Rules:

- Always answer professionally.
- Keep answers concise and useful.
- If you don't know something, say so.
- Never invent property listings.
- Do not claim a property exists unless it is provided by the application.
`;

// Currently configured Gemini model. Overridable via GEMINI_MODEL so it
// can be changed without a code edit/deploy — Google periodically retires
// model IDs for new API keys/projects (as happened with gemini-2.5-flash,
// which now 404s with "no longer available to new users" for keys created
// after a certain date, even though it's still globally GA). Defaulting to
// gemini-2.0-flash because it was confirmed present in this project's
// real ListModels response.
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-2.0-flash';

/**
 * The @google/genai SDK throws its own `ApiError` for any HTTP response
 * from Google that isn't 2xx. That ApiError carries:
 *   - error.status  -> the numeric HTTP status code (e.g. 429, 404, 403)
 *   - error.message -> JSON.stringify() of the raw Google error body,
 *                       e.g. {"error":{"code":429,"message":"...",
 *                       "status":"RESOURCE_EXHAUSTED"}}
 *
 * Classifying on the numeric status is far more reliable than string
 * matching against that JSON blob (the previous implementation looked for
 * "resource exhausted" with a space, which never matches Google's actual
 * "RESOURCE_EXHAUSTED" enum value, so quota errors could silently fall
 * through to the generic message). We still parse the JSON body when
 * present so the backend console gets Google's real reason string, but the
 * classification itself is driven by the HTTP status code.
 */
const parseGoogleErrorBody = (message) => {
  try {
    const parsed = JSON.parse(message);
    return parsed?.error || null;
  } catch (_e) {
    return null;
  }
};

const classifyGeminiError = (error) => {
  const rawMessage = String(error?.message || '');
  const googleError = parseGoogleErrorBody(rawMessage);
  const googleStatusEnum = String(googleError?.status || '').toUpperCase();
  const googleReason = String(googleError?.message || '').toLowerCase();

  // Numeric HTTP status: prefer the SDK's typed field, fall back to
  // whatever Google reported inside the JSON body.
  const httpStatus = Number(error?.status) || Number(googleError?.code) || null;

  // -------------------------------------------------
  // Network-level failure: request never reached Google at all
  // (DNS failure, connection refused, egress blocked, timeout, etc.)
  // These come from the fetch layer, not from Google, so there is no
  // HTTP status and no JSON error body.
  // -------------------------------------------------
  const networkCodes = new Set([
    'ENOTFOUND',
    'ECONNREFUSED',
    'ECONNRESET',
    'ETIMEDOUT',
    'EAI_AGAIN',
  ]);
  if (
    (error?.code && networkCodes.has(error.code)) ||
    error?.name === 'AbortError' ||
    /fetch failed|network|timeout/i.test(rawMessage) && !httpStatus
  ) {
    return {
      statusCode: 503,
      message:
        'Could not reach the Gemini API (network/connectivity issue). ' +
        'Verify outbound network access to generativelanguage.googleapis.com.',
    };
  }

  // -------------------------------------------------
  // Authentication / project configuration.
  // These all surface as 400/401/403 from Google but mean very different
  // things operationally, so we distinguish them instead of collapsing
  // everything into "invalid key".
  // -------------------------------------------------
  if (
    googleReason.includes('api_key_invalid') ||
    googleReason.includes('api key not valid')
  ) {
    return {
      statusCode: 500,
      message:
        'The Gemini API key is invalid or malformed. Regenerate it in Google AI Studio and update GEMINI_API_KEY.',
    };
  }

  if (
    googleReason.includes('has not been used in project') ||
    (googleReason.includes('generative language api') && googleReason.includes('disabled'))
  ) {
    return {
      statusCode: 500,
      message:
        'The Generative Language API is not enabled for this Google Cloud project. Enable it in Google Cloud Console, then retry.',
    };
  }

  if (
    googleReason.includes('requires billing') ||
    googleReason.includes('billing account')
  ) {
    return {
      statusCode: 500,
      message:
        'This Gemini project requires an active billing account. Enable billing in Google Cloud Console, then retry.',
    };
  }

  if (
    googleReason.includes('restricted') &&
    (googleReason.includes('api') || googleReason.includes('referrer') || googleReason.includes('ip address'))
  ) {
    return {
      statusCode: 500,
      message:
        'This API key is restricted (by API, HTTP referrer, or IP) and the restriction is blocking this request. Check the key\'s restrictions in Google Cloud Console / AI Studio.',
    };
  }

  if (
    httpStatus === 401 ||
    httpStatus === 403 ||
    googleStatusEnum === 'UNAUTHENTICATED' ||
    googleStatusEnum === 'PERMISSION_DENIED' ||
    googleReason.includes('api key') ||
    googleReason.includes('api_key')
  ) {
    return {
      statusCode: 500,
      message: 'Invalid or missing Gemini API Key, or the key lacks permission for this project.',
    };
  }

  // -------------------------------------------------
  // Quota / rate limit
  // -------------------------------------------------
  if (
    httpStatus === 429 ||
    googleStatusEnum === 'RESOURCE_EXHAUSTED'
  ) {
    return {
      statusCode: 429,
      message: 'Gemini API quota exceeded. Please try again later.',
    };
  }

  // -------------------------------------------------
  // Model / API version / model availability
  // -------------------------------------------------
  if (
    httpStatus === 404 ||
    googleStatusEnum === 'NOT_FOUND' ||
    (googleReason.includes('model') &&
      (googleReason.includes('not found') ||
        googleReason.includes('not supported') ||
        googleReason.includes('unavailable') ||
        googleReason.includes('invalid')))
  ) {
    return {
      statusCode: 502,
      message: `Configured Gemini model ("${GEMINI_MODEL}") is unavailable for this API key/project.`,
      isModelNotFound: true,
    };
  }

  // -------------------------------------------------
  // Invalid request
  // -------------------------------------------------
  if (
    httpStatus === 400 ||
    googleStatusEnum === 'INVALID_ARGUMENT' ||
    googleReason.includes('invalid argument') ||
    googleReason.includes('bad request')
  ) {
    return {
      statusCode: 400,
      message: 'Invalid request sent to Gemini API.',
    };
  }

  // -------------------------------------------------
  // Google-side outage
  // -------------------------------------------------
  if (
    httpStatus === 500 ||
    httpStatus === 503 ||
    googleStatusEnum === 'UNAVAILABLE' ||
    googleStatusEnum === 'INTERNAL'
  ) {
    return {
      statusCode: 502,
      message: 'Gemini API is temporarily unavailable. Please try again shortly.',
    };
  }

  // -------------------------------------------------
  // Anything else
  // -------------------------------------------------
  return {
    statusCode: 502,
    message: 'Gemini AI service is currently unavailable.',
  };
};

// -------------------------------------------------------------------
// Runtime model discovery.
//
// gemini-2.5-flash is GA per Google's public docs, but model
// *availability* is also gated per API key / Google Cloud project
// (region, allowlist, key restrictions, Gemini Enterprise vs. Gemini
// Developer API, etc). If the configured model 404s for THIS key, we
// ask Google's own ListModels endpoint which generateContent-capable
// models this key can actually use, and retry with a real one instead
// of guessing a different hardcoded name. The result is cached in
// memory for the life of the process so we don't call ListModels on
// every request.
// -------------------------------------------------------------------
let cachedWorkingModel = null;

const discoverWorkingModel = async (ai) => {
  const pager = await ai.models.list();
  const candidates = [];

  for await (const model of pager) {
    const actions = model.supportedActions || [];
    if (!actions.includes('generateContent')) continue;

    // Model resource names come back as "models/gemini-2.5-flash" —
    // the SDK's `model` param wants just the bare id.
    const id = String(model.name || '').replace(/^models\//, '');
    if (id) candidates.push(id);
  }

  if (candidates.length === 0) {
    return { candidates: [], picked: null };
  }

  // Prefer a "flash" model (fast/cheap, good default for a chatbot) if
  // one is available among what this key can actually use; otherwise
  // take whatever Google returned first.
  const picked =
    candidates.find((id) => id.toLowerCase().includes('flash')) ||
    candidates[0];

  return { candidates, picked };
};

const generateChatResponse = async (prompt) => {
  if (!isConfigured()) {
    throw new ApiError(
      500,
      'AI service is not configured. GEMINI_API_KEY is missing.'
    );
  }

  if (!prompt || !String(prompt).trim()) {
    throw new ApiError(400, 'Prompt is required.');
  }

  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
  });

  const contents = `${SYSTEM_CONTEXT}

User:
${String(prompt).trim()}

Assistant:`;

  const callModel = async (model) =>
    ai.models.generateContent({
      model,
      contents,
      config: { maxOutputTokens: 1024 },
    });

  const modelToUse = cachedWorkingModel || GEMINI_MODEL;

  let response;
  try {
    response = await callModel(modelToUse);
  } catch (firstError) {
    const classified = classifyGeminiError(firstError);

    // Only attempt discovery when the failure is specifically "model not
    // found/unsupported" — every other error (quota, auth, network,
    // billing) is a real problem that switching models won't fix.
    if (classified.isModelNotFound) {
      console.error('========== GEMINI ERROR (model not found) ==========');
      console.error('Configured model:', modelToUse);
      console.error('Message:', firstError?.message || 'Unknown error');
      console.error('======================================================');

      let discovery;
      try {
        discovery = await discoverWorkingModel(ai);
      } catch (listError) {
        console.error('Model discovery via ai.models.list() also failed:', listError?.message || listError);
        throw new ApiError(
          502,
          `Configured Gemini model ("${modelToUse}") is unavailable for this API key/project, ` +
            'and listing available models also failed. Verify the API key/project in Google AI Studio.'
        );
      }

      if (!discovery.picked) {
        throw new ApiError(
          502,
          `Configured Gemini model ("${modelToUse}") is unavailable, and this API key has no ` +
            'models that support generateContent. Check the key/project in Google AI Studio.'
        );
      }

      console.log(
        `Gemini: falling back to discovered model "${discovery.picked}" ` +
          `(available: ${discovery.candidates.join(', ')})`
      );

      try {
        response = await callModel(discovery.picked);
        cachedWorkingModel = discovery.picked; // reuse for subsequent requests
      } catch (secondError) {
        const { statusCode, message } = classifyGeminiError(secondError);
        throw new ApiError(statusCode, message);
      }
    } else {
      // Non-model error: log diagnostics and classify normally.
      console.error('========== GEMINI ERROR ==========');
      console.error('Message:', firstError?.message || 'Unknown error');
      console.error('HTTP status:', firstError?.status || 'N/A');
      console.error('Code:', firstError?.code || 'N/A');
      console.error('===================================');

      throw new ApiError(classified.statusCode, classified.message);
    }
  }

  const text = typeof response?.text === 'string' ? response.text : '';

  if (!text.trim()) {
    throw new ApiError(502, 'AI returned an empty response.');
  }

  return text.trim();
};

module.exports = {
  generateChatResponse,
  // exported for unit testing / diagnostics
  __test__: { classifyGeminiError, discoverWorkingModel },
};