// JSONHttpRequest from "Torben"
// Twitter: https://twitter.com/letorbi
// GitHub: https://github.com/letorbi
// Article: https://pixelsvsbytes.com/2011/12/teach-your-xmlhttprequest-some-json/

function JSONHttpRequest() {
    var _xmlHttpRequest = new XMLHttpRequest();
    var _responseJSON = null;
    var _userContentType = false;
    var _self = this;

    var property = {
        get: function() {
            try {
                _responseJSON = _xmlHttpRequest.responseText ? (!_responseJSON ? JSON.parse(_xmlHttpRequest.responseText) : _responseJSON) : null;
            } catch (e) {
                if (_self.strictJSON) throw e;
            }
            return _responseJSON;
        },
        enumerable: true,
        configurable: true
    };

    _self.strictJSON = true;
    Object.defineProperty(_self, 'responseJSON', property);

    _self.sendJSON = function(data) {
        try {
            data = JSON.stringify(data);
            _responseJSON = null;
            if (!_userContentType) {
                _xmlHttpRequest.setRequestHeader('Content-Type', 'application/json;charset=encoding');
            }
            _userContentType = false;
        } catch (e) {
            if (_self.strictJSON) {
                throw e;
            }
        }
        _xmlHttpRequest.send(data);
    };

    function proxy(name) {
        try {
            if ((typeof _xmlHttpRequest[name]) == 'function') {
                _self[name] = function() {
                    if (name == 'setRequestHeader') _userContentType = arguments[0].toLowerCase() == 'content-type';
                    return _xmlHttpRequest[name].apply(_xmlHttpRequest, Array.prototype.slice.apply(arguments));
                };
            } else {
                property.get = function() {
                    return _xmlHttpRequest[name];
                };
                property.set = function(value) {
                    _xmlHttpRequest[name] = value;
                };
                Object.defineProperty(_self, name, property);
            }
        } catch (e) {
            // NOTE Swallow any exceptions, which may rise here.
        }
    }

    // FIX onreadystatechange is not enumerable [Opera]
    proxy('onreadystatechange');
    for (var n in _xmlHttpRequest) {
    	proxy(n);
    }
}

var WebAPI = {
    tracks: function(id, successCallback, errorCallback) {
        var jhr = new JSONHttpRequest();
        jhr.onreadystatechange = function() {
            if (jhr.readyState === 4) {
                try {
                    if (jhr.responseJSON.error === undefined) {
                        successCallback(jhr.responseJSON);
                    } else {
                        throw new ReferenceError(jhr.responseJSON.error.message);
                    }
                } catch (error) {
                    alert(error.name + ": " + error.message);
                    errorCallback(error.name + ": " + error.message);
                }
            }
        };
        jhr.open('GET', 'https://api.spotify.com/v1/tracks/' + id, true);
        jhr.send();
    },
    playlist: function(id) {
        var jhr = new JSONHttpRequest();
        jhr.onreadystatechange = function() {
            if (jhr.readyState === 4) {
                try {
                    if (jhr.responseJSON.error === undefined) {
                        successCallback(jhr.responseJSON);
                    } else {
                        throw new ReferenceError(jhr.responseJSON.error.message);
                    }
                } catch (error) {
                    alert(error.name + ": " + error.message);
                    errorCallback(error.name + ": " + error.message);
                }
            }
        };
        jhr.open('GET', 'https://api.spotify.com/v1/playlist/' + id, true);
        jhr.send(); //https://play.spotify.com/user/kent1337/playlist/6IjDl5eRczFdgZkKYXhuHZ
    },
    urlToId: function(uri) {
        try {
            if (uri.indexOf('spotify:') !== -1) {
                if (uri.indexOf('spotify:track:') !== -1) {
                    return uri.split('spotify:track:')[1];
                } else {
                    throw new TypeError('The URI does not belong to a track.');
                }
            } else if (uri.indexOf('spotify.com/') !== -1) {
                if (uri.indexOf('spotify.com/track/') !== -1) {
                    return uri.split('spotify.com/track/')[1];
                } else {
                    throw new TypeError('The URI does not belong to a track.');
                }
            } else {
                return uri;
            }
        } catch (error) {
            alert(error.name + ': ' + error.message);
        }
    },
    findTrack: function(q, successCallback, errorCallback) {
        var jhr = new JSONHttpRequest();
        jhr.onreadystatechange = function() {
            if (jhr.readyState === 4) {
                try {
                    if (jhr.responseJSON.error === undefined) {
                        successCallback(jhr.responseJSON);
                    } else {
                        throw new ReferenceError(jhr.responseJSON.error.message);
                    }
                } catch (error) {
                    console.error(error.name + ": " + error.message);
                    errorCallback(error.name + ": " + error.message);
                }
            }
        };
        q = q.replace(/\s/g, '+');
        q = q.replace(/å/g, 'a');
        q = q.replace(/ä/g, 'a');
        q = q.replace(/ö/g, 'o');
        console.debug('https://api.spotify.com/v1/search?q=' + q + '&type=track');
        jhr.open('GET', 'https://api.spotify.com/v1/search?q=' + q + '&type=track', true);
        jhr.send();
    }
};