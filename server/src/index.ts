import { TrueFinals, isApiError } from './truefinals/api.ts';
import { ArenaSocket } from './arena/arena.ts';
import express, { Request } from 'express';
import { createServer } from 'node:http';
import { config } from 'dotenv-safe';
import cors from 'cors';
import morgan from 'morgan';
import { handler } from '../../web/build/handler.ts';
import { Robot } from './arena/match.ts';

config();

const port = process.env.PORT || 3000;

console.log('Starting Server');

const main = async () => {
	const api_user = process.env.TF_API_USER;
	const api_key = process.env.TF_API_KEY;
	const tfApi = new TrueFinals(api_user, api_key);

	const app = express();
	const server = createServer(app);

	app.use(cors<Request>());

	const arena = new ArenaSocket(server);

	app.use(morgan('combined'));
	app.use(express.json()); // for parsing application/json
	app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

	app.get('/api/tourney', async (_req, res) => {
		res.send(await tfApi.getTourney());
	});

	app.get('/api/players', async (_req, res) => {
		res.send(await tfApi.getPlayers());
	});

	app.get('/api/games', async (_req, res) => {
		res.send(await tfApi.getGames());
	});

	app.get('/api/game_info', async (_req, res) => {
		res.send(arena.matchState);
	});

	app.post(
		'/api/robot_ready',
		async (req: Request<{}, {}, { robotId: number; ready: boolean }>, res) => {
			arena.setReady(req.body.robotId, req.body.ready);
			res.status(200).send('OK');
		}
	);

	app.post(
		'/api/raw_match',
		(req: Request<{}, {}, { robot1?: Robot; robot2?: Robot; compMatch?: string }>, res) => {
			arena.setMatch(req.body.robot1, req.body.robot2, req.body.compMatch);
			res.send('OK');
		}
	);

	app.post('/api/load_match', async (req: Request<{}, {}, { matchId: string }>, res) => {
		let currentMatch = await tfApi.getMatchInfo(req.body.matchId);
		if (isApiError(currentMatch)) {
			res.send('400');
			return;
		}
		let player1 = await tfApi.getPlayer(currentMatch.slots[0].playerID as string);
		if (isApiError(player1)) {
			res.send('400');
			return;
		}
		let player2 = await tfApi.getPlayer(currentMatch.slots[1].playerID as string);
		if (isApiError(player2)) {
			res.send('400');
			return;
		}

		arena.setMatch(
			{ ...player1, photoUrl: player1.photoUrl as string | undefined, ready: false },
			{ ...player2, photoUrl: player2.photoUrl as string | undefined, ready: false },
			currentMatch.name
		);
		arena.setMatchId(currentMatch.id);
		res.send(currentMatch);
	});

	app.post(
		'/api/winner',
		async (
			req: Request<
				{},
				{},
				{
					who: 0 | 1;
					how: 'KO' | 'TO' | 'JD' | 'TKO' | 'HLD' | 'BY' | 'DQ' | 'FF' | 'T';
				}
			>,
			res
		) => {
			console.log(req.body);
			console.log(arena.loadedMatch);
			arena.setWinner(req.body.who, req.body.how);
			if (arena.loadedMatch != '') {
				await tfApi.declareWinner(arena.loadedMatch, req.body.who, req.body.how);
				res.status(200).send('OK');
			} else {
				res.status(200).send('No loaded match');
			}
		}
	);

	app.post('/api/timer', (req, res) => {
		switch (req.body.control) {
			case 'start':
				arena.start();
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

	app.use(handler);
	server.listen(port, () => {
		console.log(`Listening on port ${port}`);
	});
};

main().catch((error) => {
	console.error(error);
});
