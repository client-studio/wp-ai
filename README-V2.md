# Client AI Block Editor v2

**Production-grade AI chat interface with real-time streaming for ACF flexible content blocks.**

## What's New in v2

### 🚀 Major Upgrades

- ✅ **Real-time Streaming** - See AI responses word-by-word as they're generated
- ✅ **React + WordPress** - Modern component architecture with `@wordpress/scripts`
- ✅ **Conversation Memory** - AI remembers context across messages
- ✅ **Multi-Provider Support** - Switch between OpenAI and Claude (Anthropic)
- ✅ **Custom Streaming Implementation** - Lightweight, no external React dependencies
- ✅ **Better Error Handling** - Retry logic, abort support, proper loading states
- ✅ **Modern Build System** - Hot reload during development, optimized production builds

### vs v1

| Feature | v1 | v2 |
|---------|----|----|
| Response Type | Full wait | Real-time streaming |
| Conversation | Single-shot | Full context memory |
| Providers | OpenAI only | OpenAI + Claude |
| Frontend Stack | Vanilla JS | React |
| Bundle Size | ~50KB | ~26KB (optimized) |
| Development | Manual | Hot reload with `npm start` |

## Installation

### 1. Build the Plugin

```bash
cd wp-content/plugins/client-ai-editor
npm install
npm run build
```

### 2. Activate

Go to **WordPress Admin → Plugins** and activate **Client AI Block Editor**.

### 3. Configure

Go to **Settings → AI Block Editor**:

1. **Choose Provider:** OpenAI or Anthropic (Claude)
2. **Enter API Key:**
   - OpenAI: https://platform.openai.com/api-keys
   - Anthropic: https://console.anthropic.com/settings/keys
3. **Select Model:**
   - OpenAI: `gpt-4o`, `gpt-4-turbo`, `gpt-3.5-turbo`
   - Anthropic: `claude-3-5-sonnet-20241022`, `claude-3-5-haiku-20241022`
4. **Enable Frontend Editing:** Check to allow frontend editing

### 4. Use It

**Frontend:**
- Visit any page (add `?live=0` to force live rendering)
- Purple chat button appears bottom-right
- Click a block to select it
- Type your editing instructions
- Watch AI stream its response in real-time

**Admin:**
- Edit any page/post
- Chat button appears
- Click ACF flexible content rows
- Same streaming experience

## Features

### Real-Time Streaming

Unlike v1 where you waited for the full response, v2 shows each word as it's generated:

```
User: Make this heading more exciting
AI: How...about...this...amazing...new...heading... [streaming live]
```

### Conversation Memory

The AI remembers previous messages:

```
User: Make this shorter
AI: Here's a concise version: [...]

User: Now make it more formal
AI: Based on the shortened version, here's a formal rewrite: [...]
```

### Multi-Provider Support

Switch providers in one click:
- **OpenAI** - GPT-4o, GPT-4 Turbo, GPT-3.5 Turbo
- **Anthropic** - Claude 3.5 Sonnet, Claude 3.5 Haiku

Each provider has different strengths. Try both!

## Development

### Start Dev Server

```bash
npm run start
```

This starts a hot-reload server. Edit files in `src/` and see changes instantly in WordPress.

### Build for Production

```bash
npm run build
```

Creates optimized bundle in `build/` directory.

### File Structure

```
src/
├── index.js                   # Entry point
├── components/
│   ├── ChatWidget.jsx         # Main component
│   ├── MessageList.jsx        # Message display
│   ├── ChatInput.jsx          # Input field
│   ├── TargetIndicator.jsx    # Block targeting UI
│   ├── DiffModal.jsx          # Changes preview
│   └── Message.jsx            # Individual message
├── hooks/
│   ├── useAIChat.js           # Custom streaming chat
│   ├── useBlockTarget.js      # Block selection
│   └── useWordPressData.js    # WP integration
├── lib/
│   ├── api.js                 # AJAX helpers
│   └── constants.js           # Config values
└── style.css                  # Styling
```

### How Streaming Works

1. **Frontend** sends message to `cae_streaming_chat` endpoint
2. **PHP** streams from OpenAI/Claude using Server-Sent Events (SSE)
3. **Custom hook** (`useAIChat`) reads stream with `fetch` + `ReadableStream`
4. **React** updates UI in real-time as chunks arrive
5. **User** sees words appear live, can abort at any time

## Technical Details

### Streaming API Endpoint

`includes/streaming-api.php` handles:
- OpenAI streaming (`gpt-*` models)
- Anthropic streaming (`claude-*` models)
- Server-Sent Events (SSE) format
- Chunk-by-chunk transmission

### Custom React Hook

`src/hooks/useAIChat.js` implements:
- Streaming fetch with `ReadableStream`
- Message state management
- Abort controller for cancellation
- Error handling and retries

### WordPress Integration

- Uses `@wordpress/element` (React)
- Uses `@wordpress/scripts` for building
- Auto-handles dependencies (no need to bundle React)
- Creates `build/index.asset.php` with dependency list

## Troubleshooting

### Build Fails

```bash
# Clean and rebuild
rm -rf node_modules build
npm install
npm run build
```

### Streaming Doesn't Work

Some servers disable SSE. Check:
1. Server allows `text/event-stream` content type
2. No buffering enabled (nginx `X-Accel-Buffering: no`)
3. PHP timeout is sufficient (60s+)

### Chat Widget Not Appearing

1. Check build exists: `ls build/index.js`
2. Check browser console for errors
3. Verify you're logged in with `edit_posts` capability
4. For frontend: Add `?live=0` to URL

### API Errors

- **OpenAI:** Verify API key, check credits
- **Anthropic:** Verify API key format (starts with `sk-ant-`)
- Check WordPress debug log for PHP errors

## Customization

### Change Styling

Edit `src/style.css` and run `npm run build`.

### Add New AI Provider

1. Edit `includes/settings.php` - add provider option
2. Edit `includes/streaming-api.php` - add streaming function
3. Follow OpenAI/Anthropic patterns

### Modify System Prompt

Edit `cae_build_streaming_system_prompt()` in `includes/streaming-api.php`.

## Performance

- **Bundle Size:** 26KB (12KB JS + 14KB CSS)
- **Dependencies:** WordPress React (already loaded)
- **First Response:** < 500ms (with streaming)
- **Memory:** Minimal (React components unmount when closed)

## Security

- ✅ Nonce verification on all requests
- ✅ Capability checks (`edit_posts` required)
- ✅ Input sanitization with `wp_kses_post()`
- ✅ API keys stored in WordPress options
- ✅ Text fields only (no code execution)

## Roadmap

Potential future features:
- [ ] Tool calling (AI can add/remove blocks)
- [ ] Image generation integration
- [ ] A/B test variant generation
- [ ] Usage analytics dashboard
- [ ] Conversation export/import
- [ ] Custom model fine-tuning support

## Support

For issues:
1. Check browser console for JavaScript errors
2. Check WordPress debug log for PHP errors
3. Verify API key and credits
4. Test with `?live=0` on frontend

## License

GPL v2 or later

---

**Built with:**
- React (via `@wordpress/element`)
- WordPress Scripts build system
- Custom streaming implementation
- OpenAI & Anthropic APIs

