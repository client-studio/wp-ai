/**
 * Block targeting hook
 */
import { useState, useEffect, useCallback } from '@wordpress/element';
import { TARGET_MODES } from '../lib/constants';

export function useBlockTarget() {
	const [ targetBlock, setTargetBlock ] = useState( null );
	const [ targetMode, setTargetMode ] = useState( TARGET_MODES.NONE );

	useEffect( () => {
		// Frontend: Click on blocks with data-ai-block attribute
		const handleBlockClick = ( e ) => {
			const block = e.target.closest( '[data-ai-block]' );
			if ( block ) {
				const index = parseInt( block.dataset.aiBlock, 10 );
				const layout = block.dataset.aiLayout;
				const postId = block.dataset.aiPostId;
				
				setTargetBlock( { index, layout, postId } );
				setTargetMode( TARGET_MODES.SINGLE );
				
				// Highlight the block
				document.querySelectorAll( '.client-module' ).forEach( ( el ) => {
					el.classList.remove( 'cae-block-targeted' );
				} );
				block.classList.add( 'cae-block-targeted' );
			}
		};

		const handleHover = ( e ) => {
			const block = e.target.closest( '[data-ai-block]' );
			if ( block ) {
				block.classList.add( 'cae-block-hover' );
			}
		};

		const handleMouseLeave = ( e ) => {
			const block = e.target.closest( '[data-ai-block]' );
			if ( block ) {
				block.classList.remove( 'cae-block-hover' );
			}
		};

		// Admin: Listen for ACF button clicks
		const handleACFBlockSelect = ( e ) => {
			const detail = e.detail;
			if ( detail ) {
				setTargetBlock( {
					index: detail.index,
					layout: detail.layout,
					postId: detail.postId || window.CAE_Data?.postId,
				} );
				setTargetMode( TARGET_MODES.SINGLE );
			}
		};

		document.addEventListener( 'click', handleBlockClick );
		document.addEventListener( 'mouseover', handleHover );
		document.addEventListener( 'mouseout', handleMouseLeave );
		document.addEventListener( 'cae:selectBlock', handleACFBlockSelect );

		return () => {
			document.removeEventListener( 'click', handleBlockClick );
			document.removeEventListener( 'mouseover', handleHover );
			document.removeEventListener( 'mouseout', handleMouseLeave );
			document.removeEventListener( 'cae:selectBlock', handleACFBlockSelect );
		};
	}, [] );

	const setPageMode = useCallback( () => {
		setTargetBlock( null );
		setTargetMode( TARGET_MODES.PAGE );
		
		// Remove all highlights
		document.querySelectorAll( '.client-module' ).forEach( ( el ) => {
			el.classList.remove( 'cae-block-targeted' );
		} );
	}, [] );

	const clearTarget = useCallback( () => {
		setTargetBlock( null );
		setTargetMode( TARGET_MODES.NONE );
		
		document.querySelectorAll( '.client-module' ).forEach( ( el ) => {
			el.classList.remove( 'cae-block-targeted' );
		} );
	}, [] );

	return {
		targetBlock,
		targetMode,
		setTargetBlock,
		setPageMode,
		clearTarget,
	};
}

