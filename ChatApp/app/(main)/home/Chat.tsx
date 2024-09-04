import React from "react";
import { ChatMessage } from "../../../models/ChatMessage";
import { FirebaseContext, onMessagesChanged, readMessagesByCursor } from "../../../libs/Firebase";
import { Layout, Card, Divider, List, Text } from "@ui-kitten/components";
import { User } from "firebase/auth";
import { StyleProp, View, ViewProps, ViewStyle } from 'react-native';
import { Unsubscribe } from "firebase/firestore";

interface Message extends ChatMessage {
    id: string
}

interface ChatProps {
    style?: StyleProp<ViewStyle>
}

interface ChatState {
    isAutoRead: boolean
    messages: Message[],
}

export class Chat extends React.Component<ChatProps, ChatState> {
    unsub?: Unsubscribe;
    static contextType = FirebaseContext;

    constructor(props: ChatProps) {
        super(props);
        //Stateの初期化
        this.state = {
            isAutoRead: true,
            messages: [],
        }

        //render()メソッドで使用するメソッドは、すべてバインドする必要がある
        this.renderItem = this.renderItem.bind(this);
        this.renderItemHeader = this.renderItemHeader.bind(this);
        this.renderItemFooter = this.renderItemFooter.bind(this);
        this.handleStartReached = this.handleStartReached.bind(this);
        this.handleEndReached = this.handleEndReached.bind(this);
    }

    componentDidMount(): void {
        const user = this.context as User;

        //Firestoreの更新を受信してstateを変更する
        //  /messages/ の変更を受信
        this.unsub = onMessagesChanged((snapshot) => {
            console.log(`OnMessages Changed... ${this.state.isAutoRead}`);
            //自動読み込みが有効である場合のみ、更新データをStateに登録する
            if (this.state.isAutoRead) {
                const messages = snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id } as Message));
                this.setState({ ...this.state, messages: messages });
            }
        });
    }

    componentWillUnmount(): void {
        //ComponentがUnmountする際、unsubが設定されていれば、unsubを実行する(FirestoreのListenerをデタッチ)
        if (this.unsub !== undefined) {
            this.unsub();
        }
    }

    async handleStartReached(info: { distanceFromStart: number }) {
        try {
            //最上部データを読み込む
            const snapshot = await readMessagesByCursor();
            const messages = snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id } as Message));

            //Stateに読み込んだデータを設定
            //自動読み込みを有効にする
            this.setState({
                ...this.state,
                messages: messages,
                isAutoRead: true
            });
        } catch (error) {
            console.error(`Read Message Error: ${error}`);
        }
    }
    async handleEndReached(info: { distanceFromEnd: number }) {
        //最下部データのIDを取得
        const id = this.state.messages[this.state.messages.length - 1].id;

        try {
            //最下部以降のデータを読み込む
            const snapshot = await readMessagesByCursor(id);
            const messages = snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id } as Message));

            //連結したデータをState.messagesに設定
            //メッセージ件数が10件未満の場合は自動読み込みは有効のままにする
            const isAutoRead = (this.state.messages.length < 10) ? true : false;
            this.setState({
                ...this.state,
                messages: this.state.messages.concat(messages),
                isAutoRead: isAutoRead,
            });
        } catch(error) {
            console.error(`Read Message Error: ${error}`);
        }
    }

    render(): React.ReactNode {
        return (
            //表示スタイルは外部から設定する
            <Layout style={this.props.style}>
                <List
                    //行の境界の表示方法
                    ItemSeparatorComponent={Divider}
                    //明細データの定義
                    data={this.state.messages}
                    //明細データ表示
                    renderItem={this.renderItem}
                    //最上部までスクロールした後のイベント
                    onStartReached={async (info) => await this.handleStartReached(info)}
                    //onStartReachedを呼び出すまでの距離
                    onStartReachedThreshold={0.5}
                    //最下部までスクロールした後のイベント
                    onEndReached={async (info) => await this.handleEndReached(info)}
                    //onEndReachedを呼び出すまでの距離
                    onEndReachedThreshold={0.5}
                />
            </Layout>
        );
    }

    renderItem({ item, index }: { item: Message; index: number }): React.ReactElement {
        const user = this.context as User;

        return (
            <Layout
                style={{ marginVertical: 20 }}
            >
                <Layout style={{ flex: 1, marginHorizontal: 20, marginTop: 10 }}>
                    <Text>
                        {`${item.sender_name} さんの投稿`}
                    </Text>
                </Layout>
                <Card
                    style={{ marginHorizontal: 20, marginVertical: 5 }}
                    status={(item.sender_id === user.uid) ? "primary" : "basic"}
                >
                    <Text>
                        {item.content}
                    </Text>
                </Card>
                <Layout style={{ flex: 1, flexDirection: "row", marginHorizontal: 20, marginBottom: 10 }}>
                    <Text style={{ flex: 1 }}>
                        {item.timestamp.toDate().toLocaleString()}
                    </Text>
                    <Text style={{ flex: 1 }} appearance='hint' category='p2'>
                        {item.id}
                    </Text>
                </Layout>
            </Layout>
            // <Card
            //     style={{ marginHorizontal: 20, marginVertical: 20 }}
            //     status='basic'
            //     header={(headerProps) => this.renderItemHeader(item, headerProps)}
            //     footer={(footerProps) => this.renderItemFooter(item, footerProps)}
            // >
            //     <Text>
            //         {item.message}
            //     </Text>
            // </Card>
        );
    }

    renderItemHeader(item: Message, headerProps?: ViewProps): React.ReactElement {
        return (
            <View {...headerProps}>
                <Text>{item.sender_name}</Text>
            </View>
        );
    }

    renderItemFooter(item: Message, footerProps?: ViewProps): React.ReactElement {
        return (
            <View {...footerProps}>
                <Text>{item.timestamp.toDate().toISOString()}</Text>
            </View>
        );
    }

}
