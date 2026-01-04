import { GoogleGenAI, Type } from "@google/genai";
import { GeneratedReport, ResearchConfig, Source, SocialPosts, SocialVisuals, VisualAsset } from "../types";

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
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = constructPrompt(config, sources);

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview", 
      contents: prompt,
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

    const jsonStr = response.text?.trim();
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
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = `
You are a professional social media editor and copywriter.
Task: Rewrite the research insights into social media drafts that are perfectly formatted, easy to read, and free of special characters.

REPORT CONTEXT:
Summary: ${report.executiveSummary}
Key Takeaways: ${report.keyTakeaways.join('; ')}

GLOBAL FORMATTING RULES:
- Use plain ASCII punctuation only: " ' - ... (replace curly quotes and long dashes)
- Remove invisible characters.
- Keep line breaks intentional: No paragraph longer than 2 sentences.
- Ensure content is ready to copy/paste directly.

PLATFORM SPECIFIC INSTRUCTIONS:

1) LinkedIn:
- Professional tone.
- Length: 600–1200 characters.
- Structure:
  - Strong hook in first 2–3 lines.
  - Short paragraphs (1–2 sentences max).
  - Use a bullet list with "•" or numbered list "1)", "2)".
  - End with a soft CTA in a separate paragraph.
  - Hashtags in the final line only (3–6 tags).
- Max 2 emojis total.

2) X (Twitter Thread):
- Create a thread of 3–5 tweets.
- Each tweet MUST be under 280 characters.
- Start tweets with "1/", "2/", etc.
- Separate tweets with double newlines.
- Strong opinion-driven insights.
- Max 2 emojis total across the entire thread.

3) Facebook:
- Friendly and explanatory tone.
- Short paragraphs.
- Max 2 emojis total.

4) Xiaohongshu (Chinese):
- Title line in the format: 【Title Here】
- 5–7 numbered insights using emojis like 1️⃣, 2️⃣.
- Conversational tone, practical.
- End with engagement CTA.
- Max 4 emojis total (excluding the numbers).

Output JSON strictly adhering to the schema.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            linkedin: { type: Type.STRING },
            twitter: { type: Type.STRING, description: "Formatted thread with 1/, 2/ indicators" },
            facebook: { type: Type.STRING },
            xiaohongshu: { type: Type.STRING }
          },
          required: ["linkedin", "twitter", "facebook", "xiaohongshu"]
        }
      }
    });

    const jsonStr = response.text?.trim();
    if (!jsonStr) throw new Error("No social content generated");
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Social Generation Error:", error);
    throw error;
  }
};

// --- VISUAL ASSETS GENERATION ---

// 1. Generate Prompts & Text Specs using Gemini 3 Flash
const generateVisualSpecs = async (report: GeneratedReport): Promise<Omit<SocialVisuals, 'linkedin' | 'twitter' | 'facebook' | 'xiaohongshu'> & { [key: string]: Omit<VisualAsset, 'imageBase64'> }> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = `
You are a Visual Designer for a B2B AI research brand.
Brand Style: Modern, clean, enterprise-grade, dark background with subtle gradient, neon green/electric blue accents, minimal icons, no clutter.

Task: Create 4 image prompts (for background generation) and exact overlay text for social media.
Base this on the report Key Takeaways: ${report.keyTakeaways.slice(0, 3).join('; ')}

Outputs required for:
1) LinkedIn (1200x627): One key takeaway. Headline max 14 words. Subtext max 18 words.
2) Twitter (1600x900): Ultra-minimal. One bold statement max 12 words.
3) Facebook (1200x630): Similar to LinkedIn but softer.
4) Xiaohongshu (1080x1440): "Knowledge card" style. Title + 3-5 short numbered insights.

IMPORTANT: The "prompt" should describe the VISUAL BACKGROUND ONLY (no text in the prompt description, just abstract/tech vibes). The "overlayText" contains the text we will render via CSS.
`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          linkedin: {
            type: Type.OBJECT,
            properties: {
              prompt: { type: Type.STRING },
              overlayText: {
                type: Type.OBJECT,
                properties: {
                  headline: { type: Type.STRING },
                  subtext: { type: Type.STRING }
                }
              }
            }
          },
          twitter: {
            type: Type.OBJECT,
            properties: {
              prompt: { type: Type.STRING },
              overlayText: {
                type: Type.OBJECT,
                properties: {
                  headline: { type: Type.STRING }
                }
              }
            }
          },
          facebook: {
            type: Type.OBJECT,
            properties: {
              prompt: { type: Type.STRING },
              overlayText: {
                type: Type.OBJECT,
                properties: {
                  headline: { type: Type.STRING },
                  subtext: { type: Type.STRING }
                }
              }
            }
          },
          xiaohongshu: {
            type: Type.OBJECT,
            properties: {
              prompt: { type: Type.STRING },
              overlayText: {
                type: Type.OBJECT,
                properties: {
                  headline: { type: Type.STRING },
                  listItems: { type: Type.ARRAY, items: { type: Type.STRING } }
                }
              }
            }
          }
        },
        required: ["linkedin", "twitter", "facebook", "xiaohongshu"]
      }
    }
  });

  const jsonStr = response.text?.trim();
  if (!jsonStr) throw new Error("No visual specs generated");
  return JSON.parse(jsonStr);
};

// 2. Generate Actual Image using Gemini 2.5 Flash Image
const generateImage = async (prompt: string, aspectRatio: '16:9' | '3:4'): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  // Using gemini-2.5-flash-image for generation as per guidelines for general image tasks
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { text: prompt + " High quality, 4k, abstract technology background, dark mode, neon accents, no text in image." }
      ]
    },
    config: {
      imageConfig: {
        aspectRatio: aspectRatio,
      }
    }
  });

  // Extract base64 image
  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return part.inlineData.data;
    }
  }
  throw new Error("No image data returned");
};

export const generateSocialAssets = async (report: GeneratedReport): Promise<SocialVisuals> => {
  try {
    // Step 1: Get Specs
    const specs = await generateVisualSpecs(report);

    // Step 2: Generate Images in Parallel
    const [liImg, twImg, fbImg, xhsImg] = await Promise.all([
      generateImage(specs.linkedin.prompt, '16:9'),
      generateImage(specs.twitter.prompt, '16:9'),
      generateImage(specs.facebook.prompt, '16:9'),
      generateImage(specs.xiaohongshu.prompt, '3:4')
    ]);

    return {
      linkedin: { ...specs.linkedin, platform: 'linkedin', imageBase64: liImg } as VisualAsset,
      twitter: { ...specs.twitter, platform: 'twitter', imageBase64: twImg } as VisualAsset,
      facebook: { ...specs.facebook, platform: 'facebook', imageBase64: fbImg } as VisualAsset,
      xiaohongshu: { ...specs.xiaohongshu, platform: 'xiaohongshu', imageBase64: xhsImg } as VisualAsset,
    };
  } catch (error) {
    console.error("Visual Asset Generation Error:", error);
    throw error;
  }
};