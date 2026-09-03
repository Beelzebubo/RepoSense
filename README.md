# RepoSense

**Chat with any GitHub repo.**

Paste a URL. Wait a sec(like a lot of seconds first time you add a repo URL since embedding takes time but after that its quick since it gets cached). Ask it anything about the code. Every answer tells you exactly where it found the info with file:line citations you can click.

Everything runs in your browser. No server. No install. No sign-up. Your code never leaves your machine.

## Try it

```bash
git clone https://github.com/Beelzebubo/RepoSense.git
cd RepoSense
npm install
npm run dev
```

Open http://localhost:5174, paste a GitHub URL, and you are in.
You will need to set up cloudflare workers as well for CORS proxy (in the .env check the .env.example for how to set it up properly) so do keep that in mind.

You will need a free API key from Groq (https://console.groq.com) to chat. Takes 30 seconds to set up and the app walks you through it.

## How it works

Behind the scenes, RepoSense runs a full RAG pipeline, the same thing companies use to make AI search their codebases, except it all happens in your browser tab:

1. **Fetch** - Grabs the repo as a zip file from GitHub
2. **Unzip** - Decompresses it right there in the browser with no server needed
3. **Chunk** - Splits every file into small pieces, keeping track of which file and line each piece came from
4. **Embed** - Turns each piece into a vector, a list of numbers that captures meaning, using a tiny AI model that runs on your device. This runs in a Web Worker so your browser does not freeze while it works.
5. **Index** - Stores everything in IndexedDB so if you come back later, it loads instantly with no re-processing
6. **Chat** - When you ask a question, it finds the most relevant code chunks, sends them to an LLM along with your question, and streams back an answer with clickable citations

Your API key from Groq, OpenAI, or any OpenAI-compatible provider stays in your browser localStorage. It is sent directly from your browser to the provider, never through any server because there is not one.

## Tech stack

- **React 19** + **TypeScript** + **Vite 8** + **Tailwind v4** - the usual suspects
- **Transformers.js** - runs AI models and embeddings right in the browser
- **fflate** - decompresses zip files without a backend
- **IndexedDB** - persists your vector index between visits
- **Web Workers** - keeps the embedding pipeline off the main thread so the UI stays snappy

Zero backend dependencies. The whole thing is a static site you can host for free.

## License

MIT - do whatever you want with it.
