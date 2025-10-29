# Static Compilation Integration

## Overview

The AI Editor plugin automatically integrates with your theme's **static compilation system** to recompile modules after AI edits are applied.

## How It Works

### Your Theme's System

Based on `functions.php`, your theme compiles ACF modules to static HTML:
- ✅ **Compiles on save** via `acf/save_post` hook
- ✅ **Stores compiled HTML** in post meta `_client_compiled_modules`
- ✅ **Serves compiled version** via `client_modules()` function
- ✅ **Live rendering fallback** for local/dev environments

### AI Editor Integration

When AI changes are applied, the plugin:

1. **Updates ACF fields** in database
2. **Triggers compilation** by calling `client_compile_post()`
3. **Waits for compilation** to complete
4. **Reloads page** to show fresh compiled output

### Code Flow

**File:** `includes/block-detector.php`

```php
// After updating ACF fields
update_field('modules', $modules, $post_id);

// Trigger static compilation (if function exists)
if (function_exists('client_compile_post')) {
    client_compile_post($post_id);
    error_log('CAE: Triggered static compilation for post #' . $post_id);
}

wp_send_json_success([
    'compiled' => true,
    // ...
]);
```

**File:** `src/components/ChatWidget.jsx`

```javascript
const result = await applyChanges(postId, changesPayload);

if (result.success && result.data?.compiled) {
    console.log('✓ Static blocks recompiled');
}

// Reload to show compiled output
setTimeout(() => {
    window.location.reload();
}, 500);
```

## Benefits

### 1. **Immediate Compilation**
- Changes are compiled instantly when applied
- No manual recompilation needed
- No waiting for next page save

### 2. **Seamless Frontend Editing**
- Edit on live site with `?live=0`
- Apply AI changes
- Page reloads with fresh compiled HTML
- See your changes immediately

### 3. **Performance Maintained**
- Compiled HTML still served on frontend
- AI edits don't bypass compilation
- Static site performance preserved

### 4. **No Manual Steps**
- No need to rebuild via admin tools
- No need to manually clear cache
- Just edit and apply - everything else is automatic

## Workflow

### Frontend Editing Flow

```
1. Visit page with ?live=0 (live rendering for AI editor)
   → Modules render dynamically with data-ai-block attributes
   
2. Click "AI Edit" button on module
   → Chat widget opens with block selected
   
3. Send AI instruction (e.g., "make this more compelling")
   → AI streams response and shows diff modal
   
4. Click "Apply Changes"
   → ACF fields update in database
   → client_compile_post() runs
   → Static HTML regenerated
   → _client_compiled_modules updated
   
5. Page reloads (500ms later)
   → Compiled HTML served (no more ?live=0 needed)
   → Changes visible on live site
```

### Admin Editing Flow

```
1. Edit post in WP admin
   → ACF flexible content visible
   
2. Click "AI Edit" on module row
   → Chat opens with module selected
   
3. Apply AI changes
   → Fields update
   → Compilation triggered
   → Admin shows success notice
   
4. View post on frontend
   → Compiled HTML already ready
   → Changes live immediately
```

## Live vs Compiled Rendering

Your theme intelligently switches modes:

### Local Development
```php
// Default: Live rendering (easier for development)
client_modules(); 
→ Renders modules dynamically
→ AI editor can target blocks with data attributes
```

### Force Compiled (Production Simulation)
```php
// Add ?live=1 to URL
client_modules();
→ Serves compiled HTML from post meta
→ Faster performance testing
```

### Force Live (For AI Editor)
```php
// Add ?live=0 to URL
client_modules();
→ Always render live with data attributes
→ Perfect for AI editor targeting
```

## Debug Logging

Check WordPress debug log for compilation:

```
CAE: Triggered static compilation for post #123
Client: Compiled post #123 - 5 static, 2 dynamic modules in 0.034s
```

This confirms:
- AI editor triggered compilation
- Theme compiled successfully
- Compile time and module stats

## Error Handling

If compilation fails:

```php
catch (Exception $e) {
    error_log('CAE: Static compilation failed for post #' . $post_id . ': ' . $e->getMessage());
}
```

The page will still reload, but with a fallback to live rendering.

## Compatibility

### Works With Your System
✅ **Static compilation** (`client_compile_post`)  
✅ **Dynamic markers** (`client-dyn` for dynamic modules)  
✅ **Build locks** (prevents concurrent compilation)  
✅ **Compilation stats** (tracks performance)  
✅ **Admin notices** (shows compilation status)  

### Respects Your Settings
✅ **Environment detection** (local vs production)  
✅ **Query parameter overrides** (`?live=0/1`)  
✅ **Preview mode** (always live for previews)  
✅ **Build queues** (batch rebuilding)  

## Best Practices

### 1. **Use ?live=0 for Editing**
```
https://yoursite.com/page/?live=0
```
- Enables AI editor block targeting
- Still compiles when you apply changes
- Best of both worlds

### 2. **Enable Debug Logging**
```php
// wp-config.php
define('WP_DEBUG', true);
define('WP_DEBUG_LOG', true);
```
- Track compilation success/failures
- Monitor performance
- Troubleshoot issues

### 3. **Monitor Compilation Time**
- Check admin notices after AI edits
- Typical: 0.03-0.1s per module
- If slow, investigate module complexity

### 4. **Test Both Modes**
- Edit with `?live=0`
- View final result without parameter
- Verify compiled output matches

## Technical Details

### Function Detection

The plugin checks for your theme's function:

```php
if (function_exists('client_compile_post')) {
    // Your theme has static compilation
    // Integrate automatically
}
```

This means:
- ✅ Works out-of-the-box with your theme
- ✅ No configuration needed
- ✅ Graceful fallback if function missing
- ✅ Automatic integration

### Compilation Trigger Points

Your theme compiles on:
1. **ACF save** (via `acf/save_post` hook)
2. **AI editor apply** (via `client_compile_post()` call)
3. **Manual rebuild** (via admin tools)
4. **Batch processing** (via WP-Cron)

All these work together seamlessly.

### Post Meta Storage

Compiled output stored in:
```php
_client_compiled_modules     // The compiled HTML
_client_compiled_time        // Last compile timestamp  
_client_compiled_stats       // Performance metrics
```

AI editor respects and updates these automatically.

## Troubleshooting

### Changes Don't Appear After Reload

**Check:**
1. Was compilation successful?
   - Check debug log for `CAE: Triggered static compilation`
2. Are you still on `?live=0`?
   - Remove parameter to see compiled version
3. Is compilation cached?
   - Check `_client_compiled_time` post meta
   - Should update after AI edit

### Page Takes Long to Reload

**Possible causes:**
- Large number of modules compiling
- Complex dynamic modules
- Slow server response

**Solutions:**
- Check compilation stats in admin
- Optimize slow modules
- Consider async compilation

### Compilation Fails Silently

**Debug steps:**
```php
// Check if function exists
var_dump(function_exists('client_compile_post')); // should be true

// Check build lock
var_dump(get_transient('client_build_lock_' . $post_id)); // should be false

// Check ACF data
var_dump(have_rows('modules', $post_id)); // should be true
```

## Future Enhancements

Potential improvements:
- **Progress indicator** during compilation
- **Compilation preview** before page reload
- **Async compilation** with notification
- **Selective recompilation** (only changed modules)
- **Diff view** showing compiled output changes

---

**Result:** AI edits seamlessly integrate with your static compilation system! ⚡️

