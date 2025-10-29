<?php
/**
 * Settings page for AI Block Editor
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Add settings page to admin menu
 */
add_action('admin_menu', 'cae_add_settings_page');

function cae_add_settings_page() {
    add_options_page(
        __('AI Block Editor Settings', 'client-ai-editor'),
        __('AI Block Editor', 'client-ai-editor'),
        'manage_options',
        'client-ai-editor',
        'cae_render_settings_page'
    );
}

/**
 * Register settings
 */
add_action('admin_init', 'cae_register_settings');

function cae_register_settings() {
    register_setting(
        'cae_settings_group',
        'cae_settings',
        'cae_sanitize_settings'
    );
    
    add_settings_section(
        'cae_main_section',
        __('OpenAI Configuration', 'client-ai-editor'),
        'cae_main_section_callback',
        'client-ai-editor'
    );
    
    add_settings_field(
        'cae_api_key',
        __('API Key', 'client-ai-editor'),
        'cae_api_key_callback',
        'client-ai-editor',
        'cae_main_section'
    );
    
    add_settings_field(
        'cae_provider',
        __('AI Provider', 'client-ai-editor'),
        'cae_provider_callback',
        'client-ai-editor',
        'cae_main_section'
    );
    
    add_settings_field(
        'cae_model',
        __('Model', 'client-ai-editor'),
        'cae_model_callback',
        'client-ai-editor',
        'cae_main_section'
    );
    
    add_settings_field(
        'cae_frontend_enabled',
        __('Frontend Editing', 'client-ai-editor'),
        'cae_frontend_enabled_callback',
        'client-ai-editor',
        'cae_main_section'
    );
}

/**
 * Sanitize settings
 */
function cae_sanitize_settings($input) {
    $sanitized = [];
    
    // API key
    if (isset($input['api_key'])) {
        $sanitized['api_key'] = sanitize_text_field($input['api_key']);
    }
    
    // Provider
    $allowed_providers = ['openai', 'anthropic'];
    if (isset($input['provider']) && in_array($input['provider'], $allowed_providers)) {
        $sanitized['provider'] = $input['provider'];
    } else {
        $sanitized['provider'] = 'openai';
    }
    
    // Model - allow any string (different providers have different models)
    if (isset($input['model'])) {
        $sanitized['model'] = sanitize_text_field($input['model']);
    } else {
        $sanitized['model'] = 'gpt-5';
    }
    
    // Frontend enabled
    $sanitized['frontend_enabled'] = isset($input['frontend_enabled']) ? true : false;
    
    return $sanitized;
}

/**
 * Section callback
 */
function cae_main_section_callback() {
    echo '<p>' . __('Configure your OpenAI API settings for AI-powered block editing.', 'client-ai-editor') . '</p>';
}

/**
 * Provider selection field
 */
function cae_provider_callback() {
    $settings = get_option('cae_settings', []);
    $current_provider = isset($settings['provider']) ? $settings['provider'] : 'openai';
    
    $providers = [
        'openai' => 'OpenAI (GPT)',
        'anthropic' => 'Anthropic (Claude)',
    ];
    
    echo '<select name="cae_settings[provider]" id="cae_provider">';
    foreach ($providers as $value => $label) {
        $selected = selected($current_provider, $value, false);
        echo '<option value="' . esc_attr($value) . '" ' . $selected . '>' . esc_html($label) . '</option>';
    }
    echo '</select>';
    echo '<p class="description">' . __('Choose your AI provider', 'client-ai-editor') . '</p>';
}

/**
 * API Key field
 */
function cae_api_key_callback() {
    $settings = get_option('cae_settings', []);
    $api_key = isset($settings['api_key']) ? $settings['api_key'] : '';
    $provider = isset($settings['provider']) ? $settings['provider'] : 'openai';
    
    $api_links = [
        'openai' => 'https://platform.openai.com/api-keys',
        'anthropic' => 'https://console.anthropic.com/settings/keys',
    ];
    
    echo '<div style="display: flex; gap: 10px; align-items: center;">';
    echo '<input type="password" name="cae_settings[api_key]" id="cae_api_key" value="' . esc_attr($api_key) . '" class="regular-text" autocomplete="off">';
    echo '<button type="button" id="cae_test_api" class="button button-secondary" style="white-space: nowrap;">' . __('Test Connection', 'client-ai-editor') . '</button>';
    echo '<span id="cae_test_result" style="margin-left: 5px;"></span>';
    echo '</div>';
    echo '<p class="description">';
    echo 'Get your API key from ';
    foreach ($api_links as $prov => $link) {
        echo '<a href="' . $link . '" target="_blank" class="cae-api-link-' . $prov . '">' . ucfirst($prov) . '</a> ';
    }
    echo '</p>';
}

