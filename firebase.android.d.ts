import { FirebaseCommon, IFirebase, IFirebaseDataSnapshot, IFirebaseEventToken, IFirebaseAuthData } from "./firebase-common";
export declare class AndroidFirebaseDataSnapshot implements IFirebaseDataSnapshot {
    private _snap;
    constructor(snap: any);
    val(): any;
    key(): string;
}
export declare class AndroidFirebaseAuthData implements IFirebaseAuthData {
    private authData;
    constructor(authData: any);
    uid: string;
    provider: string;
    auth: any;
    expires: number;
}
export declare class Firebase extends FirebaseCommon implements IFirebase {
    constructor(instance: any);
    static toHashMap(obj: any): any;
    static toJsObject(javaObj: any): any;
    static getCallbackData(snapshot: any): IFirebaseDataSnapshot;
    static createNew(arg: {
        url: string;
    }): IFirebase;
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
    authWithOAuthToken(provider: string, token: string, onComplete?: Function): Promise<IFirebaseAuthData>;
    authWithPassword(email: string, password: string, onComplete?: Function): Promise<IFirebaseAuthData>;
    private wrapAuthCall(makeCall, onComplete);
}
