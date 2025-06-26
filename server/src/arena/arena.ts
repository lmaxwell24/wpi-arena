import { Server as httpServer } from 'node:http';
import { Server, Socket } from 'socket.io';

import { MatchState, Robot } from './match.ts';
import { Timer } from './timer.ts';

class ArenaSocket {
	io: Server;
	timer: Timer;
	matchState: MatchState;

	loadedMatch: string = '';

	constructor(server: httpServer) {
		this.io = new Server(server, {
			cors: {
				origin: 'http://localhost:5173'
			}
		});
		this.timer = new Timer(Number(process.env.MATCH_TIME));

		this.matchState = {
			robot1: { name: 'Robot 1' },
			robot2: { name: 'Robot 2' },
			compName: process.env.TOURNAMENT_NAME,
			compMatch: 'Test Match'
		};

		this.timer.startThread();

		this.io.on('connection', (socket) => {
			this.sendState(socket);
			this.timer.onUpdate((time) => {
				socket.emit('timer', time);
			});
		});
	}
	sendState(socket: Socket) {
		socket.emit('timer', this.timer.time);
		socket.emit('matchUpdate', this.matchState);
	}

	start() {
		this.timer.start();
	}
	pause() {
		this.timer.pause();
	}
	restart() {
		this.timer.restart();
	}
	setTime(target: number) {
		this.timer.setTime(target);
	}

	setWinner(who: 0 | 1, method: string) {
		this.io.emit('winner', { player: who, method });
	}

	setMatchId(id: string) {
		this.loadedMatch = id;
	}

	setMatch(robot1?: Robot, robot2?: Robot, compMatch?: string) {
		this.matchState = {
			...this.matchState,
			robot1: { ...this.matchState.robot1, ...robot1 },
			robot2: { ...this.matchState.robot2, ...robot2 },
			compMatch: compMatch || this.matchState.compMatch
		};
		this.io.emit('matchUpdate', { robot1, robot2, compMatch });
	}
}

export { ArenaSocket };