/**
 * Model selection field
 */
function cae_model_callback() {
    $settings = get_option('cae_settings', []);
    $current_model = isset($settings['model']) ? $settings['model'] : 'gpt-5';
    $provider = isset($settings['provider']) ? $settings['provider'] : 'openai';
    
    $models_by_provider = [
        'openai' => [
            'gpt-5' => 'GPT-5 (Recommended)',
            'gpt-5-mini' => 'GPT-5 Mini (Fast)',
            'gpt-5-nano' => 'GPT-5 Nano (Fastest)',
            'gpt-5-pro' => 'GPT-5 Pro',
            'gpt-4' => 'GPT-4',
        ],
        'anthropic' => [
            'claude-sonnet-4-5-20250929' => 'Claude Sonnet 4.5 (Recommended)',
            'claude-haiku-4-5-20251001' => 'Claude Haiku 4.5 (Fast)',
            'claude-opus-4-1-20250805' => 'Claude Opus 4.1',
        ],
    ];
    
    echo '<input type="text" name="cae_settings[model]" value="' . esc_attr($current_model) . '" class="regular-text">';
    
    echo '<p class="description">';
    echo __('Model name. Common models:', 'client-ai-editor') . '<br>';
    foreach ($models_by_provider as $prov => $models) {
        echo '<strong>' . ucfirst($prov) . ':</strong> ' . implode(', ', array_keys($models)) . '<br>';
    }
    echo '</p>';
}

/**
 * Frontend enabled field
 */
function cae_frontend_enabled_callback() {
    $settings = get_option('cae_settings', []);
    $enabled = isset($settings['frontend_enabled']) ? $settings['frontend_enabled'] : true;
    
    echo '<label>';
    echo '<input type="checkbox" name="cae_settings[frontend_enabled]" value="1" ' . checked($enabled, true, false) . '>';
    echo ' ' . __('Enable AI editing on frontend for logged-in editors', 'client-ai-editor');
    echo '</label>';
}

/**
 * Render settings page
 */
function cae_render_settings_page() {
    if (!current_user_can('manage_options')) {
        return;
    }
    
    // Check if settings were saved
    if (isset($_GET['settings-updated'])) {
        add_settings_error(
            'cae_messages',
            'cae_message',
            __('Settings saved successfully', 'client-ai-editor'),
            'success'
        );
    }
    
    settings_errors('cae_messages');
    ?>
    <div class="wrap">
        <h1><?php echo esc_html(get_admin_page_title()); ?></h1>
        
        <form method="post" action="options.php">
            <?php
            settings_fields('cae_settings_group');
            do_settings_sections('client-ai-editor');
            submit_button(__('Save Settings', 'client-ai-editor'));
            ?>
        </form>
        
        <hr>
        
        <h2><?php _e('Usage Instructions', 'client-ai-editor'); ?></h2>
        <ol>
            <li><?php _e('Enter your OpenAI API key above', 'client-ai-editor'); ?></li>
            <li><?php _e('Edit any page with ACF flexible content modules', 'client-ai-editor'); ?></li>
            <li><?php _e('Look for the floating AI chat widget in the bottom-right corner', 'client-ai-editor'); ?></li>
            <li><?php _e('Click a block to target it, or use "Full Page" mode', 'client-ai-editor'); ?></li>
            <li><?php _e('Type your editing instructions and let AI help!', 'client-ai-editor'); ?></li>
        </ol>
        
        <h3><?php _e('Example Prompts', 'client-ai-editor'); ?></h3>
        <ul>
            <li><code>Make this heading more exciting</code></li>
            <li><code>Translate all content to Finnish</code></li>
            <li><code>Rewrite this in a more professional tone</code></li>
            <li><code>Make the CTA more compelling</code></li>
        </ul>
    </div>
    
    <script>
    jQuery(document).ready(function($) {
        $('#cae_test_api').on('click', function() {
            var button = $(this);
            var resultSpan = $('#cae_test_result');
            var apiKey = $('#cae_api_key').val();
            var provider = $('#cae_provider').val();
            var model = $('input[name="cae_settings[model]"]').val();
            
            if (!apiKey) {
                resultSpan.html('<span style="color: #d63638;">⚠️ Please enter an API key</span>');
                return;
            }
            
            button.prop('disabled', true);
            button.text('Testing...');
            resultSpan.html('<span style="color: #666;">⏳ Testing connection...</span>');
            
            $.ajax({
                url: ajaxurl,
                type: 'POST',
                data: {
                    action: 'cae_test_api_connection',
                    api_key: apiKey,
                    provider: provider,
                    model: model,
                    nonce: '<?php echo wp_create_nonce('cae_test_api_nonce'); ?>'
                },
                success: function(response) {
                    button.prop('disabled', false);
                    button.text('<?php echo esc_js(__('Test Connection', 'client-ai-editor')); ?>');
                    
                    if (response.success) {
                        resultSpan.html('<span style="color: #00a32a;">✓ ' + response.data.message + '</span>');
                    } else {
                        resultSpan.html('<span style="color: #d63638;">✗ ' + response.data.message + '</span>');
                    }
                },
                error: function() {
                    button.prop('disabled', false);
                    button.text('<?php echo esc_js(__('Test Connection', 'client-ai-editor')); ?>');
                    resultSpan.html('<span style="color: #d63638;">✗ Connection failed</span>');
                }
            });
        });
    });
    </script>
    <?php
}

