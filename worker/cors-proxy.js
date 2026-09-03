export default {
  async fetch(request) {
    const url = new URL(request.url)
    const target = url.searchParams.get('url')
    if (!target || !target.startsWith('https://codeload.github.com/')) {
      return new Response('Bad request', { status: 400 })
    }

    const resp = await fetch(target, { headers: request.headers })
    const headers = new Headers(resp.headers)
    headers.set('Access-Control-Allow-Origin', '*')
    headers.set('Access-Control-Allow-Methods', 'GET')

    return new Response(resp.body, {
      status: resp.status,
      headers,
    })
  },
}
