import { CampaignNote } from "@/app/types/campaign";
import { BaseRepository, RepositoryError, RowMapper } from "./base.repository";

/**
 * Shape of a campaign_notes table row.
 * The full CampaignNote payload is stored in the `data` jsonb column;
 * campaign_id is mirrored as a proper FK for RLS and indexing.
 */
interface NoteRow extends Record<string, unknown> {
  id: string;
  campaign_id: string;
  data: CampaignNote;
  created_at: string;
  updated_at: string;
}

const mapper: RowMapper<CampaignNote, NoteRow> = {
  toRow(note: CampaignNote): NoteRow {
    return {
      id: note.id,
      campaign_id: note.campaignId,
      // Full payload preserves every app-level field
      data: note,
      created_at: note.createdAt,
      updated_at: note.updatedAt,
    };
  },

  fromRow(row: NoteRow): CampaignNote {
    return {
      ...row.data,
      id: row.id,
      campaignId: row.campaign_id,
    };
  },
};

class NoteRepository extends BaseRepository<CampaignNote, NoteRow> {
  constructor() {
    super("campaign_notes", mapper);
  }

  /**
   * Return all notes for the given campaign.
   * RLS: DM or campaign member can SELECT; only DM can INSERT/UPDATE/DELETE.
   */
  override async list(campaignId?: string): Promise<CampaignNote[]> {
    if (campaignId === undefined) {
      throw new RepositoryError("campaignId is required for listing notes");
    }
    return this.listBy("campaign_id", campaignId);
  }
}

/** Singleton instance — import this everywhere in the app. */
export const noteRepository = new NoteRepository();
