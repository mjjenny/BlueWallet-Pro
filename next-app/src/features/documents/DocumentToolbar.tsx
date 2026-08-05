import type { DocumentSortKey, DocumentStatusFilter } from "./documentSelectors";

interface DocumentToolbarProps {
  search: string;
  filter: DocumentStatusFilter;
  sort: DocumentSortKey;
  onSearch: (value: string) => void;
  onFilter: (value: DocumentStatusFilter) => void;
  onSort: (value: DocumentSortKey) => void;
}

export function DocumentToolbar({
  search,
  filter,
  sort,
  onSearch,
  onFilter,
  onSort,
}: DocumentToolbarProps) {
  return (
    <div className="document-toolbar" aria-label="Document search and filters">
      <label className="search-field">
        <span>Search</span>
        <input
          type="search"
          value={search}
          placeholder="Title, number, authority, notes, tags"
          onChange={(event) => onSearch(event.target.value)}
        />
      </label>
      <label>
        <span>Status</span>
        <select value={filter} onChange={(event) => onFilter(event.target.value as DocumentStatusFilter)}>
          <option value="all">All</option>
          <option value="valid">Valid</option>
          <option value="expiring">Expiring</option>
          <option value="expired">Expired</option>
          <option value="no-expiry">No expiry</option>
          <option value="encrypted">Encrypted/unavailable</option>
        </select>
      </label>
      <label>
        <span>Sort</span>
        <select value={sort} onChange={(event) => onSort(event.target.value as DocumentSortKey)}>
          <option value="expiry">Expiry</option>
          <option value="name">Name</option>
          <option value="category">Category</option>
          <option value="updated">Recently updated</option>
        </select>
      </label>
    </div>
  );
}
