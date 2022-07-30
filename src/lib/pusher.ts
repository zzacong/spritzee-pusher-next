import Pusher from 'pusher-js'
import { atom } from 'jotai'

export const pusherAtom = atom(
  new Pusher(process.env.PUSHER_KEY!, {
    cluster: process.env.PUSHER_CLUSTER,
  })
)
