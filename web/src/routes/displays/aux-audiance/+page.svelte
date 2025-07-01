<script lang="ts">
	import { io } from '$lib/websocketconnection';
	import { onMount } from 'svelte';

	let time = 180; // Default time
	let precount = 5; // Reintroduce precount

	let matchState = {
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
	};

	let matchPeriod: 'pause' | 'start' | 'end' | 'winner' | 'preload' = 'preload'; // Reintroduce winner state

	let winnerStatus: 0 | 1 | null = null; // Reintroduce winner status
	let winnerMethod = ''; // Reintroduce winner method

	onMount(() => {
		io.on('timer', (data) => {
			time = Math.ceil(data);
		});

		io.on('precount', (data) => {
			precount = Math.ceil(data);
		});

		io.on('matchUpdate', (data) => {
			console.log(data);
			matchState = { ...matchState, ...data };
			console.log(matchState);
			matchPeriod = 'preload'; // Reset to preload on match update
		});

		io.on('state', (newState) => {
			matchPeriod = newState;
			winnerStatus = null; // Reset winner status on state change
		});

		io.on('winner', (data) => {
			const { player, method } = data;
			matchPeriod = 'winner';
			winnerMethod = method;
			winnerStatus = player;
		});

		if (window.obsstudio) {
			// make body transparent if OBS is detected
			document.body.style.backgroundColor = 'rgba(0, 0, 0, 0)';
			document.body.style.background = 'rgba(0, 0, 0, 0)';
			document.body.style.margin = '0';
			document.body.style.overflow = 'hidden';
		}
	});
</script>

<div class="flex flex-col items-center justify-center min-h-screen bg-gray-950 text-white p-8 font-mono">

	<!-- Competition and Match Info -->
	<div class="text-center mb-12 border-b-4 border-red-700 pb-6 w-full max-w-4xl">
		<h1 class="text-6xl font-extrabold tracking-widest text-red-500 uppercase drop-shadow-lg">
			{matchState.compName}
		</h1>
		<p class="text-4xl font-bold text-gray-300 mt-4 tracking-wide">{matchState.compMatch}</p>
	</div>

	<!-- Main Display Area -->
	<div class="flex flex-grow items-center justify-center w-full max-w-7xl">
		<!-- Robot 1 -->
		<div class="flex flex-col items-center mx-10 p-8 bg-gray-800 border-4 border-blue-600 shadow-2xl w-80 h-auto flex-shrink-0 transform skew-x-[-5deg]
			{matchPeriod == 'winner' && winnerStatus == 0 ? 'border-emerald-500 bg-emerald-900/50' : ''}">
			<img
				class="w-56 h-56 object-cover border-4 border-blue-500 mb-6 transform skew-x-[5deg]"
				src={matchState.robot1.photoUrl}
				alt="Robot 1"
			/>
			<h2 class="text-4xl font-bold text-blue-400 text-center min-h-[3rem] uppercase tracking-wider transform skew-x-[5deg]">{matchState.robot1.name}</h2>
			{#if matchPeriod == 'winner' && winnerStatus == 0}
				<div class="mt-4 inline-flex items-center bg-emerald-600 px-5 py-2 text-lg font-bold text-white uppercase transform skew-x-[5deg]">
					🏆 WINNER
				</div>
			{/if}
		</div>

		<!-- Timer/Status Display -->
		<div class="flex flex-col items-center justify-center mx-10 p-8 bg-gray-900 border-4 border-gray-700 shadow-2xl w-96 h-auto flex-shrink-0">
			{#if matchPeriod == 'winner'}
				<div class="text-9xl font-extrabold text-emerald-400 mb-6">🏆</div>
				<div class="text-7xl font-bold text-emerald-400 uppercase tracking-wider">{winnerMethod}</div>
			{:else if precount != 0}
				<div class="text-9xl font-extrabold text-yellow-400 mb-6">{precount}</div>
				<p class="text-3xl text-gray-400 uppercase tracking-wide">Starting in...</p>
			{:else if matchPeriod == 'start'}
				<div class="text-9xl font-extrabold text-green-400 mb-6">
					{Math.floor(time / 60)}:{(time % 60).toFixed(0).padStart(2, '0')}
				</div>
				<p class="text-3xl text-gray-400 uppercase tracking-wide">Match Time</p>
			{:else}
				<div class="text-7xl font-bold text-yellow-400 mb-6">Match Ready</div>
				<p class="text-2xl text-gray-400 uppercase tracking-wide">Waiting to start...</p>
			{/if}
		</div>

		<!-- Robot 2 -->
		<div class="flex flex-col items-center mx-10 p-8 bg-gray-800 border-4 border-red-600 shadow-2xl w-80 h-auto flex-shrink-0 transform skew-x-[5deg]
			{matchPeriod == 'winner' && winnerStatus == 1 ? 'border-emerald-500 bg-emerald-900/50' : ''}">
			<img
				class="w-56 h-56 object-cover border-4 border-red-500 mb-6 transform skew-x-[-5deg]"
				src={matchState.robot2.photoUrl}
				alt="Robot 2"
			/>
			<h2 class="text-4xl font-bold text-red-400 text-center min-h-[3rem] uppercase tracking-wider transform skew-x-[-5deg]">{matchState.robot2.name}</h2>
			{#if matchPeriod == 'winner' && winnerStatus == 1}
				<div class="mt-4 inline-flex items-center bg-emerald-600 px-5 py-2 text-lg font-bold text-white uppercase transform skew-x-[-5deg]">
					🏆 WINNER
				</div>
			{/if}
		</div>
	</div>
</div>