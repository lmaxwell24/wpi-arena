import { Server as httpServer } from 'node:http';
import { Server, Socket } from 'socket.io';

import { MatchState, Robot } from './match.ts';
import { Timer } from './timer.ts';

class ArenaSocket {
	io: Server;
	timer: Timer;
	matchState: MatchState;

	loadedMatch: string = '';
	matchPeriod: string = 'end';

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
			this.timer.onPause(() => {
				this.matchPeriod = 'pause';
				socket.emit('state', 'pause');
			});
			this.timer.onResume(() => {
				this.matchPeriod = 'start';
				socket.emit('state', 'start');
			});
			this.timer.onStart(() => {
				this.matchPeriod = 'start';
				socket.emit('state', 'start');
			});
			this.timer.onEnd(() => {
				this.matchPeriod = 'end';
				socket.emit('state', 'end');
			});
			this.timer.onUpdate((time) => {
				socket.emit('timer', time);
			});
			this.timer.onPrecount((time) => {
				socket.emit('precount', time);
			});
		});
	}
	sendState(socket: Socket) {
		socket.emit('timer', this.timer.time);
		socket.emit('precount', this.timer.precount);
		socket.emit('matchUpdate', this.matchState);
		socket.emit('state', this.matchPeriod);
	}

	start() {
		this.timer.startWithPrecount();
	}
	resume() {
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
		this.loadedMatch = '';
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
