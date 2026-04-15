/**
 * GitHub Intelligence Service
 * Handles repository parsing and file fetching for node ingestion.
 */

export const githubService = {
  /**
   * Parses a GitHub URL to extract owner, repo, path, and branch.
   * Supports both blob and raw URLs.
   */
  parseUrl(url: string) {
    try {
      const trimmedUrl = url.trim();
      if (!trimmedUrl) return null;

      // Handle raw.githubusercontent.com
      if (trimmedUrl.includes('raw.githubusercontent.com')) {
        const parts = trimmedUrl.replace('https://raw.githubusercontent.com/', '').split('/');
        return {
          owner: parts[0],
          repo: parts[1],
          branch: parts[2],
          path: parts.slice(3).join('/')
        };
      }

      // Handle github.com
      const match = trimmedUrl.match(/github\.com\/([^/]+)\/([^/]+)(?:\/blob\/([^/]+)\/(.+))?/);
      if (!match) return null;

      return {
        owner: match[1],
        repo: match[2],
        branch: match[3] || 'main',
        path: match[4] || ''
      };
    } catch (e) {
      console.error('Error parsing GitHub URL:', e);
      return null;
    }
  },

  /**
   * Fetches the raw content of a file from GitHub.
   */
  async fetchFileContent(owner: string, repo: string, path: string, branch: string = 'main') {
    const rawUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${path}`;
    const response = await fetch(rawUrl);
    
    if (!response.ok) {
      throw new Error(`Technical Link Failure: ${response.statusText}`);
    }

    return response.text();
  }
};
