import { CampaignSession } from "@/app/types/campaign";
import { BaseRepository, RepositoryError, RowMapper } from "./base.repository";

/**
 * Shape of a sessions table row after the 20250104 migration that added
 * the `data` jsonb column.
 */
interface SessionRow extends Record<string, unknown> {
  id: string;
  campaign_id: string;
  session_number: number;
  date: string;
  summary: string | null;
  notes: string | null;
  data: CampaignSession;
  created_at: string;
}

const mapper: RowMapper<CampaignSession, SessionRow> = {
  toRow(session: CampaignSession): SessionRow {
    return {
      id: session.id,
      campaign_id: session.campaignId,
      session_number: session.sessionNumber,
      date: session.date,
      summary: session.summary || null,
      notes: session.notes || null,
      // Full payload preserves every app-level field
      data: session,
      created_at: session.createdAt,
    };
  },

  fromRow(row: SessionRow): CampaignSession {
    return {
      ...row.data,
      id: row.id,
      campaignId: row.campaign_id,
    };
  },
};

class SessionRepository extends BaseRepository<CampaignSession, SessionRow> {
  constructor() {
    super("sessions", mapper);
  }

  /**
   * Return all sessions for the given campaign.
   * The optional signature keeps compatibility with the base list(); at runtime
   * campaignId is always expected — an error is thrown if it is omitted.
   */
  override async list(campaignId?: string): Promise<CampaignSession[]> {
    if (campaignId === undefined) {
      throw new RepositoryError("campaignId is required for listing sessions");
    }
    return this.listBy("campaign_id", campaignId);
  }
}

/** Singleton instance — import this everywhere in the app. */
export const sessionRepository = new SessionRepository();
