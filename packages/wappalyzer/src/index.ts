import Wappalyzer from 'wappalyzer';
import { WappalyzerReport } from '@qualweb/wappalyzer';

async function executeWappalyzer(url: string): Promise<WappalyzerReport> {
  const report: WappalyzerReport = {
    type: 'wappalyzer',
    result: await new Wappalyzer(url).analyze()
  };

  return report;
};

export { 
  executeWappalyzer
};