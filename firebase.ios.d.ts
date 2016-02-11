import { FirebaseCommon, IFirebase, IFirebaseDataSnapshot, IFirebaseEventToken } from "./firebase-common";
export declare class IosFirebaseDataSnapshot implements IFirebaseDataSnapshot {
    private _snap;
    constructor(snap: any);
    val(): any;
    key(): string;
}
export declare class IosFirebase extends FirebaseCommon implements IFirebase {
    constructor(instance: any);
    static toJsObject(objCObj: any): any;
    static getCallbackData(snapshot: any): IFirebaseDataSnapshot;
    static createNew(arg: {
        url: string;
    }): IFirebase;
    login(arg: any): Promise<{}>;
    createUser(arg: any): Promise<{}>;
    push(data: any): Promise<boolean>;
    set(data: any): Promise<boolean>;
    child(path: string): IFirebase;
    on(eventName: string, callback: Function, errorCallback?: (err: any) => void): IFirebaseEventToken;
    off(eventType: string, token: IFirebaseEventToken): void;
    setValue(path: any, val: any): Promise<{}>;
    query(updateCallback: any, path: any, options: any): Promise<{}>;
    remove(path: any): Promise<{}>;
}
export declare var Firebase: typeof IosFirebase;
