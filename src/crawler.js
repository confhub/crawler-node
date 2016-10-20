import { parse, format } from 'url';

export function delay(min, max) {
  return new Promise(resolve => {
    const min = Math.min(min, max);
    const max = Math.max(min, max);
    const timeout = parseInt(Math.random(max - min)) + min;
    setTimeout(() => resolve(), timeout);
  });
}

export async function runMiddlewares(url, ...middlewares) {
  for (let i = 0, len = middlewares.length; i < len; i++) {
    const middleware = middlewares[i];
    url = await middleware(url);
  }
  return url;
}

export function filterBySameHost(baseUrl) {
  const baseUrlObj = parse(baseUrl);
  const historySet = new Set([baseUrl]);

  return function (urlObjs) {
    if (!Array.isArray(urlObjs)) {
      urlObjs = Array.prototype.slice.call(arguments);
    }

    return urlObjs
    .map(urlObj => typeof urlObj === 'string' ? parse(urlObj) : urlObj)
    .filter(urlObj => !urlObj.host || urlObj.host === baseUrlObj.host)
    .map(urlObj => {
      const { protocol, auth, host } = baseUrlObj;
      const { pathname, search } = urlObj;
      return format({
        protocol,
        auth,
        host,
        pathname,
        search
      });
    })
    .filter(u => {
      if (historySet.has(u)) {
        return false;
      }

      historySet.add(u);
      return true;
    });
  }
}

export async function runner(entry, hooks) {
  let queuedUrls = [entry];

  const crawler = typeof hooks === 'function' ? hooks : hooks.crawler;
  const pre = !!hooks ? hooks.pre : null;
  const post = !!hooks ? hooks.post : null;

  while (queuedUrls.length > 0) {
    const targetUrl = queuedUrls.pop();

    const preResult = !!pre ? await pre(targetUrl) : targetUrl;
    const parsedUrls = await crawler(targetUrl);

    if (parsedUrls) {
      const postResults = !!post ? await post(parsedUrls) : parsedUrls;
      if (Array.isArray(postResults)) {
        queuedUrls = queuedUrls.concat(postResults);
      } else {
        queuedUrls.push(postResults);
      }
    }
  }
}
