/**
 * Utility function to open GitHub new issue page with feedback template in a new tab
 * @param issuesUrl - Optional GitHub new issue URL, defaults to the gallery repository new issue page with feedback template
 */
export const openGitHubNewIssue = (issuesUrl?: string): void => {
  const defaultUrl =
    "https://github.com/EmumbaOrg/postgres-gallery/issues/new?template=feedback.md";
  window.open(issuesUrl || defaultUrl, "_blank");
};

/**
 * Higher-order function to create a click handler that opens GitHub new issue page with template
 * @param issuesUrl - Optional GitHub new issue URL, defaults to the gallery repository new issue page with feedback template
 * @returns A click handler function
 */
export const shareFeedbackHandler = (issuesUrl?: string) => {
  return () => openGitHubNewIssue(issuesUrl);
};