import type { SelectMember, SelectOrganization } from "@repo/core/database/types";
import { memberModel } from "../models/member-model";
import { organizationModel } from "../models/organization-model";

/**
 * Validates that an organization exists and the user has access to it.
 * Uses URL params as source of truth, not session state.
 *
 * @param orgId - Organization ID from URL params or server function input
 * @param userId - User ID from auth context
 * @returns Organization and membership details
 * @throws Response with 404 if org not found, 403 if user not a member
 */
export async function requireOrganizationAccess(
  orgId: string,
  userId: string,
): Promise<{ organization: SelectOrganization; membership: SelectMember }> {
  const organization = await organizationModel.findById(orgId);

  if (!organization) {
    throw new Response("Organization not found", { status: 404 });
  }

  const memberships = await memberModel.findByUserId(userId);
  const membership = memberships.find((m) => m.organizationId === organization.id);

  if (!membership) {
    throw new Response("Access denied - not a member of this organization", {
      status: 403,
    });
  }

  return { organization, membership };
}
