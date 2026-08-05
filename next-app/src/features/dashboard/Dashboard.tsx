import { Badge } from "../../components/Badge";
import type { LegacyDocumentType } from "../../legacy/legacyTypes";
import { getDashboardCounts } from "../documents/documentSelectors";
import { getCategoryLabel } from "../documents/documentCategories";
import type { WalletRecord } from "../documents/documentModel";

interface DashboardProps {
  records: WalletRecord[];
  malformedCount: number;
  selectedCategory: LegacyDocumentType;
  online: boolean;
  compatibilityStatus: string;
}

export function Dashboard({
  records,
  malformedCount,
  selectedCategory,
  online,
  compatibilityStatus,
}: DashboardProps) {
  const counts = getDashboardCounts(records, malformedCount);
  const metrics = [
    ["Readable", counts.readable],
    ["Encrypted", counts.encrypted],
    ["Valid", counts.valid],
    ["Expiring", counts.expiring],
    ["Expired", counts.expired],
    ["No expiry", counts.noExpiry],
  ] as const;

  return (
    <section className="dashboard" aria-labelledby="dashboard-title">
      <div className="section-title-row">
        <div>
          <p className="eyebrow">Read-only migration shell</p>
          <h2 id="dashboard-title">Wallet overview</h2>
        </div>
        <div className="status-cluster">
          <Badge tone={online ? "good" : "warn"}>{online ? "Online" : "Offline"}</Badge>
          <Badge tone={compatibilityStatus === "success" ? "good" : compatibilityStatus === "partial-data" ? "warn" : "info"}>
            {compatibilityStatus}
          </Badge>
        </div>
      </div>

      <div className="metric-grid" aria-label="Document summary">
        {metrics.map(([label, value]) => (
          <div className="metric" key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>

      <div className="selected-category">
        Selected category: <strong>{getCategoryLabel(selectedCategory)}</strong>
        {counts.malformed > 0 ? <span> · {counts.malformed} malformed skipped</span> : null}
      </div>
    </section>
  );
}
