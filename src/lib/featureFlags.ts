/**
 * @file Centralised feature flag definitions for progressive rollouts.
 */

export type FeatureFlags = {
  usePersonaEverywhere: boolean;
};

const defaultFlags: FeatureFlags = {
  usePersonaEverywhere:
    process.env.NEXT_PUBLIC_USE_PERSONA_EVERYWHERE === "true"
};

export const featureFlags: FeatureFlags = defaultFlags;

export const isPersonaEverywhereEnabled = (): boolean =>
  featureFlags.usePersonaEverywhere;
