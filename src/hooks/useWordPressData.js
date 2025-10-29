/**
 * Hook for WordPress data access
 */
import { useState, useEffect } from '@wordpress/element';

export function useWordPressData() {
	const [ postId, setPostId ] = useState( null );
	const [ mode, setMode ] = useState( 'frontend' );

	useEffect( () => {
		// Get data from localized script
		const data = window.CAE_Data || {};
		
		if ( data.postId ) {
			setPostId( data.postId );
		}
		
		if ( data.mode ) {
			setMode( data.mode );
		}
	}, [] );

	return { postId, mode };
}

