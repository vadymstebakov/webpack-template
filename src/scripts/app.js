import SymbolSprite from './components/SymbolSprite';
import Popups from './components/Popups';
import Resize from './components/Resize';
// import json from '../assets/json.json';

// Inject symbol sprite
SymbolSprite.inject('./../images/symbol-sprite/symbol-sprite.html', 24);

// Resize function
Resize.init();

// Popups
{
    const popups = document.querySelectorAll('.popup');

    if (popups.length) {
        Popups.init(popups);
    }
}
