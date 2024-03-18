import WebSocket from 'ws';
import jwt from 'jsonwebtoken';
import User from './models/User';
import Group from './models/Group';

interface WebSocketConnection {
    ws: WebSocket;
    userId: string;
    groupId: string;
}

const connections: WebSocketConnection[] = [];

export function initializeWebSocketServer(server: any) {
    const wss = new WebSocket.Server({ server });

    wss.on('connection', function connection(ws, req) {
        if (!req.url || req.url === "") return;
        const queryString = req.url.split('?')[1];

        // Parse the query string to get URLSearchParams object
        const params = new URLSearchParams(queryString);

        // Extract the values of 'token' and 'groupId' parameters
        const token = params.get('token');
        const groupId = params.get('groupId');

        if (!token || !groupId) return;

        jwt.verify(token, process.env.JWT_SECRET ?? "", (err, decoded: any) => {
            if (err) {
                ws.close(1008, 'Invalid token');
                return;
            }

            User.findById(decoded.userId).select('-password -__v').then(async (sender) => {
                const _groups = await Group.find({ members: decoded.userId }).populate({
                    path: 'members',
                    select: '-password -__v' // Exclude password and __v fields
                });
                const groups = _groups.map(group => group._id.toString());

                if (!groups.includes(groupId)) {
                    ws.close(401, 'You are not part of this group');
                    return;
                }
                connections.push({ ws, userId: decoded.userId, groupId })

                ws.on('message', function incoming(message) {
                    // Convert message to string if it's not already
                    const stringMessage = typeof message !== 'string' ? message.toString() : message;

                    // Find all WebSocket connections that belong to other members of the group
                    wss.clients.forEach(function each(client) {
                        if (client !== ws && client.readyState === WebSocket.OPEN) {
                            connections.filter(connection => connection.groupId === groupId).map(
                                connection => connection.ws.send(JSON.stringify({
                                    sender: sender,
                                    content: stringMessage
                                })))

                        }
                    });
                });

                ws.on('close', function close() {
                    console.log('Client disconnected from WebSocket');
                });
            }).catch((error) => {
                console.error('Error fetching user:', error);
                ws.close(1008, 'Error fetching user');
            });
        });
    });
}
