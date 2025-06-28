<script lang="ts">
	let {
		startTimer,
		resumeTimer,
		pauseTimer,
		restartTimer,
		overwriteTimer,
		overwriteTime = $bindable(),
		time,
		precount,
		selectedWinner = $bindable(),
		robot1Name,
		robot2Name,
		winningMode = $bindable(),
		emitWinner
	} = $props();
</script>

<div class="card m-6">
	<!-- Timer Display -->
	<div class="card-header text-center">
		<div class="timer-display mb-2 text-6xl">
			{precount > 0 ? precount : Math.floor(time / 60)}
			{#if precount == 0}
				:{(time % 60).toFixed(1).padStart(4, '0')}
			{/if}
		</div>
		<div class="flex items-center justify-center space-x-2">
			<div
				class="status-indicator {precount > 0
					? 'status-paused'
					: time > 0
						? 'status-active'
						: 'status-stopped'}"
			></div>
			<span class="text-lg font-medium text-slate-300">
				{precount > 0 ? 'Pre-count' : time > 0 ? 'Match Active' : 'Match Ended'}
			</span>
		</div>
	</div>

	<div class="card-body space-y-8">
		<!-- Timer Controls -->
		<div>
			<h2 class="mb-4 text-center text-xl font-semibold text-white">Timer Control</h2>
			<div class="mb-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
				<button class="btn btn-success" onclick={startTimer}> Start </button>
				<button class="btn btn-primary" onclick={resumeTimer}> Resume </button>
				<button class="btn btn-secondary" onclick={pauseTimer}> Pause </button>
				<button class="btn btn-danger" onclick={restartTimer}> Restart </button>
			</div>
			<div class="flex gap-3">
				<input
					class="input flex-1"
					type="number"
					bind:value={overwriteTime}
					placeholder="Set time (seconds)"
				/>
				<button class="btn btn-secondary flex items-center justify-center" onclick={overwriteTimer}>
					<svg class="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
						></path>
					</svg>
					Set Time
				</button>
			</div>
		</div>

		<!-- Winner Selection -->
		<div>
			<h2 class="mb-6 text-center text-xl font-semibold text-white">Declare Winner</h2>

			<!-- Robot Selection -->
			<div class="mb-6 grid grid-cols-2 gap-4">
				<button
					class="robot-card cursor-pointer bg-gradient-to-r from-blue-500/20 to-blue-600/20 p-6 transition-all duration-200 {selectedWinner ==
					0
						? 'border-emerald-400 bg-emerald-500/100 text-emerald-100'
						: 'hover:bg-slate-500'}"
					onclick={() => {
						selectedWinner = 0;
					}}
				>
					<div class="p-6 text-center">
						<!--
            <div
							class="mx-auto mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-blue-500"
						>
							<span class="font-bold text-white">1</span>
						</div>
            -->
						<h3 class="text-lg font-semibold">{robot1Name}</h3>
					</div>
				</button>

				<button
					class="robot-card cursor-pointer bg-gradient-to-r from-red-500/20 to-red-600/20 p-6 transition-all duration-200 {selectedWinner ==
					1
						? 'border-emerald-400 bg-emerald-500/100 text-emerald-100'
						: 'hover:bg-slate-500'}"
					onclick={() => {
						selectedWinner = 1;
					}}
				>
					<div class="p-6 text-center">
						<!--
						<div
							class="mx-auto mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-red-500"
						>
							<span class="font-bold text-white">2</span>
						</div>
            -->
						<h3 class="text-lg font-semibold">{robot2Name}</h3>
					</div>
				</button>
			</div>

			<!-- Win Methods -->
			<div class="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
				{#each [{ code: 'KO', name: 'Knockout', icon: '⚡' }, { code: 'TO', name: 'Tapout', icon: '🏳️' }, { code: 'JD', name: "Judge's Decision", icon: '⚖️' }, { code: 'TKO', name: 'Technical KO', icon: '🔧' }] as wintype}
					<button
						class="btn transition-all duration-200 {winningMode == wintype.code
							? 'bg-emerald-600 text-white hover:bg-emerald-700'
							: 'btn-secondary'}"
						onclick={() => {
							winningMode = wintype.code;
						}}
					>
						<div class="text-center">
							<div class="mb-1 text-lg">{wintype.icon}</div>
							<div class="text-xs font-semibold">{wintype.code}</div>
							<div class="text-xs opacity-75">{wintype.name}</div>
						</div>
					</button>
				{/each}
			</div>

			<!-- Publish Button -->
			<button
				class="btn w-full bg-gradient-to-r from-emerald-600 to-emerald-700 py-8 text-lg font-bold text-white hover:from-emerald-700 hover:to-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
				onclick={emitWinner}
				disabled={selectedWinner === null || !winningMode}
			>
				PUBLISH WINNER
			</button>
		</div>
	</div>
</div>
