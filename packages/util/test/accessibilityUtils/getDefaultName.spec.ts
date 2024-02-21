import getDefaultName from '../../src/accessibilityUtils/getDefaultName';
import { expect } from 'chai';
import { JSDOM } from 'jsdom';
import sinon from 'sinon';
import { QWElement } from '@qualweb/qw-element';

describe('getDefaultName', () => {
  /**
   * Returns:
   * - '' if the element tag is not "input".
   * - '' if the element tag is "input" and the type of the element is not 'submit' or 'reset'.
   * - 'Reset' if the element tag is "input" and the type of the element is 'submit' or 'reset'.
   * 
   * Stubs:
   * - qwElement.getElementTagName
   * - qwElement.getElementAttribute
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

  it('Should return "" if the element tag is not "input"', () => {
    sinon.stub(qwElement, 'getElementTagName').returns('div');
    const getElementAttributeStub = sinon.stub(qwElement, 'getElementAttribute');

    const result = getDefaultName(qwElement);

    expect(result).to.be.equal('');
    expect(getElementAttributeStub.called).to.be.false;
  });

  it('Should return "" if the element tag is "input" but its type is not "submit" or "reset"', () => {
    sinon.stub(qwElement, 'getElementTagName').returns('input');
    const getElementAttributeStub = sinon.stub(qwElement, 'getElementAttribute').returns('email');

    const result = getDefaultName(qwElement);

    expect(result).to.be.equal('');
    expect(getElementAttributeStub.called).to.be.true;
  });

  it('Should return "Reset" if the element tag is "input" and its type is "submit"', () => {
    sinon.stub(qwElement, 'getElementTagName').returns('input');
    const getElementAttributeStub = sinon.stub(qwElement, 'getElementAttribute').returns('submit');

    const result = getDefaultName(qwElement);

    expect(result).to.be.equal('Reset');
    expect(getElementAttributeStub.called).to.be.true;
  });

  it('Should return "Reset" if the element tag is "input" and its type is "reset"', () => {
    sinon.stub(qwElement, 'getElementTagName').returns('input');
    const getElementAttributeStub = sinon.stub(qwElement, 'getElementAttribute').returns('reset');

    const result = getDefaultName(qwElement);

    expect(result).to.be.equal('Reset');
    expect(getElementAttributeStub.called).to.be.true;
  });
});
