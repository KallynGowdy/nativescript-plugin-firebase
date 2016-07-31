var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var appModule = require("application");
var firebase_common_1 = require("./firebase-common");
var AndroidFirebaseDataSnapshot = (function () {
    function AndroidFirebaseDataSnapshot(snap) {
        this._snap = snap;
    }
    AndroidFirebaseDataSnapshot.prototype.val = function () {
        return Firebase.toJsObject(this._snap.getValue());
    };
    AndroidFirebaseDataSnapshot.prototype.key = function () {
        return this._snap.getKey();
    };
    return AndroidFirebaseDataSnapshot;
})();
exports.AndroidFirebaseDataSnapshot = AndroidFirebaseDataSnapshot;
var AndroidFirebaseAuthData = (function () {
    function AndroidFirebaseAuthData(authData) {
        this.authData = authData;
        this.uid = authData.getUid();
        this.provider = authData.getProvider();
        this.expires = authData.getExpires();
        this.auth = authData.getAuth();
        this.token = authData.getToken();
    }
    return AndroidFirebaseAuthData;
})();
exports.AndroidFirebaseAuthData = AndroidFirebaseAuthData;
var Firebase = (function (_super) {
    __extends(Firebase, _super);
    function Firebase(instance) {
        _super.call(this, instance);
    }
    Firebase.toHashMap = function (obj) {
        var node = new java.util.HashMap();
        for (var property in obj) {
            if (obj.hasOwnProperty(property)) {
                if (obj[property] !== null) {
                    switch (typeof obj[property]) {
                        case 'object':
                            node.put(property, Firebase.toHashMap(obj[property]));
                            break;
                        case 'boolean':
                            node.put(property, java.lang.Boolean.valueOf(String(obj[property])));
                            break;
                        case 'number':
                            if (Number(obj[property]) === obj[property] && obj[property] % 1 === 0)
                                node.put(property, java.lang.Long.valueOf(String(obj[property])));
                            else
                                node.put(property, java.lang.Double.valueOf(String(obj[property])));
                            break;
                        case 'string':
                            node.put(property, String(obj[property]));
                            break;
                    }
                }
            }
        }
        return node;
    };
    ;
    Firebase.toJsObject = function (javaObj) {
        if (javaObj === null || typeof javaObj != "object") {
            return javaObj;
        }
        var node;
        switch (javaObj.getClass().getName()) {
            case 'java.lang.Boolean':
                return Boolean(String(javaObj));
            case 'java.lang.Long':
            case 'java.lang.Double':
                return Number(String(javaObj));
            case 'java.util.ArrayList':
                node = [];
                for (var i = 0; i < javaObj.size(); i++) {
                    node[i] = Firebase.toJsObject(javaObj.get(i));
                }
                break;
            default:
                node = {};
                var iterator = javaObj.entrySet().iterator();
                while (iterator.hasNext()) {
                    var item = iterator.next();
                    switch (item.getClass().getName()) {
                        case 'java.util.HashMap$HashMapEntry':
                            node[item.getKey()] = Firebase.toJsObject(item.getValue());
                            break;
                        case 'java.lang.String':
                            node[item.getKey()] = String(item.getValue());
                            break;
                        case 'java.lang.Boolean':
                            node[item.getKey()] = Boolean(String(item.getValue()));
                            break;
                        case 'java.lang.Long':
                        case 'java.lang.Double':
                            node[item.getKey()] = Number(String(item.getValue()));
                            break;
                        default:
                            node[item.getKey()] = item.getValue();
                    }
                }
        }
        return node;
    };
    ;
    Firebase.getCallbackData = function (snapshot) {
        return new AndroidFirebaseDataSnapshot(snapshot);
    };
    ;
    Firebase.createNew = function (arg) {
        var JavaFirebase = com.firebase.client.Firebase;
        JavaFirebase.setAndroidContext(appModule.android.context);
        // Implementation taken from https://github.com/EddyVerbruggen/nativescript-plugin-firebase
        if (arg.persist !== false && !JavaFirebase.getDefaultConfig().isPersistenceEnabled()) {
            JavaFirebase.getDefaultConfig().setPersistenceEnabled(true);
        }
        else {
            JavaFirebase.getDefaultConfig().setPersistenceEnabled(false);
        }
        var instance = new JavaFirebase(arg.url);
        return new Firebase(instance);
    };
    ;
    Firebase.prototype.login = function (arg) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            try {
                var authorizer = new com.firebase.client.Firebase.AuthResultHandler({
                    onAuthenticated: function (authData) {
                        resolve({
                            uid: authData.getUid(),
                            provider: authData.getProvider(),
                            expiresAtUnixEpochSeconds: authData.getExpires(),
                            profileImageURL: authData.getProviderData().get("profileImageURL"),
                            token: authData.getToken()
                        });
                    },
                    onAuthenticationError: function (firebaseError) {
                        reject(firebaseError.getMessage());
                    }
                });
                var type = arg.type;
                if (type === firebase_common_1.FirebaseCommon.LoginType.ANONYMOUS) {
                    _this.instance.authAnonymously(authorizer);
                }
                else if (type === Firebase.LoginType.PASSWORD) {
                    if (!arg.email || !arg.password) {
                        reject("Auth type emailandpassword requires an email and password argument");
                    }
                    else {
                        _this.instance.authWithPassword(arg.email, arg.password, authorizer);
                    }
                }
                else {
                    reject("Unsupported auth type: " + type);
                }
            }
            catch (ex) {
                console.log("Error in firebase.login: " + ex);
                reject(ex);
            }
        });
    };
    ;
    Firebase.prototype.createUser = function (arg) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            try {
                var valueResultHandler = new com.firebase.client.Firebase.ValueResultHandler({
                    onSuccess: function (authData) {
                        console.log("--- created: " + authData);
                        resolve(Firebase.toJsObject(authData).uid);
                    },
                    onError: function (firebaseError) {
                        reject(firebaseError.getMessage());
                    }
                });
                if (!arg.email || !arg.password) {
                    reject("Creating a user requires an email and password argument");
                }
                else {
                    _this.instance.createUser(arg.email, arg.password, valueResultHandler);
                }
            }
            catch (ex) {
                console.log("Error in firebase.createUser: " + ex);
                reject(ex);
            }
        });
    };
    ;
    Firebase.prototype.root = function () {
        return new Firebase(this.instance.getRoot());
    };
    Firebase.prototype.key = function () {
        return this.instance.getKey();
    };
    Firebase.prototype.push = function (data) {
        var fb = new Firebase(this.instance.push());
        var promise = fb.set(data);
        fb.then = promise.then;
        fb.catch = promise.catch;
        fb.finally = promise.finally;
        return fb;
    };
    ;
    Firebase.prototype.setValue = function (path, val) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            try {
                _this.instance.child(path).setValue();
                resolve();
            }
            catch (ex) {
                console.log("Error in firebase.setValue: " + ex);
                reject(ex);
            }
        });
    };
    ;
    Firebase.prototype.query = function (updateCallback, path, options) {
        return new Promise(function (resolve, reject) {
            try {
                var query;
                // orderBy
                if (options.orderBy.type === Firebase.QueryOrderByType.KEY) {
                    query = this.instance.child(path).orderByKey();
                }
                else if (options.orderBy.type === Firebase.QueryOrderByType.VALUE) {
                    query = this.instance.child(path).orderByValue();
                }
                else if (options.orderBy.type === Firebase.QueryOrderByType.PRIORITY) {
                    query = this.instance.child(path).orderByPriority();
                }
                else if (options.orderBy.type === Firebase.QueryOrderByType.CHILD) {
                    if (!options.orderBy.value) {
                        reject("When orderBy.type is 'child' you must set orderBy.value as well.");
                        return;
                    }
                    query = this.instance.child(path).orderByChild(options.orderBy.value);
                }
                else {
                    reject("Invalid orderBy.type, use constants like firebase.QueryOrderByType.VALUE");
                    return;
                }
                // range
                if (options.range && options.range.type) {
                    if (!options.range.value) {
                        reject("Please set range.value");
                        return;
                    }
                    if (options.range.type === Firebase.QueryRangeType.START_AT) {
                        query = query.startAt(options.range.value);
                    }
                    else if (options.range.type === Firebase.QueryRangeType.END_AT) {
                        query = query.endAt(options.range.value);
                    }
                    else if (options.range.type === Firebase.QueryRangeType.EQUAL_TO) {
                        query = query.equalTo(options.range.value);
                    }
                    else {
                        reject("Invalid range.type, use constants like firebase.QueryRangeType.START_AT");
                        return;
                    }
                }
                // limit
                if (options.limit && options.limit.type) {
                    if (!options.limit.value) {
                        reject("Please set limit.value");
                        return;
                    }
                    if (options.limit.type === Firebase.QueryLimitType.FIRST) {
                        query = query.limitToFirst(options.limit.value);
                    }
                    else if (options.limit.type === Firebase.QueryLimitType.LAST) {
                        query = query.limitToLast(options.limit.value);
                    }
                    else {
                        reject("Invalid limit.type, use constants like firebase.QueryLimitType.FIRST");
                        return;
                    }
                }
                this._addObservers(query, updateCallback);
                resolve();
            }
            catch (ex) {
                console.log("Error in firebase.query: " + ex);
                reject(ex);
            }
        });
    };
    ;
    Firebase.prototype.remove = function (key) {
        if (key) {
            return this.child(key).set(null);
        }
        else {
            return this.set(null);
        }
    };
    ;
    Firebase.prototype.on = function (eventName, callback, errorCallback) {
        var cancelledCallback = function (err) {
            if (errorCallback) {
                errorCallback(err);
            }
        };
        switch (eventName) {
            case "value":
                var eventListener = new com.firebase.client.ValueEventListener({
                    onDataChange: function (snapshot) {
                        callback(Firebase.getCallbackData(snapshot));
                    },
                    onCancelled: cancelledCallback
                });
                return this.instance.addValueEventListener(eventListener);
            case "child_added":
                var listener = new com.firebase.client.ChildEventListener({
                    onChildAdded: function (snapshot, previousChildKey) {
                        callback(Firebase.getCallbackData(snapshot), previousChildKey);
                    },
                    onChildRemoved: function (snapshot) { },
                    onChildChanged: function (snapshot, previousChildKey) { },
                    onChildMoved: function (snapshot, previousChildKey) { },
                    onCancelled: cancelledCallback
                });
                return this.instance.addChildEventListener(listener);
            case "child_changed":
                var listener = new com.firebase.client.ChildEventListener({
                    onChildChanged: function (snapshot, previousChildKey) {
                        callback(Firebase.getCallbackData(snapshot), previousChildKey);
                    },
                    onChildRemoved: function (snapshot) { },
                    onChildMoved: function (snapshot, previousChildKey) { },
                    onChildAdded: function (snapshot, previousChildKey) { },
                    onCancelled: cancelledCallback
                });
                return this.instance.addChildEventListener(listener);
            case "child_removed":
                var listener = new com.firebase.client.ChildEventListener({
                    onChildRemoved: function (snapshot) {
                        callback(Firebase.getCallbackData(snapshot));
                    },
                    onChildChanged: function (snapshot, previousChildKey) { },
                    onChildMoved: function (snapshot, previousChildKey) { },
                    onChildAdded: function (snapshot, previousChildKey) { },
                    onCancelled: cancelledCallback
                });
                return this.instance.addChildEventListener(listener);
            case "child_moved":
                var listener = new com.firebase.client.ChildEventListener({
                    onChildMoved: function (snapshot, previousChildKey) {
                        callback(Firebase.getCallbackData(snapshot), previousChildKey);
                    },
                    onChildRemoved: function (snapshot) { },
                    onChildChanged: function (snapshot, previousChildKey) { },
                    onChildAdded: function (snapshot, previousChildKey) { },
                    onCancelled: cancelledCallback
                });
                return this.instance.addChildEventListener(listener);
        }
    };
    Firebase.prototype.off = function (eventName, token) {
        this.instance.removeEventListener(token);
    };
    Firebase.prototype.set = function (data) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            try {
                _this.instance.setValue(Firebase.toHashMap(data));
                resolve(true);
            }
            catch (err) {
                reject(err);
            }
        });
    };
    Firebase.prototype.child = function (path) {
        return new Firebase(this.instance.child(path));
    };
    Firebase.prototype.authWithOAuthToken = function (provider, token, onComplete) {
        var _this = this;
        return this.wrapAuthCall(function (handler) {
            _this.instance.authWithOAuthToken(provider, token, handler);
        }, onComplete);
    };
    Firebase.prototype.authWithPassword = function (email, password, onComplete) {
        var _this = this;
        return this.wrapAuthCall(function (handler) {
            _this.instance.authWithPassword(email, password, handler);
        }, onComplete);
    };
    Firebase.prototype.authWithCustomToken = function (token, onComplete) {
        var _this = this;
        return this.wrapAuthCall(function (handler) {
            _this.instance.authWithCustomToken(token, handler);
        }, onComplete);
    };
    Firebase.prototype.getAuth = function () {
        var data = this.instance.getAuth();
        if (data !== null) {
            return new AndroidFirebaseAuthData(data);
        }
        else {
            return null;
        }
    };
    Firebase.prototype.wrapAuthCall = function (makeCall, onComplete) {
        return new Promise(function (resolve, reject) {
            var handler = new com.firebase.client.Firebase.AuthResultHandler({
                onAuthenticated: function (authData) {
                    var androidData = new AndroidFirebaseAuthData(authData);
                    if (onComplete) {
                        onComplete(null, androidData);
                    }
                    resolve(androidData);
                },
                onAuthenticationError: function (error) {
                    if (onComplete) {
                        onComplete(error, null);
                    }
                    reject(error);
                }
            });
            makeCall(handler);
        });
    };
    return Firebase;
})(firebase_common_1.FirebaseCommon);
exports.Firebase = Firebase;
