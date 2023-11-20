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
              Connection Status
            </th>
            <th class="text-left">
              Available
            </th>
            <th class="text-left">
              Actions

            </th>

          </tr>
        </thead>
        <tbody>
          <tr v-for="item in machines" :key="item.port">
            <td>{{ item.port }}</td>
            <td>{{ item.location }}</td>
            <td>{{ item.implementingBlocking }}</td>
            <td>{{ item.availability }}</td>
            <td :v-if="item.availability">
              <v-btn :color="item.implementingBlocking ? 'green' : 'red'" size="small">{{
                item.implementingBlocking ? 'Start' : 'Stop' }}</v-btn>
            </td>
          </tr>
        </tbody>
      </v-table>

    </div>
    <div class="buttons">
      <div class="button">
        <v-btn color='blue' @click="startBlockChain">Start All Nodes</v-btn>
      </div>
      <div class="button">
        <v-btn color='red' @click="startBlockChain">Kill Block Chain</v-btn>
      </div>
    </div>

  </div>
</template>

<script lang="ts">
import { PropType, defineComponent } from 'vue';
import axios from 'axios'
import { Node } from '@/common';






export default defineComponent({
  name: 'BlockChainManager',
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
      axios.get('/start')
    },
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