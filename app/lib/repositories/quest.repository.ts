import { CampaignQuest } from "@/app/types/campaign";
import { BaseRepository, RepositoryError, RowMapper } from "./base.repository";

/**
 * Shape of a quests table row.  The table already has a `data` jsonb column
 * from the extended_schema migration.
 */
interface QuestRow extends Record<string, unknown> {
  id: string;
  campaign_id: string;
  title: string;
  status: string;
  data: CampaignQuest;
  created_at: string;
  updated_at: string;
}

const mapper: RowMapper<CampaignQuest, QuestRow> = {
  toRow(quest: CampaignQuest): QuestRow {
    return {
      id: quest.id,
      campaign_id: quest.campaignId,
      title: quest.title,
      status: quest.status,
      // Full payload preserves every app-level field (objectives, rewards, etc.)
      data: quest,
      created_at: quest.createdAt,
      updated_at: quest.updatedAt,
    };
  },

  fromRow(row: QuestRow): CampaignQuest {
    return {
      ...row.data,
      id: row.id,
      campaignId: row.campaign_id,
    };
  },
};

class QuestRepository extends BaseRepository<CampaignQuest, QuestRow> {
  constructor() {
    super("quests", mapper);
  }

  /**
   * Return all quests for the given campaign.
   * RLS: DM or campaign member can SELECT; only DM can INSERT/UPDATE/DELETE.
   */
  override async list(campaignId?: string): Promise<CampaignQuest[]> {
    if (campaignId === undefined) {
      throw new RepositoryError("campaignId is required for listing quests");
    }
    return this.listBy("campaign_id", campaignId);
  }
}

/** Singleton instance — import this everywhere in the app. */
export const questRepository = new QuestRepository();
