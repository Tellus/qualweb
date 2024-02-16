import { JSDOM } from 'jsdom';
import { QWElement } from '@qualweb/qw-element';
import { expect } from 'chai';
import sinon from 'sinon';

// Direct import of function, since it's not exported.
import elementHasContent from '../../src/domUtils/elementHasContent';
import * as constants from '../../src/domUtils/constants';

describe('elementHasContent', () => {
  /**
   * parameters:
   * - qw-element
   * - boolean
   * 
   * for qw-element, uses the following methods:
   * - getElementTagName
   * 
   * Matrix of results:
   * false: if the tag type is of a non-visible type (constants.ts alwaysNotVisible)
   * 
   * 
   * 
   * 
   * Alternative path if checkChildren = true:
   * If any of the *children* has content, return true.
   * 
   * tl;dr returns true if the element or one of its children have content.
   */

  let dom: JSDOM;

  beforeEach(() => {
    dom = new JSDOM(`<!DOCTYPE html><p>Hello world</p>`);
  });

  describe('checkChildren = false', () => {

    it('false if the element is non-visible', () => {
      for (const nonVisibleTag of constants.alwaysNotVisible) {
        const htmlElement = dom.window.document.createElement(nonVisibleTag);

        const element = new QWElement(htmlElement);

        expect(elementHasContent(element, false)).to.be.false;
      }
    });

    it('true if the tag type can have controls, and they are enabled', () => {
      for (const tagTypes of constants.needsControls) {
        const htmlElement = dom.window.document.createElement(tagTypes);

        const element = new QWElement(htmlElement);

        sinon.stub(element, 'getElementProperty')
          .throws('called with unexpected property (expected: open')
          .withArgs('controls').returns('true')
          ;

        expect(elementHasContent(element, false)).to.be.true;
      }
    });

    it('false if the tag type can have controls, and they are disabled', () => {
      for (const tagTypes of constants.needsControls) {
        const htmlElement = dom.window.document.createElement(tagTypes);

        const element = new QWElement(htmlElement);

        sinon.stub(element, 'getElementProperty')
          .throws('called with unexpected property (expected: open')
          .withArgs('controls').returns('')
          ;

        expect(elementHasContent(element, false)).to.be.false;
      }
    });

    it ('true if the tag can be opened (dialog) and has the open attribute set', () => {
      for (const needsOpenTag of constants.needsOpen) {
        const htmlElement = dom.window.document.createElement(needsOpenTag);

        const element = new QWElement(htmlElement);

        sinon.stub(element, 'getElementProperty')
          .throws('unexpected property (expected: "open")')
          .withArgs('open').returns('true')
          ;

        expect(elementHasContent(element, false)).to.be.true;
      }
    });

    it ('false if the tag can be opened (dialog) and has no "open" attribute', () => {
      for (const needsOpenTag of constants.needsOpen) {
        const htmlElement = dom.window.document.createElement(needsOpenTag);

        const element = new QWElement(htmlElement);

        sinon.stub(element, 'getElementProperty')
          .throws('unexpected property (expected: "open")')
          .withArgs('open').returns('')
          ;

        expect(elementHasContent(element, false)).to.be.false;
      }
    });

    it('true if the tag is a visible type', () => {
      for (const alwaysVisibleTag of constants.alwaysVisible) {
        const htmlElement = dom.window.document.createElement(alwaysVisibleTag);

        const element = new QWElement(htmlElement);

        expect(elementHasContent(element, false)).to.be.true;
      }
    });

    it('true if the element has text and that text has a different color than the background', () => {
      const htmlElement = dom.window.document.createElement('div');
      const element = new QWElement(htmlElement);

      sinon.stub(element, 'getElementStyleProperty')
        .withArgs('color').returns('#000000')
        .withArgs('background-color').returns('#FFFFFF')
        ;

      sinon.stub(element, 'getElementText').returns('Sample text');
      
      expect(elementHasContent(element, false)).to.be.true;
    });

    it('false if the element has text and that text has the same color as the background', () => {
      const htmlElement = dom.window.document.createElement('div');
      const element = new QWElement(htmlElement);

      sinon.stub(element, 'getElementStyleProperty')
        .withArgs('color').returns('#000000')
        .withArgs('background-color').returns('#000000')
        ;

      sinon.stub(element, 'getElementText').returns('Sample text');
      
      expect(elementHasContent(element, false)).to.be.false;
    });

    it('false if the element has no text', () => {
      const htmlElement = dom.window.document.createElement('div');
      const element = new QWElement(htmlElement);

      sinon.stub(element, 'getElementStyleProperty')
        .withArgs('color').returns('#000000')
        .withArgs('background-color').returns('#000000')
        ;

      sinon.stub(element, 'getElementText').returns('');
      
      expect(elementHasContent(element, false)).to.be.false;
    });
  });

  /**
   * These tests need to test elementHasContent's recursive behaviour, when
   * checking child elements. With the current coding style (default exporting
   * a function), we can't stub the funtion in a way that captures the recursive
   * call. This CAN be done if the function is bound to a variable, and that
   * variable is exported by name:
   * 
   * export const myFunction = function (args) { ... }
   * 
   * I don't like exporting as a variable rather than a function.
   * 
   * Instead, these tests allow the recursion to happen as normal, but stubs a
   * child element as well, to test the first recursion level. Not ideal.
   */
  describe('checkChildren = true', () => {
    it('true if a child has content', () => {
      // Outer element.
      const element = new QWElement(dom.window.document.createElement('div'));

      // Inner element.
      const elementChild = new QWElement(dom.window.document.createElement('p'));

      // Required because of final branch that uses textHasTheSameColorOfBackground.
      sinon.stub(element, 'getElementStyleProperty')
        .withArgs('color').returns('#000000')
        .withArgs('background-color').returns('#000000')
        ;
      sinon.stub(elementChild, 'getElementStyleProperty')
        .withArgs('color').returns('#000000')
        .withArgs('background-color').returns('#FFFFFF')
        ;

      // Make sure getElementChildren on the outer element just returns the child we defined.
      sinon.stub(element, 'getElementChildren').returns([elementChild]);

      // Make sure we didn't get the true result from the outer element.
      expect(elementHasContent(element, false)).to.be.false;

      expect(elementHasContent(element, true)).to.be.true;
    });

    it('false if parent and child has no content', () => {
      // Outer element.
      const element = new QWElement(dom.window.document.createElement('div'));

      // Inner element.
      const elementChild = new QWElement(dom.window.document.createElement('p'));

      // Required because of final branch that uses textHasTheSameColorOfBackground.
      sinon.stub(element, 'getElementStyleProperty')
        .withArgs('color').returns('#000000')
        .withArgs('background-color').returns('#000000')
        ;
      // this stub should be unnecessary, because we're trying to stub the recursive call.
      sinon.stub(elementChild, 'getElementStyleProperty')
        .withArgs('color').returns('#000000')
        .withArgs('background-color').returns('#000000')
        ;

      // Make sure getElementChildren on the outer element just returns the child we defined.
      sinon.stub(element, 'getElementChildren').returns([elementChild]);

      // Make sure we didn't get the true result from the outer element.
      expect(elementHasContent(element, false)).to.be.false;

      expect(elementHasContent(element, true)).to.be.false;
    });
  });
});
