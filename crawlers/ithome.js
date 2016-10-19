import { create } from 'phantom';
import { parse, format } from 'url';

import { filterBySameHost, runner } from '../src/crawler.js';

const entryUrl = 'http://www.ithome.com.tw/seminar_list';

runner(entryUrl, {
  crawler,
  post: filterBySameHost(entryUrl)
});

async function crawler(targetUrl) {
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
