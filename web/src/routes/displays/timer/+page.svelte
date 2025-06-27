<script lang="ts">
	import { io } from '$lib/websocketconnection';
	import { onMount } from 'svelte';

	let time = 0;

	onMount(() => {
		io.on('timer', (data) => {
			console.log(data);
			time = data;
		});
		io.on('precount', (data) => {
			console.log(data);
			time = data;
		});
	});
</script>

<div class="flex h-screen w-screen items-center justify-center bg-zinc-500">
	<h1 class="text-9xl">{time.toPrecision(3)}</h1>
</div>
