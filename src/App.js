import React, { useState, useEffect } from "react";
import {
  HashRouter,
  Switch,
  Route
} from "react-router-dom";
import { withAuthenticator} from '@aws-amplify/ui-react';
import { css } from '@emotion/css';
import Amplify, { API, Auth } from 'aws-amplify';
//import { listPosts } from './graphql/queries';

import Posts from './Posts';
import Post from './Post';
import Header from './Header';
import CreatePost from './CreatePost';
import Button from './Button';

Amplify.configure({
  // API gateway
  API: {
    endpoints: [
      {
        name: "myendpoint",
        endpoint: "https://rcm4f2e5u7.execute-api.us-east-1.amazonaws.com/dev"
      }
    ]
  }
});

function Router() {
  /* create a couple of pieces of initial state */
  const [showOverlay, updateOverlayVisibility] = useState(false);
  const [posts, updatePosts] = useState([]);
  const [user, setUser] = useState('');

  /* fetch posts when component loads */
  useEffect(() => {
    fetchPosts(); 

  }, []);

  async function fetchPosts() {
    const user = await Auth.currentAuthenticatedUser();
    setUser(user);
    console.log("user --> ", user);
    const apiName = 'myendpoint';
    const path = '/object';
    const myInit = { 
      headers: {
        "Authorization": `Bearer ${(await Auth.currentSession()).getIdToken().getJwtToken()}`,
        "X-Amz-Security-Token": user.signInUserSession.idToken.jwtToken,
        "Access-Control-Allow-Origin": "*",
        "Content-Type": "application/json",
        "X-Api-Key": user.attributes['custom:api_key']
      }, 
      queryStringParameters: {  
        partition: 'db_nosql',
      },
      //'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'
    };
    console.log("header --> ", myInit);
    // Get data from DynamoDB
    let postData = await API.get(apiName, path, myInit);
    console.log("Get Response ", postData);
    console.log("postdata ", postData.result);
    let postsArray = postData.result;
    console.log('post array --> ', postsArray);

    // Get signed url
    const path2 = '/geturl';
    /* map over the image keys in the posts array, get signed image URLs for each image */
    postsArray = await Promise.all(postsArray.map(async post => {
      //const sp_key = post.imageName.S.toString().split('/')[2];
      const sp_key = post.imageName.S.toString();
      console.log("keyname --> ", sp_key);
      const myInit2 = {
        headers: {
          "Authorization": `Bearer ${(await Auth.currentSession()).getIdToken().getJwtToken()}`,
          "X-Amz-Security-Token": user.signInUserSession.idToken.jwtToken,
          "Access-Control-Allow-Origin": "*",
          "Content-Type": "application/json",
          "X-Api-Key": user.attributes['custom:api_key']
        },
        queryStringParameters: {
          action: 'get_url_cf', key_name: `${sp_key}`
        },
        //'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'
      };
      const imageKey = await API.get(apiName, path2, myInit2);
      //const imageKey = await Storage.get(post.imageName); // TODO API to get signed url
      console.log('ImageKey --> ', imageKey);
      //console.log('ImageKey url --> ', imageKey.result.toString().split(': \"')[1].replace('"}','') );
      console.log('ImageKey url --> ', imageKey.result);
      post.imageName = sp_key;
      post.image = imageKey.result;
      post.description = post.description.S.toString();
      post.location = post.location.S.toString();
      post.name = post.name.S.toString();
      post.id = post.id.S.toString();
      return post;
    }));
    /* update the posts array in the local state */
    console.log("print postsArray --> ", postsArray);
    setPostState(postsArray);
  }
  async function setPostState(postsArray) {
    updatePosts(postsArray);
  }
  return (
    <>
      <HashRouter>
        <div className={contentStyle}>
          <Header
            user={user} />
          <hr className={dividerStyle} />
          <Button title="New Post" onClick={() => updateOverlayVisibility(true)} />
          <Switch>
            <Route exact path="/" >
              <Posts posts={posts} />
            </Route>
            <Route path="/post/:id" >
              <Post
                user={user} />
            </Route>
          </Switch>
        </div>

      </HashRouter>
      { showOverlay && (
        <CreatePost
          updateOverlayVisibility={updateOverlayVisibility}
          updatePosts={setPostState}
          posts={posts}
          user={user}
        />
      )}
    </>
  ) 
}

const dividerStyle = css`
  margin-top: 15px;
`

const contentStyle = css`
  min-height: calc(100vh - 45px);
  padding: 0px 40px;
`
//export default Router
export default withAuthenticator(Router, { includeGreetings: true });