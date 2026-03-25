import { useMemo } from "react";

const CommunitySubmissions = ({ projectId, refreshKey }) => {
  const submissions = useMemo(
    () => JSON.parse(localStorage.getItem(`submissions-${projectId}`) || "[]"),
    [projectId, refreshKey],
  );

  return (
    <section className="community-section">
      <h4>Community Solutions ({submissions.length})</h4>
      {submissions.length === 0 ? (
        <p className="no-submissions">No submissions yet. Be the first.</p>
      ) : (
        <ul className="submissions-list">
          {submissions.map((submission) => (
            <li key={submission.id} className="submission-item">
              <span className="submission-icon">[]</span>
              <a
                href={submission.url}
                target="_blank"
                rel="noreferrer"
                className="submission-link"
              >
                {submission.url.replace("https://github.com/", "")}
              </a>
              <span className="submission-date">
                {new Date(submission.submittedAt).toLocaleDateString()}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default CommunitySubmissions;
