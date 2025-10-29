# WPML Language Detection - Automatic Language Preservation

## Overview

The plugin **automatically detects WPML languages** and instructs the AI to maintain the same language when editing content. This prevents the AI from accidentally translating or switching languages.

## How It Works

### Automatic Detection

1. **Plugin checks if WPML is active** (`wpml_get_current_language()` function exists)
2. **Detects the current post's language** (e.g., `en`, `fi`, `sv`)
3. **Gets the language display name** (e.g., "English", "Finnish", "Swedish")
4. **Automatically adds language instruction to AI prompt**

### Universal Design

✅ **Works with WPML** - Automatic detection when plugin is active  
✅ **Works without WPML** - Gracefully handles non-multilingual sites  
✅ **No configuration needed** - Zero setup required  
✅ **Works everywhere** - Frontend and admin (WP editor)

## What the AI Receives

When WPML is detected, the system prompt includes:

```
🌍 LANGUAGE REQUIREMENT:
This page is in Finnish (FI).
You MUST respond and edit content ONLY in Finnish.
Do NOT translate or switch to any other language.
Maintain the exact same language as the current content.

[... rest of prompt ...]

5. CRITICAL: Keep all content in Finnish language!
```

## Visual Indicator

The chat widget shows the detected language in the target indicator:

```
Block 3: hero_section • Finnish
```

This lets you know the AI is language-aware for this content.

## Debug Logging

Check WordPress error log (`wp-content/debug.log`) for language detection:

```
CAE: WPML language detected: Finnish (fi)
```

## Examples

### Finnish Page
```
User: "Tee tästä tekstistä parempi"
AI: [Responds in Finnish, edits content in Finnish]
```

### Swedish Page
```
User: "Make this more engaging"  
AI: [Responds in Swedish, edits content in Swedish]
// Even though instruction was in English!
```

### English Page (no WPML)
```
User: "Make this more exciting"
AI: [Responds in English, no language restriction]
```

## Supported Language Detection

The plugin uses WPML's native functions:

- `wpml_current_language` - Gets language code (e.g., `fi`, `sv`, `en`)
- `wpml_language_information` - Gets display name and metadata

This ensures compatibility with all WPML-supported languages.

## Benefits

### 1. **No Accidental Translations**
Without this feature:
- User edits Finnish content
- AI might respond in English or mix languages
- Content becomes inconsistent

With this feature:
- AI always respects the page language
- Content stays consistent
- No manual "keep it in Finnish" reminders needed

### 2. **Multilingual Workflow**
Perfect for multilingual sites:
- Edit English version → AI uses English
- Switch to Finnish translation → AI uses Finnish
- Switch to Swedish → AI uses Swedish
- All automatic!

### 3. **Team Collaboration**
Teams working in different languages:
- English speaker can edit Finnish content
- Just type instructions in any language
- AI maintains Finnish in the output
- No language skills required!

## Technical Implementation

### Frontend/Admin Detection

**File:** `client-ai-editor.php`

```php
// Detect WPML language if active
$current_language = null;
$language_name = null;

if (function_exists('wpml_get_current_language')) {
    $current_language = apply_filters('wpml_current_language', null);
    
    // Get human-readable language name
    if ($current_language && function_exists('wpml_get_language_information')) {
        $lang_info = apply_filters('wpml_language_information', null, $current_language);
        $language_name = isset($lang_info['display_name']) ? $lang_info['display_name'] : $current_language;
    }
}

// Pass to React
wp_localize_script('cae-app', 'CAE_Data', [
    'language' => $current_language,
    'languageName' => $language_name,
]);
```

### AI Prompt Integration

**File:** `includes/streaming-api.php`

```php
function cae_build_streaming_system_prompt($block_context, $post_id, $language = null, $language_name = null) {
    // Add language instruction if WPML is active
    if ($language && $language_name) {
        $prompt .= "🌍 LANGUAGE REQUIREMENT:\n";
        $prompt .= "This page is in " . $language_name . " (" . strtoupper($language) . ").\n";
        $prompt .= "You MUST respond and edit content ONLY in " . $language_name . ".\n";
        // ...
    }
    // ...
}
```

## Compatibility

### Tested With:
- ✅ WPML (all versions)
- ✅ Sites without WPML (gracefully handles)
- ✅ Multiple languages (all WPML-supported languages)
- ✅ Frontend editing
- ✅ Admin editing

### Works With:
- ✅ String Translation
- ✅ Translation Management
- ✅ Language Switchers
- ✅ Default language fallback

## Customization

### Override Language Detection

If you need custom language handling, you can filter the language before it's sent:

```php
add_filter('cae_detected_language', function($language_name, $language_code, $post_id) {
    // Custom logic
    // Example: Always use formal Finnish for certain post types
    if (get_post_type($post_id) === 'legal_docs' && $language_code === 'fi') {
        return 'Formal Finnish';
    }
    return $language_name;
}, 10, 3);
```

### Additional Language Instructions

Add custom language-specific instructions:

```php
add_filter('cae_language_prompt', function($prompt, $language_name) {
    if ($language_name === 'Finnish') {
        $prompt .= "Use formal 'Te' form, not informal 'sinä'.\n";
    }
    return $prompt;
}, 10, 2);
```

## Troubleshooting

### Language Not Detected

**Check:**
1. WPML is activated
2. Page has a language assigned
3. Check debug log: `CAE: WPML language detected: ...`

**Test WPML:**
```php
// In WordPress console
var_dump(apply_filters('wpml_current_language', null));
// Should return language code like 'fi'
```

### AI Still Switches Languages

**Possible causes:**
1. User prompt overrides language (e.g., "translate to English")
2. Content is mixed language already
3. AI model doesn't follow instructions well

**Solutions:**
- Use more explicit instructions: "Improve this (keep in Finnish)"
- Check that original content is clean
- Try different AI model (GPT-4 follows better than GPT-3.5)

### Language Shows Wrong in UI

**Check:**
- Browser console: `console.log(window.CAE_Data.languageName)`
- Should show language name
- If null, WPML not detected properly

## Best Practices

1. **Let it work automatically** - Don't add "in Finnish" to every prompt
2. **Trust the system** - AI will maintain language
3. **Check debug logs** - Verify language detection works
4. **Use for all languages** - Works the same for all WPML languages
5. **Enable WP_DEBUG** - Helpful for troubleshooting

## Future Enhancements

Potential additions:
- Custom language instructions per language
- Tone/formality settings per language
- Language-specific terminology glossaries
- Translation memory integration

---

**Pro Tip:** This feature is "set and forget" - just install WPML and the plugin handles the rest! 🌍✨

