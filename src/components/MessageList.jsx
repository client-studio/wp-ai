/**
 * Message List Component
 */
import { createElement, useEffect, useRef } from '@wordpress/element';
import { Message } from './Message';

export function MessageList( { messages, isLoading } ) {
	const messagesEndRef = useRef( null );

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView( { behavior: 'smooth' } );
	};

	useEffect( () => {
		scrollToBottom();
	}, [ messages, isLoading ] );

	return createElement(
		'div',
		{ className: 'cae-messages' },
		// Welcome message
		createElement(
			'div',
			{ className: 'cae-message cae-message-system' },
			createElement(
				'div',
				{ className: 'cae-message-content' },
				createElement( 'p', null, '👋 Hello! I can help you edit your content.' ),
				createElement( 'p', null, createElement( 'strong', null, 'Quick tips:' ) ),
				createElement(
					'ul',
					null,
					createElement( 'li', null, 'Click a block to select it, or use "Full Page" mode' ),
					createElement( 'li', null, 'Tell me what you want to change' ),
					createElement( 'li', null, 'Review the changes before applying' )
				)
			)
		),
		// Chat messages
		messages.map( ( msg ) =>
			createElement( Message, {
				key: msg.id,
				role: msg.role,
				content: msg.content,
			} )
		),
		// Loading indicator
		isLoading &&
			createElement(
				'div',
				{ className: 'cae-message cae-message-loading' },
				createElement(
					'div',
					{ className: 'cae-message-content' },
					createElement(
						'div',
						{ className: 'cae-typing-indicator' },
						createElement( 'span', null ),
						createElement( 'span', null ),
						createElement( 'span', null )
					),
					createElement( 'span', null, 'Thinking...' )
				)
			),
		// Scroll anchor
		createElement( 'div', { ref: messagesEndRef } )
	);
}

