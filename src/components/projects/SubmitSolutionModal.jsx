import { useState } from "react";

const SubmitSolutionModal = ({ project, onClose, onSubmitted }) => {
  const [repoUrl, setRepoUrl] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const isValidGitHub = (url) =>
    /^https:\/\/github\.com\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9._-]+\/?$/.test(url.trim());

  const handleSubmit = () => {
    if (!isValidGitHub(repoUrl)) {
      setError("Please enter a valid GitHub repository URL");
      return;
    }

    const key = `submissions-${project.id}`;
    const existing = JSON.parse(localStorage.getItem(key) || "[]");
    const newSubmission = {
      id: Date.now(),
      url: repoUrl.trim(),
      submittedAt: new Date().toISOString(),
      user: "You",
    };

    localStorage.setItem(key, JSON.stringify([newSubmission, ...existing]));
    setSubmitted(true);
    onSubmitted();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} type="button">
          x
        </button>

        {!submitted ? (
          <>
            <h2>Submit Your Solution</h2>
            <p>
              Share your GitHub repository for <strong>{project.title}</strong>
            </p>

            <div className="input-group">
              <label htmlFor="repo-url">GitHub Repository URL</label>
              <input
                id="repo-url"
                type="url"
                placeholder="https://github.com/username/repo-name"
                value={repoUrl}
                onChange={(e) => {
                  setRepoUrl(e.target.value);
                  setError("");
                }}
                className={error ? "input-error" : ""}
              />
              {error && <span className="error-msg">{error}</span>}
            </div>

            <div className="submission-rules">
              <h4>Before submitting make sure:</h4>
              <ul>
                <li>Repository is public on GitHub</li>
                <li>README explains how to run the project</li>
                <li>All requirements are addressed</li>
                <li>Code is clean and well documented</li>
              </ul>
            </div>

            <div className="modal-actions">
              <button className="btn-secondary" onClick={onClose} type="button">
                Cancel
              </button>
              <button className="btn-primary" onClick={handleSubmit} type="button">
                Submit Solution
              </button>
            </div>
          </>
        ) : (
          <div className="success-screen">
            <div className="success-icon">Submitted</div>
            <h2>Solution Submitted</h2>
            <p>Your solution has been submitted successfully.</p>
            <a href={repoUrl} target="_blank" rel="noreferrer" className="repo-link">
              View your repository
            </a>
            <button className="btn-primary" onClick={onClose} type="button">
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubmitSolutionModal;
