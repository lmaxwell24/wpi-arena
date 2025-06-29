<script lang="ts">
	import { io } from '$lib/websocketconnection';
	import { onMount } from 'svelte';

	let time = 0;
	let precount = 0;
	let isReady = false;
	let readyStatus = 'Not Ready';

	let robotInfo = {
		id: 1,
		name: 'Robot 2',
		photoUrl:
			"data:image/svg+xml;charset=utf8,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%3E%3C/svg%3E"
	};

	let matchState = {
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
		compName: 'Robot Competition',
		compMatch: 'Match'
	};

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

	const toggleReady = async () => {
		isReady = !isReady;
		readyStatus = isReady ? 'Ready' : 'Not Ready';

		// Send ready status to server
		try {
			await callApi(
				'/api/robot_ready',
				{
					robotId: 1,
					ready: isReady
				},
				'POST'
			);
		} catch (error) {
			console.error('Failed to update ready status:', error);
		}
	};

	let matchPeriod: 'pause' | 'start' | 'end' | 'winner' | 'preload' = 'preload';
	let didWin: boolean = false;
	let winnerMethod = '';

	const tapOut = async () => {
		try {
			await callApi('/api/tap_out', { robotId: 1 }, 'POST');
		} catch (error) {
			console.error('Failed to tap out:', error);
		}
	};

	onMount(() => {
		// Update robot info when match loads
		robotInfo = {
			...robotInfo,
			name: matchState.robot2.name,
			photoUrl: matchState.robot2.photoUrl
		};

		io.on('timer', (data) => {
			time = data;
		});

		io.on('precount', (data) => {
			precount = Math.ceil(data);
		});

		io.on('state', (newState) => {
			matchPeriod = newState;
		});

		io.on('winner', (data) => {
			const { player, method } = data;
			matchPeriod = 'winner';
			winnerMethod = method;
			didWin = player === 1;
		});

		io.on('matchUpdate', (data) => {
			matchState = { ...matchState, ...data };
			// Update robot info when match updates
			robotInfo = {
				...robotInfo,
				name: matchState.robot2.name,
				photoUrl: matchState.robot2.photoUrl
			};
			matchPeriod = 'preload';
		});

		// Listen for ready status updates from other sources
		io.on('robotReady', (data) => {
			if (data.robotId === 1) {
				isReady = data.ready;
				readyStatus = isReady ? 'Ready' : 'Not Ready';
			}
		});
	});
</script>

<div
	class="flex min-h-screen items-center justify-center bg-gradient-to-br from-red-900/30 via-slate-900 to-red-900/30 p-8"
