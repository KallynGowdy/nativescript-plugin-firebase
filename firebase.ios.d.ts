import { FirebaseCommon, IFirebase, IFirebaseDataSnapshot, IFirebaseEventToken, IFirebaseAuthData } from "./firebase-common";
export declare class IosFirebaseDataSnapshot implements IFirebaseDataSnapshot {
    private _snap;
    constructor(snap: any);
    val(): any;
    key(): string;
}
export declare class IosFirebaseAuthData implements IFirebaseAuthData {
    private authData;
    constructor(authData: any);
    uid: string;
    provider: string;
    auth: any;
    expires: number;
    token: string;
}
export declare class IosFirebase extends FirebaseCommon implements IFirebase {
    constructor(instance: any);
    static toJsObject(objCObj: any): any;
    static getCallbackData(snapshot: any): IFirebaseDataSnapshot;
    static createNew(arg: {
        url: string;
        persist: boolean;
    }): IFirebase;
    login(arg: any): Promise<{}>;
    createUser(arg: any): Promise<{}>;
    root(): IFirebase;
    key(): string;
    push(data: any): IFirebase | Promise<IFirebase>;
    set(data: any): Promise<boolean>;
    child(path: string): IFirebase;
    on(eventName: string, callback: Function, errorCallback?: (err: any) => void): IFirebaseEventToken;
    off(eventType: string, token: IFirebaseEventToken): void;
    setValue(path: any, val: any): Promise<{}>;
    query(updateCallback: any, path: any, options: any): Promise<{}>;
    remove(path: any): Promise<{}>;
    authWithOAuthToken(provider: string, token: string, onComplete?: Function): Promise<IFirebaseAuthData>;
    authWithPassword(email: string, password: string, onComplete?: Function): Promise<IFirebaseAuthData>;
    authWithCustomToken(token: string, onComplete?: Function): Promise<IFirebaseAuthData>;
    getAuth(): IFirebaseAuthData;
    private wrapAuthAttempt(makeAttempt, onComplete);
}
export declare var Firebase: typeof IosFirebase;
