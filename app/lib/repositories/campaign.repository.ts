import { createClient } from "@/app/lib/supabase/client";
import { Campaign } from "@/app/types/campaign";
import { BaseRepository, RepositoryError, RowMapper } from "./base.repository";

/**
 * Shape of a campaigns table row after adding the `data` jsonb column.
 * All columns from the initial schema plus `data`.
 */
interface CampaignRow extends Record<string, unknown> {
  id: string;
  name: string;
  description: string | null;
  dm_id: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  data: Campaign;
}

/**
 * Resolve the current auth user id.
 * Throws a RepositoryError if the user is not signed in.
 */
async function requireUserId(): Promise<string> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new RepositoryError(
      "You must be signed in to manage campaigns."
    );
  }

  return user.id;
}

const mapper: RowMapper<Campaign, CampaignRow> = {
  toRow(campaign: Campaign): CampaignRow {
    return {
      id: campaign.id,
      name: campaign.name,
      description: campaign.description ?? null,
      // dm_id is populated by requireUserId() before insert/update;
      // we include it here so the type is complete — the repository
      // methods override it with the live user id.
      dm_id: campaign.dmId,
      is_active: campaign.status === "active",
      // created_at / updated_at are managed by Supabase triggers
      created_at: campaign.createdAt,
      updated_at: campaign.updatedAt,
      // Store the full Campaign payload so no app-level data is lost
      data: campaign,
    };
  },

  fromRow(row: CampaignRow): Campaign {
    // row.data holds the canonical Campaign; override the identity fields
    // with the authoritative database values so they stay in sync.
    return {
      ...row.data,
      id: row.id,
      dmId: row.dm_id,
    };
  },
};

class CampaignRepository extends BaseRepository<Campaign, CampaignRow> {
  constructor() {
    super("campaigns", mapper);
  }

  /** Insert a new campaign, stamping dm_id from the authenticated user. */
  override async add(campaign: Campaign): Promise<Campaign> {
    const userId = await requireUserId();
    const withDmId: Campaign = { ...campaign, dmId: userId };
    return super.add(withDmId);
  }

  /** Update a campaign, keeping dm_id locked to the authenticated user. */
  override async update(id: string, campaign: Campaign): Promise<Campaign> {
    const userId = await requireUserId();
    const withDmId: Campaign = { ...campaign, dmId: userId };
    return super.update(id, withDmId);
  }
}

/** Singleton instance — import this everywhere in the app. */
export const campaignRepository = new CampaignRepository();
