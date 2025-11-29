import type { SelectMember, SelectOrganization } from "@repo/core/database/types";
import {
  retrieveMembersFromDatabaseByUserId,
  retrieveOrganizationFromDatabaseById,
} from "./models";

export async function requireOrganizationAccess(
  orgId: string,
  userId: string,
): Promise<{ organization: SelectOrganization; membership: SelectMember }> {
  const organization = await retrieveOrganizationFromDatabaseById(orgId);

  if (!organization) {
    throw new Response("Organization not found", { status: 404 });
  }

  const memberships = await retrieveMembersFromDatabaseByUserId(userId);
  const membership = memberships.find((m) => m.organizationId === organization.id);

  if (!membership) {
    throw new Response("Access denied - not a member of this organization", {
      status: 403,
    });
  }

  return { organization, membership };
}
