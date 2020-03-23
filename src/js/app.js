import ID from 'generator-unique-id';
// import SymbolSprite from './components/SymbolSprite';
import initUiSelect from './components/multiSelect';
import Resize from './components/Resize';
// import json from '../assets/json.json';

// Inject symbol sprite
// SymbolSprite.inject('./../images/symbol-sprite/symbol-sprite.html');

if (document.querySelectorAll('.ui-select').length) {
    [...document.querySelectorAll('.ui-select')].forEach((select, i, arr) => {
        select.style.setProperty('--z-index', arr.length - i);
        select.id = ID();
        initUiSelect(select.id);
    });
}

// Resize function
Resize.init();
