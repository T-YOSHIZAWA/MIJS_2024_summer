import {
    ApplicationProvider,
    Button,
} from '@ui-kitten/components';
import { StyleSheet, View, Text } from 'react-native';
import * as eva from '@eva-design/eva';
import React, { useEffect, useState } from 'react';
import { OnAuthStateChanged } from '../libs/Firebase';
import { User } from 'firebase/auth';
import { Redirect, router } from 'expo-router';

export default function App() {
    const [checked, setChecked] = useState(false);
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        OnAuthStateChanged(async (user) => {
            setChecked(true);
            if (user !== null) {
                //ログインしていれば、ユーザ情報をStateへ設定する
                setChecked(true);
                setUser(user);
            } else {
                //ログインしていなければ、ログイン画面へリダイレクト
                setUser(null);
            }
        })
    }, []);

    //ログインチェック前
    if (!checked) {
        //ローディング画面を表示
        return (
            <View style={styles.container}>
                <Text>ローディング中...</Text>
            </View>
        );
    }

    if (user !== null) {
        //ホーム画面(/(main)/home)を表示
        return (
            <Redirect href={'/(main)/home'} />
        );
    }

    //それ以外(ログインチェック後でログインしていない場合)は、ログイン画面へのリンクを表示
    return (
        <ApplicationProvider {...eva} theme={eva.light}>
            <View style={styles.container}>
                <Button onPress={(event) => { router.navigate("/login") }}>
                    ログイン画面へ
                </Button>
            </View>
        </ApplicationProvider>
    );

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
