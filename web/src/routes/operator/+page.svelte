<script lang="ts">
	import { io } from '$lib/websocketconnection';
	import { timeRelative } from '$lib';
	import { onMount } from 'svelte';
	import Ref from '../../comonents/Ref.svelte';

	let state = {
		time: 180,
		precount: 5,
		selectedWinner: null,
		winningMode: '',
		serverState: {
			robot1: {
				name: 'Robot 1',
				photoUrl:
					"data:image/svg+xml;charset=utf8,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%3E%3C/svg%3E",
				ready: false
			},
			robot2: {
				name: 'Robot 2',
				photoUrl:
					"data:image/svg+xml;charset=utf8,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%3E%3C/svg%3E",
				ready: false
			},
			compName: 'A Robot Comp',
			compMatch: 'Semifinals'
		}
	};

	const callApi = async (endpoint: string, data: any, method?: string = 'GET') => {
		return await fetch(`http://localhost:8080${endpoint}`, {
			method,
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(data)
		});
	};

	let overwriteTime = 180;

	let players = [];
	let games = [];
	let test = {};
	let selectedGame = {};
	let selectedGameInfo = {};

	const loadDatabase = async () => {
		let players_raw = await callApi('/api/players');
		players = await players_raw.json();
		console.log(players);

		let games_raw = await callApi('/api/games');
		games = await games_raw.json();
		console.log(games);
	};

	const getPlayerById = (id: number) => {
		return players.filter((p) => p.id == id)[0];
	};

	onMount(async () => {
		io.on('timer', (data) => {
			state.time = data;
		});

		io.on('precount', (data) => {
			state.precount = Math.ceil(data);
		});

		io.on('matchUpdate', (data) => {
			state.serverState = { ...state.serverState, ...data };
		});

		await loadDatabase();
	});

	const startTimer = async () => {
		await callApi('/api/timer', { control: 'start' }, 'POST');
	};

	const resumeTimer = async () => {
		await callApi('/api/timer', { control: 'resume' }, 'POST');
	};

	const pauseTimer = async () => {
		await callApi('/api/timer', { control: 'pause' }, 'POST');
		overwriteTime = Number(state.time.toPrecision(4));
	};

	const restartTimer = async () => {
		await callApi('/api/timer', { control: 'restart' }, 'POST');
	};

	const overwriteTimer = async () => {
		await callApi('/api/timer', { control: 'set', time: overwriteTime }, 'POST');
	};

	const loadTestMatch = async () => {
		await callApi(
			'/api/raw_match',
			{ robot1: test.player1, robot2: test.player2, compMatch: 'Test Match' },
			'POST'
		);
	};

	const loadTFMatch = async () => {
		selectedGameInfo = await (
			await callApi('/api/load_match', { matchId: selectedGame.id }, 'POST')
		).json();
	};

	const sendReadyStatus = async (robotId: number, ready: boolean) => {
		await callApi('/api/robot_ready', { robotId, ready }, 'POST');
		state.serverState[`robot${robotId + 1}`].ready = ready;
	};
	const emitWinner = async () => {
		await callApi('/api/winner', { who: state.selectedWinner, how: state.winningMode }, 'POST');
		state.selectedWinner = null;
		state.winningMode = '';
	};
</script>

