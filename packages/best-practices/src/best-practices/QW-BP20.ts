import type { QWElement } from '@packages/qw-element/src';
import { ElementExists } from '@shared/applicability';
import { Test } from '@shared/classes';
import { Verdict } from '@shared/types';
import { BestPractice } from '../lib/BestPractice.object';

class QW_BP20 extends BestPractice {
  @ElementExists
  execute(element: QWElement): void {
    const possibleLandmarkList = element.getElements('header:not([role]), [role=banner]');
    const landmarkList = possibleLandmarkList.filter(
      (element) => window.AccessibilityUtils.getElementRole(element) === 'banner'
    );

    if (landmarkList.length > 0) {
      const test = new Test();
      if (landmarkList.length < 2) {
        test.verdict = Verdict.PASSED;
        test.resultCode = 'P1';
      } else {
        test.verdict = Verdict.FAILED;
        test.resultCode = 'F1';
      }
      test.addElements(landmarkList);
      super.addTestResult(test);
    }
  }
}

export { QW_BP20 };
