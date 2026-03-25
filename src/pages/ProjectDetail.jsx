import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { PROJECTS } from "@/data/projects";
import { useProjectProgress } from "@/hooks/useProjectProgress";
import ProjectBreadcrumb from "@/components/projects/ProjectBreadcrumb";
import RequirementsChecklist from "@/components/projects/RequirementsChecklist";
import SubmitSolutionModal from "@/components/projects/SubmitSolutionModal";
import CommunitySubmissions from "@/components/projects/CommunitySubmissions";
import "@/styles/projects.css";

const buildFallbackGuide = (project) => {
  const sessions = project.requirements.slice(0, 7).map((requirement, index) => ({
    day: index + 1,
    title: `Step ${index + 1}: ${requirement}`,
    duration: 60,
    topics: [project.title],
    activities: [
      `Implement: ${requirement}`,
      "Test your implementation with sample data",
      "Document what you learned and unresolved blockers",
    ],
  }));

  return {
    totalDays: sessions.length,
    totalHours: sessions.length,
    sessions,
    keyTakeaways: [
      "Ship one concrete output per step",
      "Keep validation and testing in every step",
      "Document decisions to improve future projects",
    ],
  };
};

const buildFallbackSessionGuide = (session) => {
  const safeActivities = Array.isArray(session?.activities) ? session.activities : [];
  return {
    introText: `This step focuses on ${session?.title || "the current task"}. Complete it with small, testable increments.`,
    tips: [
      "Start with the smallest working slice before optimizing",
      "Validate output after each change",
      "Keep notes for blockers and decisions",
    ],
    commonMistakes: [
      "Trying to finish everything in one pass",
      "Skipping test or validation commands",
    ],
    actionPlan: safeActivities.length > 0 ? safeActivities : ["Read the requirement", "Implement", "Test and document"],
  };
};

