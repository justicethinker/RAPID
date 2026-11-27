export interface NotificationItem {
  id: string;
  kind: string;
  title: string;
  body: string;
  href: string | null;
  read_at: string | null;
  created_at: string;
}

export interface InvitationSummary {
  id: string;
  status: string;
  invitedAt: string;
  respondedAt: string | null;
  completedAt: string | null;
  rewardStatus: string;
  rewardSentAt: string | null;
  test: {
    id: string;
    title: string;
    question: string;
    terms: string;
    method: string | null;
    rewardNote: string | null;
    status: string;
    serviceKey: string;
    projectStatus: string;
    rewardAmount: number | null;
    taskRequiresReturn: boolean;
    taskUrl: string | null;
  };
}

export interface TesterOverviewData {
  application: {
    status: string;
    reference: string;
    appliedAt: string;
    city: string | null;
    ageBand: string | null;
    situation: string | null;
    interests: string[];
    whatsapp: string | null;
    whatsappReminders: boolean;
  };
  counts: { invitations: number; active: number; completed: number };
  nextAction: string;
  recent: InvitationSummary[];
}

export interface TesterInvitationDetail extends InvitationSummary {
  steps: Array<{ id: string; position: number; stepType: string; prompt: string; options: string[]; required: boolean; metadata: Record<string, unknown>; answer: unknown }>;
  screeners: Array<{ id: string; position: number; question: string; options: string[]; required: boolean; answer: unknown }>;
  action: { state: string; selfReportedOutcome: string | null; reason: string | null; verifiedAt: string | null; openedAt: string | null; openedCount: number };
  response: {
    outcome: string;
    note: string;
    consentToQuote: boolean;
    submittedAt: string;
  } | null;
}

export interface TesterHistoryItem extends InvitationSummary {
  outcome: string | null;
  note: string | null;
  submittedAt: string | null;
}

export type StartupVisibility = 'draft' | 'published';
export type PostStatus = 'draft' | 'published' | 'archived';

export interface FounderStartup {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  stage: string | null;
  websiteUrl: string | null;
  visibility: StartupVisibility;
  logoUrl: string | null;
  coverUrl: string | null;
  createdAt: string;
  updatedAt: string;
  counts: {
    posts: number;
    publishedPosts: number;
    waitlist: number;
  };
}

export interface FounderStartupResponse {
  startup: FounderStartup | null;
}

export interface MediaReference {
  id: string;
  url: string;
  altText: string | null;
}

export interface LinkedTestSummary {
  id: string;
  title: string | null;
  status: string | null;
}

export interface FounderPost {
  id: string;
  title: string;
  body: string;
  kind: string;
  status: PostStatus;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  moderatedAt: string | null;
  testId: string | null;
  eligibility: string | null;
  closesAt: string | null;
  linkedTest: LinkedTestSummary | null;
  images: MediaReference[];
}

export interface FounderPostsResponse {
  startup: {
    id: string;
    name: string;
    slug: string;
    visibility: StartupVisibility;
  } | null;
  posts: FounderPost[];
}

export interface WaitlistEntry {
  id: string;
  email: string;
  name: string | null;
  source: string | null;
  createdAt: string;
}

export interface AudienceFeedbackItem {
  id: string;
  body: string;
  status: 'visible' | 'hidden';
  createdAt: string;
  post: { id: string; title: string };
  authorName: string;
}

export interface AudiencePostEngagement {
  id: string;
  title: string;
  publishedAt: string | null;
  feedbackCount: number;
  impressions: number;
  opens: number;
}

export interface AudienceAnalytics {
  rangeDays: number;
  profileViews: number;
  postImpressions: number;
  postOpens: number;
  uniqueVisitors: number;
  sources: { source: string; count: number }[];
  daily: {
    date: string;
    profileViews: number;
    postImpressions: number;
    postOpens: number;
  }[];
}

export interface FounderAudienceResponse {
  startup: {
    id: string;
    name: string;
    slug: string;
    visibility: StartupVisibility;
  } | null;
  count: number;
  recent: WaitlistEntry[];
  followers: { count: number; trend: { date: string; count: number }[] };
  feedback: { count: number; items: AudienceFeedbackItem[] };
  demoClicks: number;
  posts: AudiencePostEngagement[];
  analytics: AudienceAnalytics;
}

export interface PublicStartupPost {
  id: string;
  title: string;
  body: string;
  kind: string;
  publishedAt: string;
  testId: string | null;
  eligibility: string | null;
  closesAt: string | null;
  linkedTest: LinkedTestSummary | null;
  images: MediaReference[];
}

export interface PublicStartup {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  stage: string | null;
  websiteUrl: string | null;
  logoUrl: string | null;
  coverUrl: string | null;
  followers: number;
  following: boolean;
  isOwner: boolean;
  posts: PublicStartupPost[];
}

export interface PublicStartupResponse {
  startup: PublicStartup;
}

export interface FeedStartupSummary {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  stage: string | null;
  websiteUrl: string | null;
  logoUrl: string | null;
  coverUrl: string | null;
  followers: number;
}

