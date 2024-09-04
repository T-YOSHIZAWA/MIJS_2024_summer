import { Timestamp } from "firebase/firestore";

export interface ChatMessage {
    sender_id?: string;
    sender_name?: string;
    message_type?: string;
    content?: string;
    media_url?: string;
    timestamp: Timestamp;

}