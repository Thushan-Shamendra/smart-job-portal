import Groq from "groq-sdk";
import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";

const getGroqClient = () => {
    const apiKey = process.env.GROQ_API_KEY;
  
    if (!apiKey) {
      throw new Error(
        "GROQ_API_KEY is missing. Add it to the backend .env file."
      );
    }
  
    return new Groq({
      apiKey,
    });
};

const extractPDFText = async (buffer) => {
  const parser = new PDFParse({
    data: new Uint8Array(buffer),
  });

  try {
    const result = await parser.getText();
    return result.text;
  } finally {
    await parser.destroy();
  }
};

const extractDOCXText = async (buffer) => {
  const result = await mammoth.extractRawText({
    buffer,
  });

  return result.value;
};

export const extractCVText = async (file) => {
  let text;

  if (file.mimetype === "application/pdf") {
    text = await extractPDFText(file.buffer);
  } else if (
    file.mimetype ===
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    text = await extractDOCXText(file.buffer);
  } else {
    throw new Error("Unsupported CV file type");
  }

  const cleanedText = text.trim();

  if (!cleanedText) {
    throw new Error(
      "No readable text was found in the CV. Please upload a text-based CV."
    );
  }

  return cleanedText;
};

export const extractSkillsWithGroq = async (cvText) => {
    const groq = getGroqClient();
  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",

    messages: [
      {
        role: "system",
        content: `
You extract skills from CVs.

Extract only skills explicitly mentioned in the CV.

Include:
- Programming languages
- Frameworks and libraries
- Databases
- Cloud and DevOps technologies
- Testing tools
- Development and design tools
- Technical concepts
- Professional skills
- Soft skills

Do not invent skills.
Remove duplicates.
Return valid JSON only using this structure:
{
  "skills": ["Skill 1", "Skill 2"]
}
        `.trim(),
      },
      {
        role: "user",
        content: `Extract all skills from this CV:\n\n${cvText}`,
      },
    ],

    response_format: {
      type: "json_object",
    },

    temperature: 0,
  });

  const content = completion.choices[0]?.message?.content;

  if (!content) {
    throw new Error("Groq did not return a response");
  }

  const result = JSON.parse(content);

  if (!Array.isArray(result.skills)) {
    throw new Error("Groq returned an invalid skills result");
  }

  return [
    ...new Set(
      result.skills
        .filter((skill) => typeof skill === "string")
        .map((skill) => skill.trim())
        .filter(Boolean)
    ),
  ];
};

export const analyzeCV = async (file) => {
  const cvText = await extractCVText(file);
  const skills = await extractSkillsWithGroq(cvText);

  return {
    skills,
  };
};