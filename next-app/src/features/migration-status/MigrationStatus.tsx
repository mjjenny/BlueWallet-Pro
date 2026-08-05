import { Badge } from "../../components/Badge";
import type { LegacyWalletSnapshot } from "../../app/providers/LegacyDataProvider";
import { getDashboardCounts } from "../documents/documentSelectors";

interface MigrationStatusProps {
  snapshot: LegacyWalletSnapshot;
}

export function MigrationStatus({ snapshot }: MigrationStatusProps) {
  const counts = getDashboardCounts(snapshot.records, snapshot.malformed.length);
  const databaseText =
    snapshot.database.status === "present"
      ? `Legacy database detected${snapshot.database.actualVersion ? ` (v${snapshot.database.actualVersion})` : ""}`
      : snapshot.database.status === "absent"
        ? "Legacy database unavailable"
        : "Legacy database unknown";

  return (
    <aside className="migration-status" aria-labelledby="migration-status-title">
      <div className="section-title-row">
        <div>
          <p className="eyebrow">Compatibility</p>
          <h2 id="migration-status-title">Migration status</h2>
        </div>
        <Badge tone="info">Read-only</Badge>
      </div>
      <p className="readonly-callout">
        This React shell reads compatible legacy data only. It does not create, edit, delete,
        decrypt, import, export, or migrate records.
      </p>
      <dl className="status-list">
        <div>
          <dt>Database</dt>
          <dd>{databaseText}</dd>
        </div>
        <div>
          <dt>Readable records</dt>
          <dd>{counts.readable}</dd>
        </div>
        <div>
          <dt>Encrypted records</dt>
          <dd>{counts.encrypted}</dd>
        </div>
        <div>
          <dt>Malformed skipped</dt>
          <dd>{counts.malformed}</dd>
        </div>
        <div>
          <dt>Source</dt>
          <dd>{snapshot.source}</dd>
        </div>
      </dl>
      {snapshot.issues.length > 0 ? (
        <div className="warning-list">
          <h3>Compatibility warnings</h3>
          <ul>
            {snapshot.issues.slice(0, 6).map((issue) => (
              <li key={`${issue.code}-${issue.message}`}>{issue.message}</li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="muted">No compatibility warnings detected.</p>
      )}
    </aside>
  );
}
