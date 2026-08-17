import { DocType, IdentitasRPM } from '../types';
import { buildUniversalCtPrompt, buildUnifiedAllDocsPrompt } from './rpmPrompt';

export { buildUniversalCtPrompt, buildUnifiedAllDocsPrompt };

// 1. SETTING MODEL NAME REUSABLE
export const MODEL_NAME = 'gemini-3.6-flash';

/**
 * Clean and extract raw JSON text from Gemini API response or markdown block
 */
export function cleanJsonResponse(data: any): string {
  let text = '';
  if (typeof data === 'string') {
    text = data;
  } else if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
    text = data.candidates[0].content.parts[0].text;
  } else if (data?.data) {
    if (typeof data.data === 'string') {
      text = data.data;
    } else {
      return JSON.stringify(data.data);
    }
  } else if (data?.text) {
    text = data.text;
  } else {
    text = JSON.stringify(data);
  }

  // Remove markdown code fences ```json ... ```
  let cleaned = text.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json\s*/, '').replace(/\s*```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```\s*/, '').replace(/\s*```$/, '');
  }

  // Find first '{' or '[' and last '}' or ']'
  const firstBrace = cleaned.indexOf('{');
  const firstBracket = cleaned.indexOf('[');
  let startIdx = 0;
  if (firstBrace !== -1 && (firstBracket === -1 || firstBrace < firstBracket)) {
    startIdx = firstBrace;
    const lastBrace = cleaned.lastIndexOf('}');
    if (lastBrace !== -1 && lastBrace > startIdx) {
      cleaned = cleaned.substring(startIdx, lastBrace + 1);
    }
  } else if (firstBracket !== -1) {
    startIdx = firstBracket;
    const lastBracket = cleaned.lastIndexOf(']');
    if (lastBracket !== -1 && lastBracket > startIdx) {
      cleaned = cleaned.substring(startIdx, lastBracket + 1);
    }
  }

  return cleaned.trim();
}

/**
 * Direct REST API Gemini caller with Auto-Retry (max 3 attempts, 3s delay) and model fallback for 503, 429, and deprecated model errors
 */
async function callGeminiDirectRest(userPrompt: string): Promise<any> {
  const apiKey =
    (import.meta as any).env?.VITE_GEMINI_API_KEY ||
    (typeof process !== 'undefined' && ((process.env as any)?.GEMINI_API_KEY || (process.env as any)?.API_KEY)) ||
    '';

  if (!apiKey) {
    throw new Error('API Key tidak ditemukan di environment variable.');
  }

  const candidateModels = [MODEL_NAME, 'gemini-3.7-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];
  let lastError: any = null;

  for (const modelToUse of candidateModels) {
    const maxRetries = 3;
    let attempt = 0;

    while (attempt < maxRetries) {
      attempt++;
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelToUse}:generateContent?key=${apiKey}`;

        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: userPrompt }] }],
            generationConfig: {
              responseMimeType: 'application/json',
            },
          }),
        });

        if (!response.ok) {
          let errMessage = `Google API HTTP ${response.status}`;
          try {
            const errData = await response.json();
            errMessage = errData.error?.message || errMessage;
          } catch {
            // ignore json parse error on response
          }

          // If model is not available / deprecated, break to next candidate model immediately
          if (
            response.status === 404 ||
            /no longer available|not found|unsupported model|deprecated/i.test(errMessage)
          ) {
            console.warn(`[Model Fallback] Model ${modelToUse} tidak tersedia (${errMessage}). Beralih ke model berikutnya...`);
            lastError = new Error(errMessage);
            break;
          }

          // Cek error 503 (High Demand / Service Unavailable) atau 429 (Rate Limit / Quota)
          const isRateLimitOrHighDemand =
            response.status === 429 ||
            response.status === 503 ||
            response.status === 500 ||
            /429|503|500|quota|rate limit|resource exhausted|overloaded|high demand|unavailable/i.test(errMessage);

          if (isRateLimitOrHighDemand && attempt < maxRetries) {
            console.warn(
              `[Auto-Retry ${attempt}/${maxRetries} (${modelToUse})] Mendeteksi HTTP ${response.status} (${errMessage}). Menunggu jeda 3 detik...`
            );
            await new Promise((resolve) => setTimeout(resolve, 3000));
            continue;
          }

          throw new Error(errMessage);
        }

        const rawResult = await response.json();
        const rawText = cleanJsonResponse(rawResult);
        if (!rawText) {
          throw new Error(`Respon kosong dari Google Gemini API (${modelToUse})`);
        }

        try {
          return JSON.parse(rawText);
        } catch (err: any) {
          console.error('JSON Parsing Error:', err, 'Raw Text:', rawText);
          throw new Error(`Gagal mengurai respon JSON dari model: ${err.message}`);
        }
      } catch (error: any) {
        lastError = error;

        // If deprecated model error in message, switch model
        if (/no longer available|not found|unsupported model|deprecated/i.test(error?.message || '')) {
          break;
        }

        const isRetryableError =
          /429|503|500|quota|rate limit|resource exhausted|overloaded|high demand|unavailable|fetch|network/i.test(
            error?.message || ''
          );

        if (isRetryableError && attempt < maxRetries) {
          console.warn(
            `[Auto-Retry ${attempt}/${maxRetries} (${modelToUse})] Terjadi error koneksi/API (${error.message}). Menunggu jeda 3 detik...`
          );
          await new Promise((resolve) => setTimeout(resolve, 3000));
          continue;
        }

        break;
      }
    }
  }

  throw lastError || new Error(`Gagal memanggil Gemini API setelah mencoba model yang tersedia.`);
}

