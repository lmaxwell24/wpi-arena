<script lang="ts">
	import { io } from '$lib/websocketconnection';
	import { onMount } from 'svelte';

	let state = { time: 180 };

	const callApi = async (endpoint: string, data: any, method?: string = 'GET') => {
		return await fetch(`http://localhost:8080${endpoint}`, {
			method,
			headers: {
				Accept: 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(data)
		});
	};

  let players = []
  let test = {}

  const loadDatabase = async () => {
    let players_raw = await callApi('/api/players')
    players = await players_raw.json()
    console.log(players)
    
  }

	onMount(async () => {
		io.on('timer', (data) => {
			state.time = data;
		});

    await loadDatabase()
	});

	const startTimer = async () => {
		await callApi('/api/timer', { control: 'start' }, 'POST');
	};

	const pauseTimer = async () => {
		await callApi('/api/timer', { control: 'pause' }, 'POST');
	};

	const restartTimer = async () => {
		await callApi('/api/timer', { control: 'restart' }, 'POST');
	};

  const loadTestMatch = async () => {
    await callApi('/api/raw_match', {robot1: test.player1, robot2: test.player2, compMatch: "Test Match"}, "POST")
    
  }
</script>

<div class="absolute top-0 left-0 flex h-full w-full">
	<div>
		<div class="m-5 flex flex-col rounded bg-zinc-500 p-2">
			<h1 class="text-center text-3xl font-bold">{state.time.toPrecision(4)}</h1>
			<h1 class="text-center">Timer Control</h1>
			<div class="grid grid-cols-3 gap-3">
				<button class="rounded bg-zinc-800 p-2 text-white" onclick={startTimer}>Start</button>
				<button class="rounded bg-zinc-800 p-2 text-white" onclick={pauseTimer}>Pause</button>
				<button class="rounded bg-zinc-800 p-2 text-white" onclick={restartTimer}>Restart</button>
			</div>
		</div>
	</div>
	<div>
		<div class="m-5 flex flex-col rounded bg-zinc-500 p-2">
			<h1 class="text-center text-xl font-semibold">Match Loading</h1>
      <div class="bg-zinc-800 rounded text-white p-2">
        <h2 class="text-center">Test Match</h2>
        <select
            bind:value={test.player1}
            class="w-full border-2"
            >
            {#each players as player}
              <option value={player} class="text-black">
              {player.name}
              </option>
            {/each}
        </select>
        <select
            bind:value={test.player2}
            class="w-full border-2 bg-red-800 text-black"
            >
            {#each players as player}
              <option value={player} class="text-black bg-white">
              {player.name}
              </option>
            {/each}
        </select>
        <button onclick={loadTestMatch}>Load match</button>
      </div>
		</div>
	</div>
</div>
