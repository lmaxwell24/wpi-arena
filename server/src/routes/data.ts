import { Router, Request, Response } from 'express';
import { TrueFinals } from '../truefinals/api.ts';

export default (tfApi: TrueFinals) => {
	const router = Router();

	router.get('/players', async (_req: Request, res: Response) => {
		res.send(await tfApi.getPlayers());
	});

	router.get('/games', async (_req: Request, res: Response) => {
		res.send(await tfApi.getGames());
	});

	router.get('/allgames', async (_req: Request, res: Response) => {
		res.send(await tfApi.getAllGames());
	});

	return router;
};
