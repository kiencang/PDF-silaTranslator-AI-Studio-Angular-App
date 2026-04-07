import { Injectable } from '@angular/core';
import { GoogleGenAI, ThinkingLevel } from '@google/genai';

@Injectable({
  providedIn: 'root'
})
export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    // GEMINI_API_KEY is injected via angular.json define
    this.ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  }

  async countTokens(fileData: string, mimeType: string): Promise<number> {
    const response = await this.ai.models.countTokens({
      model: 'gemini-3.1-pro-preview',
      contents: [
        {
          inlineData: {
            data: fileData,
            mimeType: mimeType
          }
        }
      ]
    });
    return response.totalTokens || 0;
  }

  async translate(
    fileData: string,
    mimeType: string,
    prompt: string,
    systemInstruction: string,
    temperature: number
  ): Promise<string> {
    const response = await this.ai.models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: [
        {
          inlineData: {
            data: fileData,
            mimeType: mimeType
          }
        },
        prompt
      ],
      config: {
        systemInstruction: systemInstruction,
        temperature: temperature,
        thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH }
      }
    });

    return response.text || '';
  }

  async translateHtml(
    htmlContent: string,
    prompt: string,
    systemInstruction: string,
    temperature: number
  ): Promise<string> {
    const response = await this.ai.models.generateContent({
      model: 'gemini-3.1-pro-preview',
      contents: [
        htmlContent,
        prompt
      ],
      config: {
        systemInstruction: systemInstruction,
        temperature: temperature,
        thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH }
      }
    });

    return response.text || '';
  }
}
