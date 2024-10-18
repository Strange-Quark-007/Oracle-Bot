import fs from 'fs'
import path from 'path'
import { Stats, TranslationStats } from '../types/types'

const STATS_DIR = './statistics'

const initialStats = {
  totalCharacters: 0,
  totalWords: 0,
  totalTranslations: 0,
}

const getCurrentMonthFileName = () => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0') // Month is 0-indexed
  return path.join(STATS_DIR, `stats-${month}-${year}.json`)
}

const readStats = (file: string): Stats => {
  if (!fs.existsSync(STATS_DIR)) {
    fs.mkdirSync(STATS_DIR, { recursive: true })
  }

  if (fs.existsSync(file)) {
    const data = fs.readFileSync(file, 'utf-8')
    return JSON.parse(data)
  }
  return { ...initialStats }
}

const writeStats = (file: string, stats: Stats) => {
  fs.writeFileSync(file, JSON.stringify(stats, null, 2), 'utf-8')
}

export const updateStats = (originalText: string): void => {
  const currentMonthFile = getCurrentMonthFileName()
  const currentStats = readStats(currentMonthFile)

  const now = new Date()
  const day = String(now.getDate()).padStart(2, '0')

  const newCharactersCount = originalText.length
  const newWordsCount = originalText.split(' ').length

  currentStats.totalCharacters += newCharactersCount
  currentStats.totalWords += newWordsCount
  currentStats.totalTranslations += 1

  if (!currentStats[day]) {
    currentStats[day] = { ...initialStats }
  }

  ;(currentStats[day] as TranslationStats).totalCharacters += newCharactersCount
  ;(currentStats[day] as TranslationStats).totalWords += newWordsCount
  ;(currentStats[day] as TranslationStats).totalTranslations += 1

  writeStats(currentMonthFile, currentStats)
}
