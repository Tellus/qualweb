import type { QWElement } from '@packages/qw-element/src';
import { ElementExists, ElementIsNotHidden } from '@shared/applicability';
import { Test } from '@shared/classes';
import { Verdict } from '@shared/types';
import { AtomicRule } from '../lib/AtomicRule.object';

class QW_ACT_R21 extends AtomicRule {
  private readonly roleList = ['img', 'graphics-document', 'graphics-symbol'];

  @ElementExists
  @ElementIsNotHidden
  execute(element: QWElement): void {
    const elementsToEvaluate = element.getElements('svg *');
    elementsToEvaluate.push(element);

    for (const elem of elementsToEvaluate ?? []) {
      const test = new Test();

      const role = elem.getElementAttribute('role');
      if (role && this.roleList.includes(role)) {
        const accessibleName = window.AccessibilityUtils.getAccessibleNameSVG(elem);
        if (accessibleName && accessibleName.trim() !== '') {
          test.verdict = Verdict.PASSED;
          test.resultCode = 'P1';
        } else {
          test.verdict = Verdict.FAILED;
          test.resultCode = 'F1';
        }

        test.addElement(elem, true, false, true);
        this.addTestResult(test);
      }
    }
  }
}

export { QW_ACT_R21 };
