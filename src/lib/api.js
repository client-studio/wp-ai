/**
 * WordPress AJAX API helpers
 */

/**
 * Make WordPress AJAX request
 */
export async function wpAjax( action, data = {} ) {
	const formData = new FormData();
	formData.append( 'action', action );
	formData.append( 'nonce', window.CAE_Data?.nonce || '' );

	Object.keys( data ).forEach( ( key ) => {
		if ( typeof data[ key ] === 'object' ) {
			formData.append( key, JSON.stringify( data[ key ] ) );
		} else {
			formData.append( key, data[ key ] );
		}
	} );

	const response = await fetch( window.CAE_Data?.ajaxUrl || '/wp-admin/admin-ajax.php', {
		method: 'POST',
		body: formData,
	} );

	return response.json();
}

/**
 * Get block data
 */
export async function getBlockData( postId, blockIndex ) {
	return wpAjax( 'cae_get_block', { post_id: postId, block_index: blockIndex } );
}

/**
 * Get all page blocks
 */
export async function getPageBlocks( postId ) {
	return wpAjax( 'cae_get_page_blocks', { post_id: postId } );
}

/**
 * Apply changes to post
 */
export async function applyChanges( postId, changes ) {
	return wpAjax( 'cae_apply', { post_id: postId, changes } );
}

