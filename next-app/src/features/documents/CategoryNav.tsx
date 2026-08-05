import type { LegacyDocumentType } from "../../legacy/legacyTypes";
import { DOCUMENT_CATEGORIES } from "./documentCategories";

interface CategoryNavProps {
  selected: LegacyDocumentType;
  counts: Record<LegacyDocumentType, number>;
  onSelect: (category: LegacyDocumentType) => void;
}

export function CategoryNav({ selected, counts, onSelect }: CategoryNavProps) {
  return (
    <nav className="category-nav" aria-label="Document categories">
      {DOCUMENT_CATEGORIES.map((category) => (
        <button
          type="button"
          className={`category-tab${category.id === selected ? " active" : ""}`}
          key={category.id}
          aria-current={category.id === selected ? "page" : undefined}
          onClick={() => onSelect(category.id)}
        >
          <span>{category.label}</span>
          <strong aria-label={`${counts[category.id]} ${category.label} documents`}>{counts[category.id]}</strong>
        </button>
      ))}
    </nav>
  );
}
