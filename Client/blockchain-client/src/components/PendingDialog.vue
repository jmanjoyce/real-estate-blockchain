<template>
  <v-dialog v-model="dialog" persistent scrollable width="auto">
    <template v-slot:activator="{ props }">
      <v-btn @click="getPending" size="small" color="black" v-bind="props"> Mine </v-btn>
    </template>
    <v-card>
      <v-card-title>{{ `Transactions to be mined (${pendingTransactions?.length})` }}</v-card-title>
      <v-divider></v-divider>
      <v-card-text style="height: 300px">
        <v-list>
          <v-list-item
            v-for="(item, index) in pendingTransactions"
            :key="index"
          >
            <v-list-item-content>
              <v-list-item-title>
                <div>
                  <span>Address: {{ item.address }}</span
                  ><br />
                  <span>Price: {{ item.price }}</span
                  ><br />
                  <span>Buyer: {{ item.newOwner }}</span>
                </div>
              </v-list-item-title>
              <v-divider></v-divider>
            </v-list-item-content>
          </v-list-item>
        </v-list>
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions>
        <v-btn color="Red" @click="cancel">
          Cancel
        </v-btn>
        <v-btn color="Black" @click="mine">
          Mine
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { TransactionData } from "@/common";
import { PropType, defineComponent } from "vue";

export default defineComponent({
  props: {
    pendingTransactions: Object as PropType<TransactionData[] | undefined>,
  },
  emits: ['get-pending', 'mine'],
  data(): {
    dialog: boolean;
  } {
    return {
      dialog: false,
    };
  },
  methods: {
    getPending(){
        this.$emit('get-pending');
    },
    cancel(){
        this.dialog = false;
    },
    mine(){
        this.dialog = false;
        this.$emit('mine');

    },
  }
});
</script>
