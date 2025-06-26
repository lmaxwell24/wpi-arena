import { TrueFinals } from './truefinals/api.ts';
import { ArenaSocket } from './arena/arena.ts';
import express, { Request } from 'express';
import { createServer } from 'node:http';
import { config } from 'dotenv-safe';
import cors from 'cors';
import { handler } from '../../web/build/handler.ts';
import { Robot } from './arena/match.ts';

config();

const port = process.env.PORT || 3000;

console.log('hello world');

const main = async () => {
	const api_user = process.env.TF_API_USER;
	const api_key = process.env.TF_API_KEY;
	const tfApi = new TrueFinals(api_user, api_key);

	const app = express();
	const server = createServer(app);

	app.use(cors<Request>());

	const arena = new ArenaSocket(server);

	app.use(express.json()); // for parsing application/json
	app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

	app.get('/api/tourney', async (req, res) => {
		res.send(await tfApi.getTourney());
	});

	app.get('/api/players', async (req, res) => {
		res.send(await tfApi.getPlayers());
	});

	app.post(
		'/api/raw_match',
		(req: Request<{}, {}, { robot1?: Robot; robot2?: Robot; compMatch?: string }>, res) => {
			console.log(req.body);
			arena.setMatch(req.body.robot1, req.body.robot2, req.body.compMatch);
			res.send('OK');
		}
	);

	app.post('/api/load_match', async (req: Request<{}, {}, { matchId: string }>, res) => {
		res.send(await tfApi.getMatchInfo(req.body.matchId));
	});

	app.post('/api/timer', (req, res) => {
		switch (req.body.control) {
			case 'start':
				arena.start();
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
