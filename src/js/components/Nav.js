import {prependChild, rAF} from './customMethods';

const $nav = document.querySelector('nav.greedy');
const $btn = $nav.querySelector('button');
const $vlinks = $nav.querySelector('.links');
const $hlinks = $nav.querySelector('.hidden-links');
const state = {
    breakWidths: [],
    numOfItems: 0,
    totalSpace: 0,
    availableSpace: 0,
    numOfVisibleItems: 0,
    requiredSpace: 0,
};

export default class Nav {
    static check() {
        state.availableSpace = $vlinks.clientWidth;
        state.numOfVisibleItems = $vlinks.children.length;
        state.requiredSpace = state.breakWidths[state.numOfVisibleItems - 1];

        if (state.requiredSpace > state.availableSpace) {
            prependChild($hlinks, $vlinks.lastElementChild);
            state.numOfVisibleItems -= 1;
        } else if (
            state.availableSpace > state.breakWidths[state.numOfVisibleItems]
        ) {
            $vlinks.appendChild($hlinks.firstElementChild);
            state.numOfVisibleItems += 1;
        }

        $btn.setAttribute('count', state.numOfItems - state.numOfVisibleItems);

        state.numOfVisibleItems === state.numOfItems
            ? $btn.classList.add('hidden')
            : $btn.classList.remove('hidden');
    }

    static init() {
        [...$vlinks.children].forEach(link => {
            const style = getComputedStyle(link);
            state.totalSpace +=
                link.offsetWidth +
                parseInt(style.marginLeft) +
                parseInt(style.marginRight);
            state.numOfItems += 1;
            state.breakWidths.push(state.totalSpace);
        });

        Nav.check();

        window.addEventListener('resize', rAF(Nav.check), false);

        $btn.addEventListener('click', function() {
            $hlinks.classList.toggle('hidden');
        });
    }
}
