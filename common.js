console.log("Commons started");

Object.defineProperty(String.prototype, 'hashCode', {
    value: function() {
        var hash = 0,
            i, chr;
        for (i = 0; i < this.length; i++) {
            chr = this.charCodeAt(i);
            hash = ((hash << 5) - hash) + chr;
            hash |= 0; // Convert to 32bit integer
        }
        return hash;
    }
});

_CURRENT_URL = location.href.split("?")[0];
_HASH_KEY = _CURRENT_URL.hashCode().toString();

_HIGHLIGHT_KEY = "highlights";
_ENABLED_KEY = "enabled";

_HIGHLIGHTS = [];
_ENABLED = true;

_MESSAGE_COMMAND = 'command';
_MESSAGE_COMMAND_ERASE = 'erase';
_MESSAGE_COMMAND_REFRESH = 'refresh';

_KEY_MAP = {};


function highlights_key() {
    return _HASH_KEY + "-" + _HIGHLIGHT_KEY;
}

function options_key() {
    return _HASH_KEY + "-" + _ENABLED_KEY;
}

toClipboard = function(str, mimeType) {
    document.oncopy = function(event) {
        event.clipboardData.setData(mimeType, str);
        event.preventDefault();
    };
    document.execCommand("copy", false, null);
};

