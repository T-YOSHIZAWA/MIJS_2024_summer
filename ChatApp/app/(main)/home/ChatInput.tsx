import React from "react";
import { GestureResponderEvent, StyleProp, ViewStyle, StyleSheet } from 'react-native';
import { Button, Input, Layout } from "@ui-kitten/components";
import { FirebaseContext, onUserChanged, sendMessage } from "../../../libs/Firebase";
import { Unsubscribe, User } from "firebase/auth";
import { ChatMessage } from "../../../models/ChatMessage";
import { Timestamp } from "firebase/firestore";

interface ChatInputState {
    sender_name?: string;
    message: string;
}

export class ChatInput extends React.Component<{}, ChatInputState> {
    unsub?: Unsubscribe;
    static contextType = FirebaseContext;
    //context: React.ContextType<typeof FirebaseContext>;

    constructor(props: any) {
        super(props);
        //Stateの初期化
        this.state = {
            sender_name: undefined,
            message: "",
        }
        //render()メソッドで使用するメソッドは、すべてバインドする必要がある
        this.addMessage = this.addMessage.bind(this);
    }

    componentDidMount(): void {
        const user = this.context as User;

        //Firestoreの更新を受信してstateを変更する
        // /users/(user.uid)/ の変更を受信
        this.unsub = onUserChanged(user.uid, (snapshot) => {
            const chatUser = snapshot.data();
            if (chatUser !== undefined) {
                this.setState({
                    ...this.state,
                    sender_name: chatUser.name || user.email || undefined,
                });
            }
        });
    }

    componentWillUnmount(): void {
        //ComponentがUnmountする際、unsubが設定されていれば、unsubを実行する(FirestoreのListenerをデタッチ)
        if (this.unsub !== undefined)
            this.unsub();
    }

    async addMessage(event: GestureResponderEvent) {
        const user = this.context as User;

        //送信データ生成
        const chatMsg: ChatMessage = {
            sender_id: user.uid,
            sender_name: this.state.sender_name || user.email || "",
            message_type: "text",
            content: this.state.message,
            media_url: "",
            timestamp: Timestamp.fromDate(new Date()),
        };
        console.log(`Add Message: ${JSON.stringify(chatMsg)}`);

        //メッセージ送信
        try {
            await sendMessage(chatMsg);
            this.setState({ ...this.state, message: "" });
        } catch (error) {
            console.error(`send Message Error: ${error}`);
        }
    }

    render(): React.ReactNode {
        return (
            <Layout style={styles.container}>
                <Input
                    style={{ flex: 5 }}
                    multiline={true}
                    textStyle={{ height: 60, textAlignVertical: "top" }}
                    placeholder={`${this.state.sender_name}さん`}
                    value={this.state.message}
                    onChangeText={(text) => this.setState({ message: text })}
                />
                <Button style={{ flex: 1 }} onPress={async (event) => await this.addMessage(event)}>投稿</Button>
            </Layout>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
    },
});