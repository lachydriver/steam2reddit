import React from "react";
import { TransitionGroup } from "react-transition-group";

class Steam extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      games: [],
      isLoaded: false,
      error: null,
      customurl: "",
      steamid: "",
      loggedIn: false
    };
    this.handleGameChange = this.handleGameChange.bind(this);
  }

  updateSteamID = event => {
    this.setState({
      customurl: event.target.value
    });
  };

  //pass props to the parent component (index.js)
  handleSubmit = event => {
    event.preventDefault();
    this.props.fetchGames(this.state.customurl);
  };

  handleGameChange() {
    this.props.onGameChange({ games: this.state });
  }

  componentDidMount() {
    const login = this.props.LoginStatus;
  }

  showLogin() {}

  render() {
    return (
      <div>
        <p>Please enter your Steam Custom URL:</p>
        <div id="form">
          <form onSubmit={this.handleSubmit}>
            <label>SteamID: </label>
            <span id="input">
              <input
                type="text"
                name="steamid"
                id="steamInput"
                value={this.state.customurl}
                onChange={this.updateSteamID}
              />
            </span>
            <br />
            <button type="submit" id="steamButton">
              Submit
            </button>
          </form>
        </div>
        <div id="cards">
          <TransitionGroup
            transitionName="transition"
            transitionAppear={true}
            transitionAppearTimeout={500}
            transitionEnter={true}
            transitionLeave={true}
          >
            {this.props.gameList.map((game, id) => (
              <div id="card" key={id}>
                <img
                  src={
                    "http://media.steampowered.com/steamcommunity/public/images/apps/" +
                    game.appid +
                    "/" +
                    game.img_logo_url +
                    ".jpg"
                  }
                />
                <br />
                {game.name}
                <br />
                {Math.round(game.playtime_forever / 60)} hours
              </div>
            ))}
          </TransitionGroup>
        </div>
      </div>
    );
  }
}
export default Steam;
