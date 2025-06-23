type Robot = {
	name: string;
	imageUrl?: string;
};

type MatchState = {
	robot1: Robot;
	robot2: Robot;
	compName: string;
	compMatch: string;
};

export { Robot, MatchState };
