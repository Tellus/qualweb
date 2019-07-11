'use strict';

import {
  Application,
  WappalyzerOptions,
  WappalyzerReport
} from '@qualweb/wappalyzer';

import Wappalyzer from 'wappalyzer';

async function executeWappalyzer(url: string, options: WappalyzerOptions): Promise<WappalyzerReport> {
  const report: WappalyzerReport = {
    result: await new Wappalyzer(url).analyze()
  };

  report.result.applications.map((app: Application) => {
    if (options && options.cms) {
      return app;
    }

    return app;
  });

  return report;
};

export default executeWappalyzer;