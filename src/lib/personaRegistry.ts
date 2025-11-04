/**
 * @file Compatibility registry bridging legacy agent IDs to persona references.
 * @remarks Provides helper utilities for the gradual migration away from agent- prefixed identifiers.
 */

import personaAliases from "../../shared/persona-aliases.json";

import type { PersonaRef } from "./types";

const legacyWarned = new Set<string>();

const PERSONA_REFS: PersonaRef[] = (personaAliases as PersonaRef[]).map((alias) => ({
  personaId: alias.personaId,
  slug: alias.slug,
  displayName: alias.displayName,
  legacyAgentId: alias.legacyAgentId,
  category: alias.category,
  segment: alias.segment
}));

const PERSONA_BY_ID = new Map<string, PersonaRef>();
const PERSONA_BY_LEGACY = new Map<string, PersonaRef>();

for (const ref of PERSONA_REFS) {
  PERSONA_BY_ID.set(ref.personaId, ref);
  if (ref.legacyAgentId) {
    PERSONA_BY_LEGACY.set(ref.legacyAgentId, ref);
  }
}

export const personaRegistry = PERSONA_REFS;

export function resolvePersonaRef(options: {
  personaId?: string | null;
  legacyAgentId?: string | null;
  fallbackDisplayName?: string;
}): PersonaRef | undefined {
  if (options.personaId) {
    const ref = PERSONA_BY_ID.get(options.personaId);
    if (ref) {
      return ref;
    }
  }

  if (options.legacyAgentId) {
    const ref = PERSONA_BY_LEGACY.get(options.legacyAgentId);
    if (ref) {
      logLegacyAgentUsage(options.legacyAgentId);
      return ref;
    }
    logLegacyAgentUsage(options.legacyAgentId, true);
    if (options.fallbackDisplayName) {
      return {
        personaId: options.legacyAgentId,
        legacyAgentId: options.legacyAgentId,
        displayName: options.fallbackDisplayName,
        slug: options.legacyAgentId
      };
    }
  }

  if (options.personaId) {
    return {
      personaId: options.personaId,
      displayName: options.personaId,
      slug: options.personaId
    };
  }

  return undefined;
}

export function logLegacyAgentUsage(agentId: string, unresolved = false) {
  if (legacyWarned.has(agentId)) return;
  legacyWarned.add(agentId);
  const prefix = unresolved ? "[persona-migration] unresolved agentId" : "[persona-migration] legacy agentId";
  console.warn(`${prefix} '${agentId}' will be removed in a future release. Please migrate to personaId.`);
}
