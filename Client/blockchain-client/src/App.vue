<template>
  <!-- <img alt="Vue logo" src="./assets/logo.png"> -->
  
  <div>
    <BlockChainManager :machines="nodes"></BlockChainManager>
    
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import BlockChainManager from './components/BlockChainManager.vue'
import { Node } from './common'
const data = require('./assets/nodes.json');

const parsedData: Node[] = JSON.parse(JSON.stringify(data));
console.log(parsedData);
export default defineComponent({
  name: 'App',
  components: {
    BlockChainManager,

  },
 
  data():{
    nodes: Node[];
  }
    {
      return {
         nodes: parsedData,
      }
  },
  
  
     

  
})

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
