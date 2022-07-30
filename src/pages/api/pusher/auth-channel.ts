import type { NextApiRequest, NextApiResponse } from 'next'
import { pusherServerClient } from '$server/helpers/pusher'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { channel_name, socket_id } = req.body
  const { user_id } = req.headers

  if (!user_id || typeof user_id !== 'string') {
    res.status(404).send('lol')
    return
  }
  const auth = pusherServerClient.authorizeChannel(socket_id, channel_name, {
    user_id,
    user_info: {
      name: 'superman',
    },
  })
  res.send(auth)
}
