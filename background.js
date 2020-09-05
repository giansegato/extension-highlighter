function iconUpdate(url) {
    _HASH_KEY = url.split("?")[0].hashCode().toString();
    enabled_key = _HASH_KEY + "-" + _ENABLED_KEY;

    chrome.storage.local.get({[ enabled_key ]: true}, function(result) {
        console.log(result[enabled_key]);
        const icon = result[enabled_key] ? '/images/active_72.png' : '/images/inactive_72.png';
        // chrome.pageAction.setIcon({ tabId, path: icon });
        chrome.browserAction.setIcon({path: icon});
    });
}


chrome.tabs.onActivated.addListener(function(activeInfo) {
    // how to fetch tab url using activeInfo.tabid
    chrome.tabs.get(activeInfo.tabId, function(tab) {
        if (tab.url) {
            iconUpdate(tab.url);
        }
    });
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (changeInfo.url) {
        iconUpdate(changeInfo.url);
    }
});

chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    console.log("Received" + JSON.stringify(request));
    if (request[_MESSAGE_COMMAND] === _MESSAGE_COMMAND_REFRESH) {
        chrome.tabs.query({
            active: true
        }, function(tabs) {
            if (tabs.length === 0) {
                return;
            }
            if (tabs[0].url) {
                iconUpdate(tabs[0].url);
            }
        });
    } else {
        console.log("Unknown command");
    }
});
