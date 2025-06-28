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

const port = parseInt(process.env.PORT || '3000');
const host = process.env.IP || '0.0.0.0';

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

	app.post('/api/tap_out', async (req: Request<{}, {}, { robotId: 0 | 1 }>, res) => {
		let whoWon: 0 | 1 = req.body.robotId == 1 ? 0 : 1;
		arena.setWinner(whoWon, 'TO');
		if (arena.loadedMatch != '') {
			await tfApi.declareWinner(arena.loadedMatch, whoWon, 'TO');
		}
		res.status(200).send('OK');
	});

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

	app.post('/api/audience_overlay', (req: Request<{}, {}, { visible: boolean }>, res) => {
		arena.setAudienceOverlayVisible(req.body.visible);
		res.status(200).send('OK');
	});

	app.post(
		'/api/lower_third',
		(req: Request<{}, {}, { visible: boolean; title?: string; subtitle?: string }>, res) => {
			arena.setLowerThird(req.body.visible, req.body.title, req.body.subtitle);
			res.status(200).send('OK');
		}
	);

	app.post(
		'/api/display_state',
		(req: Request<{}, {}, { state: 'preload' | 'start' | 'pause' | 'end' | 'winner' }>, res) => {
			arena.setDisplayState(req.body.state);
			res.status(200).send('OK');
		}
	);

	app.use(handler);
	server.listen(port, host, 511, () => {
		console.log('WPI Arena');
		console.log(` Server: http://${host}:${port}`);
		console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
		console.log(
			` TrueFinals Integration: ${process.env.TF_TOURNAMENT_ID ? 'Enabled' : 'Disabled'}`
		);
		console.log(` Match Duration: ${process.env.MATCH_TIME}s`);
	});

	// Graceful shutdown
	process.on('SIGINT', () => {
		console.log('\n Shutting down WPI Arena');
		server.close(() => {
			console.log(' Server closed');
			process.exit(0);
		});
	});
};

main().catch((error) => {
	console.error(error);
});
