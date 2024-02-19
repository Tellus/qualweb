import isElementHiddenByCSS from '../../src/domUtils/isElementHiddenByCSS';
import * as isElementHiddenByCSSAux from '../../src/domUtils/isElementHiddenByCSSAux';
import { expect } from 'chai';
import sinon from 'sinon';
import { JSDOM } from 'jsdom';
import { QWElement } from '@qualweb/qw-element';
import DomUtils from '../../src/domUtils/domUtils';

describe('isElementHiddenByCSS', () => {
  /**
   * Returns:
   * - true if QWElement is hidden
   * - true if parent QWElement is hidden (recursive)
   * - false otherwise.
   */

  let dom: JSDOM;

  let htmlElement: HTMLElement;
  let qwElement: QWElement;

  beforeEach(() => {
    dom = new JSDOM();

    // @ts-expect-error: JSDOM and browser window types are 100% identical.
    global.window = dom.window;
    global.window.DomUtils = DomUtils;

    htmlElement = dom.window.document.createElement('div');
    qwElement = new QWElement(htmlElement);
  });

  afterEach(() => {
    sinon.restore();
  });

  it('Should return true if the element is hidden', () => {
    sinon.stub(qwElement, 'getParentAllContexts').returns(null);
    
    sinon.stub(isElementHiddenByCSSAux, 'default').returns(true);

    expect(isElementHiddenByCSS(qwElement)).to.be.true;
  });

  it('Should return true if the parent element is hidden', () => {
    const parentHtmlElement = dom.window.document.createElement('div');
    const parentQwElement = new QWElement(parentHtmlElement);

    sinon.stub(qwElement, 'getParentAllContexts').returns(parentQwElement);
    sinon.stub(global.window.DomUtils, 'isElementHiddenByCSS').returns(true);

    sinon.stub(isElementHiddenByCSSAux, 'default').returns(true);

    expect(isElementHiddenByCSS(qwElement)).to.be.true;
  });

  it('Should return false if the element is not hidden', () => {
    sinon.stub(qwElement, 'getParentAllContexts').returns(null);
    
    sinon.stub(isElementHiddenByCSSAux, 'default').returns(false);

    expect(isElementHiddenByCSS(qwElement)).to.be.false;
  });
});
