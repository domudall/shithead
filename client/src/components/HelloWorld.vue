<template>
  <div class="hello">
    <ul>
      <li v-bind:key="message" v-for="message in messages">{{ message }}</li>
    </ul>
  </div>
</template>

<script>
export default {
  name: "HelloWorld",
  created() {
    // ...
    this.subscribe();
  },
  data: function() {
    return {
      messages: []
    };
  },
  methods: {
    // ...
    subscribe() {
      this.$pusher.subscribe("game-1");
      this.$pusher.bind_global((event, data) => {
        console.log(event, data);
        this.messages.unshift(data.message);
      });
    }
  },
  mounted() {
    // this.$axios
    //   .get("https://api.coindesk.com/v1/bpi/currentprice.json")
    //   .then(response => (this.messages = response));
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h3 {
  margin: 40px 0 0;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
}
a {
  color: #42b983;
}
</style>
