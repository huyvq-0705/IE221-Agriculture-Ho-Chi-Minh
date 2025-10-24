module.exports = {
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'agrihcm.shop' }],
        destination: 'https://www.agrihcm.shop/:path*',
        permanent: true, // => 301
      },
    ]
  },
}