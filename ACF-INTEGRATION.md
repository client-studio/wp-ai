# ACF Integration - AI Edit Buttons

## Overview

The plugin now adds **AI Edit buttons** directly to each ACF flexible content row header in the WordPress admin, making it incredibly easy to select blocks for editing.

## How It Works

### In the Admin (Post Editor)

1. **Edit any post** with ACF flexible content (modules field)
2. **Look at each ACF row header** - you'll see a purple "AI Edit" button with a layered icon
3. **Click the "AI Edit" button** on any row:
   - The AI chat widget opens (if closed)
   - That block is automatically selected
   - The row highlights with a purple outline
   - The chat shows: "Block X: layout_name"
4. **Type your editing instructions** in the chat
5. **Review the diff** and apply changes

### Visual Indicators

- **AI Edit Button**: Purple gradient button in each ACF row header
- **Selected Row**: Purple outline around the selected ACF row
- **Target Indicator**: Shows "Block X: layout_name" in the chat widget
- **Hover Effect**: Button glows when you hover over it

## Implementation Details

### Files Added

1. **`assets/acf-integration.js`**
   - jQuery script that adds AI Edit buttons to ACF rows
   - Uses MutationObserver to handle dynamically added rows
   - Dispatches `cae:selectBlock` custom event when clicked

2. **`assets/acf-integration.css`**
   - Styles for the AI Edit button (purple gradient)
   - Highlighting styles for selected rows
   - Responsive design

### React Integration

The `useBlockTarget.js` hook now listens for two selection methods:

1. **Frontend**: Click blocks with `[data-ai-block]` attribute
2. **Admin**: Listen for `cae:selectBlock` custom event from ACF buttons

### Event Flow

```
User clicks "AI Edit" button
    ↓
acf-integration.js triggers 'cae:selectBlock' event
    ↓
useBlockTarget.js receives event
    ↓
setTargetBlock({ index, layout, postId })
    ↓
ChatWidget updates UI
    ↓
User can now chat about this block
```

## Benefits

✅ **No guessing** which block is which  
✅ **One-click selection** from ACF interface  
✅ **Visual feedback** with highlighted rows  
✅ **Auto-opens chat** if closed  
✅ **Works with dynamic rows** (new rows get buttons automatically)  
✅ **Clean integration** with existing ACF UI  

## Styling Customization

To customize the AI Edit button appearance, edit `assets/acf-integration.css`:

```css
.cae-acf-edit-btn {
    /* Change gradient */
    background: linear-gradient(135deg, #your-color-1 0%, #your-color-2 100%);
    
    /* Change size */
    padding: 4px 10px;
    font-size: 12px;
    
    /* Add your own styles */
}
```

## Browser Compatibility

- ✅ Chrome/Edge (Chromium)
- ✅ Firefox
- ✅ Safari
- ✅ Uses MutationObserver (IE11+ supported)

## Troubleshooting

**Buttons don't appear:**
- Make sure you're on a post edit screen
- Check that ACF flexible content field exists
- Clear browser cache and hard reload (Cmd/Ctrl + Shift + R)

**Button clicks don't work:**
- Check browser console for JavaScript errors
- Verify `CAE_Data` is available (should be localized by plugin)
- Make sure chat widget is enabled for admin

**Rows not highlighting:**
- Check that `assets/acf-integration.css` is loaded
- Inspect element to verify CSS is applied

## Development

To modify the ACF integration:

1. Edit `assets/acf-integration.js` or `assets/acf-integration.css`
2. Save changes
3. Hard reload browser (Cmd/Ctrl + Shift + R)
4. No rebuild needed (these are vanilla JS/CSS, not React)

---

Built to make content editing with AI as seamless as possible! 🚀

