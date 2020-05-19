import React from "react";
import { TransitionGroup } from "react-transition-group";

class Reddit extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      auth_token: "",
      name: "",
      loggedIn: false,
      games: [],
      subredditData: [],
      subscribeMessage: ""
    };

    this.getFinalToken = this.getFinalToken.bind(this);
  }

  //request the reddit api and let the user sign in with their own account
  getAuthCode() {
    window.location.replace(
      "https://www.reddit.com/api/v1/authorize?client_id=YiA3t_Y6gjO7Eg&response_type=code&state=hahaha&redirect_uri=http://localhost:3000/auth&duration=temporary&scope=identity,subscribe,read"
    );
  }

  //if there is an auth token present in the url, set gotToken to true
  getAuthToken() {
    let params = new URL(document.location).searchParams;
    let name = params.get("code");
    var gotToken;
    if (name) {
      this.gotToken = true;
    }
  }

  //get the first result of each subreddit from the props of game title array passed in from the parent component, set this data to the state of subredditData
  async getSubreddits() {
    try {
      var subHeaders = new Headers();
      subHeaders.append("User-Agent", "Steam2Reddit/0.1 by Lachlan");
      subHeaders.append("Authorization", `bearer ${this.state.auth_token}`);
      const subredditNames = this.props.gameList.map(game => game.name);
      Promise.all(
        subredditNames.map(element =>
          fetch(
            `https://cors-anywhere.herokuapp.com/https://oauth.reddit.com/subreddits/search?limit=1&q=${element}`,
            { headers: subHeaders }
          )
            .then(res => res.json())
            .then(json => json.data.children[0].data)
        )
      )
        .then(res => this.setState({ subredditData: res }))
    } catch (error) {
      console.log("Get Subreddits Error: ", error);
    }
  }

  //send the request to reddit with the authentication code and receive the authentication token used for requests in return, set this token to the state of auth_token
  async getFinalToken() {
    try {
      let params = new URL(document.location).searchParams;
      let name = params.get("code");
      var headers = new Headers();
      headers.append("Content-type", "application/x-www-form-urlencoded");
      headers.append(
        "Authorization",
        "Basic YiA3t_Y6gjO7Eg:e_CstP45zeoSPUaemLRCES7ud4M"
      );
      headers.set(
        "Authorization",
        "Basic " + btoa("YiA3t_Y6gjO7Eg" + ":" + "e_CstP45zeoSPUaemLRCES7ud4M")
      );
      var data = {
        grant_type: "authorization_code",
        code: name,
        redirect_uri: "http://localhost:3000/auth"
      };

      let response = await fetch("https://cors-anywhere.herokuapp.com/https://www.reddit.com/api/v1/access_token", {
        method: "POST",
        withCredentials: true,
        headers: headers,
        body: new URLSearchParams(data)
      });
      const authdata = await response.json();
      const redditToken = authdata.access_token;
      this.setState({ auth_token: authdata.access_token });
      this.setState({ loggedIn: true });
      this.fetchLoginStatus();
      var userHeaders = new Headers();
      userHeaders.append("User-Agent", "Steam2Reddit/0.1 by Lachlan");
      userHeaders.append("Authorization", `bearer ${this.state.auth_token}`);
      fetch("https://cors-anywhere.herokuapp.com/https://oauth.reddit.com/api/v1/me", {
        headers: userHeaders
      })
        .then(res => res.json())
        .then(res => this.setState({ name: "Hello " + res.name }))
        .then(res => this.setState({ loggedIn: true }));
    } catch (error) {
      console.log(error);
    }
  }

  fetchLoginStatus() {
    this.props.fetchLoginStatus(this.state.loggedIn);
  }

  componentDidMount() {
    this.showLoginStatus()
    this.getAuthToken();
    if (this.gotToken == true) {
      this.getFinalToken();
    } else {
      console.log("user not logged in");
    }
  }

  componentWillReceiveProps() {
    this.getSubreddits();
  }

  //subscribe the user to the respective subreddit
  subscribe(name) {
    var subscribeHeaders = new Headers();
    subscribeHeaders.append("User-Agent", "Steam2Reddit/0.1 by Lachlan");
    subscribeHeaders.append("Authorization", `bearer ${this.state.auth_token}`);
    var data = {
      action: "sub",
      sr_name: name
    };
    fetch("https://cors-anywhere.herokuapp.com/https://oauth.reddit.com/api/subscribe", {
      method: "POST",
      headers: subscribeHeaders,
      body: new URLSearchParams(data)
    })
      .then(res => res.json)
      .then(() => this.getSubreddits())
      .then(() =>
        this.setState({ subscribeMessage: "Thanks for subscribing to: " + name })
      );
  }

  //unsubscribe the user to the respective subreddit
  unsubscribe(name) {
    var subscribeHeaders = new Headers();
    subscribeHeaders.append("User-Agent", "Steam2Reddit/0.1 by Lachlan");
    subscribeHeaders.append("Authorization", `bearer ${this.state.auth_token}`);
    var data = {
      action: "unsub",
      sr_name: name
    };
    fetch("https://cors-anywhere.herokuapp.com/https://oauth.reddit.com/api/subscribe", {
      method: "POST",
      headers: subscribeHeaders,
      body: new URLSearchParams(data)
    })
      .then(res => res.json)
      .then(() => this.getSubreddits())
      .then(() =>
        this.setState({
          subscribeMessage: "Thanks for unsubscribing from: " + name
        })
      );
  }

  //display button based on subscription status
  subscribeToSubreddit(current, display_name) {
    if (current == true) {
      return (
        <button onClick={name => this.unsubscribe(display_name, name)}>
          Unsubscribe
        </button>
      );
    } else {
      return (
        <button onClick={name => this.subscribe(display_name, name)}>
          Subscribe
        </button>
      );
    }
  }

  showLoginStatus() {
    if (this.state.loggedIn == false) {
      return (
        <div className="signInButton">
          <button onClick={this.getAuthCode} id="redditButton">
            Sign into Reddit
          </button>
        </div>
      );
    }
  }

  render() {
    return (
      <div>
        {this.showLoginStatus()}
        <div className="welcomeUser">
          <p>{this.state.name}</p>
        </div>
        <p>{this.state.subscribeMessage}</p>
        <div className="subreddits">
        <TransitionGroup
            transitionName="transition"
            transitionAppear={true}
            transitionAppearTimeout={500}
            transitionEnter={true}
            transitionLeave={true}
          >
          {this.state.subredditData.map((subreddit, id) => (
            <div id="subreddit-card" key={id}>
              <a href={"https://www.reddit.com/" + subreddit.display_name_prefixed} target="_blank"><img
                src={subreddit.icon_img}
                onError={e => {
                  e.target.onerror = null;
                  e.target.src = "./content/redditlogo.png";
                }}
              /></a>
              <p><b>
                {subreddit.display_name_prefixed}</b>
                <br />
                {subreddit.title}<br/>{subreddit.subscribers} Subscribers
              </p>
              <div className="subscribeArea">
                {this.subscribeToSubreddit(
                  subreddit.user_is_subscriber,
                  subreddit.display_name
                )}
              </div>
            </div>
          ))}
          </TransitionGroup>
        </div>
      </div>
    );
  }
}

export default Reddit;
