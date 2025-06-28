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
	audienceOverlayVisible: boolean = true;
	lowerThird: {
		visible: boolean;
		title: string;
		subtitle: string;
	} = {
		visible: false,
		title: '',
		subtitle: ''
	};

	constructor(server: httpServer) {
		this.io = new Server(server, {
			cors: {
				origin: 'http://localhost:5173'
			}
		});
		this.timer = new Timer(Number(process.env.MATCH_TIME));

		this.matchState = {
			robot1: { name: 'Robot 1', ready: false },
			robot2: { name: 'Robot 2', ready: false },
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
		if (this.timer.running) {
			socket.emit('matchUpdate', this.matchState);
			socket.emit('state', this.matchPeriod);
		} else {
			socket.emit('state', this.matchPeriod);
			socket.emit('matchUpdate', this.matchState);
		}
		socket.emit('robotReady', { robotId: 0, ready: this.matchState.robot1.ready });
		socket.emit('robotReady', { robotId: 1, ready: this.matchState.robot2.ready });
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
		if (this.timer.running) {
			this.timer.pause();
		}
		this.io.emit('winner', { player: who, method });
	}

	setMatchId(id: string) {
		this.loadedMatch = id;
	}

	setReady(id: number, state: boolean) {
		this.io.emit('robotReady', { robotId: id, ready: state });
		if (id == 0) {
			this.matchState.robot1.ready = state;
		} else if (id == 1) {
			this.matchState.robot2.ready = state;
		} else {
			console.error('Invalid robot');
		}
	}

	setMatch(robot1?: Robot, robot2?: Robot, compMatch?: string) {
		this.loadedMatch = '';
		this.restart();
		this.matchState = {
			...this.matchState,
			robot1: { ...this.matchState.robot1, ...robot1, ready: false },
			robot2: { ...this.matchState.robot2, ...robot2, ready: false },
			compMatch: compMatch || this.matchState.compMatch
		};
		this.io.emit('matchUpdate', { robot1, robot2, compMatch });
		this.io.emit('robotReady', { robotId: 0, ready: false });
		this.io.emit('robotReady', { robotId: 1, ready: false });
	}

	// Audience display controls
	setAudienceOverlayVisible(visible: boolean) {
		this.audienceOverlayVisible = visible;
		this.io.emit('audienceOverlay', { visible });
	}

	setLowerThird(visible: boolean, title?: string, subtitle?: string) {
		this.lowerThird = {
			visible,
			title: title || this.lowerThird.title,
			subtitle: subtitle || this.lowerThird.subtitle
		};
		this.io.emit('lowerThird', this.lowerThird);
	}

	setDisplayState(state: 'preload' | 'start' | 'pause' | 'end' | 'winner') {
		this.matchPeriod = state;
		this.io.emit('state', state);
	}
}

export { ArenaSocket };
