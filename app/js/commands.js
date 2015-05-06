module.exports = (function () {
    var remote = require('remote'),
        app = remote.require('app'), // TODO: à entrer dans Abricotine
        shell = require('shell');
    
    return {
        new: function (win, doc) {
            doc.cmdClose();
        },
        open: function (win, doc) {
            doc.cmdOpen();
        },
        save: function (win, doc) {
            doc.cmdSave();
        },
        saveAs: function (win, doc) {
            doc.cmdSaveAs();
        },
        exportHtml: function (win, doc) {
            doc.cmdExportHtml();
        },
        quit: function (win, doc) {
            win.close();
        },
        undo: function (win, doc) {
            doc.editor.execCommand("undo");
        },
        redo: function (win, doc) {
            doc.editor.execCommand("redo");
        },
        copy: function (win, doc) {
            document.execCommand("copy");
        },
        cut: function (win, doc) {
            document.execCommand("cut");
        },
        paste: function (win, doc) {
            document.execCommand("paste");
        },
        find: function (win, doc) {
            doc.editor.execCommand("clearSearch");
            doc.editor.execCommand("find");
        },
        findNext: function (win, doc) {
            doc.editor.execCommand("findNext");
        },
        findPrev: function (win, doc) {
            doc.editor.execCommand("findPrev");
        },
        replace: function (win, doc) {
            // FIXME: very bad UX in codemirror search & replace (it closes after the first replace)
            doc.editor.execCommand("clearSearch");
            doc.editor.execCommand("replace");
        },
        replaceAll: function (win, doc) {
            doc.editor.execCommand("clearSearch");
            doc.editor.execCommand("replaceAll");
        },
        clearSearch: function (win, doc) {
            doc.editor.execCommand("clearSearch");
        },
        selectAll: function (win, doc) {
            doc.editor.execCommand("selectAll");
        },
        editConfigFile: function (win, doc) {
            var userConfigPath = app.getPath('userData') + "/config.json";
            shell.openItem(userConfigPath);
        },
        italic: function (win, doc) {
            doc.editor.toggle("italic");
        },
        bold: function (win, doc) {
            doc.editor.toggle("bold");
        },
        strikethrough: function (win, doc) {
            doc.editor.toggle("strikethrough");
        },
        code: function (win, doc) {
            doc.editor.toggle("code");
        },
        ul: function (win, doc) { // TODO: incohérence de nommage
            doc.editor.toggle("unordered-list");
        },
        ol: function (win, doc) { // TODO: incohérence de nommage
            doc.editor.toggle("ordered-list");
        },
        todo: function (win, doc) { // TODO: incohérence de nommage
            doc.editor.toggle("todo-list");
        },
        quote: function (win, doc) {
            doc.editor.toggle("quote");
        },
        h1: function (win, doc) {
            doc.editor.toggle("h1");
        },
        h2: function (win, doc) {
            doc.editor.toggle("h2");
        },
        h3: function (win, doc) {
            doc.editor.toggle("h3");
        },
        h4: function (win, doc) {
            doc.editor.toggle("h4");
        },
        h5: function (win, doc) {
            doc.editor.toggle("h5");
        },
        h6: function (win, doc) {
            doc.editor.toggle("h6");
        },
        link: function (win, doc) {
            doc.editor.draw("link");
        },
        image: function (win, doc) {
            doc.editor.draw("image");
        },
        hr: function (win, doc) {
            doc.editor.draw("hr");
        },
        preview: function (win, doc) {
            // TODO: à ranger
            var fs = require('fs');
            var dir = app.getPath('temp') + '/abricotine',
                file = 'preview-' + Date.now() + '.html', // TODO: il faudrait plutot un nom de fichier constant (et donc le timestamp est un dir)
                path = dir + '/' + file;
            if (!fs.existsSync(dir)){
                fs.mkdirSync(dir);
            }
            doc.cmdExportHtml(path, function () {
                shell.openExternal('file://' + path);
            });
        },
        showBlocks: function (win, doc) {
            $('body').toggleClass('show-blocks');
            Abricotine.config.showBlocks = $('body').hasClass('show-blocks');
            
        },
        showHiddenCharacters: function (win, doc) {
            $('body').toggleClass('show-hidden-characters');
            Abricotine.config.showHiddenCharacters = $('body').hasClass('show-hidden-characters');
        },
        autoPreviewImages: function(win, doc) {
            var flag = Abricotine.config.autoPreviewImages = !Abricotine.config.autoPreviewImages,
                editor = doc.editor;
            if (flag) {
                editor.execRoutine("imageAutoPreview");
            } else {
                editor.clearMarkers("img");
            }
        },
        autoPreviewTodo: function(win, doc) {
            var flag = Abricotine.config.autoPreviewTodo = !Abricotine.config.autoPreviewTodo,
                editor = doc.editor;
            if (flag) {
                editor.execRoutine("autoPreviewTodo");
            } else {
                editor.clearMarkers("span.checkbox");
            }
        },
        autoHideMenuBar: function (win, doc) {
            var focusedWindow = win,
                flag = focusedWindow.isMenuBarAutoHide();
            focusedWindow.setAutoHideMenuBar(!flag);
            Abricotine.config.autoHideMenuBar = !flag;
        },
        showTocPane: function (win, doc) {
            $('body').toggleClass('pane-visible');
            Abricotine.config.showTocPane = $('body').hasClass('pane-visible');
        },
        toggleFullscreen: function (win, doc) {
            var focusedWindow = win,
                flag = focusedWindow.isFullScreen();
            focusedWindow.setFullScreen(!flag);
            focusedWindow.setMenuBarVisibility(flag);
            // TODO: ESC > exit Fullscreen
        },
        devtools: function (win, doc) {
            win.toggleDevTools();
        },
        reload: function (win, doc) {
            doc.close();
            win.reloadIgnoringCache();
        },
        openConfigDir: function (win, doc) {
            var dirPath = app.getPath('userData');
            shell.openItem(dirPath);
        },
        openTempDir: function (win, doc) {
            var dirPath = app.getPath('temp') + '/abricotine';
            shell.openItem(dirPath);
        },
        openAppDir: function (win, doc) {
            var dirPath = __dirname;
            shell.openItem(dirPath);
        },
        execCommand: function (win, doc) {
            var cm = doc.editor.cm,
                html = "Command: <input type='text'/>",
                callback = function (query) {
                    if (!query) return;
                    Abricotine.execCommand(query);
                };
            cm.openDialog(html, callback);
        },
        pasteAndPreview: function (win, doc) {
            function preview (cm, changeObject) {
                cm.off("change", preview);
                var lines = changeObject.text.length,
                    from = changeObject.from,
                    to = {
                        line: from.line + lines,
                        ch: null
                    }, 
                    element = $(changeObject.text.join("\n")).get(0) ;
                // TODO: redondant, faire une fonction pour preview le HTML
                cm.doc.markText(from, to, {
                    clearOnEnter: true,
                    inclusiveLeft: true,
                    inclusiveRight: true,
                    replacedWith: element
                });
            }
            var cm = doc.editor.cm;
            cm.on("change", preview);
            document.execCommand("paste");
        },
        previewLine: function (win, doc) { // Peut-être à transformer en 'autopreview iframe' >>> faire une func générique qui permette de preview à partir des balises trouvées (iframe, object et autres ?)
            var cm = doc.editor.cm,
                lineNumber = cm.doc.getCursor().line,
                content = cm.getLine(lineNumber),
                from = {
                    line: lineNumber,
                    ch: 0
                },
                to = {
                    line: lineNumber,
                    ch: null
                },
                // element = $(content).get(0); // TODO: il faudrait tester si c'est du html (pour ça on peut utiliser la colo syntaxique de CM). (...) En fait si c'est pas du HTML jquery ne l'interprète pas. Juste le problème en cas de <span>Toto</span><span>Hey !</span> seul le premier élément est interprété à cause du get(0). A ce moment là il faudrait le wrapper dans une div pour avoir tout. Je pense que la modif suivante fait le job :
                element = (function (html) {
                    var e = $(html);
                    if (!e) {
                        return null;
                    }
                    if (e.length > 1) {
                        e = $("<div style='display: inline-block'></div>").append(e);
                    }
                    return e.get(0);
                })(content);
            if (!element) {
                return;
            }
            // Move the cursor at the end of line because markText.clearOnEnter = true
            cm.doc.setCursor({
               line: lineNumber,
                ch: null
            });
            // TODO: redondant, faire une fonction pour preview le HTML
            cm.doc.markText(from, to, {
                clearOnEnter: true,
                inclusiveLeft: false,
                inclusiveRight: false,
                replacedWith: element
            });                
        }
    };
})();