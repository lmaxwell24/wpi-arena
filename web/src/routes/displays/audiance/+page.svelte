<script lang="ts">
	import { io } from '$lib/websocketconnection';
	import { onMount } from 'svelte';

	let time = 180;

  let matchState = {
    robot1: {
      name: "Robot 1",
      imageUrl: "data:image/svg+xml;charset=utf8,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%3E%3C/svg%3E"
    },
    robot2: {
      name: "Robot 2",
      imageUrl: "data:image/svg+xml;charset=utf8,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%3E%3C/svg%3E"
    },
    compName: "A Robot Comp",
    compMatch: "Semifinals"
  }

	onMount(() => {
		io.on('timer', (data) => {
			time = Math.ceil(data);
		});

    io.on('matchUpdate', (data) => {
      console.log(data)
      matchState = {...matchState, ...data}
      console.log(matchState)
    })
	});
</script>
<div
	class="font-roboto absolute top-0 left-0 mx-0 my-0 flex h-screen w-screen items-start justify-center text-3xl"
>
	<div class="my-4 inline-block bg-zinc-500 w-4xl">
		<div class="grid grid-cols-5 text-center">
      <div class="bg-white col-span-5 text-2xl">{matchState.compName} - {matchState.compMatch}</div>
      <div class="bg-[#131323] width-full col-span-2 text-left text-white flex gap-2">
        <img class="aspect-square h-20" src={matchState.robot1.imageUrl} alt=""/>
        <span class="py-1">{matchState.robot1.name.toUpperCase()}</span>
      </div>
      <div class="bg-zinc-200 p-2 flex items-center justify-center text-5xl">0{Math.floor(time/60)}:{Math.floor((time%60) / 10)}{Math.floor(time%10)}</div>
      <div class="bg-[#af1b33] width-full col-span-2 text-right text-white flex justify-end gap-2">
        <span class="py-1">{matchState.robot2.name.toUpperCase()}</span>
        <img class="aspect-square h-20" src={matchState.robot2.imageUrl} alt=""/>
      </div>
		</div>
	</div>
</div>
