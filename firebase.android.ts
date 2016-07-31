import * as appModule from "application";
import {FirebaseCommon, IFirebase, IFirebaseDataSnapshot, IFirebaseEventToken, IFirebaseAuthData} from "./firebase-common";

declare var java: any;
declare var com;

export class AndroidFirebaseDataSnapshot implements IFirebaseDataSnapshot {
    private _snap: any;

    constructor(snap) {
        this._snap = snap;
    }

    public val(): any {
        return Firebase.toJsObject(this._snap.getValue());
    }

    public key(): string {
        return this._snap.getKey()
    }
}

export class AndroidFirebaseAuthData implements IFirebaseAuthData {

    constructor(private authData: any) {
        this.uid = authData.getUid();
        this.provider = authData.getProvider();
        this.expires = authData.getExpires();
        this.auth = authData.getAuth();
        this.token = authData.getToken();
    }

    public uid: string;
    public provider: string;
    public auth: any;
    public expires: number;
    public token: string;
}

export class Firebase extends FirebaseCommon implements IFirebase {

    constructor(instance: any) {
        super(instance);
    }

    public static toHashMap(obj) {
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

    public static toJsObject(javaObj: any): any {
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

    public static getCallbackData(snapshot): IFirebaseDataSnapshot {
        return new AndroidFirebaseDataSnapshot(snapshot);
    };

    public static createNew(arg: { url: string, persist: boolean }): IFirebase {
        var JavaFirebase = com.firebase.client.Firebase;
        JavaFirebase.setAndroidContext(appModule.android.context);
        // Implementation taken from https://github.com/EddyVerbruggen/nativescript-plugin-firebase
        if(arg.persist !== false && !JavaFirebase.getDefaultConfig().isPersistenceEnabled()) {
            JavaFirebase.getDefaultConfig().setPersistenceEnabled(true);
        } else {
            JavaFirebase.getDefaultConfig().setPersistenceEnabled(false);
        }
        var instance = new JavaFirebase(arg.url);
        return new Firebase(instance);
    };

    public login(arg: any) {
        return new Promise((resolve, reject) => {
            try {
                var authorizer = new com.firebase.client.Firebase.AuthResultHandler({
                    onAuthenticated: function(authData) {
                        resolve({
                            uid: authData.getUid(),
                            provider: authData.getProvider(),
                            expiresAtUnixEpochSeconds: authData.getExpires(),
                            profileImageURL: authData.getProviderData().get("profileImageURL"),
                            token: authData.getToken()
                        });
                    },
                    onAuthenticationError: function(firebaseError) {
                        reject(firebaseError.getMessage());
                    }
                });

                var type = arg.type;

                if (type === FirebaseCommon.LoginType.ANONYMOUS) {
                    this.instance.authAnonymously(authorizer);
                } else if (type === Firebase.LoginType.PASSWORD) {
                    if (!arg.email || !arg.password) {
                        reject("Auth type emailandpassword requires an email and password argument");
                    } else {
                        this.instance.authWithPassword(arg.email, arg.password, authorizer);
                    }
                } else {
                    reject("Unsupported auth type: " + type);
                }
            } catch (ex) {
                console.log("Error in firebase.login: " + ex);
                reject(ex);
            }
        });
    };

    public createUser(arg: any): Promise<any> {
        return new Promise((resolve, reject) => {
            try {
                var valueResultHandler = new com.firebase.client.Firebase.ValueResultHandler({
                    onSuccess: function(authData) {
                        console.log("--- created: " + authData);
                        resolve(Firebase.toJsObject(authData).uid);
                    },
                    onError: function(firebaseError) {
                        reject(firebaseError.getMessage());
                    }
                });

                if (!arg.email || !arg.password) {
                    reject("Creating a user requires an email and password argument");
                } else {
                    this.instance.createUser(arg.email, arg.password, valueResultHandler);
                }
            } catch (ex) {
                console.log("Error in firebase.createUser: " + ex);
                reject(ex);
            }
        });
    };

    public root(): IFirebase {
        return new Firebase(this.instance.getRoot());
    }

    public key(): string {
        return this.instance.getKey();
    }

    public push(data: any): IFirebase|Promise<IFirebase> {
        var fb: any = new Firebase(this.instance.push());
        var promise = fb.set(data);
        fb.then = promise.then;
        fb.catch = promise.catch;
        fb.finally = promise.finally;
        return fb;
    };

    public setValue(path, val) {
        return new Promise((resolve, reject) => {
            try {
                this.instance.child(path).setValue();
                resolve();
            } catch (ex) {
                console.log("Error in firebase.setValue: " + ex);
                reject(ex);
            }
        });
    };

    public query(updateCallback, path, options) {
        return new Promise(function(resolve, reject) {
            try {
                var query;
      
                // orderBy
                if (options.orderBy.type === Firebase.QueryOrderByType.KEY) {
                    query = this.instance.child(path).orderByKey();
                } else if (options.orderBy.type === Firebase.QueryOrderByType.VALUE) {
                    query = this.instance.child(path).orderByValue();
                } else if (options.orderBy.type === Firebase.QueryOrderByType.PRIORITY) {
                    query = this.instance.child(path).orderByPriority();
                } else if (options.orderBy.type === Firebase.QueryOrderByType.CHILD) {
                    if (!options.orderBy.value) {
                        reject("When orderBy.type is 'child' you must set orderBy.value as well.");
                        return;
                    }
                    query = this.instance.child(path).orderByChild(options.orderBy.value);
                } else {
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
                    } else if (options.range.type === Firebase.QueryRangeType.END_AT) {
                        query = query.endAt(options.range.value);
                    } else if (options.range.type === Firebase.QueryRangeType.EQUAL_TO) {
                        query = query.equalTo(options.range.value);
                    } else {
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
                    } else if (options.limit.type === Firebase.QueryLimitType.LAST) {
                        query = query.limitToLast(options.limit.value);
                    } else {
                        reject("Invalid limit.type, use constants like firebase.QueryLimitType.FIRST");
                        return;
                    }
                }

                this._addObservers(query, updateCallback);
                resolve();
            } catch (ex) {
                console.log("Error in firebase.query: " + ex);
                reject(ex);
            }
        });
    };

    public remove(key?: string): Promise<boolean> {
        if (key) {
            return this.child(key).set(null);
        } else {
            return this.set(null);
        }
    };

    public on(eventName: string, callback: Function, errorCallback?: (err: any) => void): IFirebaseEventToken {

        var cancelledCallback = (err) => {
            if (errorCallback) {
                errorCallback(err);
            }
        };
        switch (eventName) {
            case "value":
                var eventListener = new com.firebase.client.ValueEventListener({
                    onDataChange: (snapshot) => {
                        callback(Firebase.getCallbackData(snapshot));
                    },
                    onCancelled: cancelledCallback
                });
                return this.instance.addValueEventListener(eventListener);
            case "child_added":
                var listener = new com.firebase.client.ChildEventListener({
                    onChildAdded: (snapshot, previousChildKey) => {
                        callback(Firebase.getCallbackData(snapshot), previousChildKey);
                    },
                    onChildRemoved: (snapshot) => { },
                    onChildChanged: (snapshot, previousChildKey) => { },
                    onChildMoved: (snapshot, previousChildKey) => { },
                    onCancelled: cancelledCallback
                });
                return this.instance.addChildEventListener(listener);
            case "child_changed":
                var listener = new com.firebase.client.ChildEventListener({
                    onChildChanged: (snapshot, previousChildKey) => {
                        callback(Firebase.getCallbackData(snapshot), previousChildKey);
                    },
                    onChildRemoved: (snapshot) => { },
                    onChildMoved: (snapshot, previousChildKey) => { },
                    onChildAdded: (snapshot, previousChildKey) => { },
                    onCancelled: cancelledCallback
                });
                return this.instance.addChildEventListener(listener);
            case "child_removed":
                var listener = new com.firebase.client.ChildEventListener({
                    onChildRemoved: (snapshot) => {
                        callback(Firebase.getCallbackData(snapshot));
                    },
                    onChildChanged: (snapshot, previousChildKey) => { },
                    onChildMoved: (snapshot, previousChildKey) => { },
                    onChildAdded: (snapshot, previousChildKey) => { },
                    onCancelled: cancelledCallback
                });
                return this.instance.addChildEventListener(listener);
            case "child_moved":
                var listener = new com.firebase.client.ChildEventListener({
                    onChildMoved: (snapshot, previousChildKey) => {
                        callback(Firebase.getCallbackData(snapshot), previousChildKey);
                    },
                    onChildRemoved: (snapshot) => { },
                    onChildChanged: (snapshot, previousChildKey) => { },
                    onChildAdded: (snapshot, previousChildKey) => { },
                    onCancelled: cancelledCallback
                });
                return this.instance.addChildEventListener(listener);
        }
    }

    public off(eventName: string, token: IFirebaseEventToken): void {
        this.instance.removeEventListener(token);
    }

    public set(data: any): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            try {
                this.instance.setValue(Firebase.toHashMap(data));
                resolve(true);
            } catch(err) {
                reject(err);
            }
        });
    }

    public child(path: string): IFirebase {
        return new Firebase(this.instance.child(path));
    }

    public authWithOAuthToken(provider: string, token: string, onComplete?: Function): Promise<IFirebaseAuthData> {
        return this.wrapAuthCall((handler: any) => {
           this.instance.authWithOAuthToken(provider, token, handler); 
        }, onComplete);
    }

    public authWithPassword(email: string, password: string, onComplete?: Function): Promise<IFirebaseAuthData> {
        return this.wrapAuthCall((handler) => {
            this.instance.authWithPassword(email, password, handler);
        }, onComplete);
    }

    public authWithCustomToken(token: string, onComplete?: Function): Promise<IFirebaseAuthData> {
        return this.wrapAuthCall((handler) => {
            this.instance.authWithCustomToken(token, handler); 
        }, onComplete);
    }

    public getAuth(): IFirebaseAuthData {
        var data = this.instance.getAuth();
        if(data !== null) {
            return new AndroidFirebaseAuthData(data);
        } else {
            return null;
        }
    }

    private wrapAuthCall(makeCall: (authHandler: any) => void, onComplete: Function): Promise<IFirebaseAuthData> {
        return new Promise<IFirebaseAuthData>((resolve, reject) => {
            var handler = new com.firebase.client.Firebase.AuthResultHandler({
                onAuthenticated: (authData) => {
                    var androidData: AndroidFirebaseAuthData = new AndroidFirebaseAuthData(authData);
                    if (onComplete) {
                        onComplete(null, androidData)
                    }
                    resolve(androidData);
                },
                onAuthenticationError: (error) => {
                    if(onComplete) {
                        onComplete(error, null);
                    }
                    reject(error);
                }
            });
            
            makeCall(handler);
        })
    }
}