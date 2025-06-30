import { Router, Request, Response } from 'express';
import { ArenaSocket } from '../arena/arena.ts';
import { TrueFinals } from '../truefinals/api.ts';

export default (arena: ArenaSocket, tfApi: TrueFinals) => {
	const router = Router();

	router.post('/timer', async (req: Request, res: Response) => {
		switch (req.body.control) {
			case 'start':
				arena.start();
				if (arena.loadedMatch != '') {
					await tfApi.markGameActive(arena.loadedMatch, arena.matchState.compEvent);
				}
				res.send(200);
				break;
			case 'resume':
				arena.resume();
				res.send(200);
				break;
			case 'pause':
				arena.pause();
				res.send(200);
				break;
			case 'restart':
				arena.restart();
				res.send(200);
				break;
			case 'set':
				arena.setTime(req.body.time);
				res.send(200);
				break;
			default:
				res.send(400);
		}
	});

	router.get('/timer', (_req: Request, res: Response) => {
		res.status(200).send({
			time: arena.timer.time,
			precount: arena.timer.precount,
			running: arena.timer.running,
			finished: arena.timer.finished
		});
	});

	return router;
};
