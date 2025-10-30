/**
 * ACF Integration - Add AI Edit buttons to flexible content rows
 */
(function($) {
    'use strict';

    /**
     * Add AI edit button to each ACF flexible content row
     */
    function addAIButtonsToACFRows() {
        // Find the "modules" flexible content field specifically
        const $modulesField = $('.acf-field[data-name="modules"] .acf-flexible-content');
        
        if ($modulesField.length === 0) {
            return;
        }
        
        // Find all rows within the modules field
        $modulesField.find('.layout').each(function(index) {
            const $row = $(this);
            const $handle = $row.find('.acf-fc-layout-handle').first();
            
            // Skip if button already added
            if ($row.find('.cae-acf-edit-btn').length > 0) {
                return;
            }
            
            // Get layout name
            const layoutName = $row.attr('data-layout') || 'Block';
            
            // Create AI edit button
            const $button = $('<button>', {
                'class': 'cae-acf-edit-btn',
                'type': 'button',
                'title': 'Edit with AI',
                'data-block-index': index,
                'data-layout': layoutName
            }).html(`
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                    <path d="M2 17l10 5 10-5"/>
                    <path d="M2 12l10 5 10-5"/>
                </svg>
                <span>AI Edit</span>
            `);
            
            // Add click handler
            $button.on('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                const blockIndex = $(this).data('block-index');
                const layout = $(this).data('layout');
                
                // Trigger custom event that React can listen to
                const event = new CustomEvent('cae:selectBlock', {
                    detail: {
                        index: blockIndex,
                        layout: layout,
                        postId: CAE_Data.postId
                    }
                });
                
                document.dispatchEvent(event);
                
                // Highlight the row
                $('.acf-flexible-content .layout').removeClass('cae-acf-selected');
                $row.addClass('cae-acf-selected');
                
                // Scroll widget into view if needed
                const widget = document.getElementById('cae-chat-widget');
                if (widget && !widget.classList.contains('cae-expanded')) {
                    // Open the chat widget
                    const toggleBtn = widget.querySelector('.cae-toggle-btn');
                    if (toggleBtn) {
                        toggleBtn.click();
                    }
                }
            });
            
            // Append button to handle
            $handle.append($button);
        });
    }
    
    /**
     * Initialize on page load
     */
    $(document).ready(function() {
        // Initial add
        addAIButtonsToACFRows();
        
        // Re-add when new rows are added
        // ACF doesn't have a good event system, so we use MutationObserver
        if (typeof MutationObserver !== 'undefined') {
            const observer = new MutationObserver(function(mutations) {
                mutations.forEach(function(mutation) {
                    if (mutation.addedNodes.length) {
                        // Delay to let ACF finish rendering
                        setTimeout(addAIButtonsToACFRows, 100);
                    }
                });
            });
            
            // Observe the modules flexible content container specifically
            const modulesField = document.querySelector('.acf-field[data-name="modules"] .acf-flexible-content');
            if (modulesField) {
                observer.observe(modulesField, {
                    childList: true,
                    subtree: true
                });
            }
        }
    });
    
})(jQuery);

