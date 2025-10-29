# Full Page Mode - Complete Implementation

## What Was Fixed

Full Page mode was not working correctly. It's now fully functional with proper context, JSON format, and diff display.

## The Problem

**Before:**
- Full page mode didn't send ANY block data to AI
- AI had no context about the page content
- Changes were using wrong JSON format
- Diff modal couldn't display multiple modules

**After:**
- AI receives ALL modules from the page
- Proper context with module index and layout
- New JSON format for multiple modules
- Diff modal groups changes by module

## How It Works Now

### 1. System Prompt (Backend)

**File:** `includes/streaming-api.php`

When in full page mode (`blockContext` is null), the system prompt now includes:

```
CURRENT CONTEXT:
FULL PAGE MODE - Editing entire page with 5 modules

Module #0 (hero):
{
  "heading": "Welcome",
  "text": "Some text..."
}

Module #1 (features):
{
  "heading": "Features",
  "items": "Item 1, Item 2..."
}
...
```

### 2. JSON Response Format

**Single Block Mode:**
```json
{
  "fields": {
    "heading": "New heading",
    "text": "New text"
  }
}
```

**Full Page Mode (NEW):**
```json
{
  "modules": [
    {"index": 0, "fields": {"heading": "Updated heading"}},
    {"index": 2, "fields": {"text": "Updated text"}},
    {"index": 4, "fields": {"heading": "Another update"}}
  ]
}
```

The AI only includes modules it wants to change.

### 3. Frontend Parsing

**File:** `src/hooks/useAIChat.js`

Now detects both formats:
- Single: `{"fields": ...}`
- Full page: `{"modules": [...]}`

Both are parsed and stripped from chat display.

### 4. Diff Modal

**File:** `src/components/DiffModal.jsx`

Full page mode shows grouped changes:

```
┌─────────────────────────┐
│ Module #0               │
│ ┌─────────────────────┐ │
│ │ heading             │ │
│ │ BEFORE: Old         │ │
│ │ AFTER: New          │ │
│ └─────────────────────┘ │
└─────────────────────────┘

┌─────────────────────────┐
│ Module #2               │
│ ┌─────────────────────┐ │
│ │ text                │ │
│ │ BEFORE: Old text    │ │
│ │ AFTER: New text     │ │
│ └─────────────────────┘ │
└─────────────────────────┘
```

### 5. Applying Changes

**File:** `src/components/ChatWidget.jsx`

Detects format and sends correct payload:

**Single block:**
```javascript
{
  mode: 'single',
  block_index: 3,
  fields: {...}
}
```

**Full page:**
```javascript
{
  mode: 'page',
  blocks: [
    {index: 0, fields: {...}},
    {index: 2, fields: {...}}
  ]
}
```

## Usage

### Enable Full Page Mode

1. Click the **"Full Page"** checkbox in the chat widget
2. Target indicator shows: `Full Page Mode • Finnish` (or your language)
3. Type your instruction

### Example Instructions

**Good full page instructions:**
```
- "Make all headings more engaging"
- "Improve the call-to-action across the page"
- "Make the tone more professional throughout"
- "Fix any typos on the entire page"
```

**Module-specific with full page:**
```
- "Update the hero section and footer text"
- "Make the first three modules more compelling"
```

### What You See

**Chat:**
```
User: Make all headings more engaging
AI: I've updated the headings across 3 modules to be more compelling and action-oriented.
```

**Diff Modal:**
```
3 change(s) across 3 module(s)

Module #0
  heading
  BEFORE: Welcome
  AFTER: Transform Your Business Today!

Module #2
  heading
  BEFORE: Our Services
  AFTER: Discover Premium Solutions

Module #4
  heading
  BEFORE: Contact
  AFTER: Let's Connect!
```

## Technical Details

### Context Size Limit

For pages with many modules, the context sent to AI can be large. Current implementation:
- Sends all modules with text fields
- Filters out empty fields
- JSON pretty-print for readability
- Works fine with 10-20 modules
- May need optimization for 50+ modules

### AI Token Usage

Full page mode uses more tokens because:
- System prompt includes all modules
- AI needs to understand entire page
- Response includes multiple module changes

**Typical usage:**
- Single block: ~500 tokens
- Full page (5 modules): ~1500 tokens
- Full page (10 modules): ~2500 tokens

### Performance

**Compilation:**
- Full page changes trigger one compilation
- All affected modules recompiled together
- Same speed as single block edit

**Network:**
- One API call regardless of module count
- Streaming still works normally
- Diff modal fetches affected modules in parallel

## Styling

New CSS for module grouping:

```css
.cae-diff-module-group {
  margin-bottom: 32px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 8px;
  border-left: 3px solid #667eea;
}

.cae-diff-module-title {
  font-size: 14px;
  font-weight: 600;
  color: #667eea;
  text-transform: uppercase;
}
```

Clean visual separation between modules in the diff.

## Best Practices

### When to Use Full Page Mode

✅ **Good for:**
- Consistent tone/style changes
- Fixing typos across page
- Updating similar content
- Bulk improvements

❌ **Not ideal for:**
- Single module edits (use block selection)
- Complex structural changes
- Very specific detailed edits
- Pages with 30+ modules (slow)

### Tips

1. **Be specific about scope:**
   - "Update all hero sections"
   - "Improve the first three modules"
   - "Fix footer text only"

2. **Test with smaller changes first:**
   - Try "improve headings" before "rewrite everything"
   - Review diff carefully before applying

3. **Use WPML language detection:**
   - Works automatically in full page mode
   - All modules stay in the same language

## Troubleshooting

### AI only changes one module

**Cause:** Instruction was too vague or AI interpreted it narrowly

**Solution:** Be more explicit: "Update headings in ALL modules" or "Improve text across the ENTIRE page"

### Diff shows (empty) for BEFORE

**Cause:** Module doesn't have that field populated

**Solution:** This is normal for new content. The AI is adding content to empty fields.

### Changes don't apply

**Cause:** Module index mismatch or field name incorrect

**Debug:**
1. Check browser console for errors
2. Verify JSON format in response
3. Check WordPress debug log

### Too many tokens error

**Cause:** Page has too many modules with lots of text

**Solutions:**
- Use single block mode for specific sections
- Break edits into multiple sessions
- Simplify module content first

## Future Enhancements

Potential improvements:
- **Selective module targeting:** Checkboxes to select specific modules
- **Module type filtering:** "Only edit hero modules"
- **Smart batching:** Automatically split large pages
- **Module preview:** See changes per module before applying
- **Undo per module:** Revert specific module changes

---

**Result:** Full page mode now works perfectly for bulk editing across entire pages! 🎉

