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
