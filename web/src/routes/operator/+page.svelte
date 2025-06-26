<script lang="ts">
	import { io } from '$lib/websocketconnection';
	import { onMount } from 'svelte';

  let state = {time: 180}

  const callApi = async (endpiont: string, data: any, method?: string = "GET") => {
		await fetch(endpoint, {
			method,
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(data)
		});

  }

	onMount(() => {
		io.on('timer', (data) => {
      state.time = data
		});
    })


	const startTimer = async () => {
    await callApi('/api/timer', {control: 'start'}, "POST")
	};

	const pauseTimer = async () => {
    await callApi('/api/timer', {control: 'pause'}, "POST")
	};

	const restartTimer = async () => {
    await callApi('/api/timer', {control: 'restart'}, "POST")
	};

</script>

<div class="absolute left-0 top-0 w-full h-full">
  <div class="flex flex-col p-2 bg-zinc-500 rounded m-5 w-70">
    <h1 class="text-3xl font-bold text-center">{state.time.toPrecision(4)}</h1>
    <h1 class="text-center">Timer Control</h1>
    <div class="grid grid-cols-3 gap-3">
      <button class="bg-zinc-800 text-white p-2 rounded" onclick={startTimer}>Start</button>
      <button class="bg-zinc-800 text-white p-2 rounded" onclick={pauseTimer}>Pause</button>
      <button class="bg-zinc-800 text-white p-2 rounded" onclick={restartTimer}>Restart</button>
    </div>
  </div>
</div>