const ProjectDetail = () => {
  const { slug } = useParams();
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [showHints, setShowHints] = useState(false);
  const [submissionRefreshKey, setSubmissionRefreshKey] = useState(0);
  const [guide, setGuide] = useState(null);
  const [isGuideLoading, setIsGuideLoading] = useState(false);
  const [guideError, setGuideError] = useState("");
  const [activeSession, setActiveSession] = useState(null);
  const [activeSessionGuide, setActiveSessionGuide] = useState(null);
  const [isSessionGuideOpen, setIsSessionGuideOpen] = useState(false);
  const [isSessionGuideLoading, setIsSessionGuideLoading] = useState(false);
  const [sessionGuideError, setSessionGuideError] = useState("");
  const { getChecked, toggleCheck, getStatus, setStatus } = useProjectProgress();

  const project = useMemo(() => PROJECTS.find((item) => item.slug === slug), [slug]);
  const checked = project ? getChecked(project.id) : [];
  const progress =
    project && project.requirements.length > 0
      ? Math.round((checked.length / project.requirements.length) * 100)
      : 0;

  useEffect(() => {
    if (!project) {
      return;
    }

    let isActive = true;

    const loadGuide = async () => {
      const cacheKey = `project-guide-${project.id}`;
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (isActive) {
            setGuide(parsed);
          }
          return;
        } catch {
          localStorage.removeItem(cacheKey);
        }
      }

      setIsGuideLoading(true);
      setGuideError("");

      try {
        const response = await fetch("/api/ai/generate-study-plan", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nodeTitle: project.title,
            nodeDescription: `${project.description}\n\nRequirements:\n${project.requirements.join("\n")}`,
            availableDays: Math.max(5, Math.min(10, project.requirements.length)),
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to generate guide");
        }

        const data = await response.json();
        const normalized = {
          totalDays: Number(data.totalDays) || 7,
          totalHours: Number(data.totalHours) || 7,
          sessions: Array.isArray(data.sessions) ? data.sessions : [],
          keyTakeaways: Array.isArray(data.keyTakeaways) ? data.keyTakeaways : [],
        };

        if (!normalized.sessions.length) {
          throw new Error("Guide returned without sessions");
        }

        if (isActive) {
          setGuide(normalized);
          localStorage.setItem(cacheKey, JSON.stringify(normalized));
        }
      } catch (error) {
        console.error("Failed to load AI guide:", error);
        const fallback = buildFallbackGuide(project);
        if (isActive) {
          setGuide(fallback);
          setGuideError("AI guide unavailable. Showing generated local guide.");
          localStorage.setItem(cacheKey, JSON.stringify(fallback));
        }
      } finally {
        if (isActive) {
          setIsGuideLoading(false);
        }
      }
    };

    void loadGuide();

    return () => {
      isActive = false;
    };
  }, [project]);

  useEffect(() => {
    if (!project) {
      return;
    }

    if (progress === 0) {
      setStatus(project.id, "not-started");
    } else if (progress === 100) {
      setStatus(project.id, "completed");
    } else {
      setStatus(project.id, "in-progress");
    }
  }, [progress, project, setStatus]);

  const openSessionGuide = async (session, index) => {
    if (!project) {
      return;
    }

    setActiveSession({ ...session, index });
    setIsSessionGuideOpen(true);
    setSessionGuideError("");

    const sessionKey = session.day || index + 1;
    const cacheKey = `project-session-guide-${project.id}-${sessionKey}`;
    const cached = localStorage.getItem(cacheKey);

    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        setActiveSessionGuide(parsed);
        return;
      } catch {
        localStorage.removeItem(cacheKey);
      }
    }

    setIsSessionGuideLoading(true);
    setActiveSessionGuide(null);

    try {
      const previousTopics = Array.isArray(guide?.sessions)
        ? guide.sessions
            .slice(0, index)
            .map((item) => item?.title)
            .filter(Boolean)
        : [];

      const response = await fetch("/api/gemini/generate-section-info", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          roadmapTitle: project.title,
          sectionTitle: session.title || `Day ${sessionKey}`,
          previousTopics,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to load task guide");
      }

      const result = await response.json();
      const data = result?.data || {};
      const normalized = {
        introText:
          typeof data.introText === "string" && data.introText.trim().length > 0
            ? data.introText
            : `Focus on ${session.title || `Day ${sessionKey}`} and complete one clear deliverable.`,
        tips: Array.isArray(data.tips) ? data.tips : [],
        commonMistakes: Array.isArray(data.commonMistakes) ? data.commonMistakes : [],
        actionPlan: Array.isArray(session.activities) ? session.activities : [],
      };

      setActiveSessionGuide(normalized);
      localStorage.setItem(cacheKey, JSON.stringify(normalized));
    } catch (error) {
      console.error("Failed to fetch day guide:", error);
      const fallback = buildFallbackSessionGuide(session);
      setActiveSessionGuide(fallback);
      setSessionGuideError("AI task guide unavailable. Showing local execution steps.");
      localStorage.setItem(cacheKey, JSON.stringify(fallback));
    } finally {
      setIsSessionGuideLoading(false);
    }
  };

  if (!project) {
    return (
      <div className="projects-page projects-theme">
        <div className="project-not-found">
          <h1>Project not found</h1>
          <p>The requested project does not exist.</p>
          <Link to="/projects" className="btn-primary inline-btn">
            Back to Projects
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="project-detail-page projects-theme">
      <ProjectBreadcrumb title={project.title} />

      <div className="detail-layout">
        <div className="detail-main">
          <div className="detail-meta">
            <span className={`difficulty-badge ${project.difficulty}`}>
              {project.difficulty}
            </span>
            {project.tags.map((tag) => (
              <span key={tag} className="tag">
                {tag}
              </span>
            ))}
          </div>

          <h1 className="detail-title">{project.title}</h1>
          <p className="detail-desc">{project.description}</p>

          <RequirementsChecklist
            projectId={project.id}
            requirements={project.requirements}
            checked={checked}
            onToggle={toggleCheck}
          />

          <div className="hints-section">
            <button
              className="hints-toggle"
              onClick={() => setShowHints((prev) => !prev)}
              type="button"
            >
              Hints {showHints ? "Hide" : "Show"}
            </button>
            {showHints && (
              <ul className="hints-list">
                {project.hints.map((hint, index) => (
                  <li key={`${project.id}-hint-${index}`}>{hint}</li>
                ))}
              </ul>
            )}
          </div>

          <div className="resources-section">
            <h3>Resources</h3>
            {project.resources.map((resource) => (
              <a
                key={resource.url}
                href={resource.url}
                target="_blank"
                rel="noreferrer"
                className="resource-link"
              >
                {resource.title}
              </a>
            ))}
          </div>

          <section className="step-guide-section">
            <div className="step-guide-header">
              <h3>Step-by-Step Guide</h3>
              {guide && (
                <span className="step-guide-meta">
                  {guide.totalDays} days • {guide.totalHours} hours
                </span>
              )}
            </div>

            {isGuideLoading && <p className="step-guide-loading">Generating AI learning path...</p>}
            {guideError && <p className="step-guide-error">{guideError}</p>}

            {guide && Array.isArray(guide.sessions) && (
              <ol className="step-guide-list">
                {guide.sessions.map((session, index) => (
                  <li
                    key={`${project.id}-session-${index}`}
                    className="step-guide-item"
                    onClick={() => openSessionGuide(session, index)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        void openSessionGuide(session, index);
                      }
                    }}
                  >
                    <div className="step-guide-day">Day {session.day || index + 1}</div>
                    <div className="step-guide-content">
                      <h4>{session.title || `Step ${index + 1}`}</h4>
                      <div className="step-guide-duration">{session.duration || 60} min</div>
                      {Array.isArray(session.activities) && session.activities.length > 0 && (
                        <ul>
                          {session.activities.map((activity, activityIndex) => (
                            <li key={`${project.id}-${index}-activity-${activityIndex}`}>{activity}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            )}

            {guide && Array.isArray(guide.keyTakeaways) && guide.keyTakeaways.length > 0 && (
              <div className="guide-takeaways">
                <h4>Key Takeaways</h4>
                <ul>
                  {guide.keyTakeaways.map((takeaway, index) => (
                    <li key={`${project.id}-takeaway-${index}`}>{takeaway}</li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        </div>

        <aside className="detail-sidebar">
          <div className="progress-card">
            <h4>Your Progress</h4>
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <span className="progress-value">{progress}% Complete</span>

            <div className="status-options">
              {["not-started", "in-progress", "completed"].map((status) => (
                <label key={status} className="status-radio">
                  <input
                    type="radio"
                    name="status"
                    value={status}
                    checked={getStatus(project.id) === status}
                    onChange={() => setStatus(project.id, status)}
                  />
                  {status.replace("-", " ")}
                </label>
              ))}
            </div>

            <button
              className="submit-btn"
              onClick={() => setShowSubmitModal(true)}
              type="button"
            >
              Submit Solution
            </button>
          </div>

          <CommunitySubmissions
            projectId={project.id}
            refreshKey={submissionRefreshKey}
          />
        </aside>
      </div>

      {showSubmitModal && (
        <SubmitSolutionModal
          project={project}
          onClose={() => setShowSubmitModal(false)}
          onSubmitted={() => setSubmissionRefreshKey((v) => v + 1)}
        />
      )}

      {isSessionGuideOpen && activeSession && (
        <div className="modal-overlay" onClick={() => setIsSessionGuideOpen(false)}>
          <div className="modal-box task-guide-modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close"
              type="button"
              onClick={() => setIsSessionGuideOpen(false)}
            >
              x
            </button>

            <h2>
              How to Perform Day {activeSession.day || activeSession.index + 1}
            </h2>
            <p className="task-guide-title">{activeSession.title || "Current task"}</p>

            {isSessionGuideLoading && (
              <p className="step-guide-loading">Generating detailed execution guidance...</p>
            )}
            {sessionGuideError && <p className="step-guide-error">{sessionGuideError}</p>}

            {activeSessionGuide && (
              <div className="task-guide-content">
                <div className="task-guide-block">
                  <h4>Overview</h4>
                  <p>{activeSessionGuide.introText}</p>
                </div>

                {Array.isArray(activeSessionGuide.actionPlan) && activeSessionGuide.actionPlan.length > 0 && (
                  <div className="task-guide-block">
                    <h4>Execution Steps</h4>
                    <ol>
                      {activeSessionGuide.actionPlan.map((step, idx) => (
                        <li key={`session-step-${idx}`}>{step}</li>
                      ))}
                    </ol>
                  </div>
                )}

                {Array.isArray(activeSessionGuide.tips) && activeSessionGuide.tips.length > 0 && (
                  <div className="task-guide-block">
                    <h4>Tips</h4>
                    <ul>
                      {activeSessionGuide.tips.map((tip, idx) => (
                        <li key={`session-tip-${idx}`}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {Array.isArray(activeSessionGuide.commonMistakes) && activeSessionGuide.commonMistakes.length > 0 && (
                  <div className="task-guide-block">
                    <h4>Common Mistakes</h4>
                    <ul>
                      {activeSessionGuide.commonMistakes.map((mistake, idx) => (
                        <li key={`session-mistake-${idx}`}>{mistake}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetail;
