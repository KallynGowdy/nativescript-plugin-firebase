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
    remove(key?: string): Promise<boolean>;
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
export interface IFirebaseEventToken {
}
export declare class FirebaseCommon {
    constructor(instance: any);
    static LoginType: {
        ANONYMOUS: string;
        PASSWORD: string;
    };
    static QueryOrderByType: {
        KEY: string;
        VALUE: string;
        CHILD: string;
        PRIORITY: string;
    };
    static QueryLimitType: {
        FIRST: string;
        LAST: string;
    };
    static QueryRangeType: {
        START_AT: string;
        END_AT: string;
        EQUAL_TO: string;
    };
    protected instance: any;
    logout(arg: any): any;
}
