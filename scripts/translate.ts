import { BHASHINI_API_ENDPOINT, BHASHINI_SUBSCRIPTION_KEY } from '@env';
import { LANGUAGE_CODES } from '../constants/languages';

export async function translateTextAPI(
  text: string,
  from: string,
  to: string
): Promise<string> {
  if (!text.trim()) return '';

  const sourceLang = LANGUAGE_CODES[from];
  const targetLang = LANGUAGE_CODES[to];

  const requestData = {
    pipelineTasks: [
      {
        taskType: 'translation',
        config: {
          language: { sourceLanguage: sourceLang, targetLanguage: targetLang },
          serviceId: 'ai4bharat/indictrans-v2-all-gpu--t4',
        },
      },
    ],
    inputData: { input: [{ source: text }] },
  };

  try {
    const response = await fetch(BHASHINI_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: BHASHINI_SUBSCRIPTION_KEY,
      },
      body: JSON.stringify(requestData),
    });

    const textResponse = await response.text();
    let data;
    try {
      data = JSON.parse(textResponse);
    } catch {
      return `[${text}] → ${to}`;
    }

    return data.pipelineResponse?.[0]?.output?.[0]?.target || '';
  } catch (err) {
    console.error('Translation API error:', err);
    return `[${text}] → ${to}`;
  }
}
