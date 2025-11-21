export interface ModerationContent {
  title: string;
  description: string;
  beneficiaryName: string;
  coverImageUrl?: string;
}

export interface ModerationResult {
  id: string;
  results: Array<{
    flagged: boolean;
    categories: Record<string, boolean>;
    category_scores: Record<string, number>;
  }>;
}

export interface ModerationDecision {
  status: "ACTIVE" | "REJECTED" | "UNDER_REVIEW";
  reason: string | null;
}

const SERIOUS_CATEGORIES = [
  "sexual/minors",
  "hate/threatening",
  "violence/graphic",
  "self-harm/instructions",
];

export async function moderateContent(
  content: ModerationContent,
  apiKey: string,
): Promise<ModerationResult> {
  const input: Array<{
    type: string;
    text?: string;
    image_url?: { url: string };
  }> = [
    { type: "text", text: content.title },
    { type: "text", text: content.description },
    { type: "text", text: content.beneficiaryName },
  ];

  if (content.coverImageUrl) {
    input.push({
      type: "image_url",
      image_url: { url: content.coverImageUrl },
    });
  }

  const response = await fetch("https://api.openai.com/v1/moderations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "omni-moderation-latest",
      input,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI API error (${response.status}): ${errorText}`);
  }

  return await response.json();
}

export function determineModerationDecision(result: ModerationResult): ModerationDecision {
  const firstResult = result.results[0];

  if (!firstResult) {
    throw new Error("No moderation results found");
  }

  if (!firstResult.flagged) {
    return { status: "ACTIVE", reason: null };
  }

  const flaggedCategories = Object.entries(firstResult.categories)
    .filter(([_, flagged]) => flagged)
    .map(([category]) => category);

  const hasSeriousViolation = flaggedCategories.some((cat) => SERIOUS_CATEGORIES.includes(cat));

  if (hasSeriousViolation) {
    return {
      status: "REJECTED",
      reason: `Content flagged for: ${flaggedCategories.join(", ")}`,
    };
  }

  return {
    status: "UNDER_REVIEW",
    reason: `Requires manual review. Flagged categories: ${flaggedCategories.join(", ")}`,
  };
}

/**
 * Moderate text-only content (for donation messages)
 * @param text - Text to moderate
 * @param apiKey - OpenAI API key
 * @returns Moderation result
 */
export async function moderateTextContent(text: string, apiKey: string): Promise<ModerationResult> {
  const response = await fetch("https://api.openai.com/v1/moderations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "omni-moderation-latest",
      input: [{ type: "text", text }],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI API error (${response.status}): ${errorText}`);
  }

  return await response.json();
}

export interface DonationMessageDecision {
  status: "APPROVED" | "REJECTED" | "PENDING_REVIEW";
  showMessage: boolean;
}

/**
 * Determine moderation decision for donation messages
 * @param result - Moderation result from OpenAI
 * @returns Decision with status and showMessage flag
 */
export function determineDonationMessageDecision(
  result: ModerationResult,
): DonationMessageDecision {
  const firstResult = result.results[0];

  if (!firstResult) {
    throw new Error("No moderation results found");
  }

  // If not flagged, approve and show
  if (!firstResult.flagged) {
    return { status: "APPROVED", showMessage: true };
  }

  const flaggedCategories = Object.entries(firstResult.categories)
    .filter(([_, flagged]) => flagged)
    .map(([category]) => category);

  const hasSeriousViolation = flaggedCategories.some((cat) => SERIOUS_CATEGORIES.includes(cat));

  // Serious violations are auto-rejected and hidden
  if (hasSeriousViolation) {
    return { status: "REJECTED", showMessage: false };
  }

  // Minor flags go to manual review, hidden until approved
  return { status: "PENDING_REVIEW", showMessage: false };
}
