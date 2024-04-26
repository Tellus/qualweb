import type { Module, QualwebReport, Assertion } from '@shared/types';
import type { Translate, TranslationValues } from '@qualweb/locale';
import { AssertionTranslator } from './assertion-translator';
import { TestTranslator } from './test-translator';

export class ModuleTranslator {
  private readonly module: Module;
  private readonly assertionTranslator: AssertionTranslator;
  private readonly testTranslator: TestTranslator;

  constructor(module: Module, locale: Translate) {
    this.module = module;
    this.assertionTranslator = new AssertionTranslator(module, locale);
    this.testTranslator = new TestTranslator(module, locale);
  }

  public translate(report: QualwebReport): void {
    for (const code in report.modules[this.module]?.assertions ?? {}) {
      const assertion = report.modules[this.module]?.assertions[code];
      if (assertion) {
        this.translateAssertion(assertion);
      }
    }
  }

  public translateAssertion(assertion: Assertion): void {
    this.assertionTranslator.translate(assertion);

    for (const test of assertion.results ?? []) {
      test.description = this.testTranslator.translate(assertion.code, test.resultCode);
    }

    for (const test of assertion.results ?? []) {
      if (test.verdict === assertion.metadata.outcome) {
        assertion.metadata.description = test.description;
        break;
      }
    }
  }

  public translateTest(assertionCode: string, resultCode: string, values?: TranslationValues): string {
    return this.testTranslator.translate(assertionCode, resultCode, values);
  }
}
