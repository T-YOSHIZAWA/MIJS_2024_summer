import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { ApplicationProvider, Layout, Text } from '@ui-kitten/components';
import * as eva from '@eva-design/eva';
import { Auth } from '../../../components/Auth';
import { useState } from 'react';
import { logout } from '../../../libs/Firebase';
import { UserInput } from './UserInput';
import { LogoutButton } from './LogoutButton';


export default function Page() {
    const [name, setName] = useState("");

    return (
        <ApplicationProvider {...eva} theme={eva.light}>
            <Auth>
                <ScrollView style={styles.container}>
                    <Layout style={{ padding: 50 }}>
                        <Layout style={styles.input}>
                            <UserInput />
                        </Layout>
                        <Layout style={styles.logout}>
                            <LogoutButton />
                        </Layout>
                    </Layout>
                </ScrollView>
            </Auth>
        </ApplicationProvider>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
    },
    input: {
    },
    logout: {
        paddingVertical: 50,
    },
    button: {
        borderRadius: 8,
        padding: 6,
    },
});
