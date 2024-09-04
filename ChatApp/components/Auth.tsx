import React from 'react';

import { OnAuthStateChanged, FirebaseContext } from '../libs/Firebase';
import { User } from 'firebase/auth';
import { StyleSheet, Text, View } from 'react-native';
import { Redirect, router } from 'expo-router';

interface AuthState {
    checked: boolean,
    user: User | null,
}
interface AuthProps {
    children: React.ReactNode,
}

export class Auth extends React.Component<AuthProps, AuthState> {
    constructor(props: AuthProps) {
        super(props);
        this.state = {
            checked: false,
            user: null,
        }
    }

    componentDidMount(): void {
        OnAuthStateChanged(async (user) => {
            if (user !== null) {
                //ログインしていれば、ユーザ情報をStateへ設定する
                this.setState({
                    checked: true,
                    user: user
                });
            } else {
                //ログインしていなければ、ログイン画面へリダイレクト
                //await loginWithGoogle();
                this.setState({
                    checked: true,
                    user: null
                });
            }
        });
    }

    render(): React.ReactNode {
        //ログインチェック前
        if (!this.state.checked) {
            //ローディング画面を表示
            return (
                <View style={styles.container}>
                    <Text>ローディング中...</Text>
                </View>

            );
        }

        //ログインチェック後
        if (this.state.user !== null) {
            //ログイン済み (state.user に値が設定されている) -> 子要素をそのままロードする
            return (
                <FirebaseContext.Provider value={this.state.user}>
                    {this.props.children}
                </FirebaseContext.Provider>
            );
        } else {
            //未ログイン -> ログイン処理
            return (
                <Redirect href={'/'} />
            );
        }
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
});
