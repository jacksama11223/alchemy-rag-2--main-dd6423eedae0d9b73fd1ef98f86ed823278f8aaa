const { GoogleGenAI } = require('@google/genai');
const ai = new GoogleGenAI({ apiKey: 'dummy' });

async function test() {
  try {
    const result = await ai.models.embedContent({
      model: 'gemini-embedding-2-preview',
      contents: 'Hello world',
      config: { outputDimensionality: 768 }
    });
    console.log(Object.keys(result));
  } catch (e) {
    console.log(e.message);
  }
}
test();
