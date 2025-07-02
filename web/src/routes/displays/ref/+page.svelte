<script lang="ts">
	import { io } from '$lib/websocketconnection';
	import { onMount } from 'svelte';
	import Ref from '../../../comonents/Ref.svelte';

	let state = {
		time: 180,
		precount: 5,
		selectedWinner: null,
		winningMode: '',
		serverState: {
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
			compName: 'A Robot Comp',
			compMatch: 'Semifinals'
		}
	};

	import { callApi } from '$lib/api';
	let overwriteTime = 180;

	onMount(async () => {
		io.on('timer', (data) => {
			state.time = data;
		});

		io.on('precount', (data) => {
			state.precount = Math.ceil(data);
		});

		io.on('matchUpdate', (data) => {
			state.serverState = { ...state.serverState, ...data };
		});

		io.on('robotReady', (data) => {
			const { robotId, ready } = data;
			state.serverState[`robot${robotId + 1}`].ready = ready;
		});

		await loadDatabase();
	});

	const startTimer = async () => {
		await callApi('/api/timer', { control: 'start' }, 'POST');
	};

	const resumeTimer = async () => {
		await callApi('/api/timer', { control: 'resume' }, 'POST');
	};

	const pauseTimer = async () => {
		await callApi('/api/timer', { control: 'pause' }, 'POST');
		overwriteTime = Number(state.time.toPrecision(4));
	};

	const restartTimer = async () => {
		await callApi('/api/timer', { control: 'restart' }, 'POST');
	};

	const overwriteTimer = async () => {
		await callApi('/api/timer', { control: 'set', time: overwriteTime }, 'POST');
	};

	const emitWinner = async () => {
		await callApi('/api/winner', { who: state.selectedWinner, how: state.winningMode }, 'POST');
		state.selectedWinner = null;
		state.winningMode = '';
	};

	const sendReadyStatus = async (robotId: number, ready: boolean) => {
		await callApi('/api/robot_ready', { robotId, ready }, 'POST');
		state.serverState[`robot${robotId + 1}`].ready = ready;
	};
</script>

<div class="absolute top-0 left-0 hidden p-6 sm:block">
	<h1 class="mb-6 text-4xl font-bold">WPI Arena- Referee Panel</h1>
	<p class="text-slate-400">Control match timing, declare winners</p>
</div>
<div class="flex min-h-screen flex-col items-center justify-center bg-gray-900 text-white">
	<div class="w-full max-w-4xl">
		<!-- Referee Component -->
		<Ref
			{startTimer}
			{resumeTimer}
			{pauseTimer}
			{restartTimer}
			{overwriteTimer}
			{overwriteTime}
			time={state.time.toPrecision(4)}
			precount={state.precount}
			bind:selectedWinner={state.selectedWinner}
			robot1Name={state.serverState.robot1.name}
			robot2Name={state.serverState.robot2.name}
			bind:winningMode={state.winningMode}
			ready1={state.serverState.robot1.ready}
			ready2={state.serverState.robot2.ready}
			{sendReadyStatus}
			{emitWinner}
		/>
	</div>
</div>
