import { Router, Request, Response } from 'express';
import { TrueFinals } from '../truefinals/api.ts';

export default (tfApi: TrueFinals) => {
	const router = Router();

	router.get('/tourney', async (_req: Request, res: Response) => {
		res.send(await tfApi.getTourney());
	});

	router.post(
		'/tournament',
		async (
			req: Request<Record<string, never>, Record<string, never>, { tournamentId: string }>,
			res: Response
		) => {
			if (!req.body.tournamentId) {
				res.status(400).send('Tournament ID is required');
				return;
			}
			tfApi.setActiveTournament(req.body.tournamentId);
			res.status(200).send('OK');
		}
	);

	router.get('/tournament', async (_req: Request, res: Response) => {
		res.status(200).send({
			activeTournament: tfApi.getActiveTournament(),
			availableTournaments: await tfApi.getAvailableTournaments()
		});
	});

	return router;
};
