// Live badges: values fetched from GitHub, npm and Codecov.
// Each provider turns path segments into { icon, label, value, state } – rendering stays in src/.
//
//   /github/actions/{owner}/{repo}/{workflow}.svg   ?branch=
//   /github/stars/{owner}/{repo}.svg
//   /github/release/{owner}/{repo}.svg
//   /github/license/{owner}/{repo}.svg
//   /npm/v/{package}.svg                           (scoped: /npm/v/@scope/name.svg)
//   /npm/dw/{package}.svg   /npm/dm/{package}.svg  weekly / monthly downloads
//   /codecov/{owner}/{repo}.svg                    ?branch=

export const LIVE_ROOTS = ['github', 'npm', 'codecov'];

// Thrown for wrong input (unknown repo, bad name): shown as an error badge
export class LiveNotFound extends Error {}
// Thrown when an upstream API fails: the last known value is shown instead, if there is one
export class UpstreamError extends Error {}

const OWNER_REPO = /^[\w.-]{1,100}$/;
const NPM_NAME = /^(@[a-z0-9][\w.-]*\/)?[a-z0-9][\w.-]*$/i;

/**
 * 1234 -> "1.2k", 2500000 -> "2.5M", 833100000 -> "833M" (no decimal from 100 on)
 * @param {number} n
 * @returns {string}
 */
export function formatCount(n) {
  const short = (x, unit) => `${Number(x.toFixed(x >= 100 ? 0 : 1))}${unit}`;
  if (n >= 1e6) return short(n / 1e6, 'M');
  if (n >= 1e3) return short(n / 1e3, 'k');
  return String(n);
}

async function getJson(url, env, { github = false } = {}) {
  const headers = { 'User-Agent': 'mmbadges (https://mmbadges.com)', Accept: 'application/json' };
  if (github) {
    headers.Accept = 'application/vnd.github+json';
    if (env.GITHUB_TOKEN) headers.Authorization = `Bearer ${env.GITHUB_TOKEN}`;
  }
  let res;
  try {
    res = await fetch(url, { headers });
  } catch {
    throw new UpstreamError('unavailable');
  }
  if (res.status === 404) return null;
  if (!res.ok) throw new UpstreamError(res.status === 403 || res.status === 429 ? 'rate limited' : 'unavailable');
  return res.json();
}

function ownerRepo(owner, repo) {
  if (!OWNER_REPO.test(owner) || !OWNER_REPO.test(repo)) throw new LiveNotFound('invalid repo');
  return `${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`;
}

// GitHub Actions run status -> badge value and state
function runState(run) {
  if (!run) return ['no runs', 'neutral'];
  if (run.status !== 'completed') return ['running', 'info'];
  switch (run.conclusion) {
    case 'success':
      return ['passing', 'success'];
    case 'failure':
    case 'timed_out':
    case 'startup_failure':
      return ['failing', 'danger'];
    case 'cancelled':
      return ['cancelled', 'neutral'];
    default:
      return [run.conclusion ?? 'unknown', 'neutral'];
  }
}

