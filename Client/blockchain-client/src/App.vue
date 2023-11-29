<!-- eslint-disable vue/no-unused-components -->
<template>
  <div class="top">
    <div class="item">
      <BlockChainManager v-if="nodes" @start="startNode" @dump="dump" @mine="mineNewBlock" :machines="nodes"></BlockChainManager>
    </div>
    <div class="item">
      <RealEstate :addressInfo="currentAdressInfo" @get-address-info="getCurrentAddressInfo" @purchase="purchase"></RealEstate>
    </div>
    <!-- <div class="item">
      <AddressLookup></AddressLookup>
    </div> -->
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import BlockChainManager from "./components/BlockChainManager.vue";
import { AdressInfo, AdressInfoReqDto, Node, Purchase, Status, StatusDto } from "./common";
import RealEstate from "./components/RealEstate.vue";
const data = require("./assets/nodes.json");
import axios from "axios";
// const dotenv = require('dotenv');
// dotenv.config();

interface NodeInfo {
  ipAddress: string;
  port: string;
  location: string;
}

const parsedData: NodeInfo[] = JSON.parse(JSON.stringify(data));

export default defineComponent({
  name: "App",
  components: {
    BlockChainManager,
    RealEstate,
    // AddressLookup,
  },

  data(): {
    nodes: Node[] | undefined;
    currentAdressInfo: AdressInfo | undefined,
  } {
    return {
      nodes: undefined,
      currentAdressInfo: undefined,
    };
  },
  async mounted() {
    this.refresh();
    // Get status of all nodes,


    //this.nodes = nodesInfo;


    // Set them on the node info

    // const promises = parsedData.map(data => {
    //     axios.get
    //   })
    //   await Promise.all(promises);
    //   return [];
  },

  methods: {
    async getCurrentAddressInfo(address: string){
      const node: Node = this.nodes![0];
      const url = `http://${node.ipAddress}:${node.port}/addressInfo`;
      const req: AdressInfoReqDto = {
          address:address,
      }
      axios.post(url, req).then(res => {
        const response: AdressInfo = res.data;
        this.currentAdressInfo = response;
        console.log(response);

      }).catch(err => {
        console.log("error getting address details from blockchain", err);
      })

      

    },
    async refresh() {
      const nodesInfo: Node[] = [];
      const promises = parsedData.map((node) => {
        const url = `http://${node.ipAddress}:${node.port}/status`;
        return axios.get(url)
          .then((res) => {
            const info: StatusDto = res.data;
            const nodeInfo: Node = {
              ipAddress: node.ipAddress,
              port: node.port,
              location: node.location,
              status: info.status,
            };
            return nodeInfo;
          })
          .catch((error) => {
              console.log("Request refused", url, error);
              const nodeInfo: Node = {
                ipAddress: node.ipAddress,
                port: node.port,
                location: node.location,
                status: Status.OFFLINE,
              };
              return nodeInfo;
          });
      });

      Promise.all(promises)
        .then((results) => {
          this.nodes = results.filter(node => node !== null) as Node[];
          console.log(this.nodes);
          console.log(nodesInfo);
        })
        .catch((error) => {
          console.error('Error with Promise.all', error);
        });

    },
    async purchase(purchase: Purchase) {
      console.log("purchasing", purchase);
      await axios
        .post("http://localhost:3001/purchase", purchase)
        .then((res) => {
          console.log(res);
        });
    },
    async mineNewBlock(index: number) {
     
      // Endpoint not tested yet
      const node = this.nodes![index];
      const url = `http://${node.ipAddress}:${node.port}/mineNewBlock`
      await axios
        .post(url)
        .then((res) => {
          console.log(res);
        });
    },
    dump(){
      this.nodes?.forEach(node => {
        const url = `http://${node.ipAddress}:${node.port}/dump`
        axios.get(url);
      })
    },
    
    
    async startNode(index: number){
      const node: Node | undefined = this.nodes?.at(index);
      if (node){
        const url = `http://${node.ipAddress}:${node.port}/start`
        await axios.get(url).then(res => {
          const info: StatusDto = res.data;
          node.status = info.status;
        }).catch(err => {
          console.log('Trouble starting node', url, err);
        });
        
      }
    }
  },
});
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
  min-width: 33%;
}
</style>
