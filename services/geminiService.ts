import { GoogleGenAI, Type } from "@google/genai";
import { GeneratedReport, ResearchConfig, Source, SocialPosts, SocialVisuals, VisualAsset } from "../types";

const getApiKey = () => {
  const key = process.env.API_KEY;
  // In Vite builds, if the env var is missing, it might be baked as the literal string "undefined"
  if (!key || key === 'undefined' || key.length < 5) {
    throw new Error("Gemini API Key is missing or invalid. Please ensure API_KEY is set in Vercel and you have TRIGGERED A REDEPLOY.");
  }
  return key;
};

const constructPrompt = (config: ResearchConfig, sources: Source[]): string => {
  const sourceContext = sources
    .map((s, i) => `[Source ${i + 1}: ${s.name}] type: ${s.type}\nContent snippet: ${s.content.slice(0, 2000)}...`) 
    .join("\n\n");

  return `
You are a senior industry analyst at CrestPoint AI Brain, a top-tier strategy consulting firm.
Your task is to generate a professional industry report based strictly on the user's requirements and the provided knowledge base.

RESEARCH PARAMETERS:
- Industry/Topic: ${config.industry}
- Focus Areas: ${config.focusAreas.join(", ")}
- Target Audience: ${config.targetAudience}
- Geography: ${config.geography}
- Time Horizon: ${config.timeHorizon}
- Depth: ${config.reportDepth}
- Language: ${config.outputLanguage}

KNOWLEDGE BASE (CONTEXT):
${sourceContext || "No specific documents provided. Rely on general professional knowledge."}

STRICT INSTRUCTIONS FOR THE "fullReport" SECTION:
1. Remove all AI-style formatting symbols, including but not limited to Markdown headings (##, ###) and bold markers (**).
2. Convert the entire content into natural paragraphs with clear logical flow.
3. Keep all original facts and data points.
4. Use formal, neutral, and analytical language.
5. Ensure the final output looks like it was written by a human analyst.
6. OUTPUT FORMAT for "fullReport": Plain text only, double newlines between paragraphs.

Output JSON strictly adhering to the schema.
`;
};

export const generateIndustryReport = async (
  config: ResearchConfig,
  sources: Source[]
): Promise<GeneratedReport> => {
  const apiKey = getApiKey();

  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = constructPrompt(config, sources);

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview", 
      contents: { parts: [{ text: prompt }] },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            executiveSummary: { type: Type.STRING },
            fullReport: { type: Type.STRING },
            keyTakeaways: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            citations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  sourceName: { type: Type.STRING },
                  quote: { type: Type.STRING },
                  pageOrSection: { type: Type.STRING }
                }
              }
            }
          },
          required: ["executiveSummary", "fullReport", "keyTakeaways", "citations"]
        }
      }
    });

    let jsonStr = response.text?.trim() || "";
    if (jsonStr.startsWith("```")) {
      jsonStr = jsonStr.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }
    
    if (!jsonStr) throw new Error("No response generated");

    const data = JSON.parse(jsonStr);
    return {
      ...data,
      generationTime: new Date().toISOString(),
      model: "gemini-3-flash-preview"
    };
  } catch (error) {
    console.error("Gemini Generation Error:", error);
    throw error;
  }
};

