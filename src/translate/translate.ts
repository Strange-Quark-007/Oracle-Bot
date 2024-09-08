import { translate } from 'bing-translate-api'
import { logger } from '../logger/logger'

export const translateText = async (text: string, from: string, to: string) => {
  if (!text) return
  if (!to) return
  try {
    const response = await translate(`${text}`, null, to)
    return response
  } catch (error) {
    logger(error)
  }
}
