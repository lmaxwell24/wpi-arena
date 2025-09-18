import ioClient from 'socket.io-client';
import { PUBLIC_API_IP, PUBLIC_API_PORT } from '$env/static/public';

const socket = ioClient({path: "/api/socket.io"});

export const io = socket;
