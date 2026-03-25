import { Link } from "react-router-dom";

const ProjectBreadcrumb = ({ title }) => {
  return (
    <nav className="breadcrumb" aria-label="Breadcrumb">
      <Link to="/projects" className="back-link">
        Back to Projects
      </Link>
      <span className="crumb-sep">/</span>
      <span>Projects</span>
      <span className="crumb-sep">/</span>
      <span className="crumb-current">{title}</span>
    </nav>
  );
};

export default ProjectBreadcrumb;
