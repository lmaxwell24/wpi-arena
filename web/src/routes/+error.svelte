<script lang="ts">
	import { page } from '$app/state';
</script>

<!-- Error Page -->
<div class="dot -z-10 h-screen w-screen"></div>
<div
	class="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-red-900/30 via-indigo-800/20 to-red-900/30 p-8 text-center"
>
	<div class="flex flex-col items-center justify-center rounded-xl p-20 backdrop-blur-xs">
		<h1 class="mb-4 text-8xl font-bold text-slate-100">{page.status}</h1>
		<p class="mb-6 text-xl text-gray-200">{page.error.message}</p>
		<p class="text-sm text-gray-400">Please try again later.</p>
		<a href="/" class="btn btn-primary mt-4 text-blue-500 hover:underline">Go back to home</a>
	</div>
</div>
