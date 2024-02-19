import { QWElement } from '@qualweb/qw-element';
import isElementHiddenByCSSAux from '../../src/domUtils/isElementHiddenByCSSAux';
import { expect } from 'chai';
import sinon from 'sinon';
import { JSDOM } from 'jsdom';

describe('isElementHiddenByCSSAux', () => {
  /**
   * Returns:
   * - true if display style propery is "none"
   * - true if visibility style property is "collapse"
   * - true if visilibity style property is "hidden"
   */

  /**
   * Stubs:
   * - getElementStyleProperty('display')
   * - getElementStyleProperty('visibility')
   */
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

  it('Should return true if display style property is "none"', () => {
    sinon.stub(qwElement, 'getElementStyleProperty')
      .throws('Unexpected parameters passed to getElementStyleProperty')
      .withArgs('display').returns('none')
      .withArgs('visibility').returns('')
      ;

    expect(isElementHiddenByCSSAux(qwElement)).to.be.true;
  });

  it('Should return true if visibility style property is "collapse"', () => {
    sinon.stub(qwElement, 'getElementStyleProperty')
      .throws('Unexpected parameters passed to getElementStyleProperty')
      .withArgs('display').returns('')
      .withArgs('visibility').returns('collapse')
      ;

    expect(isElementHiddenByCSSAux(qwElement)).to.be.true;
  });

  it('Should return true if visibility style property is "hidden"', () => {
    sinon.stub(qwElement, 'getElementStyleProperty')
      .throws('Unexpected parameters passed to getElementStyleProperty')
      .withArgs('display').returns('')
      .withArgs('visibility').returns('hidden')
      ;

    expect(isElementHiddenByCSSAux(qwElement)).to.be.true;
  });

  it('Should return false otherwise', () => {
    sinon.stub(qwElement, 'getElementStyleProperty')
      .throws('Unexpected parameters passed to getElementStyleProperty')
      .withArgs('display').returns('')
      .withArgs('visibility').returns('')
      ;

    expect(isElementHiddenByCSSAux(qwElement)).to.be.false;
  });
});
