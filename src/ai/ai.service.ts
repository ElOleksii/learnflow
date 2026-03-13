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
    const prompt = `Your goal is create roadmap for learning ${subjectName}. Return ONLY a raw JSON array. No markdown, no code blocks, no explanation. Just the JSON array itself. It must contain array of topics with name, short description, estimated hours, order, and prerequisites (array of topic names that must be learned first).`;

    const res = await this.ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: prompt,
    });

    if (!res.text) {
      throw new InternalServerErrorException('AI returned empty response');
    }

    try {
      const json = JSON.parse(res.text) as GeneratedTopic[];
      return json;
    } catch (e) {
      console.error(e);
      throw new InternalServerErrorException('Invalid json');
    }
  }
}
