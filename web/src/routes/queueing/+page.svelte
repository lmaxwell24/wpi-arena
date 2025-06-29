<script lang="ts">
	import { onMount } from 'svelte';
	import { timeRelative } from '$lib';
	let players = [];
	let games = [];

	const callApi = async (endpoint: string, data: any, method?: string = 'GET') => {
		return await fetch(`http://${window.location.hostname}:8080${endpoint}`, {
			method,
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(data)
		});
	};

	const loadDatabase = async () => {
		let players_raw = await callApi('/api/players');
		players = await players_raw.json();
		console.log(players);

		await loadGameInfo();
	};

	const loadGameInfo = async () => {
		try {
			let games_raw = await callApi('/api/games');
			games = await games_raw.json();
			console.log(games);
		} catch (error) {
			console.error('Failed to load game info:', error);
		}
	};

	const getPlayerById = (id: string) => {
		return players.filter((p) => p.id == id)[0];
	};

	const getGameStateDisplays = (state: string) => {
		switch (state) {
			case 'available':
				return 'bg-green-100 text-green-800';
			case 'called':
				return 'bg-yellow-100 text-yellow-800';
			case 'active':
				return 'bg-blue-100 text-blue-800';
			case 'hold':
				return 'bg-zinc-100 text-zinc-800';
			default:
				return 'bg-gray-100 text-gray-800';
		}
	};

	let currentTime = Date.now();
	setInterval(() => {
		currentTime = Date.now();
	}, 1000 * 2); // Update currentTime every 2 seconds

	onMount(() => {
		setInterval(() => {
			loadGameInfo();
		}, 30000); // Refresh every 30 seconds
		loadDatabase();
	});
</script>

<div class="from-combat-black to-combat-red min-h-screen w-screen bg-gradient-to-br">
	<!-- Header -->
	<div class="mb-8 p-6">
		<h1 class="mb-2 text-3xl font-bold text-white">WPI Arena - Queue</h1>
		<p class="text-slate-400">See currently queued robots, and expected timing for future calls</p>
	</div>
	<!-- Per - game robot and status indicators -->
	<div class="mx-auto flex w-full max-w-7xl flex-wrap justify-between gap-4 rounded-lg p-4">
		{#each games.filter((g) => g.state !== 'done' && g.slots[0].playerID && g.slots[1].playerID) as game}
			<div
				class="max-w-xl grow-1 rounded-lg bg-gradient-to-br from-slate-600/20 to-slate-700/20 p-6 shadow-lg {game.state ===
				'called'
					? 'border-yellow-500/50 animate-pulse'
					: game.state === 'active'
						? 'border-blue-500/50'
						: game.state === 'hold'
							? 'border-zinc-500/50'
							: ''} {game.state !== 'available' ? 'border-10 border-solid' : ''}"
			>
				<div class="grid grid-cols-3">
					<div class="robot-card">
						<div class="text-center">
							<img
								class="mx-auto mb-4 h-24 w-32 rounded-lg border-6 border-blue-500/30 object-cover"
								src={getPlayerById(game.slots[0].playerID).photoUrl}
								alt="Robot 1"
							/>
							<h2 class="mb-2 text-xl font-bold text-white">
								{getPlayerById(game.slots[0].playerID).name.toUpperCase()}
							</h2>
						</div>
					</div>
					<!-- Status Indicator -->
					<div class="flex flex-col items-center justify-center">
						<h1 class="mb-2 text-2xl font-bold text-white">
							{game.name}
						</h1>
						<span
							class="inline-flex rounded-full px-2 py-1 text-xs font-semibold {getGameStateDisplays(
								game.state
							)}"
						>
							{game.state || 'N/A'}
						</span>
					</div>
					<div class="robot-card">
						<div class="text-center">
							<img
								class="mx-auto mb-4 h-24 w-32 rounded-lg border-6 border-red-500/30 object-cover"
								src={getPlayerById(game.slots[1].playerID).photoUrl}
								alt="Robot 2"
							/>
							<h2 class="mb-2 text-xl font-bold text-white">
								{getPlayerById(game.slots[1].playerID).name.toUpperCase()}
							</h2>
						</div>
					</div>
				</div>
				{#if game.availableSince}
					<h3 class="w-full text-center text-sm">
						(Available since {timeRelative(currentTime, game.availableSince)})
					</h3>
				{/if}
				{#if game.calledSince}
					<h3
						class="w-full bg-gradient-to-br from-yellow-600 to-yellow-700 bg-clip-text text-center text-lg font-bold text-transparent"
					>
						(Called since {timeRelative(currentTime, game.calledSince)})
					</h3>
				{/if}
			</div>
		{/each}
	</div>
	<div class="pointer-events-none absolute top-0 left-0 h-full w-full overflow-hidden">
		<!-- Decorative circles with red theme -->
		<div class="absolute right-10 bottom-10 h-48 w-48 opacity-25">
			<img src="/img/goat.png" alt="Goat" class="h-full w-full object-cover" />
		</div>
	</div>
</div>
