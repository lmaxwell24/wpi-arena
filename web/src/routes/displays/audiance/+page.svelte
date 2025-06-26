<script lang="ts">
	import { io } from '$lib/websocketconnection';
	import { onMount } from 'svelte';
	import { fade } from 'svelte/transition';

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

	let matchPeriod: 'pause' | 'start' | 'end' | 'winner' = 'end';

	let winnerStatus: 0 | 1 | null = null;
	let winnerMethod = '';

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
		});

		io.on('state', (newState) => {
			matchPeriod = newState;
      winnerStatus = null
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
	class="font-roboto absolute top-0 left-0 mx-0 my-0 flex h-screen w-screen items-start justify-center text-3xl"
>
	<div class="my-4 inline-block w-7xl bg-zinc-500">
		<div class="grid grid-cols-5 text-center">
			<div class="col-span-5 bg-white text-2xl">{matchState.compName} - {matchState.compMatch}</div>
			<div class="col-span-5 flex">
				<div class="flex w-full flex-2 gap-2 bg-[#131323] text-left text-white">
					<img class="aspect-square h-20" src={matchState.robot1.photoUrl} alt="" />
					<span class="py-1">{matchState.robot1.name.toUpperCase()}</span>
				</div>
				<div
					class="flex flex-1 items-center justify-center bg-{matchPeriod =='winner'
						? winnerStatus == 0
							? '[#131323] text-white'
							: '[#af1b33] text-white'
						: 'zinc-200 text-black'} p-2 text-5xl"
					transition:fade
				>
					{#if matchPeriod != 'end'}
						<span transition:fade>
							{#if matchPeriod == 'winner'}
								{winnerMethod}
							{:else if precount != 0}
								{precount}
							{:else}
								{Math.floor(time / 600)}{Math.floor(time / 60)}:{Math.floor(
									(time % 60) / 10
								)}{Math.floor(time % 10)}
							{/if}
						</span>
					{/if}
				</div>
				<div class="flex w-full flex-2 justify-end gap-2 bg-[#af1b33] text-right text-white">
					<span class="py-1">{matchState.robot2.name.toUpperCase()}</span>
					<img class="aspect-square h-20" src={matchState.robot2.photoUrl} alt="" />
				</div>
			</div>
		</div>
	</div>
</div>
