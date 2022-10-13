class Calculator {
    constructor(inputTextElement, previewTextElement) {
        this.inputTextElement = inputTextElement;
        this.previewTextElement = previewTextElement;
        this.clear();
        this.updateDisplay();
    }

    clear() {
        this.input = '';
        this.preview = '';
    }

    delete() {
        this.input = this.input.slice(0, -1);
    }

    append(character) {
        this.input = this.input.toString() + character.toString();
    }

    appendOperator(operator) {
        // only append if last character is a number
        // if ending in decimal point then remove it first
        if (this.input.slice(-1) == '.') { this.input = this.input.slice(0, -1) }
        if (/[0-9.\)]/.test(this.input.slice(-1))) {
            if (operator == '+/-') {
                this.invertCurrentNumber();
            } else {
                this.append(operator)
            }
        }
    }

    invertCurrentNumber() {
        // find start of current number, check symbol before it, add or switch symbol as needed
        let match = this.input.match(/[^0-9.]/gi) || -1;
        let lastSymbolIndex = this.input.lastIndexOf(match[match.length-1]);

        if (lastSymbolIndex == -1) {
            this.input = '-' + this.input;
        } else if (lastSymbolIndex == 0 && this.input[lastSymbolIndex] == '-') {
            this.input = this.input.slice(1);
        } else if (this.input[lastSymbolIndex] == '-') {
            this.input = this.input.slice(0, lastSymbolIndex) + '+' + this.input.slice(lastSymbolIndex + 1);
        } else if (this.input[lastSymbolIndex] == '+') {
            this.input = this.input.slice(0, lastSymbolIndex) + '-' + this.input.slice(lastSymbolIndex + 1);
        } else {
            this.input = this.input.slice(0, lastSymbolIndex) + '-' + this.input.slice(lastSymbolIndex);
        }
    }

    isBalanced (input) {
        let brackets = "()"
        let stack = []
    
        for(let bracket of input) {
        let bracketsIndex = brackets.indexOf(bracket)
    
        if (bracketsIndex === -1){
            continue
        }
    
        if(bracketsIndex % 2 === 0) {
            stack.push(bracketsIndex + 1)
        } else {
            if(stack.pop() !== bracketsIndex) {
            return false;
            }
        }
        }
        return stack.length === 0
    }


    appendParentheses() {
        // remove hanging decimal points
        if (this.input.slice(-1) == '.') { this.input = this.input.slice(0, -1) }

        // if ending with a number and unbalanced then close
        // if balanced or ends with operator then open
        if (/[0-9.]/.test(this.input.slice(-1)) && !this.isBalanced(this.input)) {
            this.append(')');
        } else if (this.isBalanced(this.input) || !(/[0-9.]/.test(this.input.slice(-1)))) {
            //  insert multiplication if no operator is present
            if (/[0-9.]/.test(this.input.slice(-1))) { this.append("×") }
            this.append('(');
        }
    }

    calculatePreview() {
        // only evaluate if input ends in a number
        this.input = this.input.toString();

        if (this.input == '') {
            this.preview = ''
        } else if (/[0-9.\)]/.test(this.input.slice(-1)) && this.input.length > 0) {
            // sanitize: replace unicode symbols with compatible operators, close parentheses, then eval() input
            let calc = this.input.split('').map((e) => {
                if (e == '÷') { return '\/' }
                if (e == '×') { return '\*' }
                return e;
            }).join('');

            while (!this.isBalanced(calc)) {
                calc = calc + ')';
            }

            if (calc || calc == 0) {
                this.preview =  Evaluate.exec(calc);
                this.fixColors();
            } else {
                this.preview = '';
            }
        }
    }

    compute() {
        this.input = this.preview;
        this.preview = '';
        this.inputTextElement.innerText = this.input;
        this.previewTextElement.innerText = this.preview;
        this.input = '';
    }

    updateDisplay() {
        this.inputTextElement.innerText = this.input;
        this.calculatePreview();
        this.previewTextElement.innerText = this.preview;
        this.resizeText();
        this.fixColors();
    }

    resizeText() {
        let characters = (this.input.length);
        if (characters <= 11) {
            this.changeInputClass('one-line');
        } else if (characters <= 30) {
            this.changeInputClass('two-lines');
        } else if (characters <= 66) {
            this.changeInputClass('three-lines');
        } else {
            this.changeInputClass('more-lines');
        }
    }

    changeInputClass(className) {
        const classList = ['one-line', 'two-lines', 'three-lines', 'more-lines'];
        classList.forEach(a => this.inputTextElement.classList.remove(a));
        this.inputTextElement.classList.add(className);
    }

    fixColors() {
        // change colors of operations to mach color scheme, find with regex
        this.inputTextElement.innerHTML = this.inputTextElement.innerText.split('').map((e) => {
            if (/[()%÷×+\-]/.test(e)) {
                return '<span class="operations">'+e+'</span>';
            } else {
                return e;
            }
        }).join('');
        this.previewTextElement.innerHTML = this.previewTextElement.innerText.split('').map((e) => {
            if (/[()%÷×+\-]/.test(e)) {
                return '<span class="operations">'+e+'</span>';
            } else {
                return e;
            }
        }).join('');
    }
}

const Evaluate = new BigEval();

const numberButtons = document.querySelectorAll('[data-number]');
const operationButtons = document.querySelectorAll('[data-operation]');
const equalsButton = document.querySelector('[data-equals]');
const deleteButton = document.querySelector('[data-delete]');
const clearButton = document.querySelector('[data-clear]');
const parenthesesButton = document.querySelector('[data-parentheses]');
const inputTextElement = document.querySelector('[data-input]');
const previewTextElement = document.querySelector('[data-preview]');

const calculator = new Calculator(inputTextElement, previewTextElement);

numberButtons.forEach(button => {
    button.addEventListener('click', () => {
        calculator.append(button.innerText);
        calculator.updateDisplay();
    })
})

operationButtons.forEach(button => {
    button.addEventListener('click', () => {
        calculator.appendOperator(button.innerText);
        calculator.updateDisplay();
    })
})

parenthesesButton.addEventListener('click', () => {
    calculator.appendParentheses();
    calculator.updateDisplay();
})

deleteButton.addEventListener('click', () => {
    calculator.delete();
    calculator.updateDisplay();
})

clearButton.addEventListener('click', () => {
    calculator.clear();
    calculator.updateDisplay();
})

equalsButton.addEventListener('click', () => {
    calculator.compute();
})