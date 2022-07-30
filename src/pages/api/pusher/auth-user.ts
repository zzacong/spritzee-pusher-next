import type { NextApiRequest, NextApiResponse } from 'next'
import { pusherServerClient } from '$server/helpers/pusher'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { socket_id } = req.body
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
