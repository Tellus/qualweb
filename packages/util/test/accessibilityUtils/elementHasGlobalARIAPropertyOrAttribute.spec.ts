import elementHasGlobalARIAPropertyOrAttribute from '../../src/accessibilityUtils/elementHasGlobalARIAPropertyOrAttribute';
import ariaJSON from '../../src/accessibilityUtils/ariaAttributesRoles.json';
import { expect } from 'chai';
import sinon from 'sinon';
import { JSDOM } from 'jsdom';
import { QWElement } from '@qualweb/qw-element';

describe('elementHasGlobalARIAPropertyOrAttribute', () => {
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

  it('Should return true if the element has one global aria attribute or property', () => {
    sinon.stub(qwElement, 'getElementAttributesName').returns(['aria-label']);
    expect(elementHasGlobalARIAPropertyOrAttribute(qwElement)).to.be.true;
  });

  it('Should return true if the element has two global aria attribute or property', () => {
    sinon.stub(qwElement, 'getElementAttributesName').returns(['aria-label', 'aria-atomic']);
    expect(elementHasGlobalARIAPropertyOrAttribute(qwElement)).to.be.true;
  });

  it('Should return true if the element has a combination of global and non-global aria attributes or properties', () => {
    sinon.stub(qwElement, 'getElementAttributesName').returns(['aria-activedescendant', 'aria-label']);
    expect(elementHasGlobalARIAPropertyOrAttribute(qwElement)).to.be.true;
  });

  it('Should return false if the element no attributes', () => {
    sinon.stub(qwElement, 'getElementAttributesName').returns([]);
    expect(elementHasGlobalARIAPropertyOrAttribute(qwElement)).to.be.false;
  });

  it('Should return true if the element has a mix of global aria attribute or property and others', () => {
    sinon.stub(qwElement, 'getElementAttributesName').returns(['aria-label', 'display', 'data-random']);
    expect(elementHasGlobalARIAPropertyOrAttribute(qwElement)).to.be.true;
  });

  it('Should return false if the element has a non-global aria attribute or property', () => {
    sinon.stub(qwElement, 'getElementAttributesName').returns(['aria-activedescendant']);
    expect(elementHasGlobalARIAPropertyOrAttribute(qwElement)).to.be.false;
  });
});
