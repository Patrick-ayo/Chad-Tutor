const LABELS = {
  "not-started": "Not Started",
  "in-progress": "In Progress",
  completed: "Done",
};

const ProjectStatusBadge = ({ status }) => {
  return (
    <span className={`project-status-badge ${status}`}>
      {LABELS[status] || LABELS["not-started"]}
    </span>
  );
};

export default ProjectStatusBadge;
