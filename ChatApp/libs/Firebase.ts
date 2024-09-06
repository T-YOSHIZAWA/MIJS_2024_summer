import { initializeApp } from 'firebase/app';
import {
    initializeAuth,
    getReactNativePersistence,
    indexedDBLocalPersistence,
    //browserLocalPersistence,
    connectAuthEmulator,
    signOut,
    onAuthStateChanged,
    User,
    signInWithEmailAndPassword,
    Auth,
    Unsubscribe,
} from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
    CollectionReference,
    DocumentData,
    DocumentReference,
    DocumentSnapshot,
    Query,
    QuerySnapshot,
    addDoc,
    collection,
    connectFirestoreEmulator,
    doc,
    getDoc,
    getDocs,
    initializeFirestore,
    limit,
    memoryLocalCache,
    onSnapshot,
    orderBy,
    query,
    serverTimestamp,
    setDoc,
    startAfter,
    where,
} from "firebase/firestore";
import React from 'react';
import { Platform } from 'react-native';
import { ChatMessage } from '../models/ChatMessage';
import { ChatUser } from '../models/ChatUser';

//Firebase Appsの初期化
const app = initializeApp({
    apiKey: process.env.EXPO_PUBLIC_API_KEY,
    authDomain: process.env.EXPO_PUBLIC_AUTH_DOMAIN,
    projectId: process.env.EXPO_PUBLIC_PROJECT_ID,
    storageBucket: process.env.EXPO_PUBLIC_STORAGE_BUCKET,
    messagingSenderId: process.env.EXPO_PUBLIC_MESSAGING_SENDER_ID,
    appId: process.env.EXPO_PUBLIC_APP_ID,
});

console.log(`...MODE: ${process.env.NODE_ENV}`);

//Firebase Auth初期化
let auth: Auth;
switch (Platform.OS) {
    case "web":
        //Webの場合 - PersistenceにindexedDBLocalPersistenceを使用
        auth = initializeAuth(app, { persistence: indexedDBLocalPersistence });
        break;
    case "android":
    case "ios":
        //Android/iOSの場合 - PersistenceはNativeを使用
        auth = initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });
        break;
    default:
        //その他 - Webとして認識
        auth = initializeAuth(app, { persistence: indexedDBLocalPersistence });
        break;
}

//Firestoreの初期化
const db = initializeFirestore(app, { localCache: memoryLocalCache() });

//エミュレータの設定
//開発で実行する場合のみ設定
if (process.env.EXPO_PUBLIC_LOCAL === "true") {
    //プラットフォームによってエミュレータのIPアドレスが異なる
    if (Platform.OS === "android") {
        //Androidの場合: EmulatorのIPアドレスは10.0.2.2
        //  https://developer.android.com/studio/run/emulator-networking?hl=ja
        connectAuthEmulator(auth, 'http://10.0.2.2:9099');
        connectFirestoreEmulator(db, '10.0.2.2', 8080);
    } else {
        //Web,iOSの場合: EmulatorのIPアドレスは127.0.0.1
        //  iOS Simulatorはホストコンピュータのネットワークをそのまま利用するため、localhostが利用可能
        connectAuthEmulator(auth, 'http://127.0.0.1:9099');
        connectFirestoreEmulator(db, '127.0.0.1', 8080);
    }
}

export async function loginEmail(email: string, password: string) {
    const result = await signInWithEmailAndPassword(auth, email, password);
}

export async function logout() {
    await signOut(auth);
}

//const MESSAGE_COLLECTION = '/yoshizawa_messages';
const MESSAGE_COLLECTION = '/messages';
const USER_COLLECTION = '/users';

export function OnAuthStateChanged(callback: (user: User | null) => void): Unsubscribe {
    return onAuthStateChanged(auth, callback);
}
export const FirebaseContext = React.createContext<User | null>(null);

//-----------------
//メッセージ関連
export function onMessagesChanged(callback: (snapshot: QuerySnapshot<ChatMessage, DocumentData>) => void): Unsubscribe {
    const chatRef = collection(db, MESSAGE_COLLECTION) as CollectionReference<ChatMessage>;
    //Firestoreでは'not null'の検索はできない(undefined扱いになってしまう)
    //  そのため、"dateがnull以外"を検索する場合は取り得る値全てを検索対象とする
    // see: https://firebase.google.com/docs/firestore/query-data/queries?hl=ja#not_equal_
    //const q = query(chatRef, where('date', '!=', null), orderBy('date', 'desc'), limit(10));
    const q = query(chatRef, where('timestamp', '>=', new Date(0)), orderBy('timestamp', 'desc'), limit(10));

    //指定された関数でアタッチ - デタッチポイントを保持
    return onSnapshot(q, callback, (error) => { console.error(error) });
}

export async function readMessagesByCursor(id?: string): Promise<QuerySnapshot<ChatMessage, DocumentData>> {
    const chatRef = collection(db, MESSAGE_COLLECTION) as CollectionReference<ChatMessage>;

    let q: Query<ChatMessage, DocumentData>
    if (id === undefined) {
        //IDが定義されていない場合は先頭から読み込む
        q = query(chatRef, where('timestamp', '>=', new Date(0)), orderBy('timestamp', 'desc'), limit(10));
    } else {
        //指定されたデータを読み込む
        const cursorRef = doc(db, MESSAGE_COLLECTION, id) as DocumentReference<ChatMessage>;
        const snapshot = await getDoc(cursorRef);

        //カーソル以降のデータを読み込む
        q = query(chatRef, where('timestamp', '>=', new Date(0)), orderBy('timestamp', 'desc'), startAfter(snapshot), limit(10));
    }

    return await getDocs(q);
}

export async function getMessage(id: string): Promise<DocumentSnapshot<ChatMessage, DocumentData>> {
    const chatRef = doc(db, MESSAGE_COLLECTION, id) as DocumentReference<ChatMessage>;
    return await getDoc(chatRef);
}

export async function sendMessage(message: ChatMessage): Promise<void> {
    const chatRef = collection(db, MESSAGE_COLLECTION) as CollectionReference<ChatMessage>;
    //date項目にはFirestoreの時刻データを設定する
    //await addDoc(chatRef, message);
    await addDoc(chatRef, { ...message, timestamp: serverTimestamp() });
}
//-----------------

//-----------------
//ユーザ関連
export function onUserChanged(id: string, callback: (snapshot: DocumentSnapshot<ChatUser, DocumentData>) => void): Unsubscribe {
    const userRef = doc(db, USER_COLLECTION, id) as DocumentReference<ChatUser>;
    return onSnapshot(userRef, callback, (error) => { console.error(error) });
}

export async function getUser(id: string): Promise<DocumentSnapshot<ChatUser, DocumentData>> {
    const userRef = doc(db, USER_COLLECTION, id) as DocumentReference<ChatUser>;
    return await getDoc(userRef);
}

export async function setUser(id: string, user: ChatUser): Promise<void> {
    const userRef = doc(db, USER_COLLECTION, id) as DocumentReference<ChatUser>;
    await setDoc(userRef, user);
}
//-----------------
