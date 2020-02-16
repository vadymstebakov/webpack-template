import SymbolSprite from './components/SymbolSprite';
import json from '../assets/json.json';

console.log(json);

// Set symbol sprite
let symbolSprite = new SymbolSprite(
	'../images/symbol-sprite/symbol-sprite.html'
);
symbolSprite.toInject();

// Resize function
(function fnResize() {
	let doit;

	function resized() {}

	window.onresize = () => {
		clearTimeout(doit);
		doit = setTimeout(resized, 50);
	};
})();
