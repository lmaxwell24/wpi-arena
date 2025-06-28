type Robot = {
	name: string;
	photoUrl?: string;
	ready: boolean;
};

type MatchState = {
	robot1: Robot;
	robot2: Robot;
	compName: string;
	compMatch: string;
};

export { Robot, MatchState };