const GITHUB = {
  async actions([owner, repo, workflow], { branch }, env) {
    if (!workflow || !/^[\w.-]+$/.test(workflow)) throw new LiveNotFound('invalid workflow');
    const path = ownerRepo(owner, repo);
    // Without ?branch= GitHub returns the latest run on *any* branch (often a broken
    // feature branch), so we default to the repository's default branch.
    if (!branch) {
      const info = await getJson(`https://api.github.com/repos/${path}`, env, { github: true });
      if (!info) throw new LiveNotFound('repo not found');
      branch = info.default_branch;
    }
    const q = new URLSearchParams({ per_page: '1', exclude_pull_requests: 'true', branch });
    const data = await getJson(
      `https://api.github.com/repos/${path}/actions/workflows/${encodeURIComponent(workflow)}/runs?${q}`,
      env,
      { github: true },
    );
    if (!data) throw new LiveNotFound('workflow not found');
    const [value, state] = runState(data.workflow_runs?.[0]);
    return { icon: 'si:githubactions', label: 'build', value, state };
  },

  async stars([owner, repo], _, env) {
    const data = await getJson(`https://api.github.com/repos/${ownerRepo(owner, repo)}`, env, { github: true });
    if (!data) throw new LiveNotFound('repo not found');
    return { icon: 'lucide:star', label: 'stars', value: formatCount(data.stargazers_count), state: 'neutral' };
  },

  async release([owner, repo], _, env) {
    const data = await getJson(`https://api.github.com/repos/${ownerRepo(owner, repo)}/releases/latest`, env, {
      github: true,
    });
    // 404 means "no release yet" (or no such repo)
    return { icon: 'lucide:tag', label: 'release', value: data?.tag_name ?? 'none', state: data ? 'info' : 'neutral' };
  },

  async license([owner, repo], _, env) {
    const data = await getJson(`https://api.github.com/repos/${ownerRepo(owner, repo)}`, env, { github: true });
    if (!data) throw new LiveNotFound('repo not found');
    const id = data.license?.spdx_id;
    const value = !id ? 'none' : id === 'NOASSERTION' ? 'other' : id;
    return { icon: 'lucide:scale', label: 'license', value, state: 'neutral' };
  },
};

function npmName(parts) {
  const name = parts.join('/');
  if (parts.length > 2 || !NPM_NAME.test(name)) throw new LiveNotFound('invalid package');
  return name;
}

const NPM = {
  async v(parts, _, env) {
    const name = npmName(parts);
    // Scoped names need the slash encoded in the registry URL: @scope%2Fname
    const data = await getJson(`https://registry.npmjs.org/${name.replace('/', '%2F')}/latest`, env);
    if (!data?.version) throw new LiveNotFound('package not found');
    return { icon: 'si:npm', label: 'npm', value: `v${data.version}`, state: 'info' };
  },
  dw: (parts, _, env) => downloads(parts, env, 'week'),
  dm: (parts, _, env) => downloads(parts, env, 'month'),
};

async function downloads(parts, env, period) {
  const name = npmName(parts);
  const data = await getJson(`https://api.npmjs.org/downloads/point/last-${period}/${name}`, env);
  if (!data || typeof data.downloads !== 'number') throw new LiveNotFound('package not found');
  return { icon: 'si:npm', label: 'downloads', value: `${formatCount(data.downloads)}/${period}`, state: 'neutral' };
}

async function codecov([owner, repo], { branch }, env) {
  ownerRepo(owner, repo); // validates both names
  const base = `https://api.codecov.io/api/v2/github/${encodeURIComponent(owner)}/repos/${encodeURIComponent(repo)}`;
  const data = await getJson(branch ? `${base}/branches/${encodeURIComponent(branch)}/` : `${base}/`, env);
  const coverage = branch ? data?.head_commit?.totals?.coverage : data?.totals?.coverage;
  if (typeof coverage !== 'number') throw new LiveNotFound('no coverage');
  return { icon: 'si:codecov', label: 'coverage', value: `${Number(coverage.toFixed(1))}%`, state: 'auto' };
}

/**
 * Resolve a live badge from its path segments, e.g. ["github", "stars", "owner", "repo"].
 * @param {string[]} parts
 * @param {{ branch: string }} params
 * @param {{ GITHUB_TOKEN?: string }} env
 * @returns {Promise<{ icon: string, label: string, value: string, state: string }>}
 */
export function resolveLive([root, type, ...rest], params, env) {
  if (root === 'github' && Object.hasOwn(GITHUB, type) && rest.length === (type === 'actions' ? 3 : 2))
    return GITHUB[type](rest, params, env);
  if (root === 'npm' && Object.hasOwn(NPM, type) && rest.length >= 1) return NPM[type](rest, params, env);
  if (root === 'codecov' && type !== undefined && rest.length === 1) return codecov([type, rest[0]], params, env);
  throw new LiveNotFound('not found');
}
