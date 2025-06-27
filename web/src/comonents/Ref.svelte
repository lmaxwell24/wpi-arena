<script lang="ts">
	let {
		startTimer,
		resumeTimer,
		pauseTimer,
		restartTimer,
		overwriteTimer,
		overwriteTime,
		time,
		precount,
		selectedWinner = $bindable(),
		robot1Name,
		robot2Name,
		winningMode = $bindable(),
		emitWinner
	} = $props();
</script>

<div class="m-5 flex flex-col rounded bg-zinc-500 p-2">
	<h1 class="text-center text-3xl font-bold">{precount} {time}</h1>
	<h1 class="text-center">Timer Control</h1>
	<div class="grid grid-cols-4 gap-3">
		<button class="rounded bg-zinc-800 p-2 text-white" onclick={startTimer}>Start</button>
		<button class="rounded bg-zinc-800 p-2 text-white" onclick={resumeTimer}>Resume</button>
		<button class="rounded bg-zinc-800 p-2 text-white" onclick={pauseTimer}>Pause</button>
		<button class="rounded bg-zinc-800 p-2 text-white" onclick={restartTimer}>Restart</button>
		<input class="col-span-3 bg-zinc-900 text-white" type="number" bind:value={overwriteTime} />
		<button class="rounded bg-zinc-800 p-2 text-white" onclick={overwriteTimer}>set time</button>
	</div>
	<br />
	<hr />
	<br />

	<div>
		<h1 class="text-center text-4xl font-semibold">Declare Winner</h1>
		<div class="grid grid-cols-4 gap-1 text-center">
			<div
				class="col-span-2 p-2 {selectedWinner == 0
					? 'bg-green-300 text-black'
					: 'bg-slate-800 text-white'}"
				onclick={() => {
					selectedWinner = 0;
				}}
			>
				{robot1Name}
			</div>

			<div
				class="col-span-2 p-2 {selectedWinner == 1
					? 'bg-green-300 text-black'
					: 'bg-slate-800 text-white'}"
				onclick={() => {
					selectedWinner = 1;
				}}
			>
				{robot2Name}
			</div>
			{#each ['KO', 'TO', 'JD', 'TKO'] as wintype}
				<div
					class="p-2 {winningMode == wintype
						? 'bg-green-300 text-black'
						: 'bg-slate-800 text-white'}"
					onclick={() => {
						winningMode = wintype;
					}}
				>
					{wintype}
				</div>
			{/each}
			<button class="col-span-4 bg-slate-900 p-2 text-xl font-bold text-white" onclick={emitWinner}>
				PUBLISH WINNER
			</button>
		</div>
	</div>
</div>
