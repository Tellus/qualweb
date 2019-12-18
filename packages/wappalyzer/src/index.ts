'use strict';

import {
  WappalyzerOptions,
  WappalyzerReport
} from '@qualweb/wappalyzer';

import Wappalyzer from 'wappalyzer';

async function executeWappalyzer(url: string, options?: WappalyzerOptions): Promise<WappalyzerReport> {
  const report: WappalyzerReport = {
    type: 'wappalyzer',
    result: await new Wappalyzer(url).analyze()
  };
  
  return report;
};

export { 
  executeWappalyzer
};