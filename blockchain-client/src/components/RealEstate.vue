<template>
  <div class="top">
    <div>
      <h1>Buy Property</h1>
    </div>
    <div>
      <v-sheet width="300" class="mx-auto">
        <v-form ref="form">
          <v-text-field v-if="!userName"
            v-model="name"
            :counter="10"
            :rules="nameRules"
            label="Name"
            required
          ></v-text-field>
          <AddressLookup
            :parent-address="address"
            @get-address-info="getAddressInfo"
            @text-change="updateAdress"
            @invalid-address="invalidAddress"
          ></AddressLookup>
          <v-card v-if="addressInfo">
            <v-card-title>
              {{ addressInfo.address }}
            </v-card-title>
            <v-card-subtitle> price: {{ addressInfo.price }} </v-card-subtitle>
            <v-card-text>
              {{
                addressInfo.owned
                  ? `Current Owner: ${addressInfo.previousOwner}`
                  : "This property is currently unknowned"
              }}
            </v-card-text>
          </v-card>

          <div class="d-flex flex-column">
            <v-btn
              v-if="addressInfo"
              color="green"
              class="mt-4"
              block
              @click="submit"
            >
              Submit
            </v-btn>

            <v-btn color="red" class="mt-4" block @click="reset"> Reset </v-btn>
          </div>
        </v-form>
      </v-sheet>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from "vue";
import { AdressInfo, Purchase } from "../common";
import AddressLookup from "./AddressLookup.vue";
import { PropType } from "vue";

export default defineComponent({
  emits: ["purchase", "get-address-info", "reset-address-info", "invalid-address"],
  components: {
    AddressLookup,
  },
  props: {
    addressInfo: Object as PropType<AdressInfo | undefined>,
    userName: Object as PropType<string | undefined>,
  },
  data(): {
    name: string;
    address: string;
    nameRules: any;
    price: string;
  } {
    return {
      nameRules: [
        (v: any) => !!v || "Name is required",
        (v: any) =>
          (v && v.length <= 20) || "Name must be less than 20 characters",
      ],
      name: "",
      address: "",
      price: "100",
    };
  },
  methods: {
    updateAdress(adress: string) {
      this.address = adress;
    },
    submit() {
        const name : string = this.userName?? this.name;
        const purchase: Purchase = {
        name: name,
        address: this.address,
        price: this.addressInfo?.price ?? 0,
      };
      console.log("submitting");
      this.$emit("purchase", purchase);
      this.name = "";
      this.address = "";
      this.$emit("reset-address-info");
    },
    getAddressInfo(address: string) {
      console.log("emmiting");
      this.$emit("get-address-info", address);
    },
    invalidAddress(){
        this.$emit("invalid-address");

    },
    reset() {
      this.name = "";
      this.address = "";
      this.$emit("reset-address-info");
    },
  },
});
</script>

<style scoped>
.top {
  display: flex;
  flex-direction: column;
}
</style>
