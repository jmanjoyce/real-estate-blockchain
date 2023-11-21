<template>
    <div class="top">
        <div>
            <h1>Buy Property</h1>
        </div>
        <div>
            <v-sheet width="300" class="mx-auto">

                <v-form ref="form">
                    <v-text-field v-model="name" :counter="10" :rules="nameRules" label="Name" required></v-text-field>

                    <v-text-field v-model="adress" :counter="10" label="Adress" required></v-text-field>

                    <v-text-field v-model="price" type="number" :counter="10" label="Price" required></v-text-field>

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
import { Purchase } from '../common'


export default defineComponent({
    emits: ['purchase'],
    data(): {
        name: string,
        adress: string,
        nameRules: any,
        price: string,
    } {
        return {
            nameRules: [
                (v: any) => !!v || 'Name is required',
                (v: any) => (v && v.length <= 20) || 'Name must be less than 20 characters',
            ],
            name: '',
            adress: '',
            price: '',

        }
    },
    methods: { 
        submit() {

            const purchase: Purchase = {
                name: this.name,
                adress: this.adress,
                price: parseInt(this.price),

            }
            console.log('submitting');
            this.$emit('purchase', purchase)

        },
        reset() {

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