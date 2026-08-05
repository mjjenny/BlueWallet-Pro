import type { LegacySettingsSnapshot } from "../../legacy/legacyTypes";

interface ProfileSummaryProps {
  settings: LegacySettingsSnapshot | null;
  profilePhotoKind: string;
}

export function ProfileSummary({ settings, profilePhotoKind }: ProfileSummaryProps) {
  const seafarer = settings?.seafarer;
  const name = seafarer?.name || "Document vault";
  const details = [seafarer?.rank, seafarer?.nationality, seafarer?.cdc ? `CDC ${seafarer.cdc}` : ""]
    .filter(Boolean)
    .join(" · ");

  return (
    <section className="profile-summary" aria-label="Legacy profile metadata">
      <div className="profile-avatar" aria-hidden="true">
        {profilePhotoKind === "plaintext" ? "ID" : "BW"}
      </div>
      <div>
        <p className="eyebrow">Legacy profile</p>
        <h2>{name}</h2>
        <p className="muted">{details || "No profile metadata found"}</p>
      </div>
    </section>
  );
}
