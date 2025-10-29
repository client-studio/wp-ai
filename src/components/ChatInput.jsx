/**
 * Chat Input Component
 */
import { createElement } from '@wordpress/element';

export function ChatInput( { value, onChange, onSubmit, disabled, isLoading } ) {
	const handleSubmit = ( e ) => {
		e.preventDefault();
		if ( ! disabled && ! isLoading && value.trim() ) {
			onSubmit( e );
		}
	};

	const handleKeyDown = ( e ) => {
		if ( e.key === 'Enter' && ! e.shiftKey ) {
			e.preventDefault();
			handleSubmit( e );
		}
	};

	return createElement(
		'div',
		{ className: 'cae-input-container' },
		createElement(
			'form',
			{ onSubmit: handleSubmit },
			createElement( 'textarea', {
				className: 'cae-input',
				placeholder: disabled
					? 'Select a block or enable Full Page mode first...'
					: 'Type your editing instructions...',
				rows: 3,
				value,
				onChange: ( e ) => onChange( e.target.value ),
				onKeyDown: handleKeyDown,
				disabled,
			} ),
			createElement(
				'button',
				{
					type: 'submit',
					className: 'cae-send-btn',
					disabled: disabled || isLoading || ! value.trim(),
					'aria-label': 'Send',
				},
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
					createElement( 'path', {
						d: 'M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z',
					} )
				)
			)
		)
	);
}

