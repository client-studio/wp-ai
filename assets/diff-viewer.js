/**
 * AI Block Editor - Diff Viewer
 * Shows before/after comparison with diff highlighting
 */

(function($) {
  'use strict';

  // Create global namespace
  window.CAE_DiffViewer = {
    show: showDiff,
    hide: hideDiff,
  };

  let $modal, currentContext, currentChanges, onApplyCallback;
  let dmp; // diff-match-patch instance

  /**
   * Initialize diff viewer
   */
  function init() {
    // Create modal HTML
    const modalHtml = `
      <div class="cae-diff-modal">
        <div class="cae-diff-dialog">
          <div class="cae-diff-header">
            <h3>Review AI Changes</h3>
            <button class="cae-diff-close">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>
          <div class="cae-diff-content"></div>
          <div class="cae-diff-footer">
            <div class="cae-diff-info"></div>
            <div class="cae-diff-actions">
              <button class="cae-diff-btn cae-diff-btn-cancel">Cancel</button>
              <button class="cae-diff-btn cae-diff-btn-apply">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                Apply Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    $modal = $(modalHtml).appendTo('body');

    // Initialize diff-match-patch
    if (typeof diff_match_patch !== 'undefined') {
      dmp = new diff_match_patch();
    }

    // Bind events
    $modal.on('click', '.cae-diff-close, .cae-diff-btn-cancel', hideDiff);
    $modal.on('click', '.cae-diff-btn-apply', applyChanges);
    $modal.on('click', function(e) {
      if ($(e.target).hasClass('cae-diff-modal')) {
        hideDiff();
      }
    });

    // ESC key to close
    $(document).on('keydown', function(e) {
      if (e.key === 'Escape' && $modal.hasClass('active')) {
        hideDiff();
      }
    });
  }

  /**
   * Show diff modal
   */
  function showDiff(context, changes, onApply) {
    if (!$modal) {
      init();
    }

    currentContext = context;
    currentChanges = changes;
    onApplyCallback = onApply;

    // Render diff
    renderDiff();

    // Show modal
    $modal.addClass('active');
  }

  /**
   * Hide diff modal
   */
  function hideDiff() {
    $modal.removeClass('active');
    currentContext = null;
    currentChanges = null;
    onApplyCallback = null;
  }

  /**
   * Render diff content
   */
  function renderDiff() {
    const $content = $modal.find('.cae-diff-content');
    $content.empty();

    if (currentChanges.mode === 'page') {
      // Multiple blocks
      renderPageDiff($content);
    } else {
      // Single block
      renderBlockDiff($content, currentContext, currentChanges);
    }

    // Update info
    const changeCount = countChanges();
    $modal.find('.cae-diff-info').text(`${changeCount} change${changeCount !== 1 ? 's' : ''} detected`);
  }

  /**
   * Render page diff (multiple blocks)
   */
  function renderPageDiff($container) {
    if (!currentChanges.blocks || currentChanges.blocks.length === 0) {
      $container.html('<div class="cae-diff-no-change">No changes to display</div>');
      return;
    }

    currentChanges.blocks.forEach(change => {
      const blockContext = currentContext.blocks.find(b => b.index === change.index);
      
      if (!blockContext) return;

      const $block = $('<div class="cae-diff-block">');
      $block.append(`<h4 class="cae-diff-block-title">Block ${change.index + 1}: ${blockContext.layout}</h4>`);
      
      renderFields($block, blockContext.fields, change.fields);
      
      $container.append($block);
    });
  }

  /**
   * Render single block diff
   */
  function renderBlockDiff($container, context, changes) {
    const $block = $('<div class="cae-diff-block">');
    $block.append(`<h4 class="cae-diff-block-title">${context.layout}</h4>`);
    
    renderFields($block, context.fields, changes.fields);
    
    $container.append($block);
  }

  /**
   * Render field comparisons
   */
  function renderFields($container, oldFields, newFields) {
    if (!newFields || Object.keys(newFields).length === 0) {
      $container.append('<div class="cae-diff-no-change">No changes to fields</div>');
      return;
    }

    Object.keys(newFields).forEach(fieldName => {
      const oldValue = oldFields[fieldName] || '';
      const newValue = newFields[fieldName] || '';

      // Skip if no change
      if (oldValue === newValue) {
        return;
      }

      const $field = $('<div class="cae-diff-field">');
      $field.append(`<div class="cae-diff-field-name">${fieldName}</div>`);

      // Render comparison
      if (dmp && typeof oldValue === 'string' && typeof newValue === 'string') {
        // Use diff-match-patch for inline diff
        const $inline = renderInlineDiff(oldValue, newValue);
        $field.append($inline);
      } else {
        // Side-by-side comparison
        const $comparison = renderSideBySide(oldValue, newValue);
        $field.append($comparison);
      }

      $container.append($field);
    });
  }

  /**
   * Render inline diff
   */
  function renderInlineDiff(oldText, newText) {
    const diffs = dmp.diff_main(oldText, newText);
    dmp.diff_cleanupSemantic(diffs);

    let html = '';
    
    diffs.forEach(diff => {
      const [op, text] = diff;
      const escaped = $('<div>').text(text).html();
      
      if (op === 1) {
        // Addition
        html += '<ins>' + escaped + '</ins>';
      } else if (op === -1) {
        // Deletion
        html += '<del>' + escaped + '</del>';
      } else {
        // Unchanged
        html += escaped;
      }
    });

    return $('<div class="cae-diff-inline">').html(html);
  }

  /**
   * Render side-by-side comparison
   */
  function renderSideBySide(oldValue, newValue) {
    const $comparison = $('<div class="cae-diff-comparison">');
    
    // Old value
    const $old = $('<div class="cae-diff-side cae-diff-old">');
    $old.append('<div class="cae-diff-side-label">Before</div>');
    $old.append('<div class="cae-diff-side-content">' + escapeHtml(oldValue) + '</div>');
    
    // New value
    const $new = $('<div class="cae-diff-side cae-diff-new">');
    $new.append('<div class="cae-diff-side-label">After (AI)</div>');
    $new.append('<div class="cae-diff-side-content">' + escapeHtml(newValue) + '</div>');
    
    $comparison.append($old, $new);
    
    return $comparison;
  }

  /**
   * Apply changes
   */
  function applyChanges() {
    if (onApplyCallback) {
      hideDiff();
      onApplyCallback(currentChanges);
    }
  }

  /**
   * Count total changes
   */
  function countChanges() {
    let count = 0;

    if (currentChanges.mode === 'page') {
      currentChanges.blocks.forEach(block => {
        count += Object.keys(block.fields || {}).length;
      });
    } else {
      count = Object.keys(currentChanges.fields || {}).length;
    }

    return count;
  }

  /**
   * Escape HTML
   */
  function escapeHtml(text) {
    if (typeof text !== 'string') {
      text = String(text);
    }
    return $('<div>').text(text).html();
  }

  // Initialize on document ready
  $(document).ready(init);

})(jQuery);

