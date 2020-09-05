chrome.tabs.query({
    active: true,
    currentWindow: true
}, function(tabs) {

    _CURRENT_URL = tabs[0].url.split("?")[0];
    _HASH_KEY = _CURRENT_URL.hashCode().toString();

    highlights_key = highlights_key();
    enabled_key = options_key();

    console.log("Landed on " + _CURRENT_URL + " and keys are " + highlights_key + ", " + enabled_key);


    let enable_switch = document.getElementById('switch');
    let export_btn = document.getElementById('export');

    function sync_button() {
        if (_ENABLED) {
            enable_switch.innerText = "Disable for this page";
            enable_switch.style.backgroundColor = "#EE5533";
            enable_switch.style.color = "#ffffff";
        } else {
            enable_switch.innerText = "Enable for this page";
            enable_switch.style.backgroundColor = "#334455";
            enable_switch.style.color = "#FFFFFF";
        }
    }

    function set_enabled(value, callback) {
        _ENABLED = value;
        chrome.storage.local.set({
            [enabled_key]: _ENABLED
        }, function() {
            console.log('Value is set to ' + JSON.stringify(_ENABLED));
            sync_button();
            if (callback) {
                callback();
            }
        });
    }


    chrome.storage.local.get({[ enabled_key ]: true}, function(result) {
        _ENABLED = result[enabled_key];
        console.log('Value currently is ' + JSON.stringify(_ENABLED));
        sync_button();
    });

    export_btn.onclick = function(element) {
        chrome.storage.local.get({[ highlights_key ]: []}, function(result) {
            highlights = result[highlights_key];
            highlights.forEach((item, index, arr) => {
                arr[index] = item['text'];
            });
            console.log('Value currently is ' + JSON.stringify(_HIGHLIGHTS));
            export_result = "#Article, source: [link](" + _CURRENT_URL + ")\n\n" + highlights.join("\n\n");
            toClipboard(
                export_result,
                "text/plain"
            );
            window.close();
        });
    };

    enable_switch.onclick = function(element) {

        // Remove all the highlights, if present
        // and refresh
        callback = () => {

            sync_button();

            chrome.tabs.query({
                active: true,
                currentWindow: true
            }, function(tabs) {
                chrome.tabs.sendMessage(
                    tabs[0].id, {
                        [_MESSAGE_COMMAND]: _MESSAGE_COMMAND_ERASE
                    });
            });

            chrome.runtime.sendMessage({
                [_MESSAGE_COMMAND]: _MESSAGE_COMMAND_REFRESH
            });

        };


        // Was enabled, must switch to disabled
        if (_ENABLED) {

            console.log("Switching off");
            set_enabled(false, callback);

        } else {
            // Was disabled and must switch to enabled

            console.log("Switching on");
            set_enabled(true, callback);

        }

    };

});
