# Quick Start Guide - AI Block Editor v2

Get up and running with streaming AI chat in 5 minutes.

## Step 1: Activate Plugin

The plugin is already installed and built. Just activate it:

1. Go to **WordPress Admin → Plugins**
2. Find **Client AI Block Editor**
3. Click **Activate**

## Step 2: Add API Key

1. Go to **Settings → AI Block Editor**
2. **Choose Provider:**
   - OpenAI (recommended for most use cases)
   - Anthropic Claude (recommended for complex instructions)
3. **Enter API Key:**
   - Get OpenAI key: https://platform.openai.com/api-keys
   - Get Anthropic key: https://console.anthropic.com/settings/keys
4. **Select Model:**
   - OpenAI: `gpt-4o` (recommended)
   - Anthropic: `claude-3-5-sonnet-20241022` (recommended)
5. Click **Save Settings**

## Step 3: Test on Frontend

1. Visit any page on your site (while logged in)
2. **Important:** Add `?live=0` to the URL to force live rendering:
   ```
   https://yoursite.com/your-page/?live=0
   ```
3. Look for the purple floating button in bottom-right corner
4. Click it to open the chat
5. Click any content block on the page
6. Watch the target indicator show "Block 1: feature" (or similar)
7. Type a message: "Make this heading more exciting"
8. Watch AI stream its response **word-by-word** in real-time!

## Step 4: Review & Apply

1. When AI finishes, a diff modal will appear
2. Review the changes (old vs new)
3. Click **Apply Changes**
4. Page reloads with updated content
5. Check WordPress revisions to undo if needed

## Example Prompts

**Single Block Edits:**
- "Make this heading shorter"
- "Rewrite in a more friendly tone"
- "Fix any typos"
- "Make this sound more professional"
- "Translate to Finnish"

**Full Page Mode:**
1. Click "Full Page" button in chat
2. Try these:
   - "Translate all text to Finnish"
   - "Make all headings more engaging"
   - "Ensure consistent tone across all sections"
   - "Make the language more technical"

## Features You'll Notice

### 1. Real-Time Streaming
Unlike v1, you'll see words appear as they're generated. No more waiting for the full response!

### 2. Conversation Memory
The AI remembers what you said:
```
You: "Make it shorter"
AI: [provides shortened version]

You: "Now make it formal"
AI: "Based on the shortened version, here's a formal rewrite..."
```

### 3. Abort Support
While AI is streaming, you can:
- Send a new message (aborts current)
- Close the chat (aborts current)

## Troubleshooting

### Chat button not appearing?

**Frontend:**
- Make sure you're logged in as editor/admin
- Add `?live=0` to URL to force live rendering
- Check that blocks have `data-ai-block` attributes

**Admin:**
- Make sure you're editing a page (not viewing)
- Refresh the page

### Blocks not clickable?

Add `?live=0` to the URL. Compiled pages don't have the necessary attributes.

### API errors?

1. Verify API key is correct (check for extra spaces)
2. Check you have credits in your OpenAI/Anthropic account
3. For OpenAI: Key should start with `sk-...`
4. For Anthropic: Key should start with `sk-ant-...`

### Streaming not working?

Some servers disable Server-Sent Events. If streaming doesn't work:
1. Check browser console for errors
2. Contact your hosting provider
3. Try a different browser

## Development Mode

Want to customize the plugin?

```bash
cd wp-content/plugins/client-ai-editor
npm run start
```

This starts a hot-reload server. Edit React components in `src/` and see changes instantly!

## What's Next?

Now that it's working:

1. **Try both providers** - OpenAI and Claude have different strengths
2. **Test different models** - GPT-3.5 Turbo is faster and cheaper
3. **Experiment with prompts** - Be specific for best results
4. **Use Full Page mode** - Great for translations and bulk edits

## Tips for Best Results

**Be specific:**
❌ "Make it better"
✅ "Make this heading more exciting and action-oriented"

**Provide context:**
❌ "Change the tone"
✅ "Change the tone to be more conversational, like talking to a friend"

**Use iterations:**
```
1. "Make this shorter"
2. "Now make it more formal"
3. "Add a call to action at the end"
```

The AI remembers the context!

## Need Help?

- Check `README-V2.md` for full documentation
- Check browser console (F12) for JavaScript errors
- Check WordPress debug log for PHP errors

Enjoy your AI-powered editing! 🚀