>
	<div class="w-full max-w-4xl text-center">
		<!-- Robot Header -->
		<div class="card mb-8 border-red-500/30 bg-gradient-to-r from-red-600/20 to-rose-600/20">
			<div class="card-body py-6">
				<div class="flex items-center justify-center space-x-6">
					<img
						class="mx-4 h-24 w-32 rounded-lg border-2 border-blue-500/30 object-cover"
						src={robotInfo.photoUrl}
						alt="Robot 2"
					/>
					<div class="mx-4 grow text-right">
						<h1
							class="mb-2 bg-gradient-to-r from-red-400 to-rose-400 bg-clip-text text-4xl font-bold text-transparent"
						>
							{robotInfo.name}
						</h1>
						<p class="text-xl font-medium text-slate-300">Robot 2 Status</p>
						<div class="mt-2 flex items-center justify-end">
							<div
								class="status-indicator {isReady ? 'status-active' : 'status-stopped'} mr-3"
							></div>
							<span class="text-lg font-medium {isReady ? 'text-emerald-400' : 'text-red-400'}">
								{readyStatus}
							</span>
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Competition Info -->
		<div class="card mb-8 bg-slate-800/50">
			<div class="card-body py-4">
				<div class="text-center">
					<h2 class="mb-1 text-2xl font-semibold text-white">{matchState.compName}</h2>
					<p class="text-lg text-slate-300">{matchState.compMatch}</p>
					<div class="mt-3 flex items-center justify-center space-x-4">
						<span class="font-semibold text-blue-400">{matchState.robot1.name}</span>
						<span class="text-slate-400">VS</span>
						<span class="font-semibold text-red-400">{matchState.robot2.name}</span>
					</div>
				</div>
			</div>
		</div>

		<!-- Timer Display -->
		<div class="card mb-8 bg-gradient-to-br from-slate-800/80 to-slate-700/80">
			<div class="card-body py-12">
				<div class="space-y-6">
					{#if matchPeriod === 'winner'}
						<div class="text-8xl font-bold {didWin ? 'text-emerald-400' : 'text-red-400'}">
							{didWin ? 'VICTORY' : 'DEFEAT'}
						</div>
						<div class="text-2xl font-medium text-slate-300">
							{winnerMethod}
						</div>
					{:else if matchPeriod === 'preload'}
						<div class="text-8xl font-bold text-slate-300">{matchState.compMatch}</div>
					{:else if matchPeriod === 'start' || matchPeriod === 'pause' || matchPeriod === 'end'}
						{#if precount > 0}
							<div class="timer-display text-8xl text-amber-400">
								{precount}
							</div>
							<div class="text-2xl font-medium text-slate-300">Starting in...</div>
							<div class="status-indicator status-paused mx-auto h-6 w-6"></div>
						{:else}
							<div class="text-7xl {matchPeriod === 'pause' ? 'timer-amber' : 'timer-display'}">
								{Math.floor(time / 60)}:{(time % 60).toFixed(1).padStart(4, '0')}
							</div>

							<span class="text-xl font-medium text-slate-300">Match Time </span>
							<div
								class="status-indicator {time > 0
									? 'status-active'
									: 'status-stopped'} mx-2 h-6 w-6"
							></div>
						{/if}
					{/if}
				</div>
			</div>
		</div>

		{#if matchPeriod === 'preload'}
			<!-- Ready Button -->
			<div class="card bg-gradient-to-br from-slate-800/50 to-slate-700/50">
				<div class="card-body py-8">
					<button
						class="btn mx-auto w-full max-w-md px-12 py-6 text-2xl font-bold transition-all duration-300 {isReady
							? 'bg-emerald-600 text-white hover:bg-emerald-700'
							: 'bg-red-600 text-white hover:bg-red-700'}"
						onclick={toggleReady}
					>
						<div class="flex items-center justify-center space-x-3">
							{#if isReady}
								<svg class="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
									></path>
								</svg>
								<span>READY!</span>
							{:else}
								<svg class="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
									></path>
								</svg>
								<span>MARK READY</span>
							{/if}
						</div>
					</button>

					<div class="mt-4 text-sm text-slate-400">
						Click to toggle your ready status for the match
					</div>
				</div>
			</div>
		{:else if matchPeriod === 'start' || matchPeriod === 'pause'}
			<!-- Tap out button -->
			<div class="card bg-gradient-to-br from-slate-800/50 to-slate-700/50">
				<div class="card-body py-8">
					<button
						class="btn btn-large w-full bg-zinc-500 px-6 py-16 text-2xl font-bold text-white transition-all duration-300 hover:bg-red-700"
						onclick={tapOut}
					>
						TAP OUT
					</button>
				</div>
			</div>
		{/if}

		<!-- Visual Elements -->
		<div class="pointer-events-none absolute top-0 left-0 -z-10 h-full w-full overflow-hidden">
			<!-- Decorative circles with red theme -->
			<div class="absolute top-10 left-10 h-32 w-32 rounded-full border border-red-500/20"></div>
			<div class="absolute right-10 bottom-10 -z-10 h-48 w-48">
				<img src="/img/goat.png" alt="Goat" class="h-full w-full object-cover" />
			</div>
			<div class="absolute top-1/2 right-20 h-24 w-24 rounded-full border border-red-400/20"></div>
		</div>
	</div>
	<!-- Confetti Effect -->
	{#if matchPeriod === 'winner' && didWin}
		<div
			class="pointer-events-none fixed -top-2 z-50 flex h-screen w-screen justify-center overflow-hidden"
			transition:fade
		>
			<Confetti
				x={[-5, 5]}
				y={[0, 0.1]}
				delay={[500, 2000]}
				infinite
				duration="5000"
				amount="500"
				fallDistance="100vh"
			/>
		</div>
	{/if}
</div>
