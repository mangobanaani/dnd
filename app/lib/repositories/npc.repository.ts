import { CampaignNPC } from "@/app/types/campaign";
import { BaseRepository, RepositoryError, RowMapper } from "./base.repository";

/**
 * Shape of a npcs table row.  The table already has a `data` jsonb column
 * from the extended_schema migration.
 */
interface NPCRow extends Record<string, unknown> {
  id: string;
  campaign_id: string;
  name: string;
  data: CampaignNPC;
  created_at: string;
  updated_at: string;
}

const mapper: RowMapper<CampaignNPC, NPCRow> = {
  toRow(npc: CampaignNPC): NPCRow {
    return {
      id: npc.id,
      campaign_id: npc.campaignId,
      name: npc.name,
      // Full payload preserves every app-level field
      data: npc,
      created_at: npc.createdAt,
      updated_at: npc.updatedAt,
    };
  },

  fromRow(row: NPCRow): CampaignNPC {
    return {
      ...row.data,
      id: row.id,
      campaignId: row.campaign_id,
    };
  },
};

class NPCRepository extends BaseRepository<CampaignNPC, NPCRow> {
  constructor() {
    super("npcs", mapper);
  }

  /**
   * Return all NPCs for the given campaign.
   * RLS: DM or campaign member can SELECT; only DM can INSERT/UPDATE/DELETE.
   */
  override async list(campaignId?: string): Promise<CampaignNPC[]> {
    if (campaignId === undefined) {
      throw new RepositoryError("campaignId is required for listing NPCs");
    }
    return this.listBy("campaign_id", campaignId);
  }
}

/** Singleton instance — import this everywhere in the app. */
export const npcRepository = new NPCRepository();
