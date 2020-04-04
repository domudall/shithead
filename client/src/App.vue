<template>
  <v-app>
    <v-content>
      <Landing />
    </v-content>
  </v-app>
</template>

<script>
import Landing from "./components/Landing";

export default {
  name: "App",

  components: {
    Landing
  },

  data: () => ({
    //
  })
};
</script>
