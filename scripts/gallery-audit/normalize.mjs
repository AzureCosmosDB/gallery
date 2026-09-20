const YOUTUBE_HOSTS = new Set(['youtube.com', 'www.youtube.com', 'm.youtube.com', 'youtu.be']);

function isTrackingParameter(name, configured = []) {
  const lowerName = name.toLowerCase();
  return lowerName.startsWith('utm_') || configured.some((parameter) => {
    const lowerParameter = parameter.toLowerCase();
    return lowerParameter.endsWith('*')
      ? lowerName.startsWith(lowerParameter.slice(0, -1))
      : lowerName === lowerParameter;
  });
}

function youtubeVideoId(url) {
  if (!YOUTUBE_HOSTS.has(url.hostname)) return null;
  if (url.hostname === 'youtu.be') return url.pathname.split('/').filter(Boolean)[0] ?? null;
  if (url.pathname === '/watch') return url.searchParams.get('v');
  const match = url.pathname.match(/^\/(?:embed|shorts|live)\/([^/]+)/);
  return match?.[1] ?? null;
}

export function normalizeUrl(value, trackingParameters = []) {
  const url = new URL(value);
  if (!['http:', 'https:'].includes(url.protocol)) {
    throw new TypeError(`Unsupported URL protocol: ${url.protocol}`);
  }

  url.protocol = 'https:';
  url.hostname = url.hostname.toLowerCase();
  url.hash = '';

  const videoId = youtubeVideoId(url);
  if (videoId) return `https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}`;

  if (url.hostname === 'learn.microsoft.com') {
    url.pathname = url.pathname.replace(/^\/[a-z]{2}-[a-z]{2}(?=\/)/i, '');
    const pivotMarker = url.pathname.lastIndexOf('&pivots=');
    if (pivotMarker >= 0) {
      url.searchParams.set('pivots', url.pathname.slice(pivotMarker + '&pivots='.length));
      url.pathname = url.pathname.slice(0, pivotMarker);
    }
  }

  for (const name of [...url.searchParams.keys()]) {
    if (isTrackingParameter(name, trackingParameters)) url.searchParams.delete(name);
  }
  url.searchParams.sort();
  url.pathname = url.pathname.replace(/\/{2,}/g, '/').replace(/\/$/, '') || '/';

  return url.toString();
}

export function urlFingerprint(value, trackingParameters = []) {
  const normalized = new URL(normalizeUrl(value, trackingParameters));
  const githubParts = normalized.pathname.split('/').filter(Boolean);
  if (normalized.hostname === 'github.com' && githubParts.length >= 2) {
    const owner = githubParts[0].toLowerCase();
    const repository = githubParts[1].toLowerCase().replace(/\.git$/i, '');
    const remainder = githubParts.slice(2).join('/');
    return `github.com/${owner}/${repository}${remainder ? `/${remainder}` : ''}${normalized.search}`;
  }
  return normalized.toString();
}