<template>
    <div>
        <h1>Hello</h1>
        <v-btn @click="startBlockChain">Start Block Chain</v-btn>
        
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import axios from 'axios'


export default defineComponent({
    name: 'BlockChainManager',
    data(){
        return {
            baseUrl: "localhost:8080",
        }
    },
    methods: {
        async startBlockChain(){
            axios.get('/start')

        },
    }
    
       

    
})

</script>