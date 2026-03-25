import { useNavigate } from "react-router-dom";
import ProjectStatusBadge from "@/components/projects/ProjectStatusBadge";

const ProjectCard = ({ project, status, completionPercent }) => {
  const navigate = useNavigate();

  return (
    <article
      className={`project-card ${status}`}
      onClick={() => navigate(`/projects/${project.slug}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          navigate(`/projects/${project.slug}`);
        }
      }}
    >
      <div className="card-header">
        <span className={`difficulty-badge ${project.difficulty}`}>
          {project.difficulty}
        </span>
        {status !== "not-started" && <ProjectStatusBadge status={status} />}
      </div>

      <h3 className="card-title">{project.title}</h3>
      <p className="card-desc">{project.description}</p>

      <div className="card-tags">
        {project.tags.map((tag) => (
          <span key={tag} className="tag">
            {tag}
          </span>
        ))}
      </div>

      <div className="card-footer">
        <span className="started-count">
          {project.startedCount.toLocaleString()} started
        </span>
        <span className="card-arrow">View</span>
      </div>

      {status === "in-progress" && (
        <div className="progress-indicator">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${completionPercent}%` }} />
          </div>
        </div>
      )}
    </article>
  );
};

export default ProjectCard;
