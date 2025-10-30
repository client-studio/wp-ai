/**
 * Diff Modal Component
 */
import { createElement, useState } from '@wordpress/element';
import { applyChanges } from '../lib/api';

export function DiffModal( { changes, currentData, postId, onClose, onApply } ) {
	const [ isApplying, setIsApplying ] = useState( false );

	if ( ! changes ) {
		return null;
	}

	const handleApply = async () => {
		setIsApplying( true );
		try {
			await onApply( changes );
			onClose();
		} catch ( error ) {
			console.error( 'Failed to apply changes:', error );
			alert( 'Failed to apply changes. Please try again.' );
		} finally {
			setIsApplying( false );
		}
	};

	const renderFieldDiff = ( fieldName, oldValue, newValue ) => {
		return createElement(
			'div',
			{ className: 'cae-diff-field', key: fieldName },
			createElement( 'div', { className: 'cae-diff-field-name' }, fieldName ),
			createElement(
				'div',
				{ className: 'cae-diff-comparison' },
				createElement(
					'div',
					{ className: 'cae-diff-side cae-diff-old' },
					createElement( 'div', { className: 'cae-diff-side-label' }, 'Before' ),
					createElement( 'div', { 
						className: 'cae-diff-side-content',
						dangerouslySetInnerHTML: { __html: oldValue || '<em>(empty)</em>' }
					})
				),
				createElement(
					'div',
					{ className: 'cae-diff-side cae-diff-new' },
					createElement( 'div', { className: 'cae-diff-side-label' }, 'After (AI)' ),
					createElement( 'div', { 
						className: 'cae-diff-side-content',
						dangerouslySetInnerHTML: { __html: newValue || '<em>(empty)</em>' }
					})
				)
			)
		);
	};

	return createElement(
		'div',
		{ className: 'cae-diff-modal active' },
		createElement(
			'div',
			{ className: 'cae-diff-dialog' },
			createElement(
				'div',
				{ className: 'cae-diff-header' },
				createElement( 'h3', null, 'Review AI Changes' ),
				createElement(
					'button',
					{ className: 'cae-diff-close', onClick: onClose },
					createElement(
						'svg',
						{
							width: 20,
							height: 20,
							viewBox: '0 0 24 24',
							fill: 'none',
							stroke: 'currentColor',
							strokeWidth: 2,
						},
						createElement( 'path', { d: 'M18 6L6 18M6 6l12 12' } )
					)
				)
			),
		createElement(
			'div',
			{ className: 'cae-diff-content' },
			changes.modules
				? // Full page mode - show changes for multiple modules
				  changes.modules.map( ( moduleChange, idx ) =>
						createElement(
							'div',
							{ key: idx, className: 'cae-diff-module-group' },
							createElement(
								'h4',
								{ className: 'cae-diff-module-title' },
								`Module #${ moduleChange.index }`
							),
							Object.keys( moduleChange.fields || {} ).map( ( fieldName ) =>
								renderFieldDiff(
									fieldName,
									currentData?.[ moduleChange.index ]?.[ fieldName ] || '',
									moduleChange.fields[ fieldName ]
								)
							)
						)
				  )
				: // Single block mode - show changes for one block
				  Object.keys( changes.fields || {} ).map( ( fieldName ) =>
						renderFieldDiff(
							fieldName,
							currentData?.[ fieldName ] || '',
							changes.fields[ fieldName ]
						)
				  )
		),
			createElement(
				'div',
				{ className: 'cae-diff-footer' },
				createElement(
					'div',
					{ className: 'cae-diff-info' },
					changes.modules
						? `${ changes.modules.reduce(
								( total, module ) => total + Object.keys( module.fields || {} ).length,
								0
						  ) } change(s) across ${ changes.modules.length } module(s)`
						: `${ Object.keys( changes.fields || {} ).length } change(s) detected`
				),
				createElement(
					'div',
					{ className: 'cae-diff-actions' },
					createElement(
						'button',
						{
							className: 'cae-diff-btn cae-diff-btn-cancel',
							onClick: onClose,
							disabled: isApplying,
						},
						'Cancel'
					),
					createElement(
						'button',
						{
							className: 'cae-diff-btn cae-diff-btn-apply',
							onClick: handleApply,
							disabled: isApplying,
						},
						createElement(
							'svg',
							{
								width: 16,
								height: 16,
								viewBox: '0 0 24 24',
								fill: 'none',
								stroke: 'currentColor',
								strokeWidth: 2,
							},
							createElement( 'polyline', { points: '20 6 9 17 4 12' } )
						),
						isApplying ? 'Applying...' : 'Apply Changes'
					)
				)
			)
		)
	);
}

