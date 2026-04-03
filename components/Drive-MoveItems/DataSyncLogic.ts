import { useEffect } from 'react';
import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const useDataSync = (onDataUpdate: (data: any) => void) => {
    useEffect(() => {
        if (!socket) {
            socket = io(window.location.origin);
        }

        socket.on('data-updated', (data) => {
            console.log('Received data update:', data);
            onDataUpdate(data);
        });

        return () => {
            socket?.off('data-updated');
        };
    }, [onDataUpdate]);

    const syncData = (data: any) => {
        if (socket) {
            socket.emit('sync-data', data);
        }
    };

    return { syncData };
};
