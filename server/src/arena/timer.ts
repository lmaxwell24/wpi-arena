class Timer {
	time: number; // seconds
	startTime: number; // seconds

	precount: number;
	precountDuration: number;

	precounting: boolean = false;
	running: boolean = false;
	finished: boolean = false;

	startHandlers: ((currentTime: number) => void)[] = [];
	resumeHandlers: ((currentTime: number) => void)[] = [];
	updateHandlers: ((currentTime: number) => void)[] = [];
	pauseHandlers: ((currentTime: number) => void)[] = [];
	precountHandlers: ((currentTime: number) => void)[] = [];
	endHandlers: (() => void)[] = [];

	timerInterval: number = 100; // ms

	constructor(totalTime?: number) {
		this.startTime = totalTime ?? 180;
		this.time = this.startTime;

		this.precountDuration = 5; // seconds
		this.precount = this.precountDuration;
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
	onResume(fn: (currentTime: number) => void) {
		this.resumeHandlers.push(fn);
	}
	start() {
		this.running = true;
		this.resumeHandlers.forEach((h) => h(this.time));
	}
	onPrecount(fn: (currentTime: number) => void) {
		this.precountHandlers.push(fn);
	}
	onEnd(fn: () => void) {
		this.endHandlers.push(fn);
	}
	startWithPrecount() {
		this.running = true;
		this.precounting = true;
		this.startHandlers.forEach((h) => h(this.time));
	}

	restart() {
		this.running = false;
		this.finished = false;
		this.precounting = false;
		this.time = this.startTime;
		this.precount = this.precountDuration;
		this.updateHandlers.forEach((h) => h(this.time));
    this.precountHandlers.forEach((h) => h(this.precount));
    this.endHandlers.forEach((h) => h())
	}

	setTime(target: number) {
		this.time = target;
		this.updateHandlers.forEach((h) => h(this.time));
	}

	onUpdate(fn: (currentTime: number) => void) {
		this.updateHandlers.push(fn);
	}
	startThread() {
		setInterval(() => {
			if (this.running) {
				if (this.precounting) {
					this.precount -= this.timerInterval / 1000;
					if (this.precount <= 0) {
						this.precounting = false;
            this.precount = 0
					}
					this.precountHandlers.forEach((h) => h(this.precount));
				} else {
					this.time -= this.timerInterval / 1000;

					if (this.time < 0) {
						this.running = false;
						this.finished = true;
						this.time = 0;
						this.endHandlers.forEach((h) => h());
					}
					this.updateHandlers.forEach((h) => h(this.time));
				}
			}
		}, this.timerInterval);
	}
}

export { Timer };
