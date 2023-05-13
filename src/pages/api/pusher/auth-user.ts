import { type NextApiRequest, type NextApiResponse } from 'next'
import { z } from 'zod'

import { pusherServerClient } from '$server/pusher'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { socket_id } = z.object({ socket_id: z.string() }).parse(req.body)
  const { user_id } = req.headers

  if (!user_id || typeof user_id !== 'string') {
    res.status(404).send('lol')
    return
  }
  const auth = pusherServerClient.authenticateUser(socket_id, {
    id: user_id,
    name: 'ironman',
  })
  res.send(auth)
}
