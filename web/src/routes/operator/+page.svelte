<script lang="ts">
	import { io } from '$lib/websocketconnection';
	import { onMount } from 'svelte';

	let state = { time: 180 };

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

  let overwriteTime = 180

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
    io.on('')

		await loadDatabase();
	});

	const startTimer = async () => {
		await callApi('/api/timer', { control: 'start' }, 'POST');
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
    selecedGameInfo = selectedGame
	};
</script>

<div class="absolute top-0 left-0 grid w-full grid-cols-2">
	<div>
		<div class="m-5 flex flex-col rounded bg-zinc-500 p-2">
			<h1 class="text-center text-3xl font-bold">{state.time.toPrecision(4)}</h1>
			<h1 class="text-center">Timer Control</h1>
			<div class="grid grid-cols-3 gap-3">
				<button class="rounded bg-zinc-800 p-2 text-white" onclick={startTimer}>Start</button>
				<button class="rounded bg-zinc-800 p-2 text-white" onclick={pauseTimer}>Pause</button>
				<button class="rounded bg-zinc-800 p-2 text-white" onclick={restartTimer}>Restart</button>
        <input class="col-span-2 bg-zinc-900 text-white" type="number" bind:value={overwriteTime}/>
				<button class="rounded bg-zinc-800 p-2 text-white" onclick={overwriteTimer}>set time</button>
			</div>
		</div>
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
