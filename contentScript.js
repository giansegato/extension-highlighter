highlights_key = highlights_key();
enabled_key = options_key();

console.log("Landed on " + _CURRENT_URL + " and keys are " + highlights_key + ", " + enabled_key);


function save(callback) {

    saved_object = {
        [highlights_key]: _HIGHLIGHTS,
    };
    chrome.storage.local.set(saved_object, function() {
        console.log('Value is set to ' + JSON.stringify(saved_object));
        if (callback) {
            callback();
        }
    });
}

function revert(batch_mode=false) {
    reverted = _HIGHLIGHTS.pop();
    document.body.innerHTML = document.body.innerHTML.replace("<span class=\"hb_highlight\">" + reverted.raw + "</span>", reverted.raw);
    if (batch_mode) {
        return;
    }
    save();
}

function erase() {

    if (_HIGHLIGHTS.length === 0) {
        return;
    }

    if (!confirm("You sure mate?")) {
        return;
    }

    while (_HIGHLIGHTS.length > 0) {
        revert(true);
    }

    save();
}

function highlight(text) {
    if (!text) {
        console.log('invalid high');
        return;
    }
    console.log('high ' + text);
    var innerHTML = document.body.innerHTML;
    var index = innerHTML.indexOf(text);
    if (index >= 0) {
        innerHTML = innerHTML.substring(0, index) + "<span class=\"hb_highlight\">" + innerHTML.substring(index, index + text.length) + "</span>" + innerHTML.substring(index + text.length);
        document.body.innerHTML = innerHTML;
    }
}

function saveText(raw, text) {
    _HIGHLIGHTS.push({
        raw: raw,
        text: text
    });
    save();
}

function restoreCache() {
    chrome.storage.local.get({[ enabled_key ]: true}, function(result) {
        _ENABLED = result[enabled_key];
        console.log('Options enables currently is ' + JSON.stringify(_ENABLED));
    });

    chrome.storage.local.get({[ highlights_key ]: []}, function(result) {
        _HIGHLIGHTS = result[highlights_key];
        _HIGHLIGHTS.forEach(item => highlight(item['raw']));
        console.log('Highlights value currently is ' + JSON.stringify(_HIGHLIGHTS));
    });

}


function getSelectionHtml() {
    var html = "";
    if (typeof window.getSelection != "undefined") {
        var sel = window.getSelection();
        if (sel.rangeCount) {
            var container = document.createElement("div");
            for (var i = 0, len = sel.rangeCount; i < len; ++i) {
                container.appendChild(sel.getRangeAt(i).cloneContents());
            }
            html = container.innerHTML;
        }
    } else if (typeof document.selection != "undefined") {
        if (document.selection.type == "Text") {
            html = document.selection.createRange().htmlText;
        }
    }
    return html;
}


onkeydown = onkeyup = function(event) {
    if (!_ENABLED) {
        return;
    }

    _KEY_MAP[event.keyCode] = event.type == 'keydown';

    if (event.isComposing || event.target.tagName === "INPUT" || event.target.tagName === "BUTTON") {
        return;
    }

    if (event.keyCode === 69) { // e
        text = window.getSelection().toString().trim();
        raw = getSelectionHtml(); //.replace("’", "&rsquo;");
        if (!text) {
            console.log("Invalid selection: " + text);
            return;
        }

        do {
            trim_html_end = raw.match(/<([a-zA-Z/="_-\s]+)>$/);
            if (trim_html_end) {
                raw = raw.substring(0, trim_html_end.index);
            }
            trim_html_first = raw.match(/^<([a-zA-Z/="_-\s]+)>/);
            if (trim_html_first) {
                raw = raw.substring(trim_html_first[0].length);
            }
            raw = raw.trim();
            trim_html = (trim_html_first || trim_html_end);
        } while (trim_html);

        highlight(raw);
        saveText(raw, text);
    }

    if (_KEY_MAP[17] && _KEY_MAP[81]) { // CTRL+Q
        erase();
        _KEY_MAP = {};
    }

    if (_KEY_MAP[17] && _KEY_MAP[87]) { // CTRL+W
        revert();
        _KEY_MAP = {};
    }

};

chrome.runtime.onMessage.addListener(message => {
    console.log(message);

    if (_MESSAGE_COMMAND in message) {
        if (message[_MESSAGE_COMMAND] === _MESSAGE_COMMAND_ERASE) {
            _HIGHLIGHTS = [];
            save(
                () => {
                    console.log("Saved fresh highlights.");
                    location.href = location.href;
                }
            );
        } else {
            console.log("Unknown command.");
        }
    }
});

// Start here.

restoreCache();

