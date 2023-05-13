import type { NextApiRequest, NextApiResponse } from 'next'
import { z } from 'zod'

import { pusherServerClient } from '$server/pusher'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { channel_name, socket_id } = z
    .object({ channel_name: z.string(), socket_id: z.string() })
    .parse(req.body)
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
