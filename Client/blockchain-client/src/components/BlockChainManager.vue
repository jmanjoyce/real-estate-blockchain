<template>
  <div class="top">
    <div class="top-bar">
      <div>
        <h1>Cluster Manager</h1>
      </div>

    </div>
    <div class="table">

      <v-table>
        <thead>
          <tr>
            <th class="text-left">
              Machine
            </th>
            <th class="text-left">
              Location
            </th>
            <th class="text-left">
              Status
            </th>
            <th class="text-left">
              Actions
            </th>

          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, index) in machines" :key="index">
            <td>{{ item.port }}</td>
            <td>{{ item.location }}</td>
            <td>{{ item.status }}</td>
            <td>
              <v-btn v-if="item.status as any != 2" :color="item.status as any == 1 ? 'red' : 'green'" size="small" @click="start(index)">{{
                item.status as any == 1 ? 'Stop' : 'Start' }}</v-btn>
              <v-btn v-if="item.status" size="small" color="black">Mine</v-btn>
            </td>
          </tr>
        </tbody>
      </v-table>

    </div>
    <div class="buttons">
      <div class="button">
        <v-btn size="small" color='blue' @click="startBlockChain">Start All Nodes</v-btn>
      </div>
      <div  class="button">
        <v-btn size="small" color='red' @click="startBlockChain">Kill Block Chain</v-btn>
      </div>
      <div class="button">
        <v-btn size="small" color="purple" @click="mineNewBlock">Mine new block</v-btn>

      </div>
    </div>

  </div>
</template>

<script lang="ts">
import { PropType, defineComponent } from 'vue';
import { Node } from '@/common';






export default defineComponent({
  name: 'BlockChainManager',
  emits: ['mine', 'start'],
  props: {
    machines: Object as PropType<Node[]>,
  },
  data(): {
    baseUrl: string,
    //machines: Node[],

  } {
    return {
      baseUrl: "localhost:8080",
      //machines: machines,


    }
  },
  methods: {
    async startBlockChain() {
      
    },
    mineNewBlock(){
      console.log('emmiting');
      this.$emit('mine', 0);
    },
    start(index: any){
      console.log(index);
      if (this.machines![index].status as any == 1){
        console.log('running');
      }
      if (this.machines![index].status as any == 0){
        console.log('Emmitting');
        this.$emit('start', index);
      }
      //console.log(this.machines![0].status);
    }
  }




})

</script>

<style scoped>
.top-bar {
  display: flex;
  flex-direction: row;
  justify-content: center;

}

.top {
  display: flex;
  flex-direction: column;


}

.buttons {
  display: flex;
  flex-direction: row;
  justify-content: center;


}

.button {
  padding: 10px;
}

.table {
  display: flex;
  justify-content: center;
}
</style>