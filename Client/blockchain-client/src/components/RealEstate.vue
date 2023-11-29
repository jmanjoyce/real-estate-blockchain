<template>
    <div class="top">
        <div>
            <h1>Buy Property</h1>
        </div>
        <div>
            <v-sheet width="300" class="mx-auto">
                <v-form ref="form">
                    <v-text-field v-model="name" :counter="10" :rules="nameRules" label="Name" required></v-text-field>
                    <AddressLookup :parent-address="address" @text-change="updateAdress"></AddressLookup>
                    <v-card v-if="addressInfo">
                        <v-card-title>
                           {{ addressInfo.address }}
                        </v-card-title>
                        <v-card-subtitle>
                            {{  addressInfo.price }}
                        </v-card-subtitle>
                        <v-card-text>
                            {{ addressInfo.owned ? 'unowned': addressInfo.previousOwner }}
                        </v-card-text>
                    
                    </v-card>
                   

                    <div class="d-flex flex-column">
                        <v-btn color="green" class="mt-4"  block @click="submit">
                            Submit
                        </v-btn>

                        <v-btn color="red" class="mt-4" block @click="reset">
                            Reset Form
                        </v-btn>

                    </div>
                </v-form>
            </v-sheet>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { AdressInfo, Purchase } from '../common'
import AddressLookup from './AddressLookup.vue';
import { PropType } from 'vue';


export default defineComponent({
    emits: ['purchase'],
    components: {
        AddressLookup,
    },
    props: {
        addressInfo: Object as PropType<AdressInfo | undefined>       
    },
    data(): {
        name: string,
        address: string,
        nameRules: any,
        price: string,
    } {
        return {
            nameRules: [
                (v: any) => !!v || 'Name is required',
                (v: any) => (v && v.length <= 20) || 'Name must be less than 20 characters',
            ],
            name: '',
            address: '',
            price: '100',

        }
    },
    methods: { 
        updateAdress(adress: string){
            this.address = adress;

        },
        submit() {
            const purchase: Purchase = {
                name: this.name,
                address: this.address,
                price: parseInt(this.price),

            }
            console.log('submitting');
            this.$emit('purchase', purchase)

        },
        reset() {
            this.name = '';
            this.address = '';

        }


    }

})

</script>

<style scoped>
.top {
    display: flex;
    flex-direction: column;
}
</style>