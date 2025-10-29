/**
 * Main Chat Widget Component
 */
import { createElement, useState, useCallback } from '@wordpress/element';
import { useAIChat } from '../hooks/useAIChat';
import { useBlockTarget } from '../hooks/useBlockTarget';
import { useWordPressData } from '../hooks/useWordPressData';
import { MessageList } from './MessageList';
import { ChatInput } from './ChatInput';
import { TargetIndicator } from './TargetIndicator';
import { DiffModal } from './DiffModal';
import { getBlockData, applyChanges } from '../lib/api';
import { TARGET_MODES } from '../lib/constants';

export function ChatWidget() {
	const [ isExpanded, setIsExpanded ] = useState( false );
	const [ showDiff, setShowDiff ] = useState( false );
	const [ pendingChanges, setPendingChanges ] = useState( null );
	const [ currentData, setCurrentData ] = useState( null );

	const { postId, mode } = useWordPressData();
	const { targetBlock, targetMode, setPageMode, clearTarget } = useBlockTarget();

	const handleShowDiff = useCallback(
		async ( changes ) => {
			setPendingChanges( changes );

			// Fetch current data to show in diff
			if ( targetBlock ) {
				// Single block mode
				try {
					const result = await getBlockData( postId, targetBlock.index );
					if ( result.success ) {
						setCurrentData( result.data.fields );
					}
				} catch ( error ) {
					console.error( 'Failed to fetch current block data:', error );
					setCurrentData( {} );
				}
			} else if ( changes.modules ) {
				// Full page mode - fetch all affected modules
				try {
					const currentModulesData = {};
					for ( const moduleChange of changes.modules ) {
						const result = await getBlockData( postId, moduleChange.index );
						if ( result.success ) {
							currentModulesData[ moduleChange.index ] = result.data.fields;
						}
					}
					setCurrentData( currentModulesData );
				} catch ( error ) {
					console.error( 'Failed to fetch page blocks data:', error );
					setCurrentData( {} );
				}
			} else {
				setCurrentData( {} );
			}

			setShowDiff( true );
		},
		[ postId, targetBlock ]
	);

	const { messages, input, handleSubmit, isLoading, setInput, stop } = useAIChat( {
		blockContext: targetBlock,
		postId,
		onShowDiff: handleShowDiff,
	} );

	const handleApplyChanges = useCallback(
		async ( changes ) => {
			try {
				let changesPayload;
				
				if ( changes.modules ) {
					// Full page mode - multiple modules
					changesPayload = {
						mode: 'page',
						blocks: changes.modules,
					};
				} else {
					// Single block mode
					changesPayload = {
						mode: 'single',
						block_index: targetBlock?.index,
						fields: changes.fields,
					};
				}

				const result = await applyChanges( postId, changesPayload );

				if ( result.success ) {
					// Show compilation status if applicable
					if ( result.data?.compiled ) {
						console.log( '✓ Static blocks recompiled' );
					}
					
					// Reload page to show updated content
					// Shorter timeout for better UX, compilation already done
					setTimeout( () => {
						window.location.reload();
					}, 500 );
				} else {
					throw new Error( result.data?.message || 'Failed to apply changes' );
				}
			} catch ( error ) {
				console.error( 'Apply changes error:', error );
				throw error;
			}
		},
		[ postId, targetBlock, targetMode ]
	);

	const handleMinimize = () => {
		setIsExpanded( false );
	};

	const handleClear = () => {
		if ( confirm( 'Clear conversation history?' ) ) {
			window.location.reload();
		}
	};

	return createElement(
		'div',
		{
			id: 'cae-chat-widget',
			className: isExpanded ? 'cae-expanded' : 'cae-collapsed',
		},
		// Toggle button (minimized state)
		! isExpanded &&
			createElement(
				'button',
				{
					className: 'cae-toggle-btn',
					onClick: () => setIsExpanded( true ),
					'aria-label': 'Toggle AI Editor',
				},
				createElement(
					'svg',
					{
						width: 24,
						height: 24,
						viewBox: '0 0 24 24',
						fill: 'none',
						stroke: 'currentColor',
						strokeWidth: 2,
					},
					createElement( 'path', { d: 'M12 2L2 7l10 5 10-5-10-5z' } ),
					createElement( 'path', { d: 'M2 17l10 5 10-5' } ),
					createElement( 'path', { d: 'M2 12l10 5 10-5' } )
				)
			),

		// Chat container (expanded state)
		isExpanded &&
			createElement(
				'div',
				{ className: 'cae-chat-container' },
				// Header
				createElement(
					'div',
					{ className: 'cae-chat-header' },
					createElement(
						'div',
						{ className: 'cae-header-left' },
						createElement( 'h3', null, 'AI Editor (beta)' )
					),
					createElement(
						'div',
						{ className: 'cae-header-right' },
						createElement(
							'button',
							{
								className: 'cae-clear-btn',
								onClick: handleClear,
								title: 'Clear conversation',
								'aria-label': 'Clear conversation',
							},
							createElement(
								'svg',
								{
									width: 18,
									height: 18,
									viewBox: '0 0 24 24',
									fill: 'none',
									stroke: 'currentColor',
									strokeWidth: 2,
								},
								createElement( 'path', {
									d: 'M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2',
								} )
							)
						),
						createElement(
							'button',
							{
								className: 'cae-minimize-btn',
								onClick: handleMinimize,
								'aria-label': 'Minimize',
							},
							createElement(
								'svg',
								{
									width: 18,
									height: 18,
									viewBox: '0 0 24 24',
									fill: 'none',
									stroke: 'currentColor',
									strokeWidth: 2,
								},
								createElement( 'path', { d: 'M19 12H5' } )
							)
						)
					)
				),

				// Target indicator
				createElement( TargetIndicator, {
					targetBlock,
					targetMode,
					onSetPageMode: setPageMode,
				} ),

				// Messages
				createElement( MessageList, {
					messages,
					isLoading,
				} ),

				// Input
				createElement( ChatInput, {
					value: input,
					onChange: setInput,
					onSubmit: handleSubmit,
					disabled: targetMode === TARGET_MODES.NONE,
					isLoading,
				} )
			),

		// Diff Modal
		showDiff &&
			createElement( DiffModal, {
				changes: pendingChanges,
				currentData,
				postId,
				onClose: () => setShowDiff( false ),
				onApply: handleApplyChanges,
			} )
	);
}

