/**
 * TypeScript köprüsü — asıl mantık lib/ içinde.
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

import {
  exportFullBackup,
  restoreFullBackup,
  validateFullManifest,
  FULL_BACKUP_SCHEMA_VERSION,
} from "../../../lib/full-backup.mjs";

export {
  exportBackup,
  restoreBackup,
  validateBackup,
  legacyCmsToTables,
  exportFullBackup,
  restoreFullBackup,
  validateFullManifest,
  BACKUP_SCHEMA_VERSION,
  BACKUP_SOURCE,
  FULL_BACKUP_SCHEMA_VERSION,
  TABLE_SPECS,
};

export type BackupScope = "content" | "full";
