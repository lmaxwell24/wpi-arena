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
					"data:image/svg+xml;charset=utf8,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%3E%3C/svg%3E"
			},
			robot2: {
				name: 'Robot 2',
				photoUrl:
					"data:image/svg+xml;charset=utf8,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%3E%3C/svg%3E"
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

	const emitWinner = async () => {
		await callApi('/api/winner', { who: state.selectedWinner, how: state.winningMode }, 'POST');
		state.selectedWinner = null;
		state.winningMode = '';
	};
</script>

<div class="absolute top-0 left-0 grid w-full grid-cols-2">
	<div>
		<Ref
			{startTimer}
			{resumeTimer}
			{pauseTimer}
			{overwriteTimer}
			{restartTimer}
			{overwriteTime}
			time={state.time.toPrecision(4)}
			precount={state.precount}
			bind:selectedWinner={state.selectedWinner}
			robot1Name={state.serverState.robot1.name}
			robot2Name={state.serverState.robot2.name}
			bind:winningMode={state.winningMode}
			{emitWinner}
		/>
	</div>
	<div>
		<div class="m-5 flex flex-col gap-3 rounded bg-zinc-500 p-2">
			<h1 class="text-center text-xl font-semibold">Match Loading</h1>
			<div class="rounded bg-zinc-800 p-2 text-white">
				<h2 class="text-center">Test Match</h2>
				<select bind:value={test.player1} class="w-full border-2">
					{#each players as player}
						<option value={player} class="text-black">
							{player.name}
						</option>
					{/each}
				</select>
				<select bind:value={test.player2} class="w-full border-2 bg-red-800 text-black">
					{#each players as player}
						<option value={player} class="bg-white text-black">
							{player.name}
						</option>
					{/each}
				</select>
				<button onclick={loadTestMatch}>Load match</button>
			</div>
			<div class="rounded bg-zinc-800 p-2 text-white">
				<h2 class="text-center">Truefinals Match</h2>
				<select bind:value={selectedGame} class="w-full border-2">
					{#each games.filter((a) => a.state == 'available') as game}
						<option value={game} class="text-black">
							{game.name}: {getPlayerById(game.slots[0].playerID).name} vs {getPlayerById(
								game.slots[1].playerID
							).name}
							{#if game.availableSince}
								(Available since {timeRelative(Date.now(), game.availableSince)})
							{/if}
						</option>
					{/each}
				</select>
				<button onclick={loadTFMatch}>Load match</button>
			</div>
		</div>
	</div>
	<div>
		<div class="m-5 flex flex-col gap-3 rounded bg-zinc-500 p-2">
			<h1>Preview Info</h1>
			<div class="grid grid-cols-2 text-white">
				<p>Game ID</p>
				<p>{selectedGame.game}</p>
				<p>Bracket ID</p>
				<p>{selectedGame.bracketID}</p>
				<p>Game Name</p>
				<p>{selectedGame.name}</p>
				<p>Next Game Slots</p>
				<p>
					{typeof selectedGame.nextGameSlotIDs !== 'undefined' &&
					selectedGame.nextGameSlotIDs !== null
						? selectedGame.nextGameSlotIDs.join(', ')
						: ''}
				</p>
				<p>Robot 1</p>
				<p>
					{typeof selectedGame.slots !== 'undefined'
						? getPlayerById(selectedGame.slots[0].playerID).name
						: ''}
				</p>
				<p>Robot 2</p>
				<p>
					{typeof selectedGame.slots !== 'undefined'
						? getPlayerById(selectedGame.slots[1].playerID).name
						: ''}
				</p>
				<p>State</p>
				<p>{selectedGame.state}</p>
			</div>
		</div>
	</div>
	<div>
		<div class="m-5 flex flex-col gap-3 rounded bg-zinc-500 p-2">
			<h1>Current Info</h1>
			<div class="grid grid-cols-2 text-white">
				<p>Game ID</p>
				<p>{selectedGameInfo.game}</p>
				<p>Bracket ID</p>
				<p>{selectedGameInfo.bracketID}</p>
				<p>Game Name</p>
				<p>{selectedGameInfo.name}</p>
				<p>Next Game Slots</p>
				<p>
					{typeof selectedGameInfo.nextGameSlotIDs !== 'undefined' &&
					selectedGameInfo.nextGameSlotIDs !== null
						? selectedGameInfo.nextGameSlotIDs.join(', ')
						: ''}
				</p>
				<p>Robot 1</p>
				<p>
					{typeof selectedGameInfo.slots !== 'undefined'
						? getPlayerById(selectedGameInfo.slots[0].playerID).name
						: ''}
				</p>
				<p>Robot 2</p>
				<p>
					{typeof selectedGameInfo.slots !== 'undefined'
						? getPlayerById(selectedGameInfo.slots[1].playerID).name
						: ''}
				</p>
				<p>State</p>
				<p>{selectedGameInfo.state}</p>
			</div>
		</div>
	</div>
</div>
<div
	class="absolute bottom-0 flex w-full items-center justify-center bg-zinc-800 p-5 text-center text-4xl font-bold text-white"
>
	<button class="text-center" onclick={loadDatabase}> RELOAD DATABASE LOCALLY </button>
</div>
