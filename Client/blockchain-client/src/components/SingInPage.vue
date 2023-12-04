<template>
  <div class="cover">
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
              <v-btn color="green" @click="signIn" :loading="loading"
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
              <v-btn color="green" :loading="loading" @click="createAccount"
                >Create Account
                <template v-slot:loader>
                  <v-progress-linear indeterminate></v-progress-linear>
                </template>
              </v-btn>
              <v-btn
                color="red"
                variant="text"
                @click="changePage(false)"
                >Back</v-btn
              >
            </v-form>
          </v-card-text>
        </v-card>
      </v-container>
    </div>
  </div>
  </div>
</template>

<script lang="ts">
import { Alert } from "@/App.vue";
import { NewUserDto, SignInAtmp, Permission } from "@/common";
import { PropType, defineComponent } from "vue";

export default defineComponent({
  emits: ["sign-in", "create-new-account", "alert", "change-page"],
  
  data(): {
    username: string;
    password: string;
    confirmPassword: string;
    name: string;
    loading: boolean;
  } {
    return {
      loading: false,
      name: "",
      confirmPassword: "",
      password: "",
      username: "",
    };
  },
  props: {
    createAccountPage: {
      type: Object as PropType<boolean>, 
      required: true,
    }
    
  },
  methods: {
    signIn() {
      // Perform signin logic here (e.g., call API, validate credentials)
      const signInAtmp: SignInAtmp = {
        username: this.username,
        password: this.password,
      };
      this.loading = true;
      this.$emit("sign-in", signInAtmp);
      setTimeout(() => {
        // Complete the operation after some delay (2 seconds in this example)
        this.loading = false; // Set loading state when sign-in completes
      }, 2000); // Simulating a 2-second delay

      // Example: Use this.$router.push('/dashboard') to navigate on successful signin
    },
    createAccount() {
      if (this.password !== this.confirmPassword) {
        const alert: Alert = {
          type: "warning",
          title: "Password do not match",
          text: "Passwords must match",
        };
        this.$emit("alert", alert);
        this.name = "";
        this.username = "";
        this.password = "";
        this.confirmPassword = "";
        return;
      }
      this.loading = true;
      const account: NewUserDto = {
        name: this.name,
        username: this.username,
        password: this.password,
        permission: Permission.USER,
      };
      this.name ="";
      this.username = "",
      this.password = "",
      this.confirmPassword = "",
      this.$emit("create-new-account", account);
      setTimeout(() => {
        // Complete the operation after some delay (2 seconds in this example)
        this.loading = false; // Set loading state when sign-in completes
      }, 2000); // Simulating a 2-second delay
    },
    toCreateAccount() {
      // Handle creating a new account, e.g., navigate to signup page
      //this.createAccountPage = true;
      this.changePage(true);
      console.log("Creating a new account");
      // Example: Use this.$router.push('/signup') to navigate to the signup page
    },
    changePage(createAcct: boolean){
      this.$emit("change-page", createAcct);

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

.cover {
  background-image: url("./../assets/DSC_0065.JPG"); /* Replace with the path to your image */
  background-size: cover; /* Adjusts the size of the background image */
  background-repeat: no-repeat; /* Prevents the image from repeating */
  background-attachment: fixed;
  position: fixed; /* Fixed positioning */
  top: 0;
  left: 0;
  width: 100%; /* Full width of the viewport */
  height: 100%; 
  /* Additional styles or properties as needed */
}

.primary {
  background-color: #1976d2; /* Vuetify primary color */
  color: white;
}
</style>
