<template>
  <div class="pt-4">
    <div class="bg-zinc-900 py-5">
      <div class="flex justify-center p-5">
        <img alt="LogoMW2" class="justify-center" src="/images/logo_mw2.png" />
      </div>
      <h1 class="text-center mb-10 text-5xl font-bold text-white">
        WARZONE CHALLENGE
      </h1>
      <div class="flex text-white bg-zinc-800 justify-center">
        <router-link
          class="uppercase p-5 text-2xl flex items-center transition-all hover:bg-zinc-600"
          to="/"
        >
          <Squares2X2Icon class="h-6 w-6 text-white mr-5"></Squares2X2Icon>
          Dashboard
        </router-link>
        <router-link
          class="uppercase p-5 text-2xl flex items-center transition-all hover:bg-zinc-600"
          to="/data"
        >
          <TableCellsIcon class="h-6 w-6 text-white mr-5"></TableCellsIcon>
          Data
        </router-link>
      </div>
      <router-view v-slot="{ Component }">
        <component :is="Component" :key="$route.fullPath"></component>
      </router-view>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { Squares2X2Icon, TableCellsIcon } from '@heroicons/vue/24/solid'
</script>
