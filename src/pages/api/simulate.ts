
import { api } from "../../lib/apiClient";

import type { SimulationRequest, SimulationResult, SimulationResponsePayload } from "../../lib/types";
import type { NextApiRequest, NextApiResponse } from "next";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY || process.env.NEXT_OPENAI_API_KEY;
const OPENAI_MODEL = process.env.OPENAI_MODEL || process.env.NEXT_OPENAI_MODEL || "gpt-4.1-mini";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SimulationResponsePayload | SimulationResult[] | { error: string }>
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  if (!OPENAI_API_KEY) {
    return res.status(500).json({ error: "OPENAI_API_KEY is not configured on the server." });
  }

  const payload = (typeof req.body === "string" ? JSON.parse(req.body) : req.body) as SimulationRequest;

  try {
    const results = await api.simulate(payload, undefined, {
      apiKey: OPENAI_API_KEY,
      model: OPENAI_MODEL,
      routeHandler: true
    });
    // サーバー側のストアに反映済みの最新スコアを添えて返す（クライアントはこれを取り込み）
    const updatedScores = await api.getScores(payload.ideaIds);
    return res.status(200).json({ results, updatedScores });
  } catch (error) {
    console.error("[pages/api/simulate]", error);
    return res
      .status(500)
      .json({ error: (error as Error)?.message ?? "Failed to run simulation." });
  }
}
