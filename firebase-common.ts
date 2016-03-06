declare var Promise: any;

/**
 * Defines an interface that represents objects that contain firebase authentication data.
 */
export interface IFirebaseAuthData {
    /**
     * The UID of the user.
     */
    uid: string;
    
    /**
     * The provider that the user used to authenticate.
     */
    provider: string;
    
    /**
     * The authentication token payload.
     */
    auth: any;
    
    /**
     * The token used to authenticate the client to Firebase.
     */
    token: string;
    
    /**
     * The expiration time of the token in seconds since the Unix epoch.
     */
    expires: number;
}

/**
 * Defines an interface that specifies what capabilities a firebase data snapshot has.
 */
export interface IFirebaseDataSnapshot {
    /**
     * Gets the data value from this snapshot.
     */
    val(): any;
    
    /**
     * Gets the key that this snapshot represents.
     */
    key(): string;
}

/**
 * Defines an interface that specifies what a standarized firebase instance looks like.
 */
export interface IFirebase {
    
    /**
     * Gets the key for this location.
     */
    key(): string;
    
    /**
     * Gets a firebase reference to the root of the location.
     */
    root(): IFirebase;
    
    /**
     * Listens for events with the given name.
     */
    on(eventName: string, callback?: Function, errCallback?: (err: any) => void): IFirebaseEventToken;
    
    /**
     * Stops listening for the event that the given token subscribes to.
     */
    off(eventType: string, token: IFirebaseEventToken): void;
    
    /**
     * Returns a new firebase instance that represents the given path beneath this firebase instance.
     */
    child(path: string): IFirebase;
    
    /**
     * Removes the child with the given key. If the key is not provided, this location is removed from its parent.
     */
    remove(key?:string): Promise<boolean>;
    
    /**
     * Adds the given data to this firebase location.
     */
    push(data: any, callback?: (err: any) => void): IFirebase|Promise<IFirebase>;
    
    /**
     * Sets the data at this firebase location.
     */
    set(data: any): Promise<boolean>;
        
    /**
     * Authenticates a firebase client to the given provider using the given OAuth token.
     * @param provider String The unique string identifying the OAuth provider to authenticate with, e.g. `google`.
     * @param token String The OAuth token.
     */
    authWithOAuthToken(provider: string, token: string, onComplete?: Function): Promise<IFirebaseAuthData>;
    
    /**
     * Authenticates a firebase client using the given username and password.
     * @param email String The email address of the user.
     * @param password String The password to use for authentication.
     */
    authWithPassword(email: string, password: string, onComplete?: Function): Promise<IFirebaseAuthData>;
    
    /**
     * Authenticates the firebase client using the given custom token.
     * @param token String The custom token to use for authentication.
     * @param onComplete Function A function that is called when the operation is complete.
     */
    authWithCustomToken(token: string, onComplete?: Function): Promise<IFirebaseAuthData>;
    
    /**
     * Unauthenticates the firebase client.
     */
    unauth(): Promise<boolean>;
    
    /**
     * Retrieves the current authentication data from the client.
     */
    getAuth(): IFirebaseAuthData;
}

/**
 * Defines a class that represents a token that
 * represents a subscription to a Firebase event.
 */
export interface IFirebaseEventToken {}

/**
 * Defines a class that represents firebase client code that can be shared between platforms.
 */
export class FirebaseCommon {

    constructor(instance: any) {
        this.instance = instance;
    }

    public static LoginType = {
        ANONYMOUS: "anonymous",
        PASSWORD: "password"
    };

    public static QueryOrderByType = {
        KEY: "key",
        VALUE: "value",
        CHILD: "child",
        PRIORITY: "priority"
    };

    public static QueryLimitType = {
        FIRST: "first",
        LAST: "last"
    };

    public static QueryRangeType = {
        START_AT: "startAt",
        END_AT: "endAt",
        EQUAL_TO: "equalTo"
    };

    protected instance: any = null;

    // this implementation is actually the same for both platforms, woohoo :)
    public logout() {
        return new Promise((resolve, reject) => {
            try {
                this.instance.unauth();
                resolve();
            } catch (ex) {
                console.log("Error in firebase.logout: " + ex);
                reject(ex);
            }
        });
    }
    
    public unauth() {
        return this.logout();
    }
};