/**
 * AJAX handler for testing API connection
 */
add_action('wp_ajax_cae_test_api_connection', 'cae_test_api_connection_handler');

function cae_test_api_connection_handler() {
    // Check permissions and nonce
    if (!current_user_can('manage_options')) {
        wp_send_json_error(['message' => 'Unauthorized']);
        return;
    }
    
    check_ajax_referer('cae_test_api_nonce', 'nonce');
    
    $api_key = isset($_POST['api_key']) ? sanitize_text_field($_POST['api_key']) : '';
    $provider = isset($_POST['provider']) ? sanitize_text_field($_POST['provider']) : 'openai';
    $model = isset($_POST['model']) ? sanitize_text_field($_POST['model']) : 'gpt-5';
    
    if (empty($api_key)) {
        wp_send_json_error(['message' => 'API key is required']);
        return;
    }
    
    // Test the API connection
    try {
        if ($provider === 'openai') {
            $response = wp_remote_post('https://api.openai.com/v1/chat/completions', [
                'timeout' => 15,
                'headers' => [
                    'Authorization' => 'Bearer ' . $api_key,
                    'Content-Type' => 'application/json',
                ],
                'body' => json_encode([
                    'model' => $model,
                    'messages' => [
                        ['role' => 'user', 'content' => 'Hi']
                    ],
                    'max_completion_tokens' => 5
                ])
            ]);
        } elseif ($provider === 'anthropic') {
            $response = wp_remote_post('https://api.anthropic.com/v1/messages', [
                'timeout' => 15,
                'headers' => [
                    'x-api-key' => $api_key,
                    'anthropic-version' => '2023-06-01',
                    'Content-Type' => 'application/json',
                ],
                'body' => json_encode([
                    'model' => $model,
                    'max_tokens' => 5,
                    'messages' => [
                        ['role' => 'user', 'content' => 'Hi']
                    ]
                ])
            ]);
        } else {
            wp_send_json_error(['message' => 'Unsupported provider']);
            return;
        }
        
        if (is_wp_error($response)) {
            wp_send_json_error(['message' => 'Connection error: ' . $response->get_error_message()]);
            return;
        }
        
        $status_code = wp_remote_retrieve_response_code($response);
        $body = json_decode(wp_remote_retrieve_body($response), true);
        
        if ($status_code === 200) {
            wp_send_json_success([
                'message' => 'Connection successful! API is working correctly.'
            ]);
        } else {
            $error_message = 'API Error (Status ' . $status_code . ')';
            
            if (isset($body['error']['message'])) {
                $error_message .= ': ' . $body['error']['message'];
            } elseif (isset($body['error'])) {
                if (is_array($body['error']) && isset($body['error']['type'])) {
                    $error_message .= ': ' . $body['error']['type'];
                } elseif (is_string($body['error'])) {
                    $error_message .= ': ' . $body['error'];
                }
            }
            
            wp_send_json_error(['message' => $error_message]);
        }
    } catch (Exception $e) {
        wp_send_json_error(['message' => 'Error: ' . $e->getMessage()]);
    }
}

