<script lang="ts">
	import { io } from '$lib/websocketconnection';
	import { onMount } from 'svelte';

	let time = 0;

	let precount = 0;

	let matchPeriod: 'pause' | 'start' | 'end' | 'winner' | 'preload' = 'preload';

	let winnerStatus: 0 | 1 | null = null;
	let winnerMethod = '';

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

	onMount(() => {
		io.on('timer', (data) => {
			console.log(data);
			time = data;
		});
		io.on('precount', (data) => {
			console.log(data);
			precount = data;
		});
		io.on('state', (newState) => {
			matchPeriod = newState;
		});

		io.on('matchUpdate', (data) => {
			matchState = { ...matchState, ...data };
			matchPeriod = 'preload';
		});

		io.on('robotReady', (data) => {
			if (data.robotId === 0) {
				matchState.robot1.ready = data.ready;
			} else if (data.robotId === 1) {
				matchState.robot2.ready = data.ready;
			}
		});

		io.on('winner', (data) => {
			const { player, method } = data;
			matchPeriod = 'winner';
			winnerMethod = method;
			winnerStatus = player;
		});
	});
</script>

<div
	class="via-combat-red/30 flex min-h-screen flex-col items-center justify-around bg-gradient-to-br from-red-900/30 to-zinc-900/30 p-8"
>
	<!-- Robot 1 -->
	<div class="card my-8 w-full border-blue-500/30 bg-gradient-to-r from-blue-600/20 to-cyan-600/20">
		<div class="card-body py-6">
			<div class="flex items-center justify-center space-x-6">
				<img
					class="mx-4 h-24 w-32 rounded-lg border-2 border-blue-500/30 object-cover"
					src={matchState.robot1.photoUrl}
					alt="Robot 1"
				/>
				<div class="mx-4 grow text-right">
					<h1
						class="mb-2 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-4xl font-bold text-transparent"
					>
						{matchState.robot1.name}
					</h1>
					<p class="text-xl font-medium text-slate-300">Robot 1 Status</p>
					<div class="mt-2 flex items-center justify-end">
						<div
							class="status-indicator {matchState.robot1.ready
								? 'status-active'
								: 'status-stopped'} mr-3"
						></div>
						<span
							class="text-lg font-medium {matchState.robot1.ready
								? 'text-emerald-400'
								: 'text-red-400'}"
						>
							{matchState.robot1.ready ? 'Ready' : 'Not Ready'}
						</span>
					</div>
				</div>
			</div>
		</div>
	</div>
	<!-- Main Timer Display -->
	<div
		class="w-4xl rounded-xl border-10 border-zinc-500 bg-zinc-800/50 p-10 text-center backdrop-blur-md"
	>
		<div
			class="{matchPeriod === 'preload'
				? matchState.robot1.ready && matchState.robot2.ready
					? 'timer-green'
					: 'timer-display'
				: matchPeriod === 'pause' || precount > 0
					? 'timer-amber'
					: 'timer-display'}  mb-8"
			style="font-size: 12rem; line-height: 1;"
		>
			{#if matchPeriod === 'preload'}
				{matchState.compMatch}
			{:else if precount > 0}
				{Math.ceil(precount)}
			{:else}
				{Math.floor(time / 60)}:{(time % 60).toFixed(1).padStart(4, '0')}
			{/if}
		</div>

		<!-- Status Indicator -->
		<div class="flex items-center justify-center space-x-4">
			<div
				class="status-indicator {precount > 0
					? 'status-paused'
					: time > 0
						? 'status-active'
						: 'status-stopped'} h-6 w-6"
			></div>
			<span class="text-2xl font-medium text-slate-300">
				{#if matchPeriod === 'preload'}
          {matchState.robot1.ready && matchState.robot2.ready ? 'ROBOTS READY' : 'LOADING ROBOTS'}
				{:else}
					{precount > 0 ? 'PRE-MATCH' : time > 0 ? 'MATCH IN PROGRESS' : 'MATCH ENDED'}
				{/if}
			</span>
		</div>
	</div>
	<!-- Robot 2 -->
	<div class="card my-8 w-full border-blue-500/30 bg-gradient-to-l from-red-600/20 to-rose-600/20">
		<div class="card-body py-6">
			<div class="flex flex-row-reverse items-center justify-center space-x-6">
				<img
					class="mx-4 h-24 w-32 rounded-lg border-2 border-red-500/30 object-cover"
					src={matchState.robot2.photoUrl}
					alt="Robot 2"
				/>
				<div class="mx-4 grow">
					<h1
						class="mb-2 bg-gradient-to-r from-red-400 to-rose-400 bg-clip-text text-4xl font-bold text-transparent"
					>
						{matchState.robot2.name}
					</h1>
					<p class="text-xl font-medium text-slate-300">Robot 2 Status</p>
					<div class="mt-2 flex items-center justify-start">
						<div
							class="status-indicator {matchState.robot2.ready
								? 'status-active'
								: 'status-stopped'} mr-3"
						></div>
						<span
							class="text-lg font-medium {matchState.robot2.ready
								? 'text-emerald-400'
								: 'text-red-400'}"
						>
							{matchState.robot2.ready ? 'Ready' : 'Not Ready'}
						</span>
					</div>
				</div>
			</div>
		</div>
	</div>

	<!-- Visual Elements -->

	<div class="pointer-events-none absolute top-0 left-0 -z-10 h-full w-full overflow-hidden">
		<!-- Decorative circles with red theme -->
		<div class="absolute top-10 left-10 h-32 w-32 rounded-full border-4 border-blue-500/20"></div>
		<div
			class="absolute top-1/2 left-1/2 -z-10 h-72 w-72 -translate-x-1/2 -translate-y-1/2 transform"
		>
			<img src="/img/goat.png" alt="Goat" class="h-full w-full object-cover" />
		</div>
		<div class="absolute top-1/2 right-20 h-24 w-24 rounded-full border-4 border-red-400/20"></div>
	</div>
</div>
