import * as $ from 'jquery';
import * as Swiper from 'swiper/js/swiper';
import Post from './models/Post';
import init from './example';

init();
let post = new Post('Learning Webpack');

$('pre').html(`${post.toString()}`);

function createAnalytics() {
	let counter = 0;
	let destroyed = false;

	const listener = () => counter++;

	document.addEventListener('click', listener);

	return {
		destroy() {
			document.removeEventListener('click', listener);
			destroyed = true;
		},

		getClicks() {
			if (destroyed) {
				return `Analytics is destroyed. Total clicks = ${counter}`;
			}
			return counter;
		},
	};
}

window.analytics = createAnalytics();

new Swiper('.swiper-container', {
	spaceBetween: 40,
});

$('.swiper-slide').css({
	'background-image': 'url("images/webpack-logo.png")',
	'background-repeat': 'no-repeat',
	'background-position': 'center center',
	'background-size': 'contain',
});
