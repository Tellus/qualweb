import { expect } from 'chai';
import { JSDOM } from 'jsdom';

// Import functions that are used behind the scenes by the function we are
// actually testing. Importing it this early means it gets cached by NodeJS and
// we can stub it out to control its behavior.
import isElementVisible from '../../src/domUtils/isElementVisible';
import * as elementHasContentModule from '../../src/domUtils/elementHasContent';
import * as elementHasOnePixelModule from '../../src/domUtils/elementHasOnePixel';

import { QWElement } from '@qualweb/qw-element';
import sinon from 'sinon';
import DomUtils from '../../src/domUtils/domUtils';

describe('isElementVisible', () => {
  let dom: JSDOM;
  let qwElement: QWElement;

  beforeEach(() => {
    dom = new JSDOM();
    
    global.window = dom.window as unknown as Window & typeof globalThis;

    window.DomUtils = DomUtils as any; // We need better typing, here.
    
    qwElement = new QWElement(dom.window.document.createElement('div'));
  });

  afterEach(() => {
    sinon.restore();
  })

  it('should return true for a visible element', () => {
    sinon.stub(qwElement, 'isOffScreen').returns(false);

    sinon.stub(elementHasContentModule, 'default').returns(true);
    sinon.stub(elementHasOnePixelModule, 'default').returns(false);
    sinon.stub(qwElement, 'getElementStyleProperty')
      .throws('Bad args')
      .withArgs('opacity').returns('1.0')
      ;

    // All the methods of DomUtils are static methods, hence why we're stubbing
    // "directly" on the class.
    sinon.stub(DomUtils, 'isElementHiddenByCSS').returns(false);

    // Assert that the element is visible
    expect(isElementVisible(qwElement)).to.be.true;
  });

  it('should return false for an element that is off-screen', () => {
    sinon.stub(qwElement, 'isOffScreen').returns(true);

    sinon.stub(elementHasContentModule, 'default').returns(true);
    sinon.stub(elementHasOnePixelModule, 'default').returns(false);
    sinon.stub(qwElement, 'getElementStyleProperty')
      .throws('Bad args')
      .withArgs('opacity').returns('1.0')
      ;

    // All the methods of DomUtils are static methods, hence why we're stubbing
    // "directly" on the class.
    sinon.stub(DomUtils, 'isElementHiddenByCSS').returns(false);

    // Assert that the element is visible
    expect(isElementVisible(qwElement)).to.be.false;
  });

  it('should return false for an element that is hidden by CSS', () => {
    sinon.stub(qwElement, 'isOffScreen').returns(false);

    sinon.stub(elementHasContentModule, 'default').returns(true);
    sinon.stub(elementHasOnePixelModule, 'default').returns(false);
    sinon.stub(qwElement, 'getElementStyleProperty')
      .throws('Bad args')
      .withArgs('opacity').returns('1.0')
      ;

    // All the methods of DomUtils are static methods, hence why we're stubbing
    // "directly" on the class.
    sinon.stub(DomUtils, 'isElementHiddenByCSS').returns(true);

    // Assert that the element is visible
    expect(isElementVisible(qwElement)).to.be.false;
  });

  it('should return false for an element that has no content', () => {
    sinon.stub(qwElement, 'isOffScreen').returns(false);

    sinon.stub(elementHasContentModule, 'default').returns(false);
    sinon.stub(elementHasOnePixelModule, 'default').returns(false);
    sinon.stub(qwElement, 'getElementStyleProperty')
      .throws('Bad args')
      .withArgs('opacity').returns('1.0')
      ;

    // All the methods of DomUtils are static methods, hence why we're stubbing
    // "directly" on the class.
    sinon.stub(DomUtils, 'isElementHiddenByCSS').returns(false);

    // Assert that the element is visible
    expect(isElementVisible(qwElement)).to.be.false;
  });

  it('should return false for an element of only one pixel', () => {
    sinon.stub(qwElement, 'isOffScreen').returns(false);

    sinon.stub(elementHasContentModule, 'default').returns(true);
    sinon.stub(elementHasOnePixelModule, 'default').returns(true);
    sinon.stub(qwElement, 'getElementStyleProperty')
      .throws('Bad args')
      .withArgs('opacity').returns('1.0')
      ;

    // All the methods of DomUtils are static methods, hence why we're stubbing
    // "directly" on the class.
    sinon.stub(DomUtils, 'isElementHiddenByCSS').returns(false);

    // Assert that the element is visible
    expect(isElementVisible(qwElement)).to.be.false;
  });

  it('should return false for an element with an opacity of 0', () => {
    sinon.stub(qwElement, 'isOffScreen').returns(false);

    sinon.stub(elementHasContentModule, 'default').returns(true);
    sinon.stub(elementHasOnePixelModule, 'default').returns(false);
    sinon.stub(qwElement, 'getElementStyleProperty')
      .throws('Bad args')
      .withArgs('opacity').returns('0')
      ;

    // All the methods of DomUtils are static methods, hence why we're stubbing
    // "directly" on the class.
    sinon.stub(DomUtils, 'isElementHiddenByCSS').returns(false);

    // Assert that the element is visible
    expect(isElementVisible(qwElement)).to.be.false;
  });

  it('should return true if an element is visible and its parent is not opaque', () => {
    const parentElement = new QWElement(dom.window.document.createElement('div'));

    sinon.stub(parentElement, 'getElementStyleProperty')
      .throws('Bad args')
      .withArgs('opacity').returns('0.0')
      ;

    sinon.stub(qwElement, 'getElementParent').returns(parentElement);

    sinon.stub(qwElement, 'isOffScreen').returns(false);

    sinon.stub(elementHasContentModule, 'default').returns(true);
    sinon.stub(elementHasOnePixelModule, 'default').returns(false);
    sinon.stub(qwElement, 'getElementStyleProperty')
      .throws('Bad args')
      .withArgs('opacity').returns('1.0')
      ;

    // All the methods of DomUtils are static methods, hence why we're stubbing
    // "directly" on the class.
    sinon.stub(DomUtils, 'isElementHiddenByCSS').returns(false);

    // Assert that the element is visible
    expect(isElementVisible(qwElement)).to.be.true;
  });

  it('should return false if an element is visible and its parent is opaque', () => {
    const parentElement = new QWElement(dom.window.document.createElement('div'));

    sinon.stub(parentElement, 'getElementStyleProperty')
      .throws('Bad args')
      .withArgs('opacity').returns('1.0')
      ;

    sinon.stub(qwElement, 'getElementParent').returns(parentElement);

    sinon.stub(qwElement, 'isOffScreen').returns(false);

    sinon.stub(elementHasContentModule, 'default').returns(true);
    sinon.stub(elementHasOnePixelModule, 'default').returns(false);
    sinon.stub(qwElement, 'getElementStyleProperty')
      .throws('Bad args')
      .withArgs('opacity').returns('1.0')
      ;

    // All the methods of DomUtils are static methods, hence why we're stubbing
    // "directly" on the class.
    sinon.stub(DomUtils, 'isElementHiddenByCSS').returns(false);

    // Assert that the element is visible
    expect(isElementVisible(qwElement)).to.be.false;
  });
});
