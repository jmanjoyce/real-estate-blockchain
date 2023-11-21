<template>
  <!-- <img alt="Vue logo" src="./assets/logo.png"> -->
  
  <div class="top">
    <div class="item">
      <BlockChainManager :machines="nodes"></BlockChainManager>
    </div>
    <div class="item">
      <RealEstate @purchase="purchase"></RealEstate>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import BlockChainManager from './components/BlockChainManager.vue'
import { Node, Purchase } from './common'
import RealEstate from './components/RealEstate.vue';
const data = require('./assets/nodes.json');
import axios from 'axios'

const parsedData: Node[] = JSON.parse(JSON.stringify(data));


export default defineComponent({
  name: 'App',
  components: {
    BlockChainManager,
    RealEstate
},
 
  data():{
    nodes: Node[];
  }
    {
      return {
         nodes: parsedData,
      }
  },
  methods: {
    async purchase(purchase: Purchase){
      console.log('purchasing', purchase);
      await axios.post('http://localhost:3000/purchase', purchase).then(res => {
        console.log(res);
      })
    },
    async mineNewBlock(id: number){
      const info = {
        id: id
      }
      await axios.post('http://localhost:3000/', info);
    }
  }
  
  
     

  
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

.top {
  display: flex;
  flex-direction: row;

}

.item {
  min-width: 50%;
}
</style>
