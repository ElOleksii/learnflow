import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { GoogleGenAI } from '@google/genai';
import { ConfigService } from '@nestjs/config';

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
    const prompt = `Your goal is create roadmap for learning ${subjectName}. 
    Return ONLY valid JSON.
    Each topic MUST contain:
    - name (string)
    - description (string)
    - estimatedHours (number)
    - order (number)
    - prerequisites (array of topic names)

    estimatedHours MUST be a number.`;

    const res = await this.ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
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
