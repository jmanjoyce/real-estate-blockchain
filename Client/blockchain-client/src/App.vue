<!-- eslint-disable vue/no-unused-components -->
<template>
  <v-alert
      v-show="showAlert && alert"
      density="compact"
      :type="alert?.type"
      :title="alert?.title"
      :text="alert?.text"
      style="font-size: 18px"
    >
      <v-progress-linear
        v-show="true"
        v-model="progress"
        :height="10"
        color="white"
      ></v-progress-linear>
    </v-alert>
  <div v-if="!signIn">
    <SingInPage></SingInPage>
  </div>
  <div v-if="signIn">
    <div class="top">
      <div class="item">
        <BlockChainManager
          @alert="alertUser"
          v-if="nodes"
          @start="startNode"
          @dump="dump"
          :pending-transaction="pendingTransactions"
          @get-pending="getPendingTransactions"
          @mine="mineNewBlock"
          :machines="nodes"
        ></BlockChainManager>
      </div>
      <div class="item">
        <RealEstate
          @alert="alertUser"
          :addressInfo="currentAdressInfo"
          @reset-address-info="resetAddressInfo"
          @get-address-info="getCurrentAddressInfo"
          @purchase="purchase"
          @invalid-address="invalidAddress"
        ></RealEstate>
      </div>
      <!-- <div class="item">
      <AddressLookup></AddressLookup>
    </div> -->
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import BlockChainManager from "./components/BlockChainManager.vue";
import {
  AdressInfo,
  AdressInfoReqDto,
  Node,
  Purchase,
  Status,
  StatusDto,
  TransactionData,
} from "./common";
import RealEstate from "./components/RealEstate.vue";
const data = require("./assets/nodes.json");
import axios from "axios";
import SingInPage from "./components/SingInPage.vue";
// const dotenv = require('dotenv');
// dotenv.config();

interface NodeInfo {
  ipAddress: string;
  port: string;
  location: string;
}

interface Alert {
  type: "error" | "success" | "warning" | "info" | undefined;
  title: string;
  text: string;
}

const parsedData: NodeInfo[] = JSON.parse(JSON.stringify(data));

export default defineComponent({
  name: "App",
  components: {
    BlockChainManager,
    RealEstate,
    SingInPage
},

  data(): {
    nodes: Node[] | undefined;
    currentAdressInfo: AdressInfo | undefined;
    showAlert: boolean;
    alert: Alert | undefined;
    progress: number;
    intervalId: any;
    pendingTransactions: TransactionData[] | undefined;
    signIn: boolean,
  } {
    return {
      signIn: false,
      pendingTransactions: undefined,
      progress: 0,
      intervalId: null,
      nodes: undefined,
      currentAdressInfo: undefined,
      showAlert: false,
      alert: undefined,
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
    async getCurrentAddressInfo(address: string) {
      const node: Node = this.nodes![0];
      const url = `http://${node.ipAddress}:${node.port}/addressInfo`;
      const req: AdressInfoReqDto = {
        address: address,
      };
      axios
        .post(url, req)
        .then((res) => {
          const response: AdressInfo = res.data;
          this.currentAdressInfo = response;
          console.log(response);
        })
        .catch((err) => {
          console.log("error getting address details from blockchain", err);
        });
    },
    resetAddressInfo() {
      this.currentAdressInfo = undefined;
    },
    invalidAddress() {
      const alert: Alert = {
        type: "warning",
        title: "Invalid Address",
        text: "You must enter a valid street address (with number)",
      };
      this.alertUser(alert);
    },
    alertUser(alert: Alert) {
      this.alert = alert;
      this.showAlert = true;
      this.progress = 100;

      this.intervalId = setInterval(() => {
        this.progress = this.progress - 1; // Decrease progress every second
        //console.log(this.progress);
        if (this.progress === 0) {
          setInterval(() => {
            this.intervalId = null;
            this.showAlert = false;
          }, 500);
          this.intervalId = null;
          // Hide alert when progress completes
        }
      }, 25); // Update progress every 100 milliseconds
    },
    async refresh() {
      const nodesInfo: Node[] = [];
      const promises = parsedData.map((node) => {
        const url = `http://${node.ipAddress}:${node.port}/status`;
        return axios
          .get(url)
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
          this.nodes = results.filter((node) => node !== null) as Node[];
          console.log(this.nodes);
          console.log(nodesInfo);
        })
        .catch((error) => {
          console.error("Error with Promise.all", error);
        });
    },
    async purchase(purchase: Purchase) {
      console.log("purchasing", purchase);
      await axios
        .post("http://localhost:3001/purchase", purchase)
        .then((res) => {
          console.log(res);
          const alert: Alert = {
            type: "success",
            title: "Success",
            text: "The purchase has been succesful but is not confirmed until a new block is mined",
          };
          this.alertUser(alert);
        })
        .catch((err) => {
          console.log("error", err);
          const alert: Alert = {
            type: "error",
            title: "Error",
            text: "There has been an issue purchasing item",
          };
          this.alertUser(alert);
        });
    },
    async mineNewBlock(index: number) {
      // Endpoint not tested yet
      const node = this.nodes![index];
      const url = `http://${node.ipAddress}:${node.port}/mineNewBlock`;
      await axios.post(url).then((res) => {
        console.log(res);
        const alert: Alert = {
          type: "success",
          title: "Block Succesfully Mined",
          text: `${node.ipAddress} has succesfully mined block`,
        };
        this.alertUser(alert);
        this.pendingTransactions = undefined;
      });
    },
    dump() {
      this.nodes?.forEach((node) => {
        const url = `http://${node.ipAddress}:${node.port}/dump`;
        axios.get(url);
      });
    },
    async getPendingTransactions(index: number) {
      const node: Node | undefined = this.nodes?.at(index);
      try {
        if (node) {
          const url = `http://${node.ipAddress}:${node.port}/allPendingTransaction`;
          axios
            .get(url)
            .then((res) => {
              const transactionData: TransactionData[] = res.data;
              this.pendingTransactions = transactionData;
              console.log("Recieved Transaction Data", transactionData);
            })
            .catch((err) => {
              console.log(err);
            });
        }
      } catch (err) {
        console.log("error recieving transaction data", err);
      }
    },

    async startNode(index: number) {
      const node: Node | undefined = this.nodes?.at(index);
      if (node) {
        const url = `http://${node.ipAddress}:${node.port}/start`;
        await axios
          .get(url)
          .then((res) => {
            const info: StatusDto = res.data;
            node.status = info.status;
            const alert: Alert = {
              type: "success",
              title: "Node succesfully started",
              text: `${node.ipAddress} has succesfully started`,
            };
            this.alertUser(alert);
          })
          .catch((err) => {
            console.log("Trouble starting node", url, err);
            const alert: Alert = {
              type: "warning",
              title: "Node failed to start started",
              text: `${node.ipAddress} has failed to start`,
            };
            this.alertUser(alert);
          });
      }
    },
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
  /* //margin-top: 60px; */
}

.top {
  display: flex;
  flex-direction: row;
  margin-top: 40px;
}

.item {
  min-width: 45%;
}
</style>
