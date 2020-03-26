import {format} from 'prettier';

const checkValue = input => input.value !== '';

export default class DigitInput {
    static _enteringDigits(input) {
        const validVal = input.value.replace(/\D/gi, '');
        const nextInput = input.nextElementSibling;
        const prevInput = input.previousElementSibling;
        let latch = false;

        validVal.length === 1 ? (latch = false) : (latch = true);
        input.value = validVal;

        if (latch && validVal.length > 1) {
            let exist = nextInput ? true : false;

            if (exist && validVal[1]) {
                nextInput.disabled = false;
                nextInput.value = validVal[1];
                input.value = validVal[0];
                nextInput.focus();
                nextInput.selectionStart = nextInput.selectionEnd =
                    nextInput.value.length;
            }
        } else if (latch && input && validVal.length === 0) {
            let exist = prevInput ? true : false;

            if (exist) {
                input.disabled = true;
                prevInput.focus();
            }
        }
    }

    static init() {
        const from = document.querySelector('.form');
        const inputs = [...from.getElementsByClassName('input')];
        let initialValue;
        from.reset();
        from.addEventListener(
            'keyup',
            e => {
                let key = e.keyCode || e.charCode;
                if (key === 9) return e.preventDefault();
            },
            false
        );

        from.addEventListener('paste', e => e.preventDefault(), false);
        from.addEventListener('cut', e => e.preventDefault(), false);

        format.addEventListener(
            'focus',
            function(e) {
                const curInput = e.target.closest('.input');

                if (!curInput) return;

                curInput.selectionStart = curInput.selectionEnd =
                    curInput.value.length;
            },
            false
        );

        from.addEventListener('input', function(e) {
            const curInput = e.target;

            DigitInput._enteringDigits(curInput);

            if (inputs.every(checkValue)) {
                initialValue = '';

                inputs.forEach(input => {
                    initialValue += input.value;
                    input.blur();
                });

                console.log(initialValue);
            }
        });
    }
}
