import { Router, Request, Response } from 'express';
import { ArenaSocket } from '../arena/arena.ts';
import { TrueFinals, isApiError } from '../truefinals/api.ts';
import { Robot } from '../arena/match.ts';

export default (arena: ArenaSocket, tfApi: TrueFinals) => {
	const router = Router();

	router.get('/game_info', async (_req: Request, res: Response) => {
		res.send(arena.matchState);
	});

	router.post(
		'/robot_ready',
		async (
			req: Request<
				Record<string, never>,
				Record<string, never>,
				{ robotId: number; ready: boolean }
			>,
			res: Response
		) => {
			arena.setReady(req.body.robotId, req.body.ready);
			res.status(200).send('OK');
		}
	);
	router.get('/robot_ready', (_req: Request, res: Response) => {
		res.status(200).send({
			robot1: arena.matchState.robot1.ready,
			robot2: arena.matchState.robot2.ready
		});
	});

	router.post(
		'/raw_match',
		(
			req: Request<
				Record<string, never>,
				Record<string, never>,
				{ robot1?: Robot; robot2?: Robot; compMatch?: string }
			>,
			res: Response
		) => {
			arena.setMatch(req.body.robot1, req.body.robot2, req.body.compMatch);
			res.send('OK');
		}
	);

	router.post(
		'/load_match',
		async (
			req: Request<
				Record<string, never>,
				Record<string, never>,
				{ matchId: string; tournamentId?: string }
			>,
			res: Response
		) => {
			if (req.body.tournamentId) {
				tfApi.setActiveTournament(req.body.tournamentId);
			}
			const currentMatch = await tfApi.getMatchInfo(req.body.matchId);
			if (isApiError(currentMatch)) {
				res.status(400).send('Invalid match ID');
				return;
			}
			// Pre-fetch all players for the active tournament to populate the cache
			const allPlayers = await tfApi.getPlayers();
			if (isApiError(allPlayers)) {
				res.status(400).send('Failed to retrieve players');
				return;
			}

			const player1 = allPlayers.find((p) => p.id === currentMatch.slots[0].playerID);
			if (!player1) {
				res.status(400).send('Invalid player ID for player 1');
				return;
			}
			const player2 = allPlayers.find((p) => p.id === currentMatch.slots[1].playerID);
			if (!player2) {
				res.status(400).send('Invalid player ID for player 2');
				return;
			}

			arena.setMatch(
				{ ...player1, photoUrl: player1.photoUrl as string | undefined, ready: false },
				{ ...player2, photoUrl: player2.photoUrl as string | undefined, ready: false },
				currentMatch.name,
				tfApi.getActiveTournament()
			);
			arena.setMatchId(currentMatch.id);
			res.send(currentMatch);
		}
	);

	router.post(
		'/winner',
		async (
			req: Request<
				Record<string, never>,
				Record<string, never>,
				{
					who: 0 | 1;
					how: 'KO' | 'TO' | 'JD' | 'TKO' | 'HLD' | 'BY' | 'DQ' | 'FF' | 'T';
				}
			>,
			res: Response
		) => {
			console.log(req.body);
			console.log(arena.loadedMatch);
			arena.setWinner(req.body.who, req.body.how);
			if (arena.loadedMatch != '') {
				await tfApi.declareWinner(
					arena.loadedMatch,
					req.body.who,
					req.body.how,
					arena.matchState.compEvent
				);
				res.status(200).send('OK');
			} else {
				res.status(200).send('No loaded match');
			}
		}
	);

	router.post(
		'/tap_out',
		async (
			req: Request<Record<string, never>, Record<string, never>, { robotId: 0 | 1 }>,
			res: Response
		) => {
			const whoWon: 0 | 1 = req.body.robotId == 1 ? 0 : 1;
			arena.setWinner(whoWon, 'TO');
			if (arena.loadedMatch != '') {
				await tfApi.declareWinner(arena.loadedMatch, whoWon, 'TO');
			}
			res.status(200).send('OK');
		}
	);

	return router;
};
