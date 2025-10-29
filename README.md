# Client AI Block Editor

A WordPress plugin that adds a floating AI chat interface for editing ACF flexible content blocks using OpenAI's API.

## Features

- **Floating Chat Widget** - Modern, shadcn-inspired UI that appears in both admin and frontend
- **Block-Level Editing** - Click any ACF flexible content block to target it for AI editing
- **Full Page Mode** - Edit all blocks on a page at once (e.g., for translations)
- **Diff Preview** - Review AI suggestions with visual before/after comparison
- **Safe & Reversible** - Uses WordPress post revisions, all changes can be undone
- **Permission-Based** - Only users with `edit_posts` capability can access the AI editor

## Installation

1. **Copy plugin to WordPress**
   ```bash
   cp -r client-ai-editor /path/to/wp-content/plugins/
   ```

2. **Activate the plugin** in WordPress Admin → Plugins

3. **Configure OpenAI API** in Settings → AI Block Editor
   - Enter your OpenAI API key (get one from [OpenAI Platform](https://platform.openai.com/api-keys))
   - Choose your preferred model (GPT-4o recommended)
   - Enable/disable frontend editing

## Usage

### Frontend Editing

1. Visit any published page while logged in as an editor
2. Look for the floating AI chat button in the bottom-right corner
3. Click any content block to select it
4. Type your editing instructions in the chat
5. Review the AI's suggestions in the diff modal
6. Apply or reject the changes

**Example prompts:**
- "Make this heading more exciting"
- "Rewrite this in a more professional tone"
- "Shorten this text to 2 sentences"
- "Fix any grammar mistakes"

### Admin Editing

1. Edit any page/post in WordPress admin
2. The AI chat widget appears in the bottom-right
3. Click on any ACF flexible content row to target it
4. Use the chat to request changes
5. Review and apply

### Full Page Mode

1. Click the "Full Page" button in the target indicator
2. All blocks on the page become editable at once
3. Perfect for bulk operations like:
   - "Translate all content to Finnish"
   - "Make all CTAs say 'Aloita nyt' instead of 'Get Started'"
   - "Ensure consistent tone across all blocks"

## Technical Details

### File Structure

```
client-ai-editor/
├── client-ai-editor.php       # Main plugin file
├── includes/
│   ├── settings.php            # Settings page
│   ├── api.php                 # OpenAI API integration
│   └── block-detector.php      # Block detection & AJAX handlers
├── assets/
│   ├── chat-widget.css         # Chat UI styling
│   ├── chat-widget.js          # Chat functionality
│   ├── diff-viewer.css         # Diff modal styling
│   └── diff-viewer.js          # Diff viewer functionality
├── templates/
│   └── chat-widget.php         # Chat widget HTML template
└── README.md                   # This file
```

### AJAX Endpoints

- `cae_get_block` - Get single block data
- `cae_get_page_blocks` - Get all blocks for full-page edit
- `cae_process` - Send prompt to OpenAI and get suggestions
- `cae_apply` - Apply approved changes to post

### Security

- ✅ Nonce verification on all AJAX requests
- ✅ Capability checks (`edit_posts` required)
- ✅ Input sanitization with `wp_kses_post()`
- ✅ API key stored in WordPress options
- ✅ Only text fields are editable (images/media excluded)

### Requirements

- WordPress 6.0+
- ACF Pro (already installed in your theme)
- PHP 7.4+
- OpenAI API key

## How It Works

### Frontend Flow

1. `client_print_live_modules()` wraps each block with `data-ai-block` attributes
2. Chat widget detects clicks on `.client-module` elements
3. AJAX request fetches block field data via `cae_get_block`
4. User's prompt + block context sent to OpenAI via `cae_process`
5. AI response shown in diff viewer for approval
6. On apply, `cae_apply` updates ACF fields and creates revision

### Admin Flow

1. Widget detects `.acf-row` elements in flexible content field
2. Clicks on rows target specific blocks
3. Same AJAX flow as frontend
4. Fields update directly in ACF inputs after apply

## Customization

### Change AI Model

Go to Settings → AI Block Editor and choose a different model:
- **GPT-4o** - Best quality, recommended (default)
- **GPT-4 Turbo** - Faster than GPT-4
- **GPT-3.5 Turbo** - Fastest, most economical

### Disable Frontend Editing

Uncheck "Frontend Editing" in plugin settings to restrict AI editor to admin only.

### Styling

Edit `assets/chat-widget.css` and `assets/diff-viewer.css` to customize:
- Colors (change gradient from purple to your brand color)
- Widget position
- Chat window size
- Button styles

### Extend Field Support

Currently supports text fields only. To add support for other field types, modify `cae_filter_text_fields()` in `includes/api.php`.

## Troubleshooting

### Widget doesn't appear
- Check that you're logged in with `edit_posts` capability
- Check browser console for JavaScript errors
- Verify plugin is activated

### AI requests fail
- Verify API key is correct in Settings → AI Block Editor
- Check that you have OpenAI API credits available
- Check browser console and WordPress debug log for errors

### Changes don't apply
- Ensure you're editing a post with ACF `modules` field
- Check that block index matches (try refreshing the page)
- Verify you have permission to edit the post

### Blocks not targetable on frontend
- Ensure page is rendering in live mode (not compiled)
- Add `?live=0` to URL to force live rendering
- Check that blocks have `data-ai-block` attributes in HTML

## Future Enhancements

Potential features for future versions:

- [ ] Claude API support as alternative to OpenAI
- [ ] Image generation/replacement
- [ ] Suggest new blocks based on content
- [ ] A/B test variant generation
- [ ] Per-block undo without full post revert
- [ ] Rate limiting and usage analytics
- [ ] Multi-language UI

## Support

For issues or questions:
1. Check this README
2. Review browser console for errors
3. Check WordPress debug log
4. Review OpenAI API status

## License

GPL v2 or later

## Credits

Built with:
- [OpenAI API](https://openai.com/api/)
- [diff-match-patch](https://github.com/google/diff-match-patch) for text diffing
- Inspired by [Vercel AI SDK Elements](https://ai-sdk.dev/elements)

