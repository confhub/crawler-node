import { create } from 'phantom';

const entryUrl = 'http://www.ithome.com.tw/seminar_list';

entry(entryUrl);

async function entry(targetUrl) {
  let phantom;
  const { log } = console;
  const slient = () => {};
  try {
    phantom = await create();
    const page = await phantom.createPage();
    const status = await page.open(targetUrl);

    const channelItems = await page.evaluate(getChannelItems);
    console.log(channelItems);

  } catch (err) {
    console.error(err);
  } finally {
    phantom.exit();
  }
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
