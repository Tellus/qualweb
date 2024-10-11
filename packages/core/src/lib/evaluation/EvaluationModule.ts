import type { Translate, TranslationOptions } from '@qualweb/locale';
import { LocaleFetcher } from '@qualweb/locale';
import { ModuleOptions } from './ModuleOptions';
import { TestingData } from './TestingData';
import { EvaluationReport } from './EvaluationReport';
import { ModuleReport } from './ModuleReport';
import { ModuleType } from './ModuleType';
import { Tester } from './Tester';

export abstract class EvaluationModule {
  protected abstract type: ModuleType;
  protected abstract readonly report: ModuleReport;
  protected abstract readonly tester: Tester;

  protected readonly translate: Translate;

  constructor(translationOptions: TranslationOptions) {
    this.translate = LocaleFetcher.transform(translationOptions);
  }

  public configure(options: ModuleOptions): this {
    this.tester.resetConfiguration();
    this.tester.configureByPrinciplesAndLevels(options.principles, options.levels);
    this.tester.configureIncluded(options.include);
    this.tester.configureExcluded(options.exclude);
    return this;
  }

  public test(data: TestingData): this {
    this.tester.execute(data);
    return this;
  }

  public testSpecial(): this {
    throw new Error('Method not implemented.');
  }

  public getReport(): EvaluationReport {
    return this.report.getCopy();
  }
}