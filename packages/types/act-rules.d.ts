declare module '@qualweb/act-rules' {
  import { DomElement } from 'htmlparser2';

  interface ACTROptions {
    rules?: string[];
    levels?: string[];
    principles?: string[];
  }

  interface ACTMetadata {
    target: {
      element?: string | string[];
      attributes?: string | string[];
      css?: string | string[];
    };
    'success-criteria': {
      name: string;
      level: string;
      principle: string;
    }[];
    related: string[];
    url: string;
    passed: number;
    failed: number;
    notApplicable: number;
    type?: string[];
    a11yReq?: string[];
    outcome: 'passed' | 'failed' | 'notApplicable' | '';
    description: string;
  }

  interface ACTResult {
    verdict: 'passed' | 'failed' | 'notApplicable' | '';
    description: string;
    pointer?: string;
    code?: string;
  }

  interface ACTRule {
    name: string;
    code: string;
    description: string;
    metadata: ACTMetadata;
    results: ACTResult[];
  }

  interface ACTRulesReport {
    type: 'act-rules'; 
    rules: {
      [rule: string]: ACTRule;
    };
  }

  function configure(options: ACTROptions): void;
  function executeACTR(sourceHTML: DomElement[], processedHTML: DomElement[]): Promise<ACTRulesReport>;

  export {
    ACTROptions,
    ACTMetadata,
    ACTResult,
    ACTRule,
    ACTRulesReport,
    configure,
    executeACTR
  };
} 