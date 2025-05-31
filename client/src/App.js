import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import SignUp from './components/Auth/SignUp';
import SignIn from './components/Auth/SignIn';
import ProfilePage from './components/Profile/ProfilePage';
import EditProfile from './components/Profile/EditProfile';
import PostList from './components/Posts/PostList';
import Post from './components/Posts/Post';
import CreatePost from './components/Posts/CreatePost';
import './styles/themes.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Switch>
          <Route path="/signup" component={SignUp} />
          <Route path="/signin" component={SignIn} />
          <Route path="/profile" component={ProfilePage} />
          <Route path="/edit-profile" component={EditProfile} />
          <Route path="/posts" component={PostList} />
          <Route path="/post/:id" component={Post} />
          <Route path="/create-post" component={CreatePost} />
          <Route path="/" exact component={PostList} />
        </Switch>
      </div>
    </Router>
  );
}

export default App;