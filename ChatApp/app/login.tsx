import {
    ApplicationProvider,
    Button,
    Icon,
    IconRegistry,
    Input,
    Layout,
    Text,
} from '@ui-kitten/components';
import { EvaIconsPack } from '@ui-kitten/eva-icons';
import * as eva from '@eva-design/eva';

import {
    GestureResponderEvent,
    ImageProps,
    StyleSheet,
    TouchableOpacity,
    TouchableWithoutFeedback,
} from 'react-native';
import { loginEmail } from '../libs/Firebase';
import { useState } from 'react';
import { router } from 'expo-router';

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [securePassword, setSecurePassword] = useState(true);
    const [error, setError] = useState("");

    async function login(event: GestureResponderEvent) {
        try {
            console.log(`login event: email:${email} pass:${password}`);
            await loginEmail(email, password);

            //前のページに戻る
            if (router.canGoBack()) {
                //前のページがある場合
                //前のページに戻る
                router.back();
            } else {
                //前のページがない場合
                //Historyからログインページを削除して"/"に移動
                router.replace("/");
            }
        } catch (ex: any) {
            console.log(ex);
            setError(ex.message);
        }
    }

    function toggleSecurPassword() {
        setSecurePassword(!securePassword);
    }

    function EyeIcon(props: ImageProps | undefined): React.ReactElement {
        return (
            <TouchableOpacity onPress={toggleSecurPassword}>
                <Icon
                    {...props}
                    name={securePassword ? 'eye-off' : 'eye'}
                />
            </TouchableOpacity>
        );
    };

    return (
        <ApplicationProvider {...eva} theme={eva.light}>
            <IconRegistry icons={EvaIconsPack} />
            <Layout style={styles.container}>
                <Text>{error}</Text>
                <Input
                    style={styles.input}
                    label='メールアドレス'
                    placeholder='メールアドレス'
                    value={email}
                    onChangeText={(text) => setEmail(text)}
                />
                <Input
                    style={styles.input}
                    label='パスワード'
                    placeholder='パスワード'
                    value={password}
                    accessoryRight={EyeIcon}
                    secureTextEntry={securePassword}
                    onChangeText={(text) => setPassword(text)}
                />
                <Button onPress={login}>ログイン</Button>
            </Layout>

        </ApplicationProvider>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    input: {
        width: '80%',
        margin: 10,
        borderWidth: 1,
        padding: 1,
    },
});