/**
 * Generate RPM Document using pure direct async/await call to Gemini API
 */
export async function generateRPM(formData: Partial<IdentitasRPM>): Promise<any> {
  const promptText = buildUniversalCtPrompt('rpm', formData);

  try {
    const resultJson = await callGeminiDirectRest(promptText);

    if (!resultJson) {
      throw new Error('Hasil respon dari Gemini API kosong atau tidak dapat diuraikan.');
    }

    return resultJson;
  } catch (err: any) {
    console.error('Direct Gemini RPM API Call Failed:', err);
    throw err;
  }
}

/**
 * Generate any single document type (RPM, LKPD, Moodle, Asesmen, Rubrik)
 */
export async function generateDocumentWithAi(
  docType: DocType,
  metadata: Partial<IdentitasRPM>
): Promise<{ status: string; success: boolean; data: any }> {
  const promptText = buildUniversalCtPrompt(docType, metadata);

  try {
    const parsedData = await callGeminiDirectRest(promptText);

    if (!parsedData) {
      throw new Error(`Data dokumen ${docType.toUpperCase()} kosong atau format tidak valid.`);
    }

    return { status: 'success', success: true, data: parsedData };
  } catch (err: any) {
    console.error(`Direct Gemini API Call Failed for ${docType}:`, err);
    throw err;
  }
}

/**
 * Sequential Generator for all documents:
 * Generates documents ONE BY ONE (RPM -> LKPD -> Moodle -> Asesmen -> Rubrik)
 * with a 2-second delay between each document.
 * Includes per-document try-catch and retry so single document failures do not break the whole batch.
 */
export async function generateAllDocumentsWithAi(
  metadata: Partial<IdentitasRPM>,
  onProgress?: (docType: DocType, currentStep: number, totalSteps: number) => void
): Promise<Record<DocType, any>> {
  const docTypes: DocType[] = ['rpm', 'lkpd', 'moodle', 'asesmen', 'rubrik'];
  const finalResults: Partial<Record<DocType, any>> = {};

  for (let i = 0; i < docTypes.length; i++) {
    const docType = docTypes[i];
    if (onProgress) {
      onProgress(docType, i + 1, docTypes.length);
    }

    let success = false;
    let attempts = 0;
    const maxDocAttempts = 2;

    while (!success && attempts < maxDocAttempts) {
      attempts++;
      try {
        if (docType === 'rpm') {
          const rpmData = await generateRPM(metadata);
          finalResults.rpm = rpmData;
        } else {
          const res = await generateDocumentWithAi(docType, metadata);
          finalResults[docType] = res.data;
        }
        success = true;
      } catch (err: any) {
        console.warn(
          `[Batch Generator] Gagal menyusun dokumen ${docType.toUpperCase()} (percobaan ${attempts}/${maxDocAttempts}):`,
          err?.message || err
        );
        if (attempts < maxDocAttempts) {
          // Jeda 2 detik sebelum retry dokumen yang sama
          await new Promise((resolve) => setTimeout(resolve, 2000));
        } else {
          console.error(
            `[Batch Generator] Dokumen ${docType.toUpperCase()} dilewati karena gagal setelah ${maxDocAttempts} kali percobaan.`
          );
        }
      }
    }

    // Jeda 2 detik setelah tiap dokumen selesai sebelum dokumen berikutnya, kecuali dokumen terakhir
    if (i < docTypes.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
    }
  }

  return finalResults as Record<DocType, any>;
}
