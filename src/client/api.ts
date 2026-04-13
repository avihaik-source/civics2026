import { hc } from 'hono/client'

// הוספנו .ts בסוף הנתיב
import type { AppType } from '../server/index.ts'

export const client = hc<AppType>('/')