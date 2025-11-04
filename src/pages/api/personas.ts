import {
  createPersonaProfileLocal,
  getPersonaProfilesLocal,
  upsertPersonaProfileLocal
} from "@/lib/apiClient";

import type { PersonaProfile } from "@/lib/types";
import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(
  req: NextApiRequest,
  res: NextApiResponse<PersonaProfile | PersonaProfile[] | { error: string }>
) {
  if (req.method === "GET") {
    const personas = getPersonaProfilesLocal();
    return res.status(200).json(personas);
  }

  if (req.method === "POST") {
    const payload = (typeof req.body === "string" ? JSON.parse(req.body) : req.body) as
      | PersonaProfile
      | (Omit<PersonaProfile, "id" | "createdAt" | "updatedAt"> & { id?: string });

    if (!payload) {
      return res.status(400).json({ error: "Invalid payload" });
    }

    const persona = payload.id
      ? upsertPersonaProfileLocal({
          ...(payload as PersonaProfile),
          createdAt:
            (payload as PersonaProfile).createdAt ?? new Date().toISOString(),
          updatedAt: new Date().toISOString()
        })
      : createPersonaProfileLocal(payload as Omit<PersonaProfile, "id" | "createdAt" | "updatedAt">);

    return res.status(200).json(persona);
  }

  res.setHeader("Allow", "GET,POST");
  return res.status(405).json({ error: "Method Not Allowed" });
}
