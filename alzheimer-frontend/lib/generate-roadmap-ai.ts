/**
 * AI-generated learning roadmaps (Gemini). Used by API routes — do not import from client components.
 */
import { GoogleGenAI } from "@google/genai";
import { geminiTextModel } from "@/config/gemini-models";
import type { RoadmapData, RoadmapResourceItem, RoadmapStage } from "@/lib/roadmap-from-topic";

export type RoadmapExperienceLevel = "beginner" | "intermediate" | "advanced";

function extractJson(text: string): unknown {
  const t = text.trim();
  const fence = t.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = fence ? fence[1]!.trim() : t;
  return JSON.parse(raw);
}

function normalizeResourceType(t: string): RoadmapResourceItem["type"] {
  const s = String(t ?? "article").toLowerCase();
  if (s === "video" || s === "article" || s === "course" || s === "book") return s;
  return "article";
}

type RawStage = {
  name?: string;
  description?: string;
  timeEstimate?: string;
  duration?: string;
  skills?: unknown;
  resources?: unknown;
};

type RawRoadmap = {
  title?: string;
  overview?: string;
  timeEstimate?: string;
  stages?: RawStage[];
  additionalTips?: unknown;
  proTips?: unknown;
};

function normalizeStages(stages: RawStage[]): RoadmapStage[] {
  return stages.map((st) => {
    const dur = String(st.timeEstimate ?? st.duration ?? "3–4 weeks").trim();
    const skills = Array.isArray(st.skills) ? st.skills.map((x) => String(x).slice(0, 80)) : [];
    const resIn = Array.isArray(st.resources) ? st.resources : [];
    const resources: RoadmapResourceItem[] = resIn.map((r) => {
      const o = r as Record<string, unknown>;
      return {
        name: String(o.name ?? "Resource").slice(0, 120),
        type: normalizeResourceType(String(o.type ?? "article")),
      };
    });
    const cappedResources = resources.slice(0, 3);
    return {
      name: String(st.name ?? "Stage").slice(0, 80),
      description: String(st.description ?? "").slice(0, 280),
      duration: dur,
      skills: skills.length > 0 ? skills : ["Core skills for this stage"],
      resources:
        cappedResources.length > 0 ? cappedResources : [{ name: "Curated learning materials", type: "article" }],
    };
  });
}

/**
 * Generates a full roadmap structure via Gemini (no static templates).
 */
export async function generateRoadmapDataWithGemini(params: {
  topic: string;
  experience: RoadmapExperienceLevel;
  preferredLanguage?: string;
  focus?: string;
}): Promise<RoadmapData> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const { topic, experience, preferredLanguage, focus } = params;
  const topicClean = topic.trim().slice(0, 200);

  const userPrompt = `You are an expert curriculum designer. Build ONE learning roadmap JSON for this exact request.

Topic / path: "${topicClean}"
Stated learner level: ${experience}
${preferredLanguage ? `Language or stack emphasis: ${preferredLanguage}` : ""}
${focus ? `Extra focus: ${focus}` : ""}

Rules:
- Stages must be specific to THIS topic (avoid generic filler like only "Fundamentals" with no domain detail).
- Use 6–8 ordered stages from foundations toward job-ready or advanced outcomes.
- Each stage: 4–8 concrete skills (short phrases).
- Each stage: exactly 2–3 resources with realistic titles (known books, docs, courses, channels) — titles only; types must be one of: video, article, course, book.
- Overview: 2–4 sentences tailored to the topic and level.
- timeEstimate: overall realistic range (e.g. "5–9 months").
- additionalTips: 6–10 actionable tips as strings.

Return ONLY valid JSON (no markdown fences) with this shape:
{
  "title": "string",
  "overview": "string",
  "timeEstimate": "string",
  "stages": [
    {
      "name": "string",
      "description": "string",
      "timeEstimate": "string (per-stage duration)",
      "skills": ["string"],
      "resources": [{ "name": "string", "type": "video|article|course|book" }]
    }
  ],
  "additionalTips": ["string"]
}`;

  const ai = new GoogleGenAI({ apiKey: key });
  const response = await ai.models.generateContent({
    model: geminiTextModel,
    contents: [{ role: "user", parts: [{ text: userPrompt }] }],
    config: {
      systemInstruction:
        "You output only valid JSON objects. No markdown, no commentary. Be specific and practical.",
      temperature: 0.45,
      maxOutputTokens: 8192,
    },
  });

  const text = response.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text?.trim()) {
    throw new Error("Empty model response");
  }

  let parsed: RawRoadmap;
  try {
    parsed = extractJson(text) as RawRoadmap;
  } catch {
    throw new Error("Failed to parse roadmap JSON");
  }

  if (!parsed.title || !Array.isArray(parsed.stages) || parsed.stages.length < 3) {
    throw new Error("Invalid roadmap structure from model");
  }

  const stages = normalizeStages(parsed.stages);
  const tipsRaw = Array.isArray(parsed.additionalTips)
    ? parsed.additionalTips
    : Array.isArray(parsed.proTips)
      ? parsed.proTips
      : [];
  const proTips = tipsRaw.map((x) => String(x).slice(0, 200)).filter(Boolean);
  const tips = proTips.length > 0 ? proTips : ["Review weekly", "Build one small project per stage", "Take notes while learning"];

  const flatResources: RoadmapResourceItem[] = [];
  for (const s of stages) {
    for (const r of s.resources) {
      flatResources.push(r);
    }
  }
  const topResources = flatResources.slice(0, 12);

  const roadmap: RoadmapData = {
    title: String(parsed.title).slice(0, 120),
    overview: String(parsed.overview ?? "").slice(0, 600) || `A structured path to learn ${topicClean}.`,
    experience,
    timeEstimate: String(parsed.timeEstimate ?? "6–12 months").slice(0, 80),
    stages,
    resources: topResources,
    proTips: tips,
  };

  return roadmap;
}

/**
 * Shape stored in Mongo `roadmap.roadmap` for /dashboard/roadmap when generated via coins flow.
 */
export function toMongoRoadmapPayload(data: RoadmapData) {
  return {
    title: data.title,
    overview: data.overview,
    stages: data.stages.map((s) => ({
      name: s.name,
      description: s.description,
      timeEstimate: s.duration,
      skills: s.skills,
      resources: s.resources.map((r) => ({
        name: r.name,
        type: r.type,
        url: "",
      })),
    })),
    additionalTips: data.proTips,
  };
}
