
import { GoogleGenAI, Type } from "@google/genai";
import { ClothingCategory } from '../types';

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export interface ClothingInfo {
  name: string;
  description: string;
  category: ClothingCategory;
}

export const generateClothingInfo = async (
  imageBase64: string
): Promise<ClothingInfo> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      // FIX: The `contents` field for multimodal input should be an object with a `parts` array.
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: imageBase64,
            },
          },
          {
            text: "Analyze this image of a clothing item. Based on the image, provide a suitable name, a short description for a clothing exchange app, and classify it into one of the following categories: T-SHIRT, JEANS, DRESS, JACKET, ACCESSORY. The name and description should be in Korean. Return the result as a JSON object.",
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: {
              type: Type.STRING,
              description: "A concise and attractive name for the clothing item in Korean.",
            },
            description: {
              type: Type.STRING,
              description: "A brief, appealing description of the item's style, material, and condition in Korean.",
            },
            category: {
              type: Type.STRING,
              enum: ['T-SHIRT', 'JEANS', 'DRESS', 'JACKET', 'ACCESSORY'],
              description: "The category that best fits the item.",
            },
          },
          required: ["name", "description", "category"],
        },
      },
    });

    const jsonString = response.text;
    const parsedJson = JSON.parse(jsonString);
    
    // Validate category
    const validCategories: ClothingCategory[] = ['T-SHIRT', 'JEANS', 'DRESS', 'JACKET', 'ACCESSORY'];
    if (!validCategories.includes(parsedJson.category)) {
        throw new Error(`Invalid category received from API: ${parsedJson.category}`);
    }

    return parsedJson as ClothingInfo;

  } catch (error) {
    console.error("Error generating clothing info with Gemini:", error);
    throw new Error("이미지 분석에 실패했습니다. 다시 시도하거나 직접 정보를 입력해주세요.");
  }
};
