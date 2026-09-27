import type { AampersandCoverage, AampersandPreview, AampersandTagTone } from "@/data/aampersandEntries";

export interface DevlogPublicationSettings {
  slug: string;
  coverage: AampersandCoverage;
  number: number;
  seoTitle: string;
  socialDescription: string;
  jsonLdHeadline: string;
  publishedAt: string;
  cardTitle: string;
  cardDescription: string;
  tag: string;
  tagTone: AampersandTagTone;
  preview: AampersandPreview;
  llmsDescription: string;
}

export interface DevlogRepositoryState {
  originalSlug: string;
  baseRevision: string;
  ownership: "generated" | "manual";
}

export interface DevlogPublicationDraft {
  source: string;
  settings: {
    title: string;
    description: string;
    publication: DevlogPublicationSettings;
  };
  repository: DevlogRepositoryState | null;
}

export interface RepositoryEntryDraft extends DevlogPublicationDraft {
  version: 2;
}

export type PublicationSeverity = "error" | "warning";

export interface PublicationIssue {
  severity: PublicationSeverity;
  code: string;
  message: string;
  field?: string;
}

export interface PublicationChange {
  path: string;
  kind: "create" | "update";
  before: string | null;
  after: string;
}

export interface PublicationPlan {
  revision: string;
  changes: PublicationChange[];
  issues: PublicationIssue[];
}
