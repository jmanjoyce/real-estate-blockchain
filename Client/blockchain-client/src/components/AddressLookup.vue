<template>
  <div>
  <v-container>
    <v-row>
      <v-col cols="12" sm="6">
        <v-text-field v-model="address" label="Enter your address" outlined ref="autocompleteInput"></v-text-field>
      </v-col>
    </v-row>
  </v-container>
  
    <div ref="map" style="height: 300px;"></div>
 
</div>
</template>

<script lang="ts">
import { defineComponent } from "vue";

declare const google: any;

export default defineComponent({
  name: "AddressLookup",
  data(): {
    address: string;
    map: any;
    marker: any;
    entered: boolean,
  } {
    return {
      address: "",
      map: null,
      marker: null,
      entered: false,
    };
  },
  mounted() {
    const script = document.createElement("script");

    // Not stable couldn't get enviorment variables wokring yet.
    console.log(process.env.MAPS_KEY);
    const key = "";
    script.src = `https://maps.googleapis.com/maps/api/js?key=${key}=places`;
    script.async = true;
    script.defer = true;

    script.onload = () => {
      this.initAutocomplete();
    };

    document.head.appendChild(script);
    
  },
  methods: {
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
        console.log(place);

        // What we can do to make sure it is an adress is figure out if it starts with a number


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

//   export default defineComponent(
//     address: string = '';,

//     mounted() {
//       const script = document.createElement('script');
//       script.src = `https://maps.googleapis.com/maps/api/js?key=YOUR_API_KEY&libraries=places`;
//       script.async = true;
//       script.defer = true;

//       script.onload = () => {
//         this.initAutocomplete();
//       };

//       document.head.appendChild(script);
//     },

//     initAutocomplete() {
//       const autocomplete = new google.maps.places.Autocomplete(this.$refs.autocompleteInput.$el, {
//         types: ['geocode']
//       });

//       autocomplete.addListener('place_changed', () => {
//         const place = autocomplete.getPlace();
//         this.address = place.formatted_address || '';
//         // Access other place details as needed
//       });
//     }
//   }

//   )
</script>

<style>
/* Add your custom styles here */
</style>