export interface FeedItem {
  id: string;
  title: string;
  body: string;
  kind: string;
  publishedAt: string;
  createdAt: string;
  images: MediaReference[];
  feedbackCount: number;
  following: boolean;
  isOwner: boolean;
  startup: FeedStartupSummary;
}

export interface DiscoveryFeedResponse {
  items: FeedItem[];
  nextCursor: string | null;
}

export interface ModerationFeedback {
  id: string;
  body: string;
  status: 'visible' | 'hidden';
  createdAt: string;
  post: { id: string; title: string };
  authorName: string;
}

export interface ModerationReport {
  id: string;
  targetType: 'post' | 'feedback' | 'startup';
  targetId: string;
  reason: string;
  status: string;
  createdAt: string;
  reporterName: string;
  target: { title: string | null; detail: string | null };
}

export interface ModerationPost {
  id: string;
  title: string;
  status: string;
  moderatedAt: string;
  moderatedByName: string | null;
  startupName: string;
}

export interface ModerationStartup {
  id: string;
  name: string;
  slug: string;
  moderatedAt: string;
  moderatedByName: string | null;
}

export interface StaffModerationResponse {
  reports: ModerationReport[];
  feedback: ModerationFeedback[];
  moderatedPosts: ModerationPost[];
  moderatedStartups: ModerationStartup[];
}

export interface FounderCounts {
  invited: number;
  accepted: number;
  declined: number;
  completed: number;
  responses: number;
  responseRate: number | null;
}

export interface FounderTestSummary {
  id: string;
  title: string;
  question: string;
  audienceCode: string | null;
  audienceDescription: string | null;
  terms: string;
  rewardNote: string | null;
  status: string;
  decision: string | null;
  decidedAt: string | null;
  createdAt: string;
  publishedAt: string | null;
  startupId: string | null;
  startupName: string | null;
  method: string | null;
  sampleTarget: number | null;
  reportDueAt: string | null;
  submissionId: string | null;
  serviceKey: string;
  projectStatus: string;
  paymentStatus: string;
  priceAmount: number | null;
  priceCurrency: string | null;
  taskUrl: string | null;
  taskRequiresReturn: boolean;
  rewardAmount: number | null;
  briefId: string | null;
  counts: FounderCounts;
}

export interface FounderTestDetail extends FounderTestSummary {
  outcomes: { outcome: string; count: number }[];
  actionCounts: { assigned: number; linkOpened: number; selfReported: number; verified: number };
  actionReasons: Array<{ reason: string; count: number }>;
  audienceBreakdown: Array<{ label: string; count: number }>;
  payments: Array<{ id: string; provider: string; provider_reference: string; amountKobo: number; currency: string; status: string; paid_at: string | null }>;
  brief: { id: string; status: string; brief: Record<string, unknown>; missingDetails: string[]; risks: string[]; version: number } | null;
  quotes: { note: string; outcome: string }[];
  findings: {
    headline: string;
    summary: string;
    learnings: { label: string; detail: string }[];
    limits: string;
    recommendation: string;
    publishedAt: string;
    version: number;
  } | null;
}

export interface StaffApplication {
  personId: string;
  fullName: string;
  email: string;
  phone: string | null;
  reference: string;
  country: string | null;
  city: string | null;
  ageBand: string | null;
  situation: string | null;
  otherActivities: string[];
  industry: string | null;
  interests: string[];
  frustration: string | null;
  whatsapp: string | null;
  status: string;
  appliedAt: string;
  note: string | null;
}

export interface StaffTestSummary {
  id: string;
  title: string;
  question: string;
  audienceCode: string | null;
  audienceDescription: string | null;
  terms: string;
  rewardNote: string | null;
  status: string;
  serviceKey: string;
  projectStatus: string;
  paymentStatus: string;
  priceAmount: number | null;
  priceCurrency: string | null;
  taskUrl: string | null;
  taskRequiresReturn: boolean;
  rewardAmount: number | null;
  briefId: string | null;
  createdAt: string;
  method: string | null;
  sampleTarget: number | null;
  reportDueAt: string | null;
  founder: { id: string; name: string; email: string; whatsapp: string | null };
  counts: {
    invited: number;
    accepted: number;
    completed: number;
    responses: number;
  };
}

export interface StaffTeam {
  members: {
    personId: string;
    name: string;
    email: string;
    grantedAt: string;
  }[];
  invites: { email: string; invitedAt: string; invitedBy: string | null }[];
}

export interface StaffTestDetail extends StaffTestSummary {
  invitations: {
    id: string;
    status: string;
    invitedAt: string;
    respondedAt: string | null;
    completedAt: string | null;
    rewardStatus: string;
    tester: { id: string; name: string; email: string };
    response: {
      outcome: string;
      note: string;
      consentToQuote: boolean | null;
      submittedAt: string | null;
    } | null;
  }[];
  findings: {
    headline: string;
    summary: string;
    learnings: { label: string; detail: string }[];
    limits: string;
    recommendation: string;
    publishedAt: string | null;
    version: number;
  } | null;
}
