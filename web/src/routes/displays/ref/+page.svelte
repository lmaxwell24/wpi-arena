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
					"data:image/svg+xml;charset=utf8,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%3E%3C/svg%3E"
			},
			robot2: {
				name: 'Robot 2',
				photoUrl:
					"data:image/svg+xml;charset=utf8,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%3E%3C/svg%3E"
			},
			compName: 'A Robot Comp',
			compMatch: 'Semifinals'
		}
	};

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
</script>

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
	{emitWinner}
/>
