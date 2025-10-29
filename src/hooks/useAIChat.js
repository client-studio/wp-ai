/**
 * Wrapper around Vercel AI SDK's useChat hook
 * Integrates with WordPress and handles ACF block context
 */
import { useChat } from 'ai/react';
import { useEffect, useMemo } from '@wordpress/element';

export function useAIChat( { blockContext, postId, onShowDiff } ) {
	const {
		messages: rawMessages,
		input,
		handleInputChange,
		handleSubmit: originalHandleSubmit,
		isLoading,
		stop,
		setInput,
	} = useChat( {
		api: `${ window.CAE_Data?.ajaxUrl || '/wp-admin/admin-ajax.php' }?action=cae_streaming_chat`,
		body: {
			blockContext,
			postId,
			nonce: window.CAE_Data?.nonce || '',
			language: window.CAE_Data?.language || null,
			languageName: window.CAE_Data?.languageName || null,
		},
		onFinish: ( message ) => {
			// Check if the response contains JSON changes
			try {
				// Try to match JSON starting with { and ending with }
				// Handle both single block {"fields": ...} and full page {"modules": [...]}
				let jsonMatch = null;
				let changes = null;
				
				// Try to find and extract valid JSON
				const content = message.content;
				const startIdx = content.indexOf( '{' );
				
				if ( startIdx !== -1 ) {
					// Found opening brace, try to find matching closing brace
					let braceCount = 0;
					let endIdx = -1;
					
					for ( let i = startIdx; i < content.length; i++ ) {
						if ( content[ i ] === '{' ) braceCount++;
						if ( content[ i ] === '}' ) braceCount--;
						
						if ( braceCount === 0 ) {
							endIdx = i;
							break;
						}
					}
					
					if ( endIdx !== -1 ) {
						jsonMatch = content.substring( startIdx, endIdx + 1 );
						changes = JSON.parse( jsonMatch );
						
						// Check if it's valid changes format
						if ( ( changes.fields || changes.modules ) && onShowDiff ) {
							onShowDiff( changes );
						}
					}
				}
			} catch ( e ) {
				// No JSON changes, just conversational
				console.error( 'Failed to parse JSON from AI response:', e );
			}
		},
	} );

	// Process messages to remove JSON and show only conversational part
	const messages = useMemo( () => {
		return rawMessages.map( ( message ) => {
			if ( message.role === 'assistant' ) {
				// Check if message contains JSON
				const content = message.content;
				const startIdx = content.indexOf( '{' );
				
				if ( startIdx !== -1 ) {
					// Find matching closing brace
					let braceCount = 0;
					let endIdx = -1;
					
					for ( let i = startIdx; i < content.length; i++ ) {
						if ( content[ i ] === '{' ) braceCount++;
						if ( content[ i ] === '}' ) braceCount--;
						
						if ( braceCount === 0 ) {
							endIdx = i;
							break;
						}
					}
					
					if ( endIdx !== -1 ) {
						// Extract everything before and after the JSON
						const beforeJSON = content.substring( 0, startIdx ).trim();
						const afterJSON = content.substring( endIdx + 1 ).trim();
						const conversationalPart = ( beforeJSON + ' ' + afterJSON ).trim();
						
						return {
							...message,
							content: conversationalPart || '✓ Changes ready for review.',
						};
					}
				}
			}
			return message;
		} );
	}, [ rawMessages ] );

	// Wrapper to handle form submission
	const handleSubmit = ( e ) => {
		e?.preventDefault();
		if ( input.trim() && ! isLoading ) {
			originalHandleSubmit( e );
		}
	};

	return {
		messages,
		input,
		handleSubmit,
		isLoading,
		setInput: ( value ) => {
			// Handle both string values and synthetic events
			if ( typeof value === 'string' ) {
				setInput( value );
			} else {
				handleInputChange( value );
			}
		},
		stop,
	};
}
