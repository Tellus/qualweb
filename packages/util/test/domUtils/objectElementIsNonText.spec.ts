import { JSDOM } from 'jsdom';
import { expect } from 'chai';
import sinon from 'sinon';

import objectElementIsNonText from '../../src/domUtils/objectElementIsNonText';

import image from '../../src/domUtils/image.json';
import video from '../../src/domUtils/video.json';
import audio from '../../src/domUtils/audio.json';
import { QWElement } from '@qualweb/qw-element';

describe('objectElementIsNonText', () => {
  let dom: JSDOM;

  beforeEach(() => {
    dom = new JSDOM();
  });

  it('should return true for all image types', () => {
    for (const imgType of image) {
      const htmlElement = dom.window.document.createElement('div');
      const qwElement = new QWElement(htmlElement);

      sinon.stub(qwElement, 'getElementAttribute').returns(`filename.${imgType}`);

      expect(objectElementIsNonText(qwElement)).to.be.true;
    }
  });

  it('should return true for all video types', () => {
    for (const videoType of video) {
      const htmlElement = dom.window.document.createElement('div');
      const qwElement = new QWElement(htmlElement);

      sinon.stub(qwElement, 'getElementAttribute').returns(`filename.${videoType}`);

      expect(objectElementIsNonText(qwElement)).to.be.true;
    }
  });

  it('should return true for all audio types', () => {
    for (const audioType of audio) {
      const htmlElement = dom.window.document.createElement('div');
      const qwElement = new QWElement(htmlElement);

      sinon.stub(qwElement, 'getElementAttribute').returns(`filename.${audioType}`);

      expect(objectElementIsNonText(qwElement)).to.be.true;
    }
  });

  it('should return false for a filename without extension', () => {
    const htmlElement = dom.window.document.createElement('div');
    const qwElement = new QWElement(htmlElement);

    sinon.stub(qwElement, 'getElementAttribute').returns('filenameWithoutExtension');

    expect(objectElementIsNonText(qwElement)).to.be.false;
  });

  it('should return false for an element without a data attribute', () => {
    const htmlElement = dom.window.document.createElement('div');
    const qwElement = new QWElement(htmlElement);

    expect(objectElementIsNonText(qwElement)).to.be.false;
  });
});