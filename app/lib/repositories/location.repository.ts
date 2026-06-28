import { CampaignLocation } from "@/app/types/campaign";
import { BaseRepository, RepositoryError, RowMapper } from "./base.repository";

/**
 * Shape of a locations table row.  The table already has a `data` jsonb column
 * from the extended_schema migration.
 */
interface LocationRow extends Record<string, unknown> {
  id: string;
  campaign_id: string;
  name: string;
  data: CampaignLocation;
  created_at: string;
  updated_at: string;
}

const mapper: RowMapper<CampaignLocation, LocationRow> = {
  toRow(location: CampaignLocation): LocationRow {
    return {
      id: location.id,
      campaign_id: location.campaignId,
      name: location.name,
      // Full payload preserves every app-level field
      data: location,
      created_at: location.createdAt,
      updated_at: location.updatedAt,
    };
  },

  fromRow(row: LocationRow): CampaignLocation {
    return {
      ...row.data,
      id: row.id,
      campaignId: row.campaign_id,
    };
  },
};

class LocationRepository extends BaseRepository<CampaignLocation, LocationRow> {
  constructor() {
    super("locations", mapper);
  }

  /**
   * Return all locations for the given campaign.
   * RLS: DM or campaign member can SELECT; only DM can INSERT/UPDATE/DELETE.
   */
  override async list(campaignId?: string): Promise<CampaignLocation[]> {
    if (campaignId === undefined) {
      throw new RepositoryError("campaignId is required for listing locations");
    }
    return this.listBy("campaign_id", campaignId);
  }
}

/** Singleton instance — import this everywhere in the app. */
export const locationRepository = new LocationRepository();
