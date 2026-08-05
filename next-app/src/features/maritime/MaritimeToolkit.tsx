import { useMemo, useState } from "react";
import { Badge } from "../../components/Badge";
import { formatDate } from "../../shared/dates/dateUtils";
import type { ReactWalletDocumentView, ReactWalletSeaServiceEntry } from "../react-wallet/reactWalletTypes";
import {
  getDocumentPacks,
  getMaritimeRequirementStatuses,
  getReadyToJoinScore,
  getSeaServiceDays,
  getVaccinationDocuments,
} from "./maritimeRules";

function statusTone(status: string): "good" | "warn" | "bad" | "neutral" {
  if (status === "ready") return "good";
  if (status === "expiring") return "warn";
  if (status === "expired") return "bad";
  return "neutral";
}

export function MaritimeToolkit({
  documents,
  seaService,
  onAddSeaService,
  onDeleteSeaService,
}: {
  documents: ReactWalletDocumentView[];
  seaService: ReactWalletSeaServiceEntry[];
  onAddSeaService: (input: Pick<ReactWalletSeaServiceEntry, "vessel" | "rank" | "signOn" | "signOff">) => Promise<void>;
  onDeleteSeaService: (id: string) => Promise<void>;
}) {
  const [entry, setEntry] = useState<Pick<ReactWalletSeaServiceEntry, "vessel" | "rank" | "signOn" | "signOff">>({
    vessel: "",
    rank: "",
    signOn: "",
    signOff: "",
  });
  const [message, setMessage] = useState("");
  const statuses = useMemo(() => getMaritimeRequirementStatuses(documents), [documents]);
  const packs = useMemo(() => getDocumentPacks(documents), [documents]);
  const vaccinations = useMemo(() => getVaccinationDocuments(documents), [documents]);
  const score = useMemo(() => getReadyToJoinScore(documents), [documents]);
  const seaDays = seaService.reduce((sum, item) => sum + getSeaServiceDays(item), 0);

  async function addEntry() {
    if (!entry.vessel.trim() || !entry.signOn || !entry.signOff) return;
    setMessage("");
    try {
      await onAddSeaService(entry);
      setEntry({ vessel: "", rank: "", signOn: "", signOff: "" });
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Sea-service entry could not be saved.");
    }
  }

  return (
    <section className="maritime-toolkit" aria-labelledby="maritime-title">
      <div className="section-title-row">
        <div>
          <p className="eyebrow">Maritime toolkit</p>
          <h2 id="maritime-title">Ready to join</h2>
        </div>
        <Badge tone={score >= 80 ? "good" : score >= 50 ? "warn" : "bad"}>{score}%</Badge>
      </div>

      <div className="maritime-grid">
        <section className="maritime-panel">
          <h3>STCW matrix</h3>
          <div className="matrix-list">
            {statuses.map((item) => (
              <article key={item.requirement.id} className="matrix-row">
                <div>
                  <strong>{item.requirement.label}</strong>
                  <p className="muted">{item.matched ? `${item.matched.title} - ${formatDate(item.matched.expiryDate)}` : "Missing"}</p>
                </div>
                <Badge tone={statusTone(item.status)}>{item.status}</Badge>
              </article>
            ))}
          </div>
        </section>

        <section className="maritime-panel">
          <h3>Document packs</h3>
          <div className="pack-list">
            {packs.map((pack) => (
              <article key={pack.id} className="pack-row">
                <div>
                  <strong>{pack.label}</strong>
                  <p className="muted">{pack.ready} of {pack.total} ready</p>
                </div>
                <progress value={pack.ready} max={pack.total} aria-label={`${pack.label} readiness`} />
              </article>
            ))}
          </div>
        </section>

        <section className="maritime-panel">
          <h3>Vaccination tracker</h3>
          {vaccinations.length === 0 ? <p className="muted">No vaccination documents saved.</p> : vaccinations.map((document) => (
            <article className="matrix-row" key={document.id}>
              <div>
                <strong>{document.title}</strong>
                <p className="muted">{formatDate(document.expiryDate)}</p>
              </div>
              <Badge tone="info">{document.type}</Badge>
            </article>
          ))}
        </section>

        <section className="maritime-panel">
          <h3>Sea-service log</h3>
          <div className="sea-service-form">
            <label><span>Vessel</span><input value={entry.vessel} onChange={(event) => setEntry({ ...entry, vessel: event.target.value })} /></label>
            <label><span>Rank</span><input value={entry.rank} onChange={(event) => setEntry({ ...entry, rank: event.target.value })} /></label>
            <label><span>Sign on</span><input type="date" value={entry.signOn} onChange={(event) => setEntry({ ...entry, signOn: event.target.value })} /></label>
            <label><span>Sign off</span><input type="date" value={entry.signOff} onChange={(event) => setEntry({ ...entry, signOff: event.target.value })} /></label>
            <button type="button" className="secondary-action" onClick={() => void addEntry()}>Add sea service</button>
          </div>
          <p className="muted">{seaService.length} entries - {seaDays} days</p>
          {message ? <p className="muted" aria-live="polite">{message}</p> : null}
          <div className="sea-service-list">
            {seaService.map((item) => (
              <article className="matrix-row" key={item.id}>
                <div>
                  <strong>{item.vessel}</strong>
                  <p className="muted">{item.rank || "Rank not set"} - {getSeaServiceDays(item)} days</p>
                </div>
                <button type="button" className="icon-button" aria-label={`Delete ${item.vessel}`} onClick={() => void onDeleteSeaService(item.id)}>x</button>
              </article>
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}
