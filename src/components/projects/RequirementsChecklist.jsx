const RequirementsChecklist = ({ projectId, requirements, checked, onToggle }) => {
  return (
    <section className="requirements-section">
      <h3>Requirements</h3>
      <ul className="requirements-list">
        {requirements.map((requirement, index) => {
          const isChecked = checked.includes(index);
          return (
            <li
              key={`${projectId}-${index}`}
              className={`requirement-item ${isChecked ? "checked" : ""}`}
              onClick={() => onToggle(projectId, index)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onToggle(projectId, index);
                }
              }}
            >
              <span className={`req-checkbox ${isChecked ? "checked" : ""}`}>
                {isChecked ? "x" : ""}
              </span>
              <span className="req-text">{requirement}</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
};

export default RequirementsChecklist;
