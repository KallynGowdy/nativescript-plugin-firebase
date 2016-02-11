declare var Promise: any;

export interface IFirebaseDataSnapshot {
    val(): any;
    key(): string;
}

/**
 * Defines an interface that specifies what a standarized firebase instance looks like.
 */
export interface IFirebase {
    /**
     * Listens for events with the given name.
     */
    on(eventName: string, callback: Function, errCallback: (err: any) => void): IFirebaseEventToken;
    
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
    push(data: any): Promise<boolean>;
    
    /**
     * Sets the data at this firebase location.
     */
    set(data: any): Promise<boolean>;
}

/**
 * Defines a class that represents a token that
 * represents a subscription to a Firebase event.
 */
export interface IFirebaseEventToken {}

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
    logout(arg) {
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
};