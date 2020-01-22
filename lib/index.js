"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const codemirror_1 = __importDefault(require("codemirror"));
require("codemirror/addon/hint/show-hint");
/**
 * Binary operation that compares Positions by library order
 * @param left Left Position
 * @param right Right Position
 */
const comparePos = (left, right) => {
    if (left.line < right.line) {
        return true;
    }
    else if (left.line > right.line) {
        return false;
    }
    else if (left.ch < right.ch) {
        return true;
    }
    else if (left.ch > right.ch) {
        return false;
    }
    else
        return false;
};
/**
 * The rendering function for when the hint IS chosen.
 * @param cm CodeMirror instance
 * @param self The list of LaTeX macros closest to user input
 * @param data A LaTeX macro
 */
const intelliSense = (cm, self, data) => {
    const { text } = data;
    const dissectedSnippet = [];
    let snipPart = "";
    for (let i = 0; i < text.length; i++) {
        if (text[i] === "#") {
            dissectedSnippet.push(snipPart);
            snipPart = "";
            i++;
        }
        else {
            snipPart += text[i];
        }
    }
    dissectedSnippet.push(snipPart);
    const start = {
        line: self.from.line + (dissectedSnippet[0].match(/\n/g) || []).length,
        ch: self.from.ch + dissectedSnippet[0].length,
    };
    let content = [start.ch];
    const calculateEnd = () => {
        return {
            line: start.line + content.length - 1,
            ch: content[content.length - 1],
        };
    };
    const checkCursorPosition = (cm) => {
        const cursorPos = cm.getCursor();
        if (comparePos(calculateEnd(), cursorPos) || comparePos(cursorPos, start)) {
            stopSnippet();
        }
    };
    const stopSnippet = () => {
        cm.removeKeyMap(moveToNextLocation);
        cm.off("change", setCurrentPosition);
        cm.off("cursorActivity", checkCursorPosition);
    };
    const setCurrentPosition = (cm, { from, text, removed }) => {
        let origin = from.line - start.line;
        if (removed) {
            let len = removed.length - 1;
            if (len > 0) {
                content[origin + len] -= removed[len].length;
                content[origin] += content[origin + len] - removed[0].length;
                content.splice(origin + 1, len);
            }
            else {
                content[origin] -= removed[0].length;
            }
        }
        if (text) {
            let len = text.length - 1;
            if (len > 0) {
                const diff = content[origin] - from.ch;
                content[origin] = content[origin] + text[0].length - diff;
                for (let i = 1; i < len; i++) {
                    content.splice(origin + i, 0, 0);
                    content[origin + i] = content[origin + i] + text[i].length;
                }
                content.splice(origin + len, 0, 0);
                content[origin + len] = content[origin + len] + text[len].length + diff;
            }
            else {
                content[origin] += text[0].length;
            }
        }
    };
    const moveToNextLocation = {
        Tab: (cm) => {
            if (dissectedSnippet.length > 0) {
                let end = calculateEnd();
                start.line = end.line + (dissectedSnippet[0].match(/\n/g) || []).length;
                start.ch = end.ch + dissectedSnippet[0].length;
                content = [start.ch];
                cm.setCursor(start);
            }
            dissectedSnippet.shift();
            if (dissectedSnippet.length === 1) {
                return stopSnippet();
            }
        },
    };
    cm.replaceRange(dissectedSnippet.join(""), data.from || self.from, data.to || self.to, "complete");
    cm.setCursor(calculateEnd());
    if (text.includes("#1")) {
        cm.addKeyMap(moveToNextLocation);
        cm.on("change", setCurrentPosition);
        cm.on("cursorActivity", checkCursorPosition);
    }
    dissectedSnippet.shift();
};
/**
 * The hinter function
 * @param cm CodeMirror instance
 * @param macros A list of LaTeX macros
 */
const LaTeXHint = (cm, macros) => {
    let cur = cm.getCursor();
    let token = cm.getTokenAt(cur);
    let start = token.start;
    let end = cur.ch;
    let word = token.string.slice(0, end - start);
    if (word === "\\\\") {
        cm.state.completionActive.close();
        return {
            list: [],
            from: codemirror_1.default.Pos(cur.line, start),
            to: codemirror_1.default.Pos(cur.line, end),
        };
    }
    if (/[^\w\\]/.test(word)) {
        word = "";
        start = end = cur.ch;
    }
    const hints = {
        list: [],
        from: codemirror_1.default.Pos(cur.line, start),
        to: codemirror_1.default.Pos(cur.line, end),
    };
    if (token.type == "tag") {
        for (const macro of macros) {
            if (!word || macro.text.lastIndexOf(word, 0) === 0) {
                hints.list.push({
                    displayText: macro.text,
                    text: macro.snippet,
                    render: (element, data, cur) => {
                        let entered = element.appendChild(document.createElement("span"));
                        entered.classList.add("CodeMirror-hint-entered");
                        entered.textContent = word;
                        element.appendChild(document.createElement("span")).innerHTML = cur.displayText
                            .slice(word.length)
                            .replace(/(\#[1-9])/g, (_, arg) => `<span class="CodeMirror-hint-arg">${arg}</span>`);
                    },
                    hint: intelliSense,
                });
            }
        }
    }
    return hints;
};
exports.default = LaTeXHint;
//# sourceMappingURL=index.js.map