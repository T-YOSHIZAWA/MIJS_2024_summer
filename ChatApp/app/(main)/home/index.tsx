import {
    ApplicationProvider,
    Button,
    IconRegistry,
    Layout,
} from '@ui-kitten/components';
import { EvaIconsPack } from '@ui-kitten/eva-icons';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import * as eva from '@eva-design/eva';
import { Auth } from '../../../components/Auth';
import React from 'react';
import { logout } from '../../../libs/Firebase';
import { Chat } from './Chat';
import { ChatInput } from './ChatInput';

export default function App() {
    return (
        <ApplicationProvider {...eva} theme={eva.light}>
            <IconRegistry icons={EvaIconsPack} />
            <Auth>
                <Layout style={styles.container}>
                    { /* ヘッダ: 投稿コンポーネント */}
                    <Layout style={styles.head}>
                        <ChatInput />
                    </Layout>
                    {/* チャット本体 */}
                    <Layout style={styles.body}>
                        <Chat style={{ flex: 1 }} />
                    </Layout>
                    { /* フッタ: ログアウトボタン */}
                    {/*
                    <Layout style={styles.bottom}>
                        <ButtomScreen />
                    </Layout>
                    */}
                </Layout>
            </Auth>
            <StatusBar style="auto" />
        </ApplicationProvider>
    );
}

class ButtomScreen extends React.Component<{}, {}> {
    render() {
        return (
            <Layout style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                <Button onPress={async (event) => await logout()}>ログアウト</Button>
                {/*<Text category='h1'>HOME</Text>*/}
            </Layout>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',    //コンポーネントは縦に配置
    },
    head: {
        height: 80, // 高さ80pxに固定
    },
    body: {
        flex: 1,  // 可変サイズ
    },
    bottom: {
        height: 50, // 高さを50pxに固定
    },
});
