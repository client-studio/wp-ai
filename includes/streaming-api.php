<?php
/**
 * Streaming API for Vercel AI SDK
 * Outputs proper AI SDK stream format compatible with useChat hook
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

/**
 * AJAX Handler: Streaming chat endpoint for AI SDK
 */
function cae_ajax_streaming_chat() {
    // Get request data first (AI SDK sends JSON body)
    $input = json_decode(file_get_contents('php://input'), true);
    
    // Security check - nonce is in JSON body from AI SDK
    $nonce = isset($input['nonce']) ? $input['nonce'] : '';
    if (!wp_verify_nonce($nonce, 'cae-nonce')) {
        cae_stream_error('Security check failed');
        return;
    }
    
    if (!current_user_can('edit_posts')) {
        cae_stream_error('Insufficient permissions');
        return;
    }
    
    $messages = isset($input['messages']) ? $input['messages'] : [];
    $block_context = isset($input['blockContext']) ? $input['blockContext'] : null;
    $post_id = isset($input['postId']) ? intval($input['postId']) : 0;
    $language = isset($input['language']) ? $input['language'] : null;
    $language_name = isset($input['languageName']) ? $input['languageName'] : null;
    
    if (empty($messages)) {
        cae_stream_error('No messages provided');
        return;
    }
    
    // Get settings
    $settings = get_option('cae_settings', []);
    $api_key = isset($settings['api_key']) ? $settings['api_key'] : '';
    $model = isset($settings['model']) ? $settings['model'] : 'gpt-5';
    $provider = isset($settings['provider']) ? $settings['provider'] : 'openai';
    
    if (empty($api_key)) {
        cae_stream_error('API key not configured. Please add your API key in Settings → AI Block Editor');
        return;
    }
    
    // Build system prompt with context
    $system_prompt = cae_build_streaming_system_prompt($block_context, $post_id, $language, $language_name);
    
    // Add system message to beginning
    array_unshift($messages, [
        'role' => 'system',
        'content' => $system_prompt,
    ]);
    
    // Setup streaming headers for AI SDK
    header('Content-Type: text/plain; charset=utf-8');
    header('Cache-Control: no-cache');
    header('Connection: keep-alive');
    header('X-Accel-Buffering: no'); // Disable nginx buffering
    
    // Flush any existing output
    if (ob_get_level()) {
        ob_end_flush();
    }
    
    // Stream from OpenAI or Anthropic
    if ($provider === 'openai') {
        cae_stream_openai($api_key, $model, $messages);
    } elseif ($provider === 'anthropic') {
        cae_stream_anthropic($api_key, $model, $messages);
    }
    
    exit;
}

/**
 * Build system prompt with block context
 */
function cae_build_streaming_system_prompt($block_context, $post_id, $language = null, $language_name = null) {
    $prompt = "You are an expert content editor for a WordPress website. ";
    $prompt .= "You help users edit content in ACF flexible content blocks.\n\n";
    
    // Add language instruction if WPML is active
    if ($language && $language_name) {
        $prompt .= "🌍 LANGUAGE REQUIREMENT:\n";
        $prompt .= "This page is in " . $language_name . " (" . strtoupper($language) . ").\n";
        $prompt .= "You MUST respond and edit content ONLY in " . $language_name . ".\n";
        $prompt .= "Do NOT translate or switch to any other language.\n";
        $prompt .= "Maintain the exact same language as the current content.\n\n";
    }
    
    // Get modules data
    $modules = get_field('modules', $post_id);
    
    if ($block_context) {
        // Single block mode
        $prompt .= "CURRENT CONTEXT:\n";
        $prompt .= "Layout: " . $block_context['layout'] . "\n";
        $prompt .= "Block index: " . $block_context['index'] . "\n";
        
        if ($modules && isset($modules[$block_context['index']])) {
            $block_data = $modules[$block_context['index']];
            $text_fields = cae_filter_text_fields($block_data);
            $prompt .= "Current fields:\n" . json_encode($text_fields, JSON_PRETTY_PRINT) . "\n\n";
        }
    } else if ($modules && is_array($modules)) {
        // Full page mode - include ALL modules
        $prompt .= "CURRENT CONTEXT:\n";
        $prompt .= "FULL PAGE MODE - Editing entire page with " . count($modules) . " modules\n\n";
        
        foreach ($modules as $index => $module) {
            $layout = isset($module['acf_fc_layout']) ? $module['acf_fc_layout'] : 'unknown';
            $text_fields = cae_filter_text_fields($module);
            
            if (!empty($text_fields)) {
                $prompt .= "Module #" . $index . " (" . $layout . "):\n";
                $prompt .= json_encode($text_fields, JSON_PRETTY_PRINT) . "\n\n";
            }
        }
    }
    
    $prompt .= "INSTRUCTIONS:\n";
    $prompt .= "1. When editing content, use this EXACT format:\n";
    $prompt .= "   First, write a brief conversational message describing what you changed.\n";
    $prompt .= "   Then, on a new line, provide the JSON changes:\n";
    
    if (!$block_context && $modules) {
        // Full page mode - different JSON format
        $prompt .= '   {"modules": [' . "\n";
        $prompt .= '     {"index": 0, "fields": {"field_name": "new value"}},'. "\n";
        $prompt .= '     {"index": 2, "fields": {"other_field": "another value"}}'. "\n";
        $prompt .= '   ]}' . "\n";
        $prompt .= "   Only include modules you want to change (use the Module # from context).\n";
        $prompt .= "   Example:\n";
        $prompt .= "   I've improved the headings across multiple sections.\n";
        $prompt .= '   {"modules": [{"index": 0, "fields": {"heading": "New heading"}}, {"index": 2, "fields": {"heading": "Another heading"}}]}' . "\n\n";
    } else {
        // Single block mode
        $prompt .= '   {"fields": {"field_name": "new value", "another_field": "another value"}}' . "\n";
        $prompt .= "   Example:\n";
        $prompt .= "   I've made the text more engaging and added a call-to-action.\n";
        $prompt .= '   {"fields": {"heading": "New heading", "text": "New text"}}' . "\n\n";
    }
    
    $prompt .= "2. Only modify text fields. Preserve HTML tags if present.\n";
    $prompt .= "3. For questions or confirmations (no edits), respond naturally without JSON.\n";
    $prompt .= "4. Be helpful, concise, and professional.\n";
    
    if ($language && $language_name) {
        $prompt .= "5. CRITICAL: Keep all content in " . $language_name . " language!\n";
    }
    
    return $prompt;
}

