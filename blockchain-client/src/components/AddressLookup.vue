<template>
  <div>
    <v-text-field
      width="300"
      @input="textChange"
      v-model="address"
      label="Enter the address you want to buy"
      outlined
      ref="autocompleteInput"
    ></v-text-field>
    <div v-show="entered" class="map-container">
      <div ref="map" style="height: 200px"></div>
    </div>
  </div>
</template>

<script lang="ts">
import { PropType, defineComponent } from "vue";

declare const google: any;

export default defineComponent({
  name: "AddressLookup",
  props: {
    parentAddress: Object as PropType<string>,
  },
  emits: ["text-change", "get-address-info", "alert", "invalid-address"],
  data(): {
    map: any;
    marker: any;
    entered: boolean;
    address: string;
  } {
    return {
      map: null,
      marker: null,
      entered: false,
      address: this.parentAddress ?? "",
    };
  },
  watch: {
    parentAddress(newValue) {
      //console.log('watched');
      this.address = newValue;
      if (newValue == "") {
        this.entered = false;
      }
    },
  },
  mounted() {
    const script = document.createElement("script");

    // Not stable couldn't get enviorment variables wokring yet.
    console.log(process.env.MAPS_KEY);
    const key = 'YOUR_API_KEY'; // Insert API key
    script.src = `https://maps.googleapis.com/maps/api/js?key=${key}=places`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      this.initAutocomplete();
    };

    document.head.appendChild(script);
  },
  methods: {
    textChange() {
      this.$emit("text-change", this.address);
    },
    alertInvalidAddress(){
      this.$emit("invalid-address");
    },
    initAutocomplete() {
      const inputRef = this.$refs.autocompleteInput as HTMLInputElement;
      const mapElement = this.$refs.map;
      const autocomplete = new google.maps.places.Autocomplete(inputRef, {
        types: ["address"],
      });

      this.map = new google.maps.Map(mapElement, {
        center: { lat: 0, lng: 0 },
        zoom: 12,
      });

      this.marker = new google.maps.Marker({
        map: this.map,
      });

      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        this.address = place.name;
        //console.log('emmiting', this.address);
        this.entered = true;

        this.$emit("get-address-info", this.address);
        this.$emit("text-change", this.address);

        // What we can do to make sure it is an address is figure out if it starts with a number
        const formatted_addr = place.formatted_address;
        // console.log("formatted add", formatted_addr);

        const numCommas = formatted_addr.match(/,/g).length;
        if(numCommas < 3){
          this.alertInvalidAddress();
        } else if (place.address_components[0].types != "street_number"){
          this.alertInvalidAddress();
          console.log("no street number ripppp");
        }

        this.entered = true;
        if (!place.geometry || !place.geometry.location) {
          return; // No location data available
        }

        // Update the map and marker with the selected location
        this.map.setCenter(place.geometry.location);
        this.marker.setPosition(place.geometry.location);
      });
    },
  },
});


</script>

<style>
.map-container {
  margin-bottom: 5px;
}
</style>
