var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var firebase_common_1 = require("./firebase-common");
var types = require("utils/types");
var IosFirebaseClass = global.Firebase;
var IosFirebaseDataSnapshot = (function () {
    function IosFirebaseDataSnapshot(snap) {
        this._snap = snap;
    }
    IosFirebaseDataSnapshot.prototype.val = function () {
        return IosFirebase.toJsObject(this._snap.value);
    };
    IosFirebaseDataSnapshot.prototype.key = function () {
        return this._snap.key;
    };
    return IosFirebaseDataSnapshot;
})();
exports.IosFirebaseDataSnapshot = IosFirebaseDataSnapshot;
var IosFirebaseAuthData = (function () {
    function IosFirebaseAuthData(authData) {
        this.authData = authData;
        this.uid = authData.uid;
        this.provider = authData.provider;
        this.expires = authData.expires;
        this.auth = authData.auth;
        this.token = authData.token;
    }
    return IosFirebaseAuthData;
})();
exports.IosFirebaseAuthData = IosFirebaseAuthData;
var IosFirebase = (function (_super) {
    __extends(IosFirebase, _super);
    function IosFirebase(instance) {
        _super.call(this, instance);
    }
    IosFirebase.toJsObject = function (objCObj) {
        if (objCObj === null || typeof objCObj != "object") {
            return objCObj;
        }
        var node, key, i, l, oKeyArr = objCObj.allKeys;
        if (oKeyArr === undefined) {
            // array
            node = [];
            for (i = 0, l = objCObj.count; i < l; i++) {
                key = objCObj.objectAtIndex(i);
                node.push(IosFirebase.toJsObject(key));
            }
        }
        else {
            // object
            node = {};
            for (i = 0, l = oKeyArr.count; i < l; i++) {
                key = oKeyArr.objectAtIndex(i);
                var val = objCObj.valueForKey(key);
                switch (types.getClass(val)) {
                    case 'NSMutableArray':
                        node[key] = IosFirebase.toJsObject(val);
                        break;
                    case 'NSMutableDictionary':
                        node[key] = IosFirebase.toJsObject(val);
                        break;
                    case 'String':
                        node[key] = String(val);
                        break;
                    case 'Boolean':
                        node[key] = Boolean(String(val));
                        break;
                    case 'Number':
                        node[key] = Number(String(val));
                        break;
                }
            }
        }
        return node;
    };
    IosFirebase.getCallbackData = function (snapshot) {
        return new IosFirebaseDataSnapshot(snapshot);
    };
    ;
    IosFirebase.createNew = function (arg) {
        if (typeof IosFirebaseClass !== "function") {
            console.error("global.Firebase did not retrieve the correct Firebase global object. Instead, the type of IosFirebaseClass is:", typeof IosFirebaseClass);
        }
        // Implementation taken from https://github.com/EddyVerbruggen/nativescript-plugin-firebase
        if (arg.persist !== false) {
            IosFirebaseClass.defaultConfig().persistenceEnabled = true;
        }
        else {
            IosFirebaseClass.defaultConfig().persistenceEnabled = false;
        }
        var instance = new IosFirebaseClass(arg.url);
        return new IosFirebase(instance);
    };
    IosFirebase.prototype.login = function (arg) {
        return new Promise(function (resolve, reject) {
            try {
                var onCompletion = function (error, authData) {
                    if (error) {
                        reject(error.localizedDescription);
                    }
                    else {
                        resolve({
                            uid: authData.uid,
                            provider: authData.provider,
                            expiresAtUnixEpochSeconds: authData.expires,
                            profileImageURL: authData.providerData.objectForKey("profileImageURL"),
                            token: authData.token
                        });
                    }
                };
                var type = arg.type;
                if (type === firebase_common_1.FirebaseCommon.LoginType.ANONYMOUS) {
                    this.instance.authAnonymouslyWithCompletionBlock(onCompletion);
                }
                else if (type === firebase_common_1.FirebaseCommon.LoginType.PASSWORD) {
                    if (!arg.email || !arg.password) {
                        reject("Auth type emailandpassword requires an email and password argument");
                    }
                    else {
                        this.instance.authUserPasswordWithCompletionBlock(arg.email, arg.password, onCompletion);
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
    IosFirebase.prototype.createUser = function (arg) {
        return new Promise(function (resolve, reject) {
            try {
                var onCompletion = function (error, authData) {
                    if (error) {
                        reject(error.localizedDescription);
                    }
                    else {
                        resolve(IosFirebase.toJsObject(authData).uid);
                    }
                };
                if (!arg.email || !arg.password) {
                    reject("Creating a user requires an email and password argument");
                }
                else {
                    this.instance.createUserPasswordWithValueCompletionBlock(arg.email, arg.password, onCompletion);
                }
            }
            catch (ex) {
                console.log("Error in firebase.createUser: " + ex);
                reject(ex);
            }
        });
    };
    IosFirebase.prototype.root = function () {
        return new IosFirebase(this.instance.root);
    };
    IosFirebase.prototype.key = function () {
        return this.instance.key;
    };
    IosFirebase.prototype.push = function (data) {
        var fb = new IosFirebase(this.instance.childByAutoId());
        var promise = fb.set(data);
        fb.then = promise.then.bind(promise);
        fb.catch = promise.catch.bind(promise);
        fb.finally = promise.finally.bind(promise);
        return fb;
    };
    IosFirebase.prototype.set = function (data) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.instance.setValueWithCompletionBlock(data, function (err, ref) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(true);
                }
            });
        });
    };
    IosFirebase.prototype.child = function (path) {
        return new IosFirebase(this.instance.childByAppendingPath(path));
    };
    IosFirebase.prototype.on = function (eventName, callback, errorCallback) {
        var eventType;
        switch (eventName) {
            case "value":
                eventType = FEventType.FEventTypeValue;
                break;
            case "child_added":
                eventType = FEventType.FEventTypeChildAdded;
                break;
            case "child_removed":
                eventType = FEventType.FEventTypeChildRemoved;
                break;
            case "child_changed":
                eventType = FEventType.FEventTypeChildChanged;
                break;
            case "child_moved":
                eventType = FEventType.FEventTypeChildMoved;
                break;
        }
        return this.instance.observeEventTypeWithBlockWithCancelBlock(eventType, function (snap) {
            callback(IosFirebase.getCallbackData(snap));
        }, function (err) {
            if (errorCallback) {
                errorCallback(err);
            }
        });
    };
    IosFirebase.prototype.off = function (eventType, token) {
        this.instance.removeObserverWithHandle(token);
    };
    IosFirebase.prototype.setValue = function (path, val) {
        return new Promise(function (resolve, reject) {
            try {
                this.instance.childByAppendingPath(path).setValue(val);
                resolve();
            }
            catch (ex) {
                console.log("Error in firebase.setValue: " + ex);
                reject(ex);
            }
        });
    };
    IosFirebase.prototype.query = function (updateCallback, path, options) {
        return new Promise(function (resolve, reject) {
            try {
                var where = this.instance;
                if (path !== undefined) {
                    where = this.instance.childByAppendingPath(path);
                }
                var query;
                // orderBy
                if (options.orderBy.type === firebase_common_1.FirebaseCommon.QueryOrderByType.KEY) {
                    query = where.queryOrderedByKey();
                }
                else if (options.orderBy.type === firebase_common_1.FirebaseCommon.QueryOrderByType.VALUE) {
                    query = where.queryOrderedByValue();
                }
                else if (options.orderBy.type === firebase_common_1.FirebaseCommon.QueryOrderByType.PRIORITY) {
                    query = where.queryOrderedByPriority();
                }
                else if (options.orderBy.type === firebase_common_1.FirebaseCommon.QueryOrderByType.CHILD) {
                    if (!options.orderBy.value) {
                        reject("When orderBy.type is 'child' you must set orderBy.value as well.");
                        return;
                    }
                    query = where.queryOrderedByChild(options.orderBy.value);
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
                    if (options.range.type === firebase_common_1.FirebaseCommon.QueryRangeType.START_AT) {
                        query = query.queryStartingAtValue(options.range.value);
                    }
                    else if (options.range.type === firebase_common_1.FirebaseCommon.QueryRangeType.END_AT) {
                        console.log("----- ending at: " + options.range.value);
                        query = query.queryEndingAtValue(options.range.value);
                    }
                    else if (options.range.type === firebase_common_1.FirebaseCommon.QueryRangeType.EQUAL_TO) {
                        query = query.queryEqualToValue(options.range.value);
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
                    if (options.limit.type === firebase_common_1.FirebaseCommon.QueryLimitType.FIRST) {
                        query = query.queryLimitedToFirst(options.limit.value);
                    }
                    else if (options.limit.type === firebase_common_1.FirebaseCommon.QueryLimitType.LAST) {
                        console.log("---- LAST");
                        query = query.queryLimitedToLast(options.limit.value);
                    }
                    else {
                        reject("Invalid limit.type, use constants like firebase.queryOptions.limitType.FIRST");
                        return;
                    }
                }
                //IosFirebase._addObservers(query, updateCallback);
                resolve();
            }
            catch (ex) {
                console.log("Error in firebase.query: " + ex);
                reject(ex);
            }
        });
    };
    IosFirebase.prototype.remove = function (path) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            try {
                _this.instance.childByAppendingPath(path).setValue(null);
                resolve();
            }
            catch (ex) {
                console.log("Error in firebase.remove: " + ex);
                reject(ex);
            }
        });
    };
    IosFirebase.prototype.authWithOAuthToken = function (provider, token, onComplete) {
        var _this = this;
        return this.wrapAuthAttempt(function (handler) {
            _this.instance.authWithOAuthProviderTokenWithCompletionBlock(provider, token, handler);
        }, onComplete);
    };
    IosFirebase.prototype.authWithPassword = function (email, password, onComplete) {
        var _this = this;
        return this.wrapAuthAttempt(function (handler) {
            _this.instance.authUserPasswordWithCompletionBlock(email, password, handler);
        }, onComplete);
    };
    IosFirebase.prototype.authWithCustomToken = function (token, onComplete) {
        var _this = this;
        return this.wrapAuthAttempt(function (handler) {
            _this.instance.authWithCustomTokenWithCompletionBlock(token, handler);
        }, onComplete);
    };
    IosFirebase.prototype.getAuth = function () {
        var data = this.instance.auth;
        if (data !== null) {
            return new IosFirebaseAuthData(data);
        }
        else {
            return null;
        }
    };
    IosFirebase.prototype.wrapAuthAttempt = function (makeAttempt, onComplete) {
        return new Promise(function (resolve, reject) {
            makeAttempt(function (error, authData) {
                if (error) {
                    if (onComplete) {
                        onComplete(error, null);
                    }
                    reject(error);
                }
                else {
                    var data = new IosFirebaseAuthData(authData);
                    if (onComplete) {
                        onComplete(null, data);
                    }
                    resolve(data);
                }
            });
        });
    };
    return IosFirebase;
})(firebase_common_1.FirebaseCommon);
exports.IosFirebase = IosFirebase;
exports.Firebase = IosFirebase;