export const generateSocialMediaContent = async (report: GeneratedReport): Promise<SocialPosts> => {
  const apiKey = getApiKey();

  try {
    const ai = new GoogleGenAI({ apiKey });
    const prompt = `
You are a professional social media editor and ghostwriter for a C-Level executive.
Task: Rewrite the research insights into social media drafts. 

REPORT CONTEXT:
Summary: ${report.executiveSummary}
Key Takeaways: ${report.keyTakeaways.join('; ')}

CRITICAL FORMATTING RULES:
1. NO MARKDOWN BOLDING. Output must be plain text.
2. USE DOUBLE NEWLINES (\\n\\n) between paragraphs.
3. TONE: Professional, natural, human. Avoid AI clichés.

PLATFORM SPECIFIC INSTRUCTIONS:
1) LinkedIn: Thought-leader style with hooks and bullet points.
2) X (Twitter Thread): Punchy thread format separated by double newlines.
3) Facebook: Narrative, casual storytelling style.
4) Xiaohongshu (Rednote): Emoji-rich listicle style.

Output JSON strictly adhering to the schema.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: { parts: [{ text: prompt }] },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            linkedin: { 
              type: Type.OBJECT, 
              properties: { title: { type: Type.STRING }, content: { type: Type.STRING } },
              required: ["title", "content"]
            },
            twitter: { 
              type: Type.OBJECT, 
              properties: { title: { type: Type.STRING }, content: { type: Type.STRING } },
              required: ["title", "content"]
            },
            facebook: { 
              type: Type.OBJECT, 
              properties: { title: { type: Type.STRING }, content: { type: Type.STRING } },
              required: ["title", "content"]
            },
            xiaohongshu: { 
              type: Type.OBJECT, 
              properties: { title: { type: Type.STRING }, content: { type: Type.STRING } },
              required: ["title", "content"]
            }
          },
          required: ["linkedin", "twitter", "facebook", "xiaohongshu"]
        }
      }
    });

    let jsonStr = response.text?.trim() || "";
    if (jsonStr.startsWith("```")) {
      jsonStr = jsonStr.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }
    
    if (!jsonStr) throw new Error("No social content generated");
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Social Generation Error:", error);
    throw error;
  }
};

const generateVisualSpecs = async (report: GeneratedReport): Promise<any> => {
  const apiKey = getApiKey();
  const ai = new GoogleGenAI({ apiKey });
  const prompt = `
You are a professional visual designer. Generate text-free image prompts for an enterprise-grade AI research platform.
Topic: ${report.executiveSummary.split('.')[0]}

Output JSON with a 'prompt' field for: linkedin, twitter, facebook, xiaohongshu.
PROMPTS MUST BE VISUAL ONLY. NO TEXT.
`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: { parts: [{ text: prompt }] },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          linkedin: { type: Type.OBJECT, properties: { prompt: { type: Type.STRING } }, required: ["prompt"] },
          twitter: { type: Type.OBJECT, properties: { prompt: { type: Type.STRING } }, required: ["prompt"] },
          facebook: { type: Type.OBJECT, properties: { prompt: { type: Type.STRING } }, required: ["prompt"] },
          xiaohongshu: { type: Type.OBJECT, properties: { prompt: { type: Type.STRING } }, required: ["prompt"] }
        },
        required: ["linkedin", "twitter", "facebook", "xiaohongshu"]
      }
    }
  });

  let jsonStr = response.text?.trim() || "";
  if (jsonStr.startsWith("```")) {
    jsonStr = jsonStr.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
  }
  return JSON.parse(jsonStr);
};

const generateImage = async (prompt: string, aspectRatio: '16:9' | '3:4'): Promise<string> => {
  const apiKey = getApiKey();
  const ai = new GoogleGenAI({ apiKey });
  const finalPrompt = prompt + " --no text --no writing --no symbols. Enterprise-grade, abstract, clean background.";
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts: [{ text: finalPrompt }] },
    config: {
      imageConfig: { aspectRatio: aspectRatio }
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) return part.inlineData.data;
  }
  throw new Error("No image data returned");
};

export const generateSocialAssets = async (report: GeneratedReport): Promise<SocialVisuals> => {
  try {
    const specs = await generateVisualSpecs(report);

    const [liImg, twImg, fbImg, xhsImg] = await Promise.all([
      generateImage(specs.linkedin.prompt, '16:9'),
      generateImage(specs.twitter.prompt, '16:9'),
      generateImage(specs.facebook.prompt, '16:9'),
      generateImage(specs.xiaohongshu.prompt, '3:4')
    ]);

    return {
      linkedin: { platform: 'linkedin', prompt: specs.linkedin.prompt, imageBase64: liImg },
      twitter: { platform: 'twitter', prompt: specs.twitter.prompt, imageBase64: twImg },
      facebook: { platform: 'facebook', prompt: specs.facebook.prompt, imageBase64: fbImg },
      xiaohongshu: { platform: 'xiaohongshu', prompt: specs.xiaohongshu.prompt, imageBase64: xhsImg },
    };
  } catch (error) {
    console.error("Visual Asset Generation Error:", error);
    throw error;
  }
};