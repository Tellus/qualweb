'use strict';

import videoElementHasAudio from './videoElementHasAudio';
import { QWElement } from '@qualweb/qw-element';

async function getVideoMetadata(elementQW: QWElement) {
  //let src =elementQW.getElementProperty('currentSrc');
  let duration = parseInt(elementQW.getElementProperty('duration'));
  let hasSoundTrack = videoElementHasAudio(elementQW);
  let result = { service: { video: { duration: {} }, audio: { duration: {}, volume: {} }, error: {} }, puppeteer: { video: { duration: {} }, audio: { hasSoundTrack: {} }, error: {} } };
  result.puppeteer.video.duration = duration;
  result.puppeteer.audio.hasSoundTrack = hasSoundTrack;
  result.puppeteer.error = !(duration >= 0 && hasSoundTrack);
  return result;
}


export default getVideoMetadata;