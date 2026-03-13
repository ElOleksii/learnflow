export const generateRoadmapPrompt = (subjectName: string): string => {
  return `
You are an expert learning roadmap generator.

Task: Generate a learning roadmap for the subject "${subjectName}".

Rules:
1. Return ONLY a **raw JSON array**. Do NOT include markdown, code blocks, explanations, or comments.
2. Each topic must have all fields:
   - name (string)
   - description (string)
   - estimatedHours (number, between 2 and 10)
   - order (number, starting from 1)
   - prerequisites (array of topic names that must come before this topic)
3. All prerequisites must refer to other topic names in the same array.
4. Ensure JSON is **valid and parsable**.
5. The total number of topics should be between 10 and 15.
6. The roadmap should be logically ordered so that prerequisites appear before dependent topics.
7. If there are no prerequisites for a topic, return an empty array.
8. Do not invent extra fields or omit any required field.

Output example:

[
  {
    "name": "Variables",
    "description": "Learn about variables and data types in the language.",
    "estimatedHours": 3,
    "order": 1,
    "prerequisites": []
  },
  {
    "name": "Functions",
    "description": "Learn how to define and call functions.",
    "estimatedHours": 4,
    "order": 2,
    "prerequisites": ["Variables"]
  }
]
`;
};
