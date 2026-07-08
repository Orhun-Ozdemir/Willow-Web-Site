/**
 * TypeScript köprüsü — sunucu/API için yalnızca DB yedekleme (lib/db-backup.mjs).
 * ZIP (fflate) tam yedek: tarayıcıda backup-client.ts, CLI'da lib/full-backup.mjs.
 */
import {
  exportBackup,
  restoreBackup,
  validateBackup,
  legacyCmsToTables,
  BACKUP_SCHEMA_VERSION,
  BACKUP_SOURCE,
  TABLE_SPECS,
} from "../../../lib/db-backup.mjs";

export {
  exportBackup,
  restoreBackup,
  validateBackup,
  legacyCmsToTables,
  BACKUP_SCHEMA_VERSION,
  BACKUP_SOURCE,
  TABLE_SPECS,
};

export type BackupScope = "content" | "full";

/** Tam ZIP manifest sürümü (backup-client ile aynı). */
export const FULL_BACKUP_SCHEMA_VERSION = 2;
