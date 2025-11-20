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

export function determineModerationDecision(
  result: ModerationResult,
): ModerationDecision {
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

  const hasSeriousViolation = flaggedCategories.some((cat) =>
    SERIOUS_CATEGORIES.includes(cat),
  );

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
