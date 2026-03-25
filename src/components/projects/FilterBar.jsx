const DIFFICULTIES = ["all", "beginner", "intermediate", "advanced"];

const toTagLabel = (tag) =>
  tag
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const FilterBar = ({
  difficulty,
  onDifficulty,
  tag,
  onTag,
  search,
  onSearch,
  tags,
}) => {
  return (
    <div className="filter-bar-wrap">
      <div className="filter-bar">
        {DIFFICULTIES.map((item) => (
          <button
            key={item}
            className={`filter-btn ${difficulty === item ? "active" : ""}`}
            onClick={() => onDifficulty(item)}
            type="button"
          >
            {item === "all" ? "All" : toTagLabel(item)}
          </button>
        ))}
      </div>

      <div className="filter-bar">
        <button
          className={`filter-btn ${tag === "all" ? "active" : ""}`}
          onClick={() => onTag("all")}
          type="button"
        >
          All Tags
        </button>

        {tags.map((item) => (
          <button
            key={item}
            className={`filter-btn ${tag === item ? "active" : ""}`}
            onClick={() => onTag(item)}
            type="button"
          >
            {toTagLabel(item)}
          </button>
        ))}

        <input
          className="filter-search"
          placeholder="Search projects"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          type="search"
          aria-label="Search projects"
        />
      </div>
    </div>
  );
};

export default FilterBar;