<div class="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900/20 to-slate-900 p-6">
	<div class="mx-auto max-w-7xl">
		<!-- Header -->
		<div class="mb-8">
			<h1 class="mb-2 text-3xl font-bold text-white">Robot Arena - Operator Panel</h1>
			<p class="text-slate-400">Control match timing, load competitions, and manage the arena</p>
		</div>

		<div class="grid grid-cols-1 gap-6 xl:grid-cols-2">
			<!-- Referee Controls -->
			<div>
				<Ref
					{startTimer}
					{resumeTimer}
					{pauseTimer}
					{overwriteTimer}
					{restartTimer}
					bind:overwriteTime
					time={state.time.toPrecision(4)}
					precount={state.precount}
					bind:selectedWinner={state.selectedWinner}
					robot1Name={state.serverState.robot1.name}
					robot2Name={state.serverState.robot2.name}
					bind:winningMode={state.winningMode}
					{emitWinner}
					{sendReadyStatus}
					ready1={state.serverState.robot1.ready}
					ready2={state.serverState.robot2.ready}
				/>
			</div>
			<!-- Match Loading -->
			<div class="card">
				<div class="card-header">
					<h2 class="text-xl font-semibold text-white">Match Loading</h2>
				</div>
				<div class="card-body space-y-6">
					<!-- Test Match -->
					<div class="rounded-lg bg-slate-700/50 p-4">
						<h3 class="mb-4 text-center text-lg font-medium text-white">Test Match</h3>
						<div class="space-y-3">
							<div>
								<label class="mb-1 block text-sm font-medium text-slate-300">Robot 1</label>
								<select bind:value={test.player1} class="select w-full">
									{#each players as player}
										<option value={player}>
											{player.name}
										</option>
									{/each}
								</select>
							</div>
							<div>
								<label class="mb-1 block text-sm font-medium text-slate-300">Robot 2</label>
								<select bind:value={test.player2} class="select w-full">
									{#each players as player}
										<option value={player}>
											{player.name}
										</option>
									{/each}
								</select>
							</div>
							<button class="btn btn-primary w-full" onclick={loadTestMatch}>
								Load Test Match
							</button>
						</div>
					</div>

					<!-- Tournament Match -->
					<div class="rounded-lg bg-slate-700/50 p-4">
						<h3 class="mb-4 text-center text-lg font-medium text-white">Tournament Match</h3>
						<div class="space-y-3">
							<div>
								<label class="mb-1 block text-sm font-medium text-slate-300"
									>Available Matches</label
								>
								<select bind:value={selectedGame} class="select w-full">
									{#each games.filter((a) => a.state == 'available') as game}
										<option value={game}>
											{game.name}: {getPlayerById(game.slots[0].playerID).name} vs {getPlayerById(
												game.slots[1].playerID
											).name}
											{#if game.availableSince}
												(Available since {timeRelative(Date.now(), game.availableSince)})
											{/if}
										</option>
									{/each}
								</select>
							</div>
							<button class="btn btn-success w-full" onclick={loadTFMatch}>
								Load Tournament Match
							</button>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Info Panels -->
		<div class="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
			<!-- Preview Info -->
			<div class="card from-combat-black/40 to-combat-red/40 bg-gradient-to-br">
				<div class="card-header">
					<h3 class="text-lg font-semibold text-white">Match Preview</h3>
				</div>
				<div class="card-body">
					<div class="grid grid-cols-2 gap-4 text-sm">
						<div class="space-y-3">
							<div>
								<span class="text-slate-400">Game ID</span>
								<p class="font-medium text-white">{selectedGame.game || 'N/A'}</p>
							</div>
							<div>
								<span class="text-slate-400">Bracket ID</span>
								<p class="font-medium text-white">{selectedGame.bracketID || 'N/A'}</p>
							</div>
							<div>
								<span class="text-slate-400">Game Name</span>
								<p class="font-medium text-white">{selectedGame.name || 'N/A'}</p>
							</div>
						</div>
						<div class="space-y-3">
							<div>
								<span class="text-slate-400">Robot 1</span>
								<p class="font-medium text-white">
									{typeof selectedGame.slots !== 'undefined'
										? getPlayerById(selectedGame.slots[0].playerID).name
										: 'N/A'}
								</p>
							</div>
							<div>
								<span class="text-slate-400">Robot 2</span>
								<p class="font-medium text-white">
									{typeof selectedGame.slots !== 'undefined'
										? getPlayerById(selectedGame.slots[1].playerID).name
										: 'N/A'}
								</p>
							</div>
							<div>
								<span class="text-slate-400">State</span>
								<p class="font-medium text-white">
									<span
										class="inline-flex rounded-full px-2 py-1 text-xs font-semibold {selectedGame.state ===
										'available'
											? 'bg-green-100 text-green-800'
											: 'bg-gray-100 text-gray-800'}"
									>
										{selectedGame.state || 'N/A'}
									</span>
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
			<!-- Current Info -->
			<div class="card from-combat-black/40 to-combat-red/40 bg-gradient-to-br">
				<div class="card-header">
					<h3 class="text-lg font-semibold text-white">Current Match Info</h3>
				</div>
				<div class="card-body">
					<div class="grid grid-cols-2 gap-4 text-sm">
						<div class="space-y-3">
							<div>
								<span class="text-slate-400">Game ID</span>
								<p class="font-medium text-white">{selectedGameInfo.game || 'N/A'}</p>
							</div>
							<div>
								<span class="text-slate-400">Bracket ID</span>
								<p class="font-medium text-white">{selectedGameInfo.bracketID || 'N/A'}</p>
							</div>
							<div>
								<span class="text-slate-400">Game Name</span>
								<p class="font-medium text-white">{selectedGameInfo.name || 'N/A'}</p>
							</div>
						</div>
						<div class="space-y-3">
							<div>
								<span class="text-slate-400">Robot 1</span>
								<p class="font-medium text-white">
									{typeof selectedGameInfo.slots !== 'undefined'
										? getPlayerById(selectedGameInfo.slots[0].playerID).name
										: 'N/A'}
								</p>
							</div>
							<div>
								<span class="text-slate-400">Robot 2</span>
								<p class="font-medium text-white">
									{typeof selectedGameInfo.slots !== 'undefined'
										? getPlayerById(selectedGameInfo.slots[1].playerID).name
										: 'N/A'}
								</p>
							</div>
							<div>
								<span class="text-slate-400">State</span>
								<p class="font-medium text-white">
									<span
										class="inline-flex rounded-full px-2 py-1 text-xs font-semibold {selectedGameInfo ===
										'available'
											? 'bg-green-100 text-green-800'
											: 'bg-gray-100 text-gray-800'}"
									>
										{selectedGameInfo.state || 'N/A'}
									</span>
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>

		<br />
		<hr />
		<!-- Database Control -->
		<div class="card mt-6">
			<div class="card-body flex flex-col items-center justify-center text-center">
				<button
					class="btn btn-secondary flex items-center justify-center px-8 py-3 text-lg font-bold"
					onclick={loadDatabase}
				>
					<svg class="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
						></path>
					</svg>
					RELOAD DATABASE
				</button>
			</div>
		</div>
	</div>
</div>
