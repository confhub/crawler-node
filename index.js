import ithomeCrawler, { run } from './crawlers/ithome';

ithomeCrawler.on('start', url => {
  console.log(`start: ${url}`);
});

ithomeCrawler.on('complete', items => {
  console.log(`result: ${items.length}`);
});

ithomeCrawler.on('end', url => {
  console.log(`end: ${url}`);
});

run();
