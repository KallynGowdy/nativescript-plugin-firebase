declare module "nativescript-plugin-firebase-common" {
    
    /**
    * Defines an interface that specifies what a standarized firebase instance looks like.
    */
    interface IFirebase {
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
    interface IFirebaseEventToken { }

    interface IFirebaseDataSnapshot {
        val(): any;
        key(): string;
    }

    class Firebase implements IFirebase {
        constructor(instance: any);
        static toHashMap(obj: any): any;
        static toJsObject(javaObj: any): any;
        static getCallbackData(snapshot: any): IFirebaseDataSnapshot;
        static init(arg: {
            url: string;
        }): Promise<{}>;
        login(arg: any): Promise<{}>;
        createUser(arg: any): Promise<any>;
        push(data: any): Promise<boolean>;
        setValue(path: any, val: any): Promise<{}>;
        query(updateCallback: any, path: any, options: any): Promise<{}>;
        remove(key?: string): Promise<boolean>;
        on(eventName: string, callback: Function, errorCallback?: (err: any) => void): IFirebaseEventToken;
        off(eventName: string, token: IFirebaseEventToken): void;
        set(data: any): Promise<boolean>;
        child(path: string): IFirebase;
    }
    export = Firebase;
}