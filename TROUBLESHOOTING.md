# Troubleshooting Guide

## Common Issues & Solutions

### ❌ 403 Forbidden Error

**Symptom:** Chat request fails with "403 (Forbidden)" error in browser console

**Cause:** Nonce (security token) verification failed

**Solution:** ✅ FIXED in latest version
- The Vercel AI SDK sends data as JSON in request body
- Updated `streaming-api.php` to extract nonce from JSON body instead of POST params
- Now uses `wp_verify_nonce()` with the nonce from request body

**How to verify fix:**
1. Open browser DevTools (F12)
2. Go to Network tab
3. Send a chat message
4. Look for request to `admin-ajax.php?action=cae_streaming_chat`
5. Should see `200 OK` instead of `403 Forbidden`

---

### ❌ "API key not configured" Error

**Symptom:** Chat shows "API key not configured" message

**Cause:** OpenAI/Anthropic API key is missing from settings

**Solution:**
1. Go to **Settings → AI Block Editor**
2. Enter your API key:
   - **OpenAI:** Get from https://platform.openai.com/api-keys
   - **Anthropic:** Get from https://console.anthropic.com/
3. Click **Save Settings**
4. Refresh the page and try again

**How to verify:**
- Check WordPress error log: `error_log('CAE: API key not configured in settings')`
- Make sure you clicked "Save Settings" after entering the key

---

### ❌ No Streaming / Messages Don't Appear

**Symptom:** Chat input sends but no response appears

**Possible Causes:**

**1. JavaScript Error**
- Open browser console (F12)
- Look for red errors
- Common issue: `useChat is not defined` → Run `npm install && npm run build`

**2. Network Error**
- Check Network tab in DevTools
- Look for failed requests
- Check if streaming response is coming through

**3. PHP Error**
- Check WordPress debug log
- Look for `CAE:` prefixed messages
- Common: `CAE: Starting stream with X messages`

**Solution:**
```bash
# Rebuild the React app
cd wp-content/plugins/client-ai-editor
npm install
npm run build
```

---

### ❌ AI Edit Buttons Don't Appear in ACF Rows

**Symptom:** ACF flexible content rows don't have "AI Edit" buttons

**Possible Causes:**

**1. Assets Not Loaded**
- Check browser console for 404 errors
- Verify files exist:
  - `assets/acf-integration.js`
  - `assets/acf-integration.css`

**2. Wrong Page**
- AI Edit buttons only appear on **post edit screens** (`post.php`)
- Not on post list, settings, or other admin pages

**3. Cache Issue**
- Hard reload: Cmd/Ctrl + Shift + R
- Clear browser cache

**Solution:**
1. Verify you're on a post edit screen
2. Check that ACF flexible content field exists
3. Hard reload the page
4. Check browser console for errors

---

### ❌ Block Selection Doesn't Work

**Symptom:** Clicking "AI Edit" button doesn't select the block

**Cause:** Custom event not being received by React

**Debug Steps:**
1. Open browser console
2. Click "AI Edit" button
3. Type: `document.addEventListener('cae:selectBlock', (e) => console.log('Event:', e.detail))`
4. Click button again - should see event logged

**Solution:**
- Make sure React app is loaded (check for errors in console)
- Verify `useBlockTarget.js` has event listener for `cae:selectBlock`
- Rebuild: `npm run build`

---

### ❌ Streaming Shows Raw JSON Instead of Text

**Symptom:** Chat shows `0:"word"\n` instead of formatted text

**Cause:** Frontend not parsing AI SDK stream format correctly

**Solution:**
- Verify using Vercel AI SDK's `useChat` hook (not custom implementation)
- Check `useAIChat.js` imports from `ai/react`
- Rebuild: `npm run build`

---

### ❌ Changes Don't Apply to ACF Fields

**Symptom:** Diff shows changes but they don't save to WordPress

**Possible Causes:**

**1. Permissions**
- User must have `edit_posts` capability
- Check: `current_user_can('edit_posts')`

**2. Field Names Don't Match**
- AI returns field names that don't exist in ACF
- Check system prompt includes correct field structure

**3. Sanitization Removes Content**
- HTML being stripped by `wp_kses_post()`
- Check if your content has special characters

**Debug:**
- Check WordPress error log
- Look for `CAE: X fields updated successfully` message
- Check Network response in DevTools

---

## Debug Checklist

When something isn't working, check in this order:

1. ✅ **Browser Console** (F12 → Console tab)
   - Look for red errors
   - Check if React app loaded
   - Verify `CAE_Data` exists: `console.log(window.CAE_Data)`

2. ✅ **Network Tab** (F12 → Network tab)
   - Check AJAX requests
   - Look for 403/404/500 errors
   - Verify streaming responses

3. ✅ **WordPress Error Log**
   - Enable debug: `define('WP_DEBUG', true);` in `wp-config.php`
   - Enable log: `define('WP_DEBUG_LOG', true);`
   - Check `wp-content/debug.log`
   - Look for `CAE:` prefixed messages

4. ✅ **Settings Page**
   - Settings → AI Block Editor
   - Verify API key is saved
   - Check provider selection
   - Try different model

5. ✅ **Rebuild Plugin**
   ```bash
   cd wp-content/plugins/client-ai-editor
   npm install
   npm run build
   ```

6. ✅ **Clear Caches**
   - Browser: Cmd/Ctrl + Shift + R
   - WordPress: Deactivate/reactivate plugin
   - Server: Clear opcache if applicable

---

## Error Log Messages

Plugin logs helpful debug messages. Look for these in `wp-content/debug.log`:

```
CAE: React build not found. Run: npm run build
→ Build the React app

CAE: API key not configured in settings
→ Add API key in Settings → AI Block Editor

CAE: Starting stream with 2 messages, provider: openai, model: gpt-4o
→ Streaming started successfully

CAE: No messages provided in request
→ Frontend sent empty messages array
```

---

## Still Having Issues?

1. **Check versions:**
   - WordPress 6.0+
   - PHP 7.4+
   - ACF Pro (latest)
   - Node.js 18+ (for development)

2. **Try minimal test:**
   - Deactivate all other plugins
   - Switch to default theme
   - Test with fresh post

3. **Verify installation:**
   ```bash
   cd wp-content/plugins/client-ai-editor
   ls -la build/  # Should see index.js, style-index.css
   ls -la assets/  # Should see acf-integration.js, acf-integration.css
   ```

4. **Check file permissions:**
   - Files should be readable by web server
   - Usually 644 for files, 755 for directories

---

## About WordPress Revisions

**Q: Do I need post revisions enabled?**

**A: No, but highly recommended!**

- **Diff preview works WITHOUT revisions** ✅
  - Plugin fetches current ACF field values via AJAX
  - Shows before/after comparison in real-time
  
- **Undo functionality requires revisions** ⚠️
  - WordPress creates automatic revisions when you save
  - You can revert to previous versions via: **Pages → Revisions**
  - Enable with: `define('WP_POST_REVISIONS', true);` in `wp-config.php`

**Best practice:** Keep revisions enabled as a safety net for AI edits!

---

**Pro Tip:** Most issues are solved by running `npm install && npm run build` after pulling updates! 🚀

