// src/livekitToken.ts
import { AccessToken } from 'livekit-server-sdk';

export function createLiveKitToken(params: {
    roomName: string;
    userId: string;
    userName?: string;
    canPublish: boolean;
}) {
    const at = new AccessToken(process.env.LIVEKIT_API_KEY!, process.env.LIVEKIT_API_SECRET!, {
        identity: params.userId,
        name: params.userName,
    });
    at.addGrant({
        room: params.roomName,
        roomJoin: true,
        canPublish: params.canPublish,
        canSubscribe: true,
        canPublishData: true,
    });
    return at.toJwt();
}
