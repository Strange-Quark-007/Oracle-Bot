import fs from 'fs'
import path from 'path'

const LOG_DIR = './logs'
const LOG_FILE = path.join(LOG_DIR, 'log.txt')

export const logger = (log: any) => {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true })
  }

  if (!fs.existsSync(LOG_FILE)) {
    fs.writeFileSync(LOG_FILE, '', 'utf-8')
  }

  const timestamp = new Date().toISOString()
  const logMessage = `[${timestamp}]\n${JSON.stringify(log)}\n\n`
  fs.appendFileSync(LOG_FILE, logMessage)
}
