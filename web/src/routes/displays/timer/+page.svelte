<script lang="ts">
	import { io } from '$lib/websocketconnection';
	import { onMount } from 'svelte';

	let time = 0;

	let precount = 0;

	let matchPeriod: 'pause' | 'start' | 'end' | 'winner' | 'preload' = 'preload';

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
	});
</script>

<div
	class="via-combat-red/30 flex min-h-screen items-center justify-center bg-gradient-to-br from-red-900/30 to-zinc-900/30 p-8"
>
	<div class="text-center">
		<!-- Main Timer Display -->
		<div
			class="{matchPeriod === 'pause' || precount > 0 ? 'timer-amber' : 'timer-display'}  mb-8"
			style="font-size: 12rem; line-height: 1;"
		>
			{#if precount > 0}
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
				{precount > 0 ? 'PRE-MATCH' : time > 0 ? 'MATCH IN PROGRESS' : 'MATCH ENDED'}
			</span>
		</div>

		<!-- Visual Elements -->
		<div class="pointer-events-none absolute top-0 left-0 h-full w-full overflow-hidden">
			<!-- Decorative circles -->
			<div class="absolute top-10 left-10 h-32 w-32 rounded-full border border-blue-500/20"></div>
			<div
				class="absolute right-10 bottom-10 h-48 w-48 rounded-full border border-purple-500/20"
			></div>
			<div class="absolute top-1/2 right-20 h-24 w-24 rounded-full border border-cyan-500/20"></div>
		</div>
	</div>
</div>
