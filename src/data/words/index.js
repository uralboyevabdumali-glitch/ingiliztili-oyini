import travel from './travel.js';
import work from './work.js';
import edu from './edu.js';
import health from './health.js';
import tech from './tech.js';
import nature from './nature.js';
import char from './char.js';
import daily from './daily.js';

export const TOPICS = {
  "travel": "Sayohat",
  "work": "Ish va biznes",
  "edu": "Ta'lim",
  "health": "Sog'liq",
  "tech": "Texnologiya",
  "nature": "Tabiat",
  "char": "Xarakter va hissiyot",
  "daily": "Kundalik hayot"
};
export const CEFR_LEVELS = ['A1','A2','B1','B2','C1','C2'];
export const WORDS = [...travel, ...work, ...edu, ...health, ...tech, ...nature, ...char, ...daily];
export default WORDS;
