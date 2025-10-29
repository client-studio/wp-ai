/**
 * AI Block Editor - Chat Widget
 * Handles chat UI, block targeting, and AI communication
 */

(function($) {
  'use strict';

  // State management
  const state = {
    targetMode: 'none', // 'none', 'single', 'page'
    targetBlockIndex: null,
    targetBlockLayout: null,
    conversation: [],
    isProcessing: false,
    postId: null,
  };

  // DOM elements
  let $widget, $messages, $input, $sendBtn, $targetText, $targetPageBtn;

  /**
   * Initialize widget
   */
  function init() {
    $widget = $('#cae-chat-widget');
    if (!$widget.length) return;

    // Get post ID
    if (typeof CAE_Context !== 'undefined' && CAE_Context.postId) {
      state.postId = CAE_Context.postId;
    } else if ($('body').hasClass('post-type-page') || $('body').hasClass('post-type-post')) {
      // Try to get from admin
      const urlParams = new URLSearchParams(window.location.search);
      state.postId = urlParams.get('post') || $('#post_ID').val();
    }

    // Cache DOM elements
    $messages = $widget.find('.cae-messages');
    $input = $widget.find('.cae-input');
    $sendBtn = $widget.find('.cae-send-btn');
    $targetText = $widget.find('.cae-target-text');
    $targetPageBtn = $widget.find('.cae-target-page-btn');

    // Bind events
    bindEvents();

    // Initialize block targeting
    if (CAE_Context.mode === 'frontend') {
      initFrontendTargeting();
    } else {
      initAdminTargeting();
    }
  }

  /**
   * Bind UI events
   */
  function bindEvents() {
    // Toggle widget
    $widget.on('click', '.cae-toggle-btn', function() {
      $widget.removeClass('cae-collapsed').addClass('cae-expanded');
      $input.focus();
    });

    // Minimize widget
    $widget.on('click', '.cae-minimize-btn', function() {
      $widget.removeClass('cae-expanded').addClass('cae-collapsed');
    });

    // Clear conversation
    $widget.on('click', '.cae-clear-btn', function() {
      if (confirm('Clear conversation history?')) {
        clearConversation();
      }
    });

    // Full page mode
    $widget.on('click', '.cae-target-page-btn', function() {
      togglePageMode();
    });

    // Send message
    $widget.on('click', '.cae-send-btn', function() {
      sendMessage();
    });

    // Send on Enter (Shift+Enter for new line)
    $input.on('keydown', function(e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });
  }

  /**
   * Initialize frontend block targeting
   */
  function initFrontendTargeting() {
    // Add click handlers to blocks
    $(document).on('click', '.client-module[data-ai-block]', function(e) {
      e.stopPropagation();
      const index = parseInt($(this).attr('data-ai-block'));
      const layout = $(this).attr('data-ai-layout');
      targetBlock(index, layout);
      
      // Expand widget if collapsed
      if ($widget.hasClass('cae-collapsed')) {
        $widget.removeClass('cae-collapsed').addClass('cae-expanded');
      }
    });

    // Add hover effects
    $(document).on('mouseenter', '.client-module[data-ai-block]', function() {
      $(this).addClass('cae-block-hover');
    });

    $(document).on('mouseleave', '.client-module[data-ai-block]', function() {
      $(this).removeClass('cae-block-hover');
    });

    // Clear target on outside click
    $(document).on('click', function(e) {
      if (!$(e.target).closest('.client-module, #cae-chat-widget').length) {
        clearTarget();
      }
    });
  }

  /**
   * Initialize admin block targeting
   */
  function initAdminTargeting() {
    // Wait for ACF to load
    if (typeof acf === 'undefined') {
      setTimeout(initAdminTargeting, 500);
      return;
    }

    // Add click handlers to ACF rows
    $(document).on('click', '.acf-flexible-content .acf-row', function(e) {
      if ($(e.target).closest('.acf-actions, .acf-fc-layout-controls').length) {
        return; // Ignore clicks on ACF controls
      }

      const $row = $(this);
      const $table = $row.closest('.acf-table');
      const index = $table.find('.acf-row').index($row);
      const layout = $row.data('layout');

      targetBlock(index, layout);

      // Expand widget if collapsed
      if ($widget.hasClass('cae-collapsed')) {
        $widget.removeClass('cae-collapsed').addClass('cae-expanded');
      }
    });
  }

  /**
   * Target a specific block
   */
  function targetBlock(index, layout) {
    state.targetMode = 'single';
    state.targetBlockIndex = index;
    state.targetBlockLayout = layout;

    // Update UI
    $targetText.text(`Block ${index + 1}: ${layout}`);
    $widget.find('.cae-target-indicator').addClass('cae-has-target');
    $targetPageBtn.removeClass('active');

    // Highlight block (frontend)
    if (CAE_Context.mode === 'frontend') {
      $('.client-module').removeClass('cae-block-targeted');
      $(`.client-module[data-ai-block="${index}"]`).addClass('cae-block-targeted');
    }
  }

  /**
   * Clear block target
   */
  function clearTarget() {
    state.targetMode = 'none';
    state.targetBlockIndex = null;
    state.targetBlockLayout = null;

    // Update UI
    $targetText.text('No block selected');
    $widget.find('.cae-target-indicator').removeClass('cae-has-target');
    $targetPageBtn.removeClass('active');

    // Remove highlights
    if (CAE_Context.mode === 'frontend') {
      $('.client-module').removeClass('cae-block-targeted');
    }
  }

  /**
   * Toggle full page mode
   */
  function togglePageMode() {
    if (state.targetMode === 'page') {
      clearTarget();
    } else {
      state.targetMode = 'page';
      state.targetBlockIndex = null;
      state.targetBlockLayout = null;

      // Update UI
      $targetText.text('Full Page Mode');
      $widget.find('.cae-target-indicator').addClass('cae-has-target');
      $targetPageBtn.addClass('active');

      // Remove block highlights
      if (CAE_Context.mode === 'frontend') {
        $('.client-module').removeClass('cae-block-targeted');
      }
    }
  }

  /**
   * Send message to AI
   */
  function sendMessage() {
    const prompt = $input.val().trim();
    
    if (!prompt || state.isProcessing) {
      return;
    }

    // Check if target is set
    if (state.targetMode === 'none') {
      addMessage('error', 'Please select a block or enable "Full Page" mode first.');
      return;
    }

    // Check if post ID is available
    if (!state.postId) {
      addMessage('error', 'Could not determine the post ID. Please save the post first.');
      return;
    }

    // Add user message
    addMessage('user', prompt);
    $input.val('');
    state.isProcessing = true;
    $sendBtn.prop('disabled', true);

    // Add loading message
    const $loading = addMessage('loading', 'Thinking...');

    // Get block context and process
    getContext()
      .then(context => processAI(prompt, context))
      .then(result => {
        $loading.remove();
        handleAIResponse(result);
      })
      .catch(error => {
        $loading.remove();
        addMessage('error', error.message || 'An error occurred. Please try again.');
      })
      .finally(() => {
        state.isProcessing = false;
        $sendBtn.prop('disabled', false);
      });
  }

  /**
   * Get context for AI request
   */
  function getContext() {
    return new Promise((resolve, reject) => {
      if (state.targetMode === 'page') {
        // Get all blocks
        $.ajax({
          url: CAE_Ajax.ajaxUrl,
          type: 'POST',
          data: {
            action: 'cae_get_page_blocks',
            nonce: CAE_Ajax.nonce,
            post_id: state.postId,
          },
          success: function(response) {
            if (response.success) {
              resolve({
                mode: 'page',
                blocks: response.data.blocks,
              });
            } else {
              reject(new Error(response.data.message || 'Failed to get page blocks'));
            }
          },
          error: function() {
            reject(new Error('AJAX request failed'));
          },
        });
      } else {
        // Get single block
        $.ajax({
          url: CAE_Ajax.ajaxUrl,
          type: 'POST',
          data: {
            action: 'cae_get_block',
            nonce: CAE_Ajax.nonce,
            post_id: state.postId,
            block_index: state.targetBlockIndex,
          },
          success: function(response) {
            if (response.success) {
              resolve({
                mode: 'single',
                block_index: state.targetBlockIndex,
                layout: response.data.layout,
                fields: response.data.fields,
              });
            } else {
              reject(new Error(response.data.message || 'Failed to get block data'));
            }
          },
          error: function() {
            reject(new Error('AJAX request failed'));
          },
        });
      }
    });
  }

  /**
   * Process AI request
   */
  function processAI(prompt, context) {
    return new Promise((resolve, reject) => {
      $.ajax({
        url: CAE_Ajax.ajaxUrl,
        type: 'POST',
        data: {
          action: 'cae_process',
          nonce: CAE_Ajax.nonce,
          prompt: prompt,
          context: JSON.stringify(context),
        },
        success: function(response) {
          if (response.success) {
            resolve(response.data);
          } else {
            reject(new Error(response.data.message || 'AI processing failed'));
          }
        },
        error: function() {
          reject(new Error('AJAX request failed'));
        },
      });
    });
  }

  /**
   * Handle AI response - show diff viewer
   */
  function handleAIResponse(aiResult) {
    addMessage('ai', 'I have some suggestions for you. Review the changes below:');

    // Prepare changes based on mode
    let changes;
    
    if (state.targetMode === 'page') {
      // Page mode - multiple blocks
      changes = {
        mode: 'page',
        blocks: aiResult.fields ? [{
          index: state.targetBlockIndex,
          fields: aiResult.fields,
        }] : [],
      };
    } else {
      // Single block mode
      changes = {
        mode: 'single',
        block_index: state.targetBlockIndex,
        layout: state.targetBlockLayout,
        fields: aiResult.fields || {},
      };
    }

    // Show diff viewer
    if (typeof CAE_DiffViewer !== 'undefined') {
      getContext().then(context => {
        CAE_DiffViewer.show(context, changes, function() {
          // On apply
          applyChanges(changes);
        });
      });
    }
  }

  /**
   * Apply changes to post
   */
  function applyChanges(changes) {
    const $loading = addMessage('loading', 'Applying changes...');

    $.ajax({
      url: CAE_Ajax.ajaxUrl,
      type: 'POST',
      data: {
        action: 'cae_apply',
        nonce: CAE_Ajax.nonce,
        post_id: state.postId,
        changes: JSON.stringify(changes),
      },
      success: function(response) {
        $loading.remove();
        
        if (response.success) {
          addMessage('ai', '✓ Changes applied successfully! ' + response.data.message);
          
          // Reload page after a delay
          setTimeout(function() {
            location.reload();
          }, 1500);
        } else {
          addMessage('error', response.data.message || 'Failed to apply changes');
        }
      },
      error: function() {
        $loading.remove();
        addMessage('error', 'Failed to apply changes. Please try again.');
      },
    });
  }

  /**
   * Add message to chat
   */
  function addMessage(type, content) {
    let html = '<div class="cae-message cae-message-' + type + '">';
    html += '<div class="cae-message-content">';
    
    if (type === 'loading') {
      html += '<div class="cae-typing-indicator">';
      html += '<span></span><span></span><span></span>';
      html += '</div>';
      html += '<span>' + content + '</span>';
    } else {
      html += '<p>' + content + '</p>';
    }
    
    html += '</div></div>';
    
    const $msg = $(html);
    $messages.append($msg);
    
    // Scroll to bottom
    $messages.scrollTop($messages[0].scrollHeight);
    
    return $msg;
  }

  /**
   * Clear conversation
   */
  function clearConversation() {
    state.conversation = [];
    $messages.find('.cae-message').not('.cae-message-system').remove();
  }

  // Initialize on document ready
  $(document).ready(init);

})(jQuery);

