<template>
  <div class="top">
    <div v-if="!createAccountPage" class="signin">
      <v-container>
        <v-card
          class="mx-auto"
          min-height="300"
          min-width="400"
          max-width="500"
        >
          <v-card-title> Real Estate Blockchain </v-card-title>
          <v-card-subtitle> Sign In </v-card-subtitle>
          <v-card-text>
            <v-divider></v-divider>
            <v-form>
              <v-text-field
                v-model="username"
                label="Username"
                required
              ></v-text-field>
              <v-text-field
                v-model="password"
                label="Password"
                type="password"
                required
              ></v-text-field>
              <v-btn
                color="green"
                @click="signIn"
               
                :loading="loading"
                >Sign In
                <template v-slot:loader>
                  <v-progress-linear indeterminate></v-progress-linear>
                </template>
              </v-btn>
              <v-btn
                color="red"
                size="small"
                variant="text"
                @click="toCreateAccount"
                >Create New Account</v-btn
              >
            </v-form>
          </v-card-text>
        </v-card>
      </v-container>
    </div>
    <div v-if="createAccountPage" class="signin">
      <v-container>
        <v-card
          class="mx-auto"
          min-height="300"
          min-width="400"
          max-width="500"
        >
          <v-card-title> RealEstate Blockchain </v-card-title>
          <v-card-subtitle> Create New Account </v-card-subtitle>
          <v-card-text>
            <v-divider></v-divider>
            <v-form>
              <v-text-field
                v-model="name"
                label="Enter Name"
                required
              ></v-text-field>
              <v-text-field
                v-model="username"
                label="Username"
                required
              ></v-text-field>
              <v-text-field
                v-model="password"
                label="Password"
                type="password"
                required
              ></v-text-field>
              <v-text-field
                v-model="confirmPassword"
                label="Confirm Password"
                type="password"
                required
              ></v-text-field>
              <v-btn color="green" :loading="loading" @click="createAccount">Create Account
                <template v-slot:loader>
                  <v-progress-linear indeterminate></v-progress-linear>
                </template>
              </v-btn>
              <v-btn
                color="red"
                variant="text"
                @click="createAccountPage = false"
                >Back</v-btn
              >
            </v-form>
          </v-card-text>
        </v-card>
      </v-container>
    </div>
  </div>
</template>

<script lang="ts">
import { SignInAtmp } from "@/common";
import { defineComponent } from "vue";

export default defineComponent({
  emits: ["sign-in", "create-new-account"],
  watch: {
    // loading (val) {
    //   if (!val) return
    //   setTimeout(() => (this.loading = false), 3000)
    // },
  },
  data(): {
    username: string;
    password: string;
    createAccountPage: boolean;
    confirmPassword: string;
    name: string;
    loading: boolean;
  } {
    return {
      loading: false,
      createAccountPage: false,
      name: "",
      confirmPassword: "",
      password: "",
      username: "",
    };
  },
  methods: {
    signIn() {
      // Perform signin logic here (e.g., call API, validate credentials)
      const signInAtmp: SignInAtmp = {
        username: this.password,
        password: this.username,
      };
      this.loading = true;
      this.$emit("sign-in", signInAtmp);
     // Set loading state when sign-in starts

      // Simulate asynchronous operation (e.g., API call) with setTimeout
      // Replace this with your actual async operation (e.g., calling an API)
      setTimeout(() => {
        // Complete the operation after some delay (2 seconds in this example)
        this.loading = false; // Set loading state when sign-in completes
      }, 2000); // Simulating a 2-second delay

      // Example: Use this.$router.push('/dashboard') to navigate on successful signin
    },
    createAccount(){
      this.loading = true;
      setTimeout(() => {
        // Complete the operation after some delay (2 seconds in this example)
        this.loading = false; // Set loading state when sign-in completes
      }, 2000); // Simulating a 2-second delay

    },
    toCreateAccount() {
      // Handle creating a new account, e.g., navigate to signup page
      this.createAccountPage = true;
      console.log("Creating a new account");
      // Example: Use this.$router.push('/signup') to navigate to the signup page
    },
  },
});
</script>

<style>
.top {
  display: flex;
  justify-content: center;
  flex-direction: row;
}

.signin {
  padding: 10%;
}

html,
body {
  background-image: url("./../assets/DSC_0065.JPG"); /* Replace with the path to your image */
  background-size: cover; /* Adjusts the size of the background image */
  background-repeat: no-repeat; /* Prevents the image from repeating */
  background-attachment: fixed;
  /* Additional styles or properties as needed */
}

.primary {
  background-color: #1976d2; /* Vuetify primary color */
  color: white;
}
</style>
