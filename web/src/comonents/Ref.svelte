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
		emitWinner,
		ready1,
		ready2,
		sendReadyStatus
	} = $props();
</script>

<div
	class="to-combat-red/40 m-6 rounded-lg bg-gradient-to-br from-zinc-800/60 py-6 shadow-lg ring-5 ring-slate-700/50"
>
	<div class="card m-6">
		<!-- Timer Display -->
		<div class="card-header text-center">
			<div class="timer-display mb-2 text-6xl">
				{precount > 0 ? precount : Math.floor(time / 60)}{#if precount == 0}:{(time % 60)
						.toFixed(1)
						.padStart(4, '0')}{/if}
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
					<button
						class="btn btn-success disabled:cursor-not-allowed disabled:opacity-50"
						onclick={startTimer}
						disabled={!(ready1 && ready2) || precount !== 5}
					>
						Start
					</button>
					<button
						class="btn btn-primary disabled:cursor-not-allowed disabled:opacity-50"
						onclick={resumeTimer}
						disabled={precount > 0}
					>
						Resume
					</button>
					<button
						class="btn btn-secondary disabled:cursor-not-allowed disabled:opacity-50"
						onclick={pauseTimer}
						disabled={precount > 0}
					>
						Pause
					</button>
					<button
						class="btn btn-danger disabled:cursor-not-allowed disabled:opacity-50"
						onclick={restartTimer}
					>
						Restart
					</button>
				</div>
				<div class="grid grid-cols-3 gap-3 lg:grid-cols-4">
					<input
						class="input col-span-2 lg:col-span-3"
						type="number"
						bind:value={overwriteTime}
						placeholder="Set time (seconds)"
					/>
					<button
						class="btn btn-secondary flex items-center justify-center"
						onclick={overwriteTimer}
					>
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
				<!-- Robot Selection -->
				<div class="mb-6 grid grid-cols-2 gap-4">
					{#if precount === 5}
						<button
							class="btn {ready1 ? 'bg-emerald-950' : 'btn-secondary'} "
							onclick={() => {
								sendReadyStatus(0, !ready1);
							}}
						>
							<div
								class="status-indicator {ready1 ? 'status-active' : 'status-stopped'} mr-3"
							></div>
							<span class="text-lg font-medium {ready1 ? 'text-emerald-400' : 'text-red-400'}">
								{ready1 ? 'Ready' : 'Not Ready'}
							</span>
						</button>
						<button
							class="btn {ready2 ? 'bg-emerald-950' : 'btn-secondary'} "
							onclick={() => {
								sendReadyStatus(1, !ready2);
							}}
						>
							<div
								class="status-indicator {ready2 ? 'status-active' : 'status-stopped'} mr-3"
							></div>
							<span class="text-lg font-medium {ready2 ? 'text-emerald-400' : 'text-red-400'}">
								{ready2 ? 'Ready' : 'Not Ready'}
							</span>
						</button>
					{/if}

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

				<h2 class="mb-6 text-center text-xl font-semibold text-white">Declare Winner</h2>
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
</div>
