import { env } from './src/server/env.mjs'

/**
 * Don't be scared of the generics here.
 * All they do is to give us autocompletion when using this.
 *
 * @template {import('next').NextConfig} T
 * @param {T} config - A generic parameter that flows through to the return type
 * @constraint {{import('next').NextConfig}}
 */
function defineNextConfig(config) {
  return config
}

export default defineNextConfig({
  reactStrictMode: true,
  swcMinify: true,

  env: {
    PUSHER_KEY: env.PUSHER_KEY,
    PUSHER_CLUSTER: env.PUSHER_CLUSTER,
  },

  images: {
    domains: ['avatars.githubusercontent.com'],
  },

  experimental: {
    images: { allowFutureImage: true },
  },
})
