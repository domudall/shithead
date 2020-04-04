<template>
  <div class="hello">
    <template v-if="!joined">
      <v-text-field v-model="playerName" label="Name"></v-text-field>
      <br />
      <div>
        <v-btn @click.native="create" color="primary">Create Game</v-btn>
      </div>
      <br />
      <v-text-field v-model="gameID" label="Game ID"></v-text-field>
      <div>
        <v-btn @click.native="join" color="primary">Join Game</v-btn>
      </div>
    </template>
    <template v-else>
      <h1>GAME!</h1>
      <p>You are in game {{ gameID }}</p>
    </template>

    <v-list>
      <v-subheader>Game Log</v-subheader>
      <v-list-item-group v-model="messages" color="primary">
        <v-list-item v-for="(message, i) in messages" :key="i">
          <v-list-item-content>
            <v-list-item-title v-html="message"></v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list-item-group>
    </v-list>
  </div>
</template>

<script>
export default {
  name: "Landing",
  created() {
    // ...
    this.subscribe();
  },
  data: function() {
    return {
      messages: [],
      playerName: "",
      playerID: "",
      gameID: "",
      joined: false
    };
  },
  methods: {
    // ...

    subscribe() {
      this.$pusher.bind_global((event, data) => {
        console.log(event, data);
        this.messages.unshift(data.message);
      });
    },
    create() {
      let params = {
        playerName: this.playerName
      };

      this.$axios
        .get(`${process.env.VUE_APP_SHITHEAD_API}/create`, { params })
        .then(response => {
          this.gameID = response.data.gameID;
          this.playerID = response.data.playerID;
          this.joined = true;

          this.$pusher.subscribe(`game-${this.gameID}`);
        })
        .catch(error => {
          console.log(error.response.data.errors);
        });
    },
    join() {
      let params = {
        playerName: this.playerName,
        gameID: this.gameID
      };

      this.$axios
        .get(`${process.env.VUE_APP_SHITHEAD_API}/join`, { params })
        .then(response => {
          this.joined = true;
          this.$pusher.subscribe(`game-${this.gameID}`);
          console.log(response.data);
        })
        .catch(error => {
          console.log(error.response.data.errors);
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
