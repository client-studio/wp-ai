<?php
/**
 * Chat widget HTML template
 * Rendered in both admin and frontend
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}
?>

<div id="cae-chat-widget" class="cae-collapsed" data-mode="<?php echo is_admin() ? 'admin' : 'frontend'; ?>">
    <!-- Minimized state - floating button -->
    <button class="cae-toggle-btn" aria-label="Toggle AI Editor">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2L2 7l10 5 10-5-10-5z"/>
            <path d="M2 17l10 5 10-5"/>
            <path d="M2 12l10 5 10-5"/>
        </svg>
        <span class="cae-badge" style="display:none;">1</span>
    </button>
    
    <!-- Expanded state - chat interface -->
    <div class="cae-chat-container">
        <div class="cae-chat-header">
            <div class="cae-header-left">
                <h3>AI Editor (beta)</h3>
            </div>
            <div class="cae-header-right">
                <button class="cae-clear-btn" title="Clear conversation" aria-label="Clear conversation">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
                    </svg>
                </button>
                <button class="cae-minimize-btn" aria-label="Minimize">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M19 12H5"/>
                    </svg>
                </button>
            </div>
        </div>
        
        <div class="cae-target-indicator">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <circle cx="12" cy="12" r="6"/>
                <circle cx="12" cy="12" r="2"/>
            </svg>
            <span class="cae-target-text">No block selected</span>
            <button class="cae-target-page-btn" title="Edit full page">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="3" width="18" height="18" rx="2"/>
                </svg>
                Full Page
            </button>
        </div>
        
        <div class="cae-messages">
            <div class="cae-message cae-message-system">
                <div class="cae-message-content">
                    <p>👋 Hello! I can help you edit your content.</p>
                    <p><strong>Quick tips:</strong></p>
                    <ul>
                        <li>Click a block to select it, or use "Full Page" mode</li>
                        <li>Tell me what you want to change</li>
                        <li>Review the changes before applying</li>
                    </ul>
                </div>
            </div>
        </div>
        
        <div class="cae-input-container">
            <textarea 
                class="cae-input" 
                placeholder="Type your editing instructions..."
                rows="3"
                aria-label="AI prompt input"
            ></textarea>
            <button class="cae-send-btn" aria-label="Send">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
                </svg>
            </button>
        </div>
    </div>
</div>

