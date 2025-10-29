/**
 * Individual Message Component
 */
import { createElement } from '@wordpress/element';

export function Message( { role, content } ) {
	return createElement(
		'div',
		{ className: `cae-message cae-message-${ role }` },
		createElement(
			'div',
			{ className: 'cae-message-content' },
			content
		)
	);
}

