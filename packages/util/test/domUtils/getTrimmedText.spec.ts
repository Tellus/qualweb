import getTrimmedText from '../../src/domUtils/getTrimmedText';
import { expect } from 'chai';
import sinon from 'sinon';
import { JSDOM } from 'jsdom';
import { QWElement } from '@qualweb/qw-element';

describe('getTrimmedText', () => {
  let dom: JSDOM;

  let htmlElement: HTMLElement;
  let qwElement: QWElement;

  beforeEach(() => {
    dom = new JSDOM();

    htmlElement = dom.window.document.createElement('div');
    qwElement = new QWElement(htmlElement);
  });

  afterEach(() => {
    sinon.restore();
  });

  it('Should correctly return an untrimmable text as-is', () => {
    const text = 'Untrimmable text';

    sinon.stub(qwElement, 'getElementText').returns(text);

    expect(getTrimmedText(qwElement)).to.equal(text);
  });

  it('Should correctly trim a trimmable text', () => {
    const text = '  Trimmable text  ';
    const expected = 'Trimmable text';

    sinon.stub(qwElement, 'getElementText').returns(text);

    expect(getTrimmedText(qwElement)).to.equal(expected);
  });

  it('Should return an empty string if passed an empty string', () => {
    const text = '';

    sinon.stub(qwElement, 'getElementText').returns(text);

    expect(getTrimmedText(qwElement)).to.equal(text);
  });
});
