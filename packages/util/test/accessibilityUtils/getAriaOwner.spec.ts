import getAriaOwner from '../../src/accessibilityUtils/getAriaOwner';
import { expect } from 'chai';
import sinon from 'sinon';
import { JSDOM } from 'jsdom';
import { QWElement } from '@qualweb/qw-element';
import AccessibilityUtils from '../../src/accessibilityUtils/accessibilityUtils';

describe('getAriaOwner', () => {
  /**
   * Returns:
   * - null if no elements have an aria-owns attribute
   * - null if no element's aria-owns attribute contains the id of the given element
   * - null if an element with an aria-owns attribute is not in the accessibility tree
   * - an owning element if an element with an aria-owns attribute is in the accessibility tree and points to the given element
   * 
   * Stubs:
   * - element.getElementAttribute('id') and ('aria-owns')
   * - window.qwPage.getElements
   * - window.AccessibilityUtils.isElementInAT
   * 
   * Status:
   * - Coverage is missing a condition on line 9 which is impossible to hit. The
   *   code's alternate branch requires that a potential parent element does not
   *   have an aria-owns attribute, which is not possible since only elements
   *   that have the attribute are tested in the first place.
   */

  let dom: JSDOM;
  let htmlElement: HTMLElement;
  let qwElement: QWElement;
  const qwElementId: string = 'element-id';

  beforeEach(() => {
    dom = new JSDOM();
    htmlElement = dom.window.document.createElement('div');
    
    qwElement = new QWElement(htmlElement);
    sinon.stub(qwElement, 'getElementAttribute').returns(qwElementId);

    // @ts-expect-error: JSDOM and native don't match types perfectly.
    global.window = dom.window;
    // @ts-expect-error: manual stubbing necessary. QWPage tries to access global window.
    global.window.qwPage = {
      getElements: () => []
    };
    global.window.AccessibilityUtils = AccessibilityUtils;
  });

  afterEach(() => {
    sinon.restore();
  });

  it('Should return null if no elements have an aria-owns attribute', () => {
    sinon.stub(window.qwPage, 'getElements').returns([]);
    //sinon.stub(window.AccessibilityUtils, 'isElementInAT').returns(false);

    // Assert
    expect(getAriaOwner(qwElement)).to.be.null;
  });

  it('Should return null if no element with an aria-owns attribute points to the given element', () => {
    const nonOwningElement = new QWElement(dom.window.document.createElement('div'));
    const getElementAttributeStub = sinon.stub(nonOwningElement, 'getElementAttribute').returns('non-owning-id');

    sinon.stub(window.qwPage, 'getElements').returns([])
      .throws('Called with unexpected parameters')
      .withArgs('[aria-owns]').returns([nonOwningElement]);
      ;
    // This branch should not be hit, but we stub a throw to make sure that is the case.
    sinon.stub(window.AccessibilityUtils, 'isElementInAT').throws();

    expect(getAriaOwner(qwElement)).to.be.null;
  });

  it('Should return null if the owning element an aria-owns attribute pointing to the given element but is not in the accessibility tree', () => {
    const owningElement = new QWElement(dom.window.document.createElement('div'));
    sinon.stub(owningElement, 'getElementAttribute').returns(qwElementId);

    sinon.stub(window.qwPage, 'getElements').returns([])
      .throws('Called with unexpected parameters')
      .withArgs('[aria-owns]').returns([owningElement]);
      ;
    // This branch should not be hit, but we stub a throw to make sure that is the case.
    sinon.stub(window.AccessibilityUtils, 'isElementInAT').returns(false);

    expect(getAriaOwner(qwElement)).to.be.null;
  });

  it('Should return an owning element if it has an aria-owns attribute pointing to the given element', () => {
    const owningElement = new QWElement(dom.window.document.createElement('div'));
    sinon.stub(owningElement, 'getElementAttribute').returns(qwElementId);

    sinon.stub(window.qwPage, 'getElements').returns([])
      .throws('Called with unexpected parameters')
      .withArgs('[aria-owns]').returns([owningElement]);
      ;
    // This branch should not be hit, but we stub a throw to make sure that is the case.
    sinon.stub(window.AccessibilityUtils, 'isElementInAT').returns(true);

    expect(getAriaOwner(qwElement)).to.not.be.null;
  });
});
