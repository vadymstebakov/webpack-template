import { EventEmitter } from '@helpers/EventEmitter';
import Popups from '@components/Popups';
import { resizer } from '@helpers/resizer';
import { sleep } from '@helpers/utils';

const emitter = new EventEmitter();

// Popups
{
    const $popups = document.querySelectorAll('.popup');
    if ($popups.length) {
        const popups = new Popups($popups, {});
        popups.init();
    }
}

sleep(5000).then(() => {
    console.log('end');
});

// Resize function
resizer({ emitter, ms: 300 });