/**
 * Stream OpenAI response in AI SDK format
 */
function cae_stream_openai($api_key, $model, $messages) {
    $url = 'https://api.openai.com/v1/chat/completions';
    
    $data = [
        'model' => $model,
        'messages' => $messages,
        'stream' => true,
    ];
    
    // Only add temperature for models that support it (gpt-5 only supports default temperature of 1)
    if (strpos($model, 'gpt-5') === false && strpos($model, 'o1') === false) {
        $data['temperature'] = 0.7;
    }
    
    // Use a global variable to capture full response for error checking
    global $cae_response_buffer;
    $cae_response_buffer = '';
    
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Authorization: Bearer ' . $api_key,
    ]);
    curl_setopt($ch, CURLOPT_WRITEFUNCTION, 'cae_stream_callback_openai');
    curl_setopt($ch, CURLOPT_TIMEOUT, 0); // No timeout
    curl_setopt($ch, CURLOPT_BUFFERSIZE, 128); // Small buffer for faster streaming
    
    curl_exec($ch);
    
    $http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    
    if ($http_code !== 200 && $cae_response_buffer) {
        $error = json_decode($cae_response_buffer, true);
        if (isset($error['error']['message'])) {
            cae_stream_error('OpenAI Error: ' . $error['error']['message']);
        }
    }
    
    if (curl_errno($ch)) {
        cae_stream_error('OpenAI API error: ' . curl_error($ch));
    }
    
    curl_close($ch);
}

/**
 * Stream callback for OpenAI - outputs AI SDK format
 */
function cae_stream_callback_openai($ch, $data) {
    global $cae_response_buffer;
    $cae_response_buffer .= $data;
    
    // Check if this is an error response (JSON, not SSE)
    if (strpos($data, '{"error":') !== false || strpos($cae_response_buffer, '{"error":') !== false) {
        return strlen($data);
    }
    
    // Parse SSE format from OpenAI
    $lines = explode("\n", $data);
    
    foreach ($lines as $line) {
        $line = trim($line);
        
        if (empty($line) || $line === 'data: [DONE]') {
            continue;
        }
        
        if (strpos($line, 'data: ') === 0) {
            $json = substr($line, 6);
            $parsed = json_decode($json, true);
            
            if (isset($parsed['choices'][0]['delta']['content'])) {
                $content = $parsed['choices'][0]['delta']['content'];
                
                // Output in AI SDK stream format: "0:" + JSON encoded text + "\n"
                echo "0:" . json_encode($content) . "\n";
                flush();
            }
        }
    }
    
    return strlen($data);
}

/**
 * Stream Anthropic response in AI SDK format
 */
function cae_stream_anthropic($api_key, $model, $messages) {
    // Convert messages format for Anthropic
    $system_message = '';
    $anthropic_messages = [];
    
    foreach ($messages as $msg) {
        if ($msg['role'] === 'system') {
            $system_message = $msg['content'];
        } else {
            $anthropic_messages[] = $msg;
        }
    }
    
    $url = 'https://api.anthropic.com/v1/messages';
    
    $data = [
        'model' => $model,
        'messages' => $anthropic_messages,
        'system' => $system_message,
        'stream' => true,
        'max_tokens' => 2000,
    ];
    
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'x-api-key: ' . $api_key,
        'anthropic-version: 2023-06-01',
    ]);
    curl_setopt($ch, CURLOPT_WRITEFUNCTION, 'cae_stream_callback_anthropic');
    curl_setopt($ch, CURLOPT_TIMEOUT, 0);
    curl_setopt($ch, CURLOPT_BUFFERSIZE, 128);
    
    curl_exec($ch);
    
    if (curl_errno($ch)) {
        cae_stream_error('Anthropic API error: ' . curl_error($ch));
    }
    
    curl_close($ch);
}

/**
 * Stream callback for Anthropic - outputs AI SDK format
 */
function cae_stream_callback_anthropic($ch, $data) {
    $lines = explode("\n", $data);
    
    foreach ($lines as $line) {
        $line = trim($line);
        
        if (empty($line)) {
            continue;
        }
        
        if (strpos($line, 'data: ') === 0) {
            $json = substr($line, 6);
            $parsed = json_decode($json, true);
            
            if (isset($parsed['type']) && $parsed['type'] === 'content_block_delta') {
                if (isset($parsed['delta']['text'])) {
                    $content = $parsed['delta']['text'];
                    
                    // Output in AI SDK stream format: "0:" + JSON encoded text + "\n"
                    echo "0:" . json_encode($content) . "\n";
                    flush();
                }
            }
        }
    }
    
    return strlen($data);
}

/**
 * Stream error message in AI SDK format
 */
function cae_stream_error($message) {
    // AI SDK expects errors in a specific format
    echo "error: " . json_encode(['message' => $message]) . "\n";
    flush();
}
