class Timer {
	time: number; // seconds
	startTime: number; // seconds
	running: boolean = false;
	finished: boolean = false;

	startHandlers: ((currentTime: number) => void)[] = [];
	updateHandlers: ((currentTime: number) => void)[] = [];
	pauseHandlers: ((currentTime: number) => void)[] = [];
	endHandlers: (() => void)[] = [];

	timerInterval: number = 100; // ms

	constructor(totalTime?: number) {
		this.startTime = totalTime ?? 180;
		this.time = this.startTime;
	}

	onPause(fn: (currentTime: number) => void) {
		this.pauseHandlers.push(fn);
	}
	pause() {
		this.running = false;
		this.pauseHandlers.forEach((h) => h(this.time));
	}

	onStart(fn: (currentTime: number) => void) {
		this.startHandlers.push(fn);
	}
	start() {
		this.running = true;
	}

	restart() {
		this.running = false;
		this.finished = false;
		this.time = this.startTime;
		this.updateHandlers.forEach((h) => h(this.time));
	}

	onUpdate(fn: (currentTime: number) => void) {
		this.updateHandlers.push(fn);
	}
	startThread() {
		setInterval(() => {
			if (this.running) {
				this.time -= this.timerInterval / 1000;

				if (this.time < 0) {
					this.running = false;
					this.finished = true;
					this.time = 0;
					this.endHandlers.forEach((h) => h());
				}
				this.updateHandlers.forEach((h) => h(this.time));
			}
		}, this.timerInterval);
	}
}

export { Timer };
