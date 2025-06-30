import { TrueFinals } from './truefinals/api.ts';
import { ArenaSocket } from './arena/arena.ts';
import express, { Request } from 'express';
import { createServer } from 'node:http';
import { config } from 'dotenv-safe';
import cors from 'cors';
import morgan from 'morgan';
import { handler } from '../../web/build/handler.ts';

// Import route modules
import tournamentRoutes from './routes/tournament.ts';
import dataRoutes from './routes/data.ts';
import matchRoutes from './routes/match.ts';
import timerRoutes from './routes/timer.ts';
import displayRoutes from './routes/display.ts';

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

	// Use route modules
	app.use('/api', tournamentRoutes(tfApi));
	app.use('/api', dataRoutes(tfApi));
	app.use('/api', matchRoutes(arena, tfApi));
	app.use('/api', timerRoutes(arena, tfApi));
	app.use('/api', displayRoutes(arena));

	app.use(handler);
	server.listen(port, host, 511, () => {
		console.log('WPI Arena');
		console.log(` Server: http://${host}:${port}`);
		console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
		console.log(
			` TrueFinals Integration: ${process.env.TF_TOURNAMENT_IDS ? 'Enabled' : 'Disabled'}`
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
