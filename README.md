# LaTeX Hinter for CodeMirror

This is a hinter function for use with [CodeMirror](https://codemirror.net)'s [showHint.js](https://codemirror.net/doc/manual.html#addon_show-hint) plugin. This is based on [TeXStudio](https://github.com/texstudio-org/texstudio)'s autocompletion mechanism.

# Features
Pressing `tab` allows users to move to the next argument of a macro. It also highlights user input in the list of matched hints.

<img href="https://github.com/jun-sheaf/codemirror-latex-hint/raw/master/demo_media/demo.gif" height="50px"></img>

# Installation
```
npm install codemirror-latex-hint codemirror
```

# To Use
```javascript
import LaTeXHint from "codemirror-latex-hint";
import macros from "codemirror-latex-hint/macros.json";

CodeMirror.registerHelper("hint", "stex", (cm) => LaTeXHint(cm, macros));
```

# Customization
The list of macros in the package contains all MathJaX macros and environments. You can import your own list of macros (with the format given in `macros.json`) rather than the packaged one.