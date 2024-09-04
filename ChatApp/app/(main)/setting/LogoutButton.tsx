import React from "react";
import { StyleSheet, Pressable, View, Text } from "react-native";
import { logout } from "../../../libs/Firebase";

export class LogoutButton extends React.Component<{}, {}> {
    constructor(props: any) {
        super(props);
    }

    render(): React.ReactNode {
        return (
            <Pressable
                onPress={async (event) => await logout()}
                style={({ pressed }) => [
                    {
                        backgroundColor: pressed ? 'rgb(210, 230, 255)' : 'dodgerblue',
                    },
                    styles.button,
                ]}
            >
                <View style={{ alignItems: 'center', }}>
                    <Text style={{ color: "white" }}>ログアウト</Text>
                </View>
            </Pressable>
        );
    }
}

const styles = StyleSheet.create({
    button: {
        borderRadius: 8,
        padding: 6,
    },
});
