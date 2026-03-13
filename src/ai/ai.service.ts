import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';
import { ConfigService } from '@nestjs/config';
import { generateRoadmapPrompt } from './prompt';

interface GeneratedTopic {
  name: string;
  description: string;
  estimatedHours: number;
  order: number;
  prerequisites: string[];
}

@Injectable()
export class AiService {
  private ai: GoogleGenAI;
  constructor(private config: ConfigService) {
    this.ai = new GoogleGenAI({ apiKey: config.get('GEMINI_KEY') });
  }

  async generateRoadmap(subjectName: string): Promise<GeneratedTopic[]> {
    const res = await this.ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: generateRoadmapPrompt(subjectName),
    });

    if (!res.text) {
      throw new InternalServerErrorException('AI returned empty response');
    }

    const cleanText = res.text.replace(/```json|```/g, '').trim();

    try {
      const json = JSON.parse(cleanText) as GeneratedTopic[];
      return json;
    } catch (e) {
      console.error(e);
      throw new InternalServerErrorException('Invalid json');
    }
  }
}
