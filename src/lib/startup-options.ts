export const STARTUP_CATEGORIES = [
  { value: 'consumer', label: 'Consumer app' },
  { value: 'marketplace', label: 'Marketplace' },
  { value: 'fintech', label: 'Fintech' },
  { value: 'health', label: 'Health' },
  { value: 'education', label: 'Education' },
  { value: 'b2b', label: 'B2B software' },
  { value: 'climate', label: 'Climate' },
  { value: 'other', label: 'Other' },
] as const;

export const STARTUP_STAGES = [
  { value: 'idea', label: 'Idea' },
  { value: 'building', label: 'Building' },
  { value: 'prototype', label: 'Prototype' },
  { value: 'beta', label: 'Beta' },
  { value: 'launched', label: 'Launched' },
] as const;

export type StartupCategory = (typeof STARTUP_CATEGORIES)[number]['value'];
export type StartupStage = (typeof STARTUP_STAGES)[number]['value'];
export type StartupVisibility = 'draft' | 'published';

export function startupCategoryLabel(value: string | null | undefined): string {
  return STARTUP_CATEGORIES.find((category) => category.value === value)?.label ?? 'Other';
}

export function startupStageLabel(value: string | null | undefined): string {
  return STARTUP_STAGES.find((stage) => stage.value === value)?.label ?? '';
}
