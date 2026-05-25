import { io, Socket } from 'socket.io-client';

class SocketService {
    private socket: Socket | null = null;

    connect() {
        if (!this.socket) {
            const socketUrl = import.meta.env.VITE_API_URL || '/';
            this.socket = io(socketUrl, {
                withCredentials: true,
                autoConnect: true
            });
            
            this.socket.on('connect', () => {
                console.log('Connected to socket server');
            });
        }
        return this.socket;
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
    }

    getSocket() {
        return this.socket;
    }
}

export const socketService = new SocketService();
