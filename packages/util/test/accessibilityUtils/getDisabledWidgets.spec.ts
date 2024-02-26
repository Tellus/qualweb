import getDisabledWidgets from '../../src/accessibilityUtils/getDisabledWidgets';
import AccessibilityUtils from '../../src/accessibilityUtils/accessibilityUtils';
import { expect } from 'chai';
import { JSDOM } from 'jsdom';
import sinon from 'sinon';
import { QWElement } from '@qualweb/qw-element';

describe('getDisabledWidgets', () => {
  /**
   * Returns:
   * Out of *all* elements in the DOM, returns those that are widgets and are
   * 'disabled' or 'aria-disabled'. If they are not, but the parent is, then
   * they are still added. It the immediate parent is a label, then step one
   * level up to find a usable parent.
   * 
   * - returns an element if it is a widget and it is disabled
   * - returns an element if it is a widget and it is aria-disabled
   * - returns an element if it is a widget and its parent is disabled
   * - returns an element if it is a widget and its parent is aria-disabled
   * - returns an element if it is a widget and its (label) parent's parent is disabled
   * - returns an element if it is a widget and its (label) parent's parent is aria-disabled
   * - returns nothing if the element is not a widget
   * - returns nothing if the element is a widget but is not disabled/aria-disabled (2 ways)
   * - returns nothing if the element is a widget that is not disabled/aria-disabled and its parent is not disabled/aria-disabled (4 ways)
   * 
   * Stubs:
   * - window.qwPage.getElements
   * - window.AccessibilityUtils.isElementWidget
   * - qwElement.getElementAttribute 'disabled' and 'aria-disabled'
   * - qwElement.getElementParent
   * - qwElement.getElementTagName
   */

  afterEach(() => {
    sinon.restore();
  });

  type AssemleTestParameters = {
    isElementWidget: boolean,
    isElementDisabled: boolean,
    isElementAriaDisabled: boolean,
    parent?: {
      tagType: string,
      parentIsDisabled: boolean,
      parentIsAriaDisabled: boolean,
    }
  }

  /**
   * Assembles a test for combinations of widget status, disabled property, and
   * parents with the same. The vast majority of tests for getDisabledWidgets
   * relies on these parameters, making all combinations easier with a single
   * function.
   * @param isElementWidget Is the qwElement a widget?
   * @param isElementDisabled Is the qwElement disabled?
   * @param isElementAriaDisabled Is the qwElement aria-disabled?
   * @param parent If set, a parent will be created
   */
  function assembleTest({
    isElementWidget,
    isElementDisabled,
    isElementAriaDisabled,
    parent,
  }: AssemleTestParameters) {
    const dom: JSDOM = new JSDOM();
    const qwElement = new QWElement(dom.window.document.createElement('div'));

    // @ts-expect-error: The two types don't match exactly. Make sure to stub
    // relevant functions!
    global.window = dom.window;

    // @ts-expect-error: Manual filling. AccessibilityUtils is usually assigned
    // to the global window object, which means a single object is re-used for
    // all tests. Makes re-stubbing difficult. This is a workaround.
    global.window.AccessibilityUtils = {
      isElementWidget: () => isElementWidget,
    };
    // @ts-expect-error: Manual stubbing. Since QWPage is just static methods,
    // we can't stub them with sinon. Default stub will return the QWElement we
    // set up for each test, as a good default.
    global.window.qwPage = {
      getElements: (selector) => [qwElement]
    };

    const isElementWidgetStub = sinon.stub(global.window.AccessibilityUtils, 'isElementWidget').returns(isElementWidget);

    sinon.stub(qwElement, 'getElementAttribute')
      .throws('Unexpected call to getElementAttribute')
      .withArgs('disabled').returns(isElementDisabled ? 'true' : null)
      .withArgs('aria-disabled').returns(isElementAriaDisabled ? 'true' : null)
      ;

    // Missing: parent. If parent.tagType is set, then the parent is created.
    let topParent: QWElement;
    let labelParent: QWElement;

    let getElementParentStub;

    if (!parent) {
      // If no parent, do not return a parent.
      getElementParentStub = sinon.stub(qwElement, 'getElementParent').returns(null);
    } else if (parent?.tagType === 'label') {
      // If parent is a label type, add another parent above it.
      labelParent = new QWElement(dom.window.document.createElement('label'));
      topParent = new QWElement(dom.window.document.createElement('div'));

      getElementParentStub = sinon.stub(qwElement, 'getElementParent').returns(labelParent);
      sinon.stub(labelParent, 'getElementParent').returns(topParent);

      sinon.stub(topParent, 'getElementAttribute')
        .throws('Unexpected call to getElementAttribute')
        .withArgs('disabled').returns(parent.parentIsDisabled ? 'true' : null)
        .withArgs('aria-disabled').returns(parent.parentIsAriaDisabled ? 'true' : null)
        ;
    } else {
      // If parent is NOT a label type, then just use a single parent.
      topParent = new QWElement(dom.window.document.createElement('div'));

      getElementParentStub = sinon.stub(qwElement, 'getElementParent').returns(topParent);

      sinon.stub(topParent, 'getElementAttribute')
        .throws('Unexpected call to getElementAttribute')
        .withArgs('disabled').returns(parent.parentIsDisabled ? 'true' : null)
        .withArgs('aria-disabled').returns(parent.parentIsAriaDisabled ? 'true' : null)
        ;
    }

    const getElementsStub = sinon.stub(global.window.qwPage, 'getElements').returns([qwElement]);

    const result = getDisabledWidgets();

    // Make sure the stub were actually called. If this fails, it may have been
    // because the function internals have changed, and the unit test needs to
    // be updated.
    expect(getElementsStub.calledWith('*')).to.be.true;
    expect(isElementWidgetStub.calledOnce).to.be.true;
    expect(getElementParentStub.calledOnce).to.be.true;
    // @ts-expect-error: For some reason, assigning the stub to a variable and
    // then asserting on that variable doesn't work. Odd?
    expect(qwElement.getElementAttribute.calledTwice).to.be.true;
    // @ts-expect-error
    expect(qwElement.getElementAttribute.calledWith('disabled')).to.be.true;
    // @ts-expect-error
    expect(qwElement.getElementAttribute.calledWith('aria-disabled')).to.be.true;

    // We only ever expect getDisabledWidgets to return the qwElement. If it is
    // disabled, we return it. If its parent is disabled, we still return it.
    if (isElementWidget) {
      expect(result).to.deep.equal([qwElement]);
    } else {
      expect(result).to.be.empty;
    }
  }

  describe('No parent(s)', () => {
    // Main positive test A.
    it('Should return an element if it is a widget and it is disabled', () => {
      assembleTest({
        isElementWidget: true,
        isElementDisabled: true,
        isElementAriaDisabled: false,
      });
    });

    // Main positive test B.
    it('Should return an element if it is a widget and it is aria-disabled', () => {
      assembleTest({
        isElementWidget: true,
        isElementDisabled: false,
        isElementAriaDisabled: true,
      });
    });

    // Main negative test.
    it('Should return nothing if the element is not a widget and not disabled', () => {
      assembleTest({
        isElementWidget: false,
        isElementDisabled: false,
        isElementAriaDisabled: false,
      });
    });

    // Secondary negative test A. The function should never consider the
    // attributes if the element is not a widget - these tests makes sure that it
    // isn't the case.
    it('Should return nothing if the element is not a widget and disabled', () => {
      assembleTest({
        isElementWidget: false,
        isElementDisabled: true,
        isElementAriaDisabled: false,
      });
    })

    // Secondary test B.
    it('Should return nothing if the element is not a widget and aria-disabled', () => {
      assembleTest({
        isElementWidget: false,
        isElementDisabled: false,
        isElementAriaDisabled: true,
      });
    });
  })

  describe('With paren(s)', () => {
    // Main positive test A. The function only considers parent elements if the
    // tested element is NOT already disabled.
    it('Should return an element if it is a widget and its parent is disabled', () => {
      assembleTest({
        isElementWidget: true,
        isElementDisabled: false,
        isElementAriaDisabled: false,
        parent: {
          tagType: 'label',
          parentIsDisabled: true,
          parentIsAriaDisabled: false,
        }
      });
    });

    // Main positive test B.
    it('Should return an element if it is a widget and its parent is aria-disabled', () => {
      assembleTest({
        isElementWidget: true,
        isElementDisabled: false,
        isElementAriaDisabled: false,
        parent: {
          tagType: 'label',
          parentIsDisabled: false,
          parentIsAriaDisabled: true,
        }
      });
    });
  });
});
