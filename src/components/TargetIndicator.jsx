/**
 * Target Indicator Component
 */
import { createElement } from '@wordpress/element';
import { TARGET_MODES } from '../lib/constants';

export function TargetIndicator( { targetBlock, targetMode, onSetPageMode } ) {
	const hasTarget = targetMode !== TARGET_MODES.NONE;
	const isPageMode = targetMode === TARGET_MODES.PAGE;
	const language = window.CAE_Data?.languageName || null;

	let targetText = 'No block selected';
	if ( isPageMode ) {
		targetText = 'Full Page Mode';
	} else if ( targetBlock ) {
		targetText = `Block ${ targetBlock.index + 1 }: ${ targetBlock.layout }`;
	}
	
	// Add language indicator if WPML is active
	if ( language ) {
		targetText += ` • ${language}`;
	}

	return createElement(
		'div',
		{ className: `cae-target-indicator ${ hasTarget ? 'cae-has-target' : '' }` },
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
			createElement( 'circle', { cx: 12, cy: 12, r: 10 } ),
			createElement( 'circle', { cx: 12, cy: 12, r: 6 } ),
			createElement( 'circle', { cx: 12, cy: 12, r: 2 } )
		),
		createElement( 'span', { className: 'cae-target-text' }, targetText ),
		createElement(
			'button',
			{
				className: `cae-target-page-btn ${ isPageMode ? 'active' : '' }`,
				onClick: onSetPageMode,
				title: 'Edit full page',
			},
			createElement(
				'svg',
				{
					width: 14,
					height: 14,
					viewBox: '0 0 24 24',
					fill: 'none',
					stroke: 'currentColor',
					strokeWidth: 2,
				},
				createElement( 'rect', { x: 3, y: 3, width: 18, height: 18, rx: 2 } )
			),
			' Full Page'
		)
	);
}

