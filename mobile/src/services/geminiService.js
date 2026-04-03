import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Initialize Gemini API
const getGenAI = async () => {
  const customKey = await AsyncStorage.getItem('custom_gemini_api_key');
  const apiKey = customKey || process.env.EXPO_PUBLIC_GEMINI_API_KEY || 'YOUR_API_KEY_HERE';
  return new GoogleGenAI({ apiKey });
};

export const generateWithThinking = async (prompt) => {
  try {
    const ai = await getGenAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: prompt,
      config: {
        thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH }
      }
    });
    return { success: true, text: response.text };
  } catch (error) {
    console.error('Error generating with thinking:', error);
    return { success: false, error: error.message };
  }
};

export const generateImage = async (prompt, aspectRatio = '1:1', usePro = false) => {
  try {
    const ai = await getGenAI();
    const model = usePro ? 'gemini-3-pro-image-preview' : 'gemini-3.1-flash-image-preview';
    
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        imageConfig: {
          aspectRatio: aspectRatio,
          imageSize: "1K"
        }
      }
    });

    let imageUrl = null;
    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        const base64EncodeString = part.inlineData.data;
        imageUrl = `data:image/png;base64,${base64EncodeString}`;
        break;
      }
    }

    if (imageUrl) {
      return { success: true, imageUrl };
    } else {
      return { success: false, error: 'No image generated' };
    }
  } catch (error) {
    console.error('Error generating image:', error);
    return { success: false, error: error.message };
  }
};
