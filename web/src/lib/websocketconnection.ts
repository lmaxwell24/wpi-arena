import ioClient from 'socket.io-client';

const socket = ioClient("http://localhost:8080");

export const io = socket;
