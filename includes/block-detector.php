<?php
/**
 * Block detection and data extraction
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

/**
 * AJAX: Get single block data
 */
function cae_ajax_get_block() {
    // Security check
    check_ajax_referer('cae-nonce', 'nonce');
    
    if (!current_user_can('edit_posts')) {
        wp_send_json_error(['message' => 'Insufficient permissions']);
    }
    
    $post_id = isset($_POST['post_id']) ? intval($_POST['post_id']) : 0;
    $block_index = isset($_POST['block_index']) ? intval($_POST['block_index']) : 0;
    
    error_log('CAE get_block: post_id=' . $post_id . ', block_index=' . $block_index);
    
    if (!$post_id) {
        wp_send_json_error(['message' => 'Invalid post ID']);
    }
    
    // Get modules field
    $modules = get_field('modules', $post_id);
    
    error_log('CAE get_block: modules=' . (is_array($modules) ? count($modules) : 'null'));
    
    if (!$modules || !isset($modules[$block_index])) {
        wp_send_json_error(['message' => 'Block not found at index ' . $block_index]);
    }
    
    $block = $modules[$block_index];
    $layout = isset($block['acf_fc_layout']) ? $block['acf_fc_layout'] : 'unknown';
    
    error_log('CAE get_block: layout=' . $layout);
    
    // Filter to text fields only
    $text_fields = cae_filter_text_fields($block);
    
    error_log('CAE get_block: text_fields=' . json_encode($text_fields));
    
    wp_send_json_success([
        'layout' => $layout,
        'fields' => $text_fields,
        'block_index' => $block_index,
    ]);
}

/**
 * AJAX: Get all page blocks
 */
function cae_ajax_get_page_blocks() {
    // Security check
    check_ajax_referer('cae-nonce', 'nonce');
    
    if (!current_user_can('edit_posts')) {
        wp_send_json_error(['message' => 'Insufficient permissions']);
    }
    
    $post_id = isset($_POST['post_id']) ? intval($_POST['post_id']) : 0;
    
    if (!$post_id) {
        wp_send_json_error(['message' => 'Invalid post ID']);
    }
    
    // Get all modules
    $modules = get_field('modules', $post_id);
    
    if (!$modules || !is_array($modules)) {
        wp_send_json_error(['message' => 'No modules found']);
    }
    
    $blocks = [];
    
    foreach ($modules as $index => $block) {
        $layout = isset($block['acf_fc_layout']) ? $block['acf_fc_layout'] : 'unknown';
        $text_fields = cae_filter_text_fields($block);
        
        $blocks[] = [
            'index' => $index,
            'layout' => $layout,
            'fields' => $text_fields,
        ];
    }
    
    wp_send_json_success([
        'blocks' => $blocks,
        'total' => count($blocks),
    ]);
}

/**
 * AJAX: Process AI request
 */
function cae_ajax_process() {
    // Security check
    check_ajax_referer('cae-nonce', 'nonce');
    
    if (!current_user_can('edit_posts')) {
        wp_send_json_error(['message' => 'Insufficient permissions']);
    }
    
    $prompt = isset($_POST['prompt']) ? sanitize_textarea_field($_POST['prompt']) : '';
    $context = isset($_POST['context']) ? json_decode(stripslashes($_POST['context']), true) : [];
    
    if (empty($prompt)) {
        wp_send_json_error(['message' => 'Prompt is required']);
    }
    
    if (empty($context)) {
        wp_send_json_error(['message' => 'Context is required']);
    }
    
    // Call OpenAI API
    $result = cae_request_ai_edit($prompt, $context);
    
    if (is_wp_error($result)) {
        wp_send_json_error([
            'message' => $result->get_error_message(),
            'code' => $result->get_error_code(),
        ]);
    }
    
    wp_send_json_success($result);
}

/**
 * AJAX: Apply AI changes to post
 */
function cae_ajax_apply() {
    // Security check
    check_ajax_referer('cae-nonce', 'nonce');
    
    if (!current_user_can('edit_posts')) {
        wp_send_json_error(['message' => 'Insufficient permissions']);
    }
    
    $post_id = isset($_POST['post_id']) ? intval($_POST['post_id']) : 0;
    $changes = isset($_POST['changes']) ? json_decode(stripslashes($_POST['changes']), true) : [];
    
    if (!$post_id) {
        wp_send_json_error(['message' => 'Invalid post ID']);
    }
    
    if (empty($changes)) {
        wp_send_json_error(['message' => 'No changes to apply']);
    }
    
    // Get current modules
    $modules = get_field('modules', $post_id);
    
    if (!$modules || !is_array($modules)) {
        wp_send_json_error(['message' => 'No modules found']);
    }
    
    // Apply changes
    $updated_count = 0;
    
    if (isset($changes['mode']) && $changes['mode'] === 'page') {
        // Full page mode - multiple blocks
        foreach ($changes['blocks'] as $change) {
            $index = $change['index'];
            
            if (!isset($modules[$index])) {
                continue;
            }
            
            // Sanitize AI fields
            $sanitized_fields = cae_sanitize_ai_fields($change['fields']);
            
            // Update fields in module
            foreach ($sanitized_fields as $field_key => $field_value) {
                if (isset($modules[$index][$field_key])) {
                    $modules[$index][$field_key] = $field_value;
                    $updated_count++;
                }
            }
        }
    } else {
        // Single block mode
        $index = isset($changes['block_index']) ? intval($changes['block_index']) : 0;
        
        if (!isset($modules[$index])) {
            wp_send_json_error(['message' => 'Block not found']);
        }
        
        // Sanitize AI fields
        $sanitized_fields = cae_sanitize_ai_fields($changes['fields']);
        
        // Update fields in module
        foreach ($sanitized_fields as $field_key => $field_value) {
            if (isset($modules[$index][$field_key])) {
                $modules[$index][$field_key] = $field_value;
                $updated_count++;
            }
        }
    }
    
    // Save updated modules
    update_field('modules', $modules, $post_id);
    
    // WordPress will create a revision automatically
    
    // Trigger static compilation (if theme has client_compile_post function)
    $compiled = false;
    if (function_exists('client_compile_post')) {
        try {
            client_compile_post($post_id);
            $compiled = true;
            error_log('CAE: Triggered static compilation for post #' . $post_id);
        } catch (Exception $e) {
            error_log('CAE: Static compilation failed for post #' . $post_id . ': ' . $e->getMessage());
        }
    }
    
    wp_send_json_success([
        'message' => sprintf(__('%d fields updated successfully', 'client-ai-editor'), $updated_count),
        'updated_count' => $updated_count,
        'compiled' => $compiled,
    ]);
}

