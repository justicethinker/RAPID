import type { Tone } from "@/pages/app/Ui";

/** One place for the words a tester sees on invitations and history. */
export const INVITATION_LABEL: Record<string, string> = {
  invited: "Invited",
  accepted: "Accepted",
  declined: "Declined",
  completed: "Completed",
  withdrawn: "Withdrawn",
};

export function invitationTone(status: string): Tone {
  if (status === "invited") return "warning";
  if (status === "accepted" || status === "completed") return "positive";
  if (status === "declined") return "negative";
  return "neutral";
}

export function formatDay(value: string | null | undefined): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
