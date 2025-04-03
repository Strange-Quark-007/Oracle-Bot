import fs from 'fs';
import express, { Response } from 'express';
import { Stats } from '../types/types';
import { TOTAL_STATS_FILE } from '../config';

const router = express.Router();
const EXPIRE_TIME = 21600;

const generateStatsSVG = (stats: Stats) => {
  return `
  <svg xmlns="http://www.w3.org/2000/svg" width="400" height="200" viewBox="0 0 400 200" fill="none" role="img">
  <title id="titleId">Oracle Bot Stats</title>
  <desc id="descId">Discord - Oracle Bot translation statistics</desc>

  <style>
    .header {
      font: 600 20px &apos;Segoe UI&apos;, Ubuntu, Sans-Serif;
      fill: #f4cd7c;
      animation: fadeInAnimation 0.8s ease-in-out forwards;
      text-anchor: start;
      dominant-baseline: middle;
    }
    .stat {
      font: 15px &apos;Segoe UI&apos;, Ubuntu, &quot;Helvetica Neue&quot;, Sans-Serif;
      fill: #6abde6;
    }
    .stagger {
      opacity: 0;
      animation: fadeInAnimation 0.3s ease-in-out forwards;
    }
    @keyframes fadeInAnimation {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    .bold { font-weight: 700 }
  </style>

  <rect x="0.5" y="0.5" rx="4.5" height="99%" stroke="#e4e2e2" width="399" fill="#1f2430" stroke-opacity="1"/>

  <g transform="translate(110, 30)" class="stagger" style="animation-delay: 300ms">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#f4cd7c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 6V2H8"/>
      <path d="m8 18-4 4V8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2Z"/>
      <path d="M2 12h2"/>
      <path d="M9 11v2"/>
      <path d="M15 11v2"/>
      <path d="M20 12h2"/>
    </svg>
    <text x="30" y="14" class="header" >Oracle Bot Stats</text>
  </g>

  <g transform="translate(110, 90)" class="stagger" style="animation-delay: 450ms">
    <svg x="-30" y="-15" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6abde6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-sigma-icon lucide-sigma"><path d="M18 7V5a1 1 0 0 0-1-1H6.5a.5.5 0 0 0-.4.8l4.5 6a2 2 0 0 1 0 2.4l-4.5 6a.5.5 0 0 0 .4.8H17a1 1 0 0 0 1-1v-2"/></svg>
    <text class="stat bold">
      Characters:
    </text>
    <text x="150" class="stat bold">
      ${stats.totalCharacters.toLocaleString()}
    </text>
  </g>

  <g transform="translate(110, 120)" class="stagger" style="animation-delay: 600ms">
    <svg x="-30" y="-15" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6abde6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-message-square-text-icon lucide-message-square-text"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/><path d="M13 8H7"/><path d="M17 12H7"/></svg>
    <text class="stat bold">
      Words:
    </text>
    <text x="150" class="stat bold">
      ${stats.totalWords.toLocaleString()}
    </text>
  </g>

  <g transform="translate(110, 150)" class="stagger" style="animation-delay: 750ms">
    <svg x="-30" y="-15" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6abde6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-languages-icon lucide-languages"><path d="m5 8 6 6"/><path d="m4 14 6-6 2-3"/><path d="M2 5h12"/><path d="M7 2h1"/><path d="m22 22-5-10-5 10"/><path d="M14 18h6"/></svg>
    <text class="stat bold">
      Translations: 
    </text>
    <text x="150" class="stat bold">
      ${stats.totalTranslations.toLocaleString()}
    </text>
  </g>
</svg>
  `;
};

router.get('/', async (_, res: Response) => {
  if (!fs.existsSync(TOTAL_STATS_FILE)) {
    res.status(404).json({ error: 'Stats file not found' });
    return;
  }

  try {
    const statsData = JSON.parse(fs.readFileSync(TOTAL_STATS_FILE, 'utf-8')) as Stats;
    const svg = generateStatsSVG(statsData);

    res.set({
      'Content-Type': 'image/svg+xml',
      'Cache-Control': `public, max-age=${EXPIRE_TIME}, s-maxage=${EXPIRE_TIME}`,
      Expires: new Date(Date.now() + EXPIRE_TIME * 1000).toUTCString(),
    });
    res.send(svg);
  } catch (error) {
    console.error('Error generating SVG:', error);
    res.status(500).json({ error: 'Error generating SVG' });
  }
});

export default router;
