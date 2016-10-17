import parse from 'url';

export function delay(...ms) {
  const min = Math.min(...ms);
  const max = Math.max(...ms);
  return (...args) => new Promise(resolve => {
    const timeout = parseInt(Math.random(max - min)) + min;
    setTimeout(() => resolve(...args), timeout);
  });
}

export async function runMiddlewares(url, ...middlewares) {
  for (let i = 0, len = middlewares.length; i < len; i++) {
    const middleware = middlewares[i];
    url = await middleware(url);
  }
  return url;
}

export function filterBySameHost(baseUrlObj, urlObjs) {
  const { protocol, auth, host } = baseUrlObj;

  if (!Array.isArray(urlObjs)) {
    urlObjs = Array.prototype.slice.call(arguments, 1);
  }

  return urlObjs
  .map(urlObj => typeof urlObj === 'string' ? parse(urlObj) : urlObj)
  .filter(urlObj => !urlObj.host || urlObj.host === host);
}
