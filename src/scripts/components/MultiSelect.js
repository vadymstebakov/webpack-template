import ID from 'generator-unique-id';

export default class MultiSelect {
    static init(id) {
        const select = document.getElementById(id);
        const selectInput = select.querySelector(
            '.multiselect__input-inner input'
        );
        const selectInputBtnClear = select.querySelector(
            '.multiselect__input-inner label'
        );
        const selectOptions = select.querySelector('.multiselect__options');
        let selectionValues = [],
            latch = false,
            index;

        selectInput.id = ID();
        selectInputBtnClear.setAttribute('for', selectInput.id);

        /*Disable pressing*/
        selectInput.addEventListener('keydown', e => e.preventDefault(), false);

        /*Toggle select*/
        const closeSelect = () => {
            document.body.addEventListener(
                'click',
                function cb(e) {
                    const target = e.target;

                    if (!select.contains(target)) {
                        select.classList.remove('multiselect--active');
                        this.removeEventListener('click', cb, false);
                        latch = false;
                    }
                },
                false
            );
        };

        selectInput.addEventListener(
            'click',
            () => {
                select.classList.add('multiselect--active');

                if (!latch) {
                    latch = true;
                    closeSelect();
                }
            },
            false
        );

        /*Clear input*/
        selectInputBtnClear.addEventListener(
            'click',
            function(e) {
                !select.classList.contains('multiselect--active') &&
                    e.preventDefault();

                select.querySelector(`#${this.getAttribute('for')}`).value = '';

                [
                    ...select.querySelectorAll(
                        '.multiselect__option input[type="checkbox"]:checked'
                    ),
                ].forEach(checkbox => {
                    checkbox.checked = false;
                    selectionValues = [];
                });

                this.parentNode.classList.remove(
                    'multiselect__input-inner--active'
                );
            },
            false
        );

        /*Add to input*/
        selectOptions.addEventListener(
            'change',
            function(e) {
                const option = e.target.closest('.multiselect__option-label');

                if (!option) return;

                const isChecked = option.querySelector('input[type="checkbox"]')
                    .checked;
                const value = option.querySelector('.multiselect__option-text')
                    .textContent;

                if (!isChecked) {
                    index = selectionValues.indexOf(value);
                    selectionValues.splice(index, 1);
                    selectInput.value = selectionValues.join(', ');

                    !selectInput.value &&
                        selectInputBtnClear.parentNode.classList.remove(
                            'multiselect__input-inner--active'
                        );
                    return;
                }

                selectionValues.push(value);
                selectInput.value = selectionValues.join(', ');

                selectInput.value &&
                    selectInputBtnClear.parentNode.classList.add(
                        'multiselect__input-inner--active'
                    );
            },
            false
        );
    }
}
