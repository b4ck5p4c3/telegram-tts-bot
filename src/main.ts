import { Telegraf } from 'telegraf'
import { getLogger } from './logger'
import { getEnvironment } from './environment'
import { connect } from 'mqtt'
import { readFileSync } from 'node:fs'

const logger = getLogger()
const environment = getEnvironment()

const bot = new Telegraf(environment.TELEGRAM_BOT_TOKEN, {
  telegram: {
    apiRoot: environment.TELEGRAM_API_ROOT
  }
})

type MembersResponse = {
  id: string;
  telegramMetadata?: {
    telegramId: string,
    telegramName?: string
  }
  username: string;
}[]

async function getMembers(): Promise<MembersResponse> {
  const response = await fetch(`${environment.SWYNCA_URL}/api/members`, {
    headers: {
      authorization: `Bearer ${environment.SWYNCA_API_KEY}`
    }
  })
  return await response.json()
}

const mqtt = connect(environment.MQTT_URL, {
  ca: environment.MQTT_CA_CERTIFICATE_PATH ? 
    readFileSync(environment.MQTT_CA_CERTIFICATE_PATH) : undefined
})

mqtt.on('connect', () => {
  logger.info('Connected to MQTT')
})

mqtt.on('error', error => {
  logger.error('MQTT error: ', error)
})

bot.command('tts', async (context) => {
  logger.info('tts?')
  const members = await getMembers()

  const message = context.message

  const telegramUserId = message.chat.id
  if (!members.some(member => Number.parseInt(member.telegramMetadata?.telegramId ?? '0') ===
    telegramUserId)) {
    return
  }

  logger.info('wut?')

  if (context.entities().length > 0 || !context.text) {
    return
  }

  logger.info(context.text)

  const text = (context.text.split(/^\/tts$/ig)[1] ?? '').trim()

  if (!text) {
    return
  }

  mqtt.publish(environment.MQTT_TOPIC, text)

  context.sendMessage('TTS sent!')
})

bot.launch(environment.TELEGRAM_WEBHOOK_DOMAIN
  ? {
    webhook: {
      domain: environment.TELEGRAM_WEBHOOK_DOMAIN,
      path: '/',
      port: environment.TELEGRAM_WEBHOOK_PORT
    }
  }
  // eslint-disable-next-line unicorn/prefer-top-level-await
  : {}).catch(error => {
    console.error(error)
  })

process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))