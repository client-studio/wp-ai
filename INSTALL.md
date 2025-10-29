# Quick Installation Guide

## Prerequisites

This plugin uses the **Vercel AI SDK** for streaming chat. Make sure you have:
- WordPress 6.0+
- ACF Pro (for flexible content)
- Node.js 18+ (for development only)

## Step 1: Install Dependencies & Build

```bash
cd wp-content/plugins/client-ai-editor
npm install
npm run build
```

## Step 2: Activate Plugin

1. Go to **WordPress Admin → Plugins**
2. Find **Client AI Block Editor**
3. Click **Activate**

## Step 3: Configure OpenAI

1. Go to **Settings → AI Block Editor**
2. Enter your **OpenAI API Key**
   - Get one at: https://platform.openai.com/api-keys
   - Make sure you have credits in your OpenAI account
3. Choose **Model**: GPT-4o (recommended)
4. Enable **Frontend Editing** (checked by default)
5. Click **Save Settings**

## Step 4: Test It Out

### Option A: Frontend Editing

1. Go to any published page on your site (while logged in)
2. Look for the purple floating button in bottom-right corner
3. Click it to open the AI chat
4. Click any content block on the page
5. Type: "Make this heading more exciting"
6. Review the diff and click **Apply Changes**

### Option B: Admin Editing (NEW: One-Click Selection!)

1. Go to **Pages → Edit any page**
2. Look for **AI Edit buttons** in each ACF flexible content row header (purple gradient buttons)
3. **Click "AI Edit"** on any row to:
   - Auto-open the chat widget
   - Select that block instantly
   - Highlight the selected row
4. Type your editing instruction
5. Review and apply

**Pro Tip:** Each ACF row now has its own AI Edit button - no more guessing which block to select!

## Common First-Time Issues

### ❌ "Widget doesn't appear"
**Solution:** Make sure you're logged in as an administrator or editor

### ❌ "API key not configured"
**Solution:** Go to Settings → AI Block Editor and enter your OpenAI API key

### ❌ "Blocks aren't clickable on frontend"
**Solution:** Add `?live=0` to the page URL to force live rendering:
```
https://yoursite.com/page/?live=0
```

### ❌ "OpenAI API error"
**Solutions:**
- Verify API key is correct
- Check you have credits in your OpenAI account
- Try a different model (GPT-3.5 Turbo uses fewer credits)

## Quick Test Prompts

Try these to see the AI in action:

**Single Block:**
- "Make this more concise"
- "Rewrite in a friendly tone"
- "Fix any typos"
- "Make this sound more professional"

**Full Page Mode:**
- "Translate all text to Finnish"
- "Make all headings more engaging"
- "Ensure consistent tone across all sections"

## What Gets Edited

✅ **Editable Fields:**
- Text content
- Headings
- Descriptions
- Button labels
- Any text-based ACF fields

❌ **Not Editable:**
- Images
- URLs (preserves existing links)
- ACF relationship fields
- File uploads

## Next Steps

- Read full documentation in `README.md`
- Customize styling in `assets/chat-widget.css`
- Try full page mode for bulk edits
- Use WordPress revisions to undo if needed

## Static Compilation Integration ⚡️

**Automatic static block recompilation!** If your theme uses `client_compile_post()`:

✅ **Auto-recompiles after AI edits** - no manual rebuild needed  
✅ **Immediate results** - changes live on page reload  
✅ **Performance maintained** - compiled HTML still served  
✅ **Zero configuration** - detects and integrates automatically  
✅ **Works without compilation too** - gracefully handles all themes  

See `STATIC-COMPILATION.md` for full details.

## WPML Language Support 🌍

**Automatic multilingual support!** If you use WPML:

✅ **Auto-detects page language** (Finnish, Swedish, English, etc.)  
✅ **AI maintains the same language** (no accidental translations!)  
✅ **Visual indicator** shows current language in chat  
✅ **Zero configuration** - works automatically  
✅ **Works without WPML too** - gracefully handles all sites  

See `WPML-INTEGRATION.md` for full details.

## Support

If something isn't working:
1. Check browser console (F12) for errors
2. Verify API key in Settings → AI Block Editor
3. Try disabling other plugins temporarily
4. Ensure ACF Pro is activated
5. Check WordPress debug log for `CAE:` messages

