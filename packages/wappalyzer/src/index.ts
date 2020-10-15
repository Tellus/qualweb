import Wappalyzer from 'wappalyzer';
import { WappalyzerReport } from '@qualweb/wappalyzer';

async function executeWappalyzer(url: string): Promise<WappalyzerReport> {
  const wappalyzer = new Wappalyzer();

  await wappalyzer.init();

  const report: WappalyzerReport = {
    type: 'wappalyzer',
    result: await wappalyzer.open(url).analyze()
  };

  await wappalyzer.destroy();

  return report;
};

export { 
  executeWappalyzer
};