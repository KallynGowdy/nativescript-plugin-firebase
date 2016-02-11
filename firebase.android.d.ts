import { FirebaseCommon, IFirebase, IFirebaseDataSnapshot, IFirebaseEventToken } from "./firebase-common";
declare class Firebase extends FirebaseCommon implements IFirebase {
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
