<?php
/**
 * OpenAI API integration
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Send request to OpenAI and get content suggestions
 * 
 * @param string $prompt User's instruction
 * @param array $context Current block/page content
 * @return array|WP_Error Response or error
 */
function cae_request_ai_edit($prompt, $context) {
    $settings = get_option('cae_settings', []);
    
    // Validate API key
    if (empty($settings['api_key'])) {
        return new WP_Error('no_api_key', __('OpenAI API key not configured', 'client-ai-editor'));
    }
    
    $api_key = $settings['api_key'];
    $model = isset($settings['model']) ? $settings['model'] : 'gpt-5';
    
    // Build system prompt
    $system_prompt = "You are an expert content editor for a WordPress website. " .
                    "You will receive content from ACF flexible content blocks and edit them based on user instructions. " .
                    "CRITICAL: You must respond ONLY with valid JSON in this exact format:\n" .
                    '{"fields": {"field_name": "new value", "another_field": "another value"}}' . "\n" .
                    "Do not include any explanations, markdown, or other text outside the JSON. " .
                    "Only modify text fields. Preserve HTML tags if present. " .
                    "Field names will be provided in the context.";
    
    // Build context message
    $context_message = cae_build_context_message($context);
    
    // Prepare messages
    $messages = [
        ['role' => 'system', 'content' => $system_prompt],
        ['role' => 'user', 'content' => $context_message],
        ['role' => 'user', 'content' => $prompt],
    ];
    
    // Make API request
    $response = wp_remote_post('https://api.openai.com/v1/chat/completions', [
        'headers' => [
            'Content-Type' => 'application/json',
            'Authorization' => 'Bearer ' . $api_key,
        ],
        'body' => json_encode([
            'model' => $model,
            'messages' => $messages,
            'temperature' => 0.7,
            'max_tokens' => 2000,
        ]),
        'timeout' => 60,
    ]);
    
    // Check for errors
    if (is_wp_error($response)) {
        return $response;
    }
    
    $status_code = wp_remote_retrieve_response_code($response);
    $body = wp_remote_retrieve_body($response);
    
    if ($status_code !== 200) {
        $error_data = json_decode($body, true);
        $error_message = isset($error_data['error']['message']) 
            ? $error_data['error']['message'] 
            : 'OpenAI API request failed';
        
        return new WP_Error('api_error', $error_message, ['status' => $status_code]);
    }
    
    // Parse response
    $data = json_decode($body, true);
    
    if (!isset($data['choices'][0]['message']['content'])) {
        return new WP_Error('invalid_response', __('Invalid response from OpenAI', 'client-ai-editor'));
    }
    
    $ai_response = trim($data['choices'][0]['message']['content']);
    
    // Remove markdown code blocks if present
    $ai_response = preg_replace('/^```json\s*/m', '', $ai_response);
    $ai_response = preg_replace('/\s*```$/m', '', $ai_response);
    $ai_response = trim($ai_response);
    
    // Parse JSON response
    $suggestions = json_decode($ai_response, true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        return new WP_Error('json_parse_error', __('Failed to parse AI response as JSON', 'client-ai-editor') . ': ' . $ai_response);
    }
    
    if (!isset($suggestions['fields']) || !is_array($suggestions['fields'])) {
        return new WP_Error('invalid_format', __('AI response missing "fields" object', 'client-ai-editor'));
    }
    
    return $suggestions;
}

/**
 * Build context message from block data
 * 
 * @param array $context Block or page context
 * @return string Formatted context message
 */
function cae_build_context_message($context) {
    if (isset($context['mode']) && $context['mode'] === 'page') {
        // Full page mode - multiple blocks
        $message = "I am editing an entire page with multiple content blocks.\n\n";
        
        foreach ($context['blocks'] as $index => $block) {
            $message .= "Block #" . ($index + 1) . " (" . $block['layout'] . "):\n";
            $message .= json_encode($block['fields'], JSON_PRETTY_PRINT) . "\n\n";
        }
        
        return $message;
    } else {
        // Single block mode
        $message = "I am editing a content block of type: " . $context['layout'] . "\n\n";
        $message .= "Current content:\n";
        $message .= json_encode($context['fields'], JSON_PRETTY_PRINT);
        
        return $message;
    }
}

/**
 * Get only text fields from ACF field data
 * Filters out images, relationships, etc.
 * 
 * @param array $fields All field data
 * @return array Filtered text fields only
 */
function cae_filter_text_fields($fields) {
    if (!is_array($fields)) {
        return [];
    }
    
    $text_fields = [];
    
    foreach ($fields as $key => $value) {
        // Skip empty values
        if (empty($value)) {
            continue;
        }
        
        // Only include scalar values (strings, numbers)
        if (is_string($value) || is_numeric($value)) {
            $text_fields[$key] = $value;
        }
        
        // Handle arrays recursively (for repeater fields, etc.)
        if (is_array($value)) {
            $filtered = cae_filter_text_fields($value);
            if (!empty($filtered)) {
                $text_fields[$key] = $filtered;
            }
        }
    }
    
    return $text_fields;
}

/**
 * Sanitize AI-generated content before saving
 * 
 * @param array $fields Field data from AI
 * @return array Sanitized fields
 */
function cae_sanitize_ai_fields($fields) {
    $sanitized = [];
    
    foreach ($fields as $key => $value) {
        if (is_string($value)) {
            // Allow basic HTML tags
            $sanitized[$key] = wp_kses_post($value);
        } elseif (is_array($value)) {
            $sanitized[$key] = cae_sanitize_ai_fields($value);
        } else {
            $sanitized[$key] = sanitize_text_field($value);
        }
    }
    
    return $sanitized;
}

