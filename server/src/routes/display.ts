import { Router, Request, Response } from 'express';
import { ArenaSocket } from '../arena/arena.ts';

export default (arena: ArenaSocket) => {
	const router = Router();

	router.post(
		'/audience_overlay',
		(
			req: Request<Record<string, never>, Record<string, never>, { visible: boolean }>,
			res: Response
		) => {
			arena.setAudienceOverlayVisible(req.body.visible);
			res.status(200).send('OK');
		}
	);

	router.get('/audience_overlay', (_req: Request, res: Response) => {
		res.status(200).send({
			visible: arena.audienceOverlayVisible
		});
	});

	router.post(
		'/lower_third',
		(
			req: Request<
				Record<string, never>,
				Record<string, never>,
				{ visible: boolean; title?: string; subtitle?: string }
			>,
			res: Response
		) => {
			arena.setLowerThird(req.body.visible, req.body.title, req.body.subtitle);
			res.status(200).send('OK');
		}
	);
	router.get('/lower_third', (_req: Request, res: Response) => {
		res.status(200).send({
			visible: arena.lowerThird.visible,
			title: arena.lowerThird.title,
			subtitle: arena.lowerThird.subtitle
		});
	});

	router.post(
		'/display_state',
		(
			req: Request<
				Record<string, never>,
				Record<string, never>,
				{ state: 'preload' | 'start' | 'pause' | 'end' | 'winner' }
			>,
			res: Response
		) => {
			arena.setDisplayState(req.body.state);
			res.status(200).send('OK');
		}
	);

	return router;
};
