import { create } from 'phantom';
import { parse, format } from 'url';

import { delay } from './src/crawler.js';

const entryUrl = 'http://www.ithome.com.tw/seminar_list';
const pause = delay(200, 500);

entry(entryUrl);

async function entry(entry) {
  const entryUrlObj = parse(entry);

  let urls = [entry];
  const pathSet = new Set([entryUrlObj.path]);

  while (urls.length > 0) {
    const targetUrl = urls.pop();
    const targetUrlObj = parse(targetUrl);

    const parsedUrls = await crawl(targetUrl);
    if (!!parsedUrls) {
      const crawlUrls = (Array.isArray(parsedUrls) ? parsedUrls : [parsedUrls])
      .map(link => parse(link))
      .filter(urlObj => {
        const { host } = entryUrlObj;
        const isSameHost = !urlObj.host || urlObj.host === host;
        const isNew = !pathSet.has(urlObj.path);
        return isSameHost && isNew;
      })
      .map(urlObj => {
        const { protocol, auth, host } = entryUrlObj;
        urlObj.protocol = protocol;
        urlObj.auth = auth;
        urlObj.host = host;
        pathSet.add(urlObj.path);
        return format(urlObj);
      });

      urls = urls.concat(crawlUrls);

      console.log(`Parse ${targetUrl}, add ${crawlUrls.length} url(s).`);
      console.log(`Remain ${urls.length} url(s).`);
      console.log();
    }

    await pause();
  }
}

async function crawl(targetUrl) {
  let phantom;
  let otherPages;
  try {
    phantom = await create();
    const page = await phantom.createPage();
    const status = await page.open(targetUrl);

    const channelItems = await page.evaluate(getChannelItems);
    otherPages = await page.evaluate(getPaginations);
  } catch (err) {
    console.error(err);
  } finally {
    phantom.exit();
  }
  return otherPages;
}

function getChannelItems() {
  const ret = [];
  const channelItemNodes = document.querySelectorAll('.channel-item');
  for (let i = 0; i < channelItemNodes.length; i++) {
    const channelItemNode = channelItemNodes[i];
    const titleNode = channelItemNode.querySelector('.title');
    const summaryNode = channelItemNode.querySelector('.summary');
    const timeNode = channelItemNode.querySelector('.post-at');
    ret.push({
      title: titleNode.textContent,
      summary: summaryNode.textContent,
      time: timeNode.textContent
    });
  }
  return ret;
}

function getPaginations() {
  const ret = {};
  const paginationNodes = document.querySelectorAll('.pagination a');
  for (let i = 0; i < paginationNodes.length; i++) {
    const paginationNode = paginationNodes[i];
    const url = paginationNode.getAttribute('href');
    ret[url] = 1;
  }

  return Object.keys(ret);
}
