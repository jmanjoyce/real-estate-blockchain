<template>
  <BlockChainManager/>
  <v-btn></v-btn>
 
</template>

<script>
import BlockChainManager from './components/BlockChainManager.vue'

export default {
  name: 'App',
  components: {
    BlockChainManager,
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
