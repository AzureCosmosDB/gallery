/**
 * Utility function to open GitHub issues page in a new tab
 * @param issuesUrl - Optional GitHub issues URL, defaults to the postgres-appdev-hub issues page
 */
export const openGitHubIssues = (issuesUrl?: string): void => {
  const defaultUrl =
    "https://github.com/Azure-Samples/postgres-appdev-hub/issues";
  window.open(issuesUrl || defaultUrl, "_blank");
};

/**
 * Higher-order function to create a click handler that opens GitHub issues
 * @param issuesUrl - Optional GitHub issues URL, defaults to the postgres-appdev-hub issues page
 * @returns A click handler function
 */
export const shareFeedbackHandler = (issuesUrl?: string) => {
  return () => openGitHubIssues(issuesUrl);
};
