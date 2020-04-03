const axios = require("axios");
const baseURL = "http://localhost:3000";

axios.get(`${baseURL}/create?playerName=jeff`).then(createResponse => {
  console.log(createResponse.data);
  axios
    .get(`${baseURL}/join?gameID=${createResponse.data.gameID}&playerName=dave`)
    .then(joinResponse => {
      console.log(joinResponse.data);
      // axios
      //   .get(`${baseURL}/start?gameID=${createResponse.data.gameID}`)
      //   .then(startResponse => {
      // console.log(startResponse.data);
      axios
        .get(`${baseURL}/status?gameID=${createResponse.data.gameID}`)
        .then(statusResponse => {
          console.log(statusResponse.data);
          axios
            .get(
              `${baseURL}/play?gameID=${createResponse.data.gameID}&cardID=2&playerID=${createResponse.data.playerID}`
            )
            .then(playResponse => {
              console.log(playResponse.data);
            });
        });
      //     });
    });
});
