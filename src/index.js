/**
 * AI Block Editor v2 - Entry Point
 */
import { render, createElement } from '@wordpress/element';
import { ChatWidget } from './components/ChatWidget';
import './style.css';

// Wait for DOM to be ready
document.addEventListener( 'DOMContentLoaded', () => {
	// Create container for React app
	const container = document.createElement( 'div' );
	container.id = 'cae-react-root';
	document.body.appendChild( container );

	// Render React app
	render( createElement( ChatWidget ), container );
} );

