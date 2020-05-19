import React from "react";
import ReactDOM from "react-dom";
import Steam from "./components/Steam.js";
import Reddit from "./components/Reddit.js";
import style from "./styles.css";

const STEAMAPI =
  "https://cors-anywhere.herokuapp.com/http://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=23B59B73D05A7568CECD589D4BDD4D69&format=json&include_appinfo=1&steamid=";
const STEAMIDCONVERT =
  "https://cors-anywhere.herokuapp.com/http://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=23B59B73D05A7568CECD589D4BDD4D69&vanityurl=";

class App extends React.Component {
  constructor() {
    super();

    this.state = {
      games: [],
      isLoaded: false,
      error: null,
      customurl: "",
      steamid: "",
      loggedIn: "",
      readInstructions: false
    };
    this.getGameData = this.getGameData.bind(this);
    this.fetchLoginStatus = this.fetchLoginStatus.bind(this);
  }

  //set the state from the Steam and Reddit component
  getGameData(listedGames) {
    this.setState({ gameList: listedGames });
  }

  fetchLoginStatus(loginStatus) {
    this.setState({ loggedIn: loginStatus });
  }

  //only display the steam component if the state of loggedIn is true
  displaySteam() {
    if (this.state.loggedIn == true) {
      return (
        <Steam
          loginStatus={this.state.loggedIn}
          onGameChange={this.getGameData}
          fetchGames={this.fetchGames}
          gameList={this.state.games}
        />
      );
    } else {
      return <h1>Please login to Reddit</h1>;
    }
  }

  //fetch the steam games with the provided URL and custom profile URL (from steam component props), slice the array to the first 15 and set the state of 'games' to the json
  fetchGames = customurl => {
    fetch(STEAMIDCONVERT + customurl)
      .then(res => res.json())
      .then(json => json.response.steamid)
      .then(json => {
        var id = json;
        return fetch(STEAMAPI + id);
      })
      .then(res => res.json())
      .then(json => json.response.games)
      .then(json =>
        json.sort(
          (a, b) =>
            parseFloat(b.playtime_forever) - parseFloat(a.playtime_forever)
        )
      )
      .then(json => json.slice(0, 15))
      .then(json => this.setState({ isLoaded: true, games: json }))
      .then(json => this.handleGameChange())
      .catch(error => this.setState({ error, isLoading: false }));
  };

  showInstructions() {
    if (this.state.readInstructions == true) {
      return (
        <div>
          <div className="steamDisplay">{this.displaySteam()}</div>
          <div className="redditDisplay">
            <Reddit
              gameList={this.state.games}
              fetchLoginStatus={this.fetchLoginStatus}
            />
          </div>
        </div>
      );
    } else {
      return (
        <div className="startingInfo">
          <h1>Starting Information</h1>
          <p>
            This application combines the Steam Web API and the Reddit API to
            show subreddits for your favourite games.
          </p>
          <p>The functionality includes:</p>
          <ol>
            <li>
              Signing into Reddit with oauth, providing the required permissions
            </li>
            <li>Entering in your Steam account custom URL</li>
            <li>
              Grabbing your top 10 played Steam games and sorting into an array
            </li>
            <li>
              Sending this games array to the Reddit component, searching Reddit
              for the game name and retrieving the first subreddit
            </li>
            <li>
              Checking if you are already subscribed and displaying a
              subscibe/unsubscribe button
            </li>
          </ol>
          <button onClick={() => this.showInstructionsClicked()}>
            Continue
          </button>
        </div>
      );
    }
  }

  showInstructionsClicked() {
    this.setState({ readInstructions: true });
  }

  render() {
    return (
      <div className="container">
        <h1>Welcome to Steam2Reddit</h1>
          {this.showInstructions()}
      </div>
    );
  }
}

ReactDOM.render(<App />, document.querySelector("#root"));
