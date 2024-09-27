import { translate } from 'bing-translate-api'
import { logger } from '../logger/logger'
import { LANGUAGE_CHOICES } from '../constants/constants'

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

export const GET_LANGUAGE_LIST_DESC = (() => {
  let cachedLangListDesc = ''

  return () => {
    if (cachedLangListDesc) {
      return cachedLangListDesc
    }

    const list = Object.keys(LANGUAGE_CHOICES)
    let description = '```'

    for (let i = 0; i < list.length; i++) {
      description += list[i].padEnd(20, ' ')
    }

    description += '```'
    cachedLangListDesc = description
    return description
  }
})()
