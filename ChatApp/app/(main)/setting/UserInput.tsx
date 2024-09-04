import { Button, Input, Layout } from "@ui-kitten/components";
import React from "react";
import { GestureResponderEvent, StyleSheet } from 'react-native';
import { FirebaseContext, getUser, setUser } from "../../../libs/Firebase";
import { User } from "firebase/auth";
import { ChatUser } from "../../../models/ChatUser";

interface UserInputState {
    name: string;
    profile_picture: string;
    bio: string;
}

export class UserInput extends React.Component<{}, UserInputState> {
    static contextType = FirebaseContext;

    constructor(props: any) {
        super(props);
        this.state = {
            name: "",
            profile_picture: "",
            bio: "",
        };
        this.updateUserInfo = this.updateUserInfo.bind(this);
    }

    async componentDidMount(): Promise<void> {
        const fbUser = this.context as User;

        try {
            const snapshot = await getUser(fbUser.uid);
            const chatUser = snapshot.data();
            if (chatUser !== undefined) {
                this.setState({
                    name: chatUser?.name || "",
                    profile_picture: chatUser?.profile_picture || "",
                    bio: chatUser?.bio || "",
                });
            }
        } catch(error) {
            console.error(`Get User Error: ${error}`);
        }
    }
    async updateUserInfo(event: GestureResponderEvent): Promise<void> {
        try {
            const fbUser = this.context as User;
            const chatUser: ChatUser = {
                name: this.state.name,
                profile_picture: this.state.profile_picture,
                bio: this.state.bio,
            };
            console.log(`User: ${JSON.stringify(chatUser)}`);
            await setUser(fbUser.uid, chatUser);
        } catch(error) {
            console.error(`Update User Error: ${error}`);
        }
    }

    render(): React.ReactNode {
        const fbUser = this.context as User;
        return (
            <Layout style={styles.container}>
                <Input
                    style={styles.input}
                    label="ID"
                    value={fbUser.uid}
                    disabled={true}
                />
                <Input
                    style={styles.input}
                    label="メールアドレス"
                    value={fbUser.email || ""}
                    disabled={true}
                />
                <Input
                    style={styles.input}
                    label="名前"
                    value={this.state.name}
                    onChangeText={(value) => this.setState({ name: value })}
                />
                <Input
                    style={styles.input}
                    label="自己紹介"
                    multiline={true}
                    textStyle={{ height: 100, textAlignVertical: "top" }}
                    value={this.state.bio}
                    onChangeText={(value) => this.setState({ bio: value })}
                />
                <Button
                    onPress={async (event) => { await this.updateUserInfo(event) }}
                >
                    登録
                </Button>
            </Layout>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
    },
    input: {
        paddingBottom: 20,
    },
});
