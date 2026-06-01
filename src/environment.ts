import 'dotenv/config'
import { z } from 'zod'

const environmentType = z.object({
  MQTT_CA_CERTIFICATE_PATH: z.string().default('ca-cert.pem'),
  MQTT_TOPIC: z.string().default('bus/services/telegram-tts/text'),
  MQTT_URL: z.url().default('mqtts://test:test@mqtt.int.bksp.in:8883'),
  SWYNCA_API_KEY: z.string(),
  SWYNCA_URL: z.url().default('https://swynca.bksp.in'),
  TELEGRAM_API_ROOT: z.url().default('https://api.telegram.org'),
  TELEGRAM_BOT_TOKEN: z.string().default('1337008:B4CKSP4CEB4CKSP4CEB4CKSP4CEB4CKSP4C'),
  TELEGRAM_WEBHOOK_DOMAIN: z.string().optional(),
  TELEGRAM_WEBHOOK_PORT: z.string().default('8000').transform(Number)
})

export type Environment = z.infer<typeof environmentType>

export function getEnvironment (): Environment {
  return environmentType.parse(process.env)
}
