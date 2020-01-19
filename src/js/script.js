import * as $ from 'jquery';
import * as Swiper from 'swiper/js/swiper';
import Post from './models/Post';
import './../images/webpack-logo.png';
import './../styles/styles.css';

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
    }
  };
}

window.analytics = createAnalytics();

new Swiper('.swiper-container', {
	spaceBetween: 40
});
