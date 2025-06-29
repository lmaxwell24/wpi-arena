<script lang="ts">
	import { io } from '$lib/websocketconnection';
	import { onMount } from 'svelte';
	import { fade, slide } from 'svelte/transition';
	import { Howl, Howler } from 'howler';

	let time = 180;
	let precount = 5;

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

	let matchPeriod: 'pause' | 'start' | 'end' | 'winner' | 'preload' = 'preload';

	let winnerStatus: 0 | 1 | null = null;
	let winnerMethod = '';

	// Audience display controls
	let overlayVisible: boolean = true;
	let lowerThird = {
		visible: false,
		title: 'Text',
		subtitle: 'subtext'
	};

	// initialize sound files for match events
	const matchSound = new Howl({
		src: ['/sounds/match-start.mp3'],
		volume: 0.5,
		onplay: () => {
			Howler.stop();
		}
	});
	const winnerSound = new Howl({
		src: ['/sounds/winner.mp3'],
		volume: 0.5
	});
	const tapoutSound = new Howl({
		src: ['/sounds/tapout.mp3'],
		volume: 0.5
	});
	const koSound = new Howl({
		src: ['/sounds/ko.mp3'],
		volume: 0.5
	});

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
			matchPeriod = 'preload';
		});

		io.on('state', (newState) => {
			matchPeriod = newState;
			winnerStatus = null;

			// play sounds on state changes
			if (newState === 'start') {
				matchSound.play();
			}
		});

		io.on('winner', (data) => {
			const { player, method } = data;
			matchPeriod = 'winner';
			winnerMethod = method;
			winnerStatus = player;
			// play sound depending on winner method
			if (method === 'KO') {
				koSound.play();
			} else if (method === 'TO') {
				tapoutSound.play();
			}
		});

		io.on('lowerThird', (data) => {
			lowerThird = { ...lowerThird, ...data };
		});

		io.on('audienceOverlay', (data) => {
			overlayVisible = data.visible;
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

<!-- Lower Third Overlay -->
{#if lowerThird.visible}
	<div
		class="fixed right-0 bottom-10 left-10 z-50 p-4"
		in:slide={{ duration: 500, axis: 'x' }}
		out:slide={{ duration: 300, axis: 'x' }}
	>
		<div class="bg-combat-black/80 max-w-3xl rounded-lg p-4 text-left shadow-xl">
			{#key lowerThird.title}
				<h2 class="text-7xl font-bold text-white" in:fade>
					{lowerThird.title}
				</h2>
			{/key}
			<hr class="my-4 border-t-2 border-zinc-500" />
			{#key lowerThird.subtitle}
				<p class="text-2xl text-slate-300" in:fade>
					{lowerThird.subtitle}
				</p>
			{/key}
		</div>
	</div>
{/if}

{#if overlayVisible}
	<div
		class="flex min-h-screen items-start justify-center p-8"
		in:slide={{ duration: 800, axis: 'y' }}
		out:slide={{ duration: 300, axis: 'y' }}
	>
		<div class="w-full max-w-6xl">
			<!-- Competition Header -->
			<div class="card bg-combat-black border-red-500">
				<div class="card-body py-2 text-center">
					<span
						class="mb-2 bg-gradient-to-r from-red-400 to-rose-400 bg-clip-text text-3xl font-bold text-transparent"
					>
						{matchState.compName}
					</span>
					-
					<span
						class="bg-gradient-to-r from-red-400 to-rose-400 bg-clip-text text-3xl font-bold text-transparent"
						>{matchState.compMatch}</span
					>
				</div>
			</div>

			<!-- Main Match Display -->
			<div
				class="from-combat-black to-combat-red grid grid-cols-1 items-stretch bg-gradient-to-br lg:grid-cols-3"
			>
				<!-- Robot 1 -->
				<div
					class="robot-card border-blue-500/50 {matchPeriod == 'winner' && winnerStatus == 0
						? 'border-emerald-400 bg-emerald-500/20'
						: ''}"
				>
					<div class="text-center">
						<img
							class="mx-auto mb-4 h-24 w-32 rounded-lg border-6 border-blue-500/30 object-cover"
							src={matchState.robot1.photoUrl}
							alt="Robot 1"
						/>
						<h2 class="mb-2 text-xl font-bold text-white">
							{matchState.robot1.name.toUpperCase()}
						</h2>
						{#if matchPeriod == 'winner' && winnerStatus == 0}
							<div
								class="inline-flex items-center rounded-full bg-emerald-500 px-3 py-1 text-sm font-semibold text-white"
							>
								<svg class="mr-1 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
									<path
										d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
									/>
								</svg>
								WINNER
							</div>
						{/if}
					</div>
				</div>

				<!-- Timer/Status Display -->
				<div class="text-center {matchPeriod == 'winner' ? 'bg-emerald-500/20' : ''}">
					<div class="h-full from-slate-800/80 to-slate-700/80">
						<div class="card-body h-full py-8">
							{#if matchPeriod != 'preload'}
								<div class="h-full space-y-2">
									{#if matchPeriod == 'winner'}
										<div class="flex h-full flex-col items-center justify-center">
											<div class="mb-4 text-8xl font-bold text-emerald-400">🏆</div>
											<div class="text-6xl font-bold text-emerald-400">{winnerMethod}</div>
										</div>
									{:else if precount != 0}
										<div class="timer-display text-7xl">{precount}</div>
										<div class="text-lg text-slate-300">Starting in...</div>
										<div class="status-indicator status-paused mx-auto h-4 w-4"></div>
									{:else}
										<div class="timer-display text-6xl">
											{Math.floor(time / 60)}:{(time % 60).toFixed(0).padStart(2, '0')}
										</div>
										<div class="text-lg text-slate-300">Match Time</div>
										<div
											class="status-indicator {matchPeriod == 'end'
												? 'status-stopped'
												: 'status-active'} mx-auto h-4 w-4"
										></div>
									{/if}
								</div>
							{:else}
								<div class="text-4xl font-bold text-slate-200">Match Ready</div>
								<div class="mt-2 text-lg text-slate-200">Waiting to start...</div>
								<div class="status-indicator status-stopped mx-auto mt-4 h-16 w-16"></div>
							{/if}
						</div>
					</div>
				</div>

				<!-- Robot 2 -->
				<div
					class="robot-card {matchPeriod == 'winner' && winnerStatus == 1
						? 'border-emerald-400 bg-emerald-500/20'
						: ''}"
				>
					<div class="text-center">
						<img
							class="mx-auto mb-4 h-24 w-32 rounded-lg border-6 border-red-500/30 object-cover"
							src={matchState.robot2.photoUrl}
							alt="Robot 2"
						/>
						<h2 class="mb-2 text-xl font-bold text-white">
							{matchState.robot2.name.toUpperCase()}
						</h2>
						{#if matchPeriod == 'winner' && winnerStatus == 1}
							<div
								class="inline-flex items-center rounded-full bg-emerald-500 px-3 py-1 text-sm font-semibold text-white"
							>
								<svg class="mr-1 h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
									<path
										d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
									/>
								</svg>
								WINNER
							</div>
						{/if}
					</div>
				</div>
			</div>
		</div>
	</div>
{/if}
