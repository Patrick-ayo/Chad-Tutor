import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { PROJECTS } from "@/data/projects";
import { useProjectProgress } from "@/hooks/useProjectProgress";
import ProjectCard from "@/components/projects/ProjectCard";
import "@/styles/projects.css";

const Projects = () => {
  const [searchParams] = useSearchParams();
  const [activeTag, setActiveTag] = useState("all");
  const [search, setSearch] = useState("");
  const [view, setView] = useState("all");
  const { getStatus, getCompletionPercent } = useProjectProgress();

  useEffect(() => {
    const incomingTag = (searchParams.get("tag") || "").trim();
    if (incomingTag) {
      setActiveTag(incomingTag);
    }
  }, [searchParams]);

  const sidebarTags = useMemo(() => {
    const tags = new Set(PROJECTS.flatMap((project) => project.tags));
    const roadmapTags = new Set(PROJECTS.map((project) => project.roadmapTag));
    return ["all", ...new Set([...tags, ...roadmapTags])].sort((a, b) => {
      if (a === "all") return -1;
      if (b === "all") return 1;
      return a.localeCompare(b);
    });
  }, []);

  const filtered = PROJECTS.filter((project) => {
    const matchTag =
      activeTag === "all" ||
      project.tags.includes(activeTag) ||
      project.roadmapTag === activeTag;
    const q = search.toLowerCase();
    const matchSearch =
      project.title.toLowerCase().includes(q) ||
      project.description.toLowerCase().includes(q);
    const matchMine = view === "all" || getStatus(project.id) !== "not-started";
    return matchTag && matchSearch && matchMine;
  });

  return (
    <div className="projects-page projects-theme">
      <div className="projects-layout">
        <aside className="projects-sidebar">
          {sidebarTags.map((tag) => (
            <button
              key={tag}
              type="button"
              className={`sidebar-item ${activeTag === tag ? "active" : ""}`}
              onClick={() => setActiveTag(tag)}
            >
              {tag === "all"
                ? "All Projects"
                : tag
                    .split("-")
                    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
                    .join(" ")}
            </button>
          ))}
        </aside>

        <section className="projects-content">
          <div className="projects-content-head">
            <h1>All Projects</h1>
            <span>Matches found ({filtered.length})</span>
          </div>

          <div className="projects-content-controls">
            <div className="view-toggle compact">
              <button
                className={view === "all" ? "active" : ""}
                onClick={() => setView("all")}
                type="button"
              >
                All
              </button>
              <button
                className={view === "mine" ? "active" : ""}
                onClick={() => setView("mine")}
                type="button"
              >
                Mine
              </button>
            </div>

            <input
              className="filter-search"
              placeholder="Search projects"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              type="search"
              aria-label="Search projects"
            />
          </div>

          <div className="projects-grid">
            {filtered.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                status={getStatus(project.id)}
                completionPercent={getCompletionPercent(project)}
              />
            ))}
          </div>
        </section>
      </div>

      {filtered.length === 0 && (
        <div className="projects-empty">No projects match the selected filters.</div>
      )}
    </div>
  );
};

export default Projects;
