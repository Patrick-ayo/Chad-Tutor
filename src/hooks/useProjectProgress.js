import { useCallback, useEffect, useState } from "react";

export const useProjectProgress = () => {
  const [, setVersion] = useState(0);

  const bump = useCallback(() => {
    setVersion((v) => v + 1);
  }, []);

  useEffect(() => {
    const onStorage = () => bump();
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const getChecked = useCallback((projectId) => {
    return JSON.parse(localStorage.getItem(`checked-${projectId}`) || "[]");
  }, []);

  const toggleCheck = useCallback((projectId, index) => {
    const current = getChecked(projectId);
    const updated = current.includes(index)
      ? current.filter((i) => i !== index)
      : [...current, index];
    localStorage.setItem(`checked-${projectId}`, JSON.stringify(updated));
    bump();
  }, [bump, getChecked]);

  const getStatus = useCallback((projectId) => {
    return localStorage.getItem(`status-${projectId}`) || "not-started";
  }, []);

  const setStatus = useCallback((projectId, status) => {
    const key = `status-${projectId}`;
    const current = localStorage.getItem(key) || "not-started";
    if (current === status) {
      return;
    }
    localStorage.setItem(`status-${projectId}`, status);
    bump();
  }, [bump]);

  const getCompletionPercent = useCallback((project) => {
    const checked = getChecked(project.id);
    if (!project.requirements.length) {
      return 0;
    }
    return Math.round((checked.length / project.requirements.length) * 100);
  }, [getChecked]);

  return {
    getChecked,
    toggleCheck,
    getStatus,
    setStatus,
    getCompletionPercent,
  };
};
