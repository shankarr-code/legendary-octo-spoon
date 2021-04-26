import React, { useState, useEffect } from 'react'
import { css } from '@emotion/css';
import { useParams } from 'react-router-dom';
import { API, Storage, Auth } from 'aws-amplify';
//import { getPost } from './graphql/queries';

export default function Post({user}) {
  const [loading, updateLoading] = useState(true);
  const [post, updatePost] = useState(null);
  const { id } = useParams()
  useEffect(() => {
    fetchPost()
  }, [])
  async function fetchPost() {
    const apiName = 'myendpoint';
    try {
      const pathurl = '/geturl';
      const myIniturl = {
          headers: {
            "Authorization": `Bearer ${(await Auth.currentSession()).getIdToken().getJwtToken()}`,
            "X-Amz-Security-Token": user.signInUserSession.idToken.jwtToken,
            "Access-Control-Allow-Origin": "*",
            "X-Api-Key": user.attributes['custom:api_key']
          },
          queryStringParameters: {
            action: 'get_id', obj_id: id
          },
        };
      const resp = await API.get(apiName, pathurl, myIniturl);
      console.log("url response --> ", resp);
      const postData = {};
      const currentPost = resp.result
      console.log('post.js post obj --> ', currentPost);
      const sp_key = currentPost[0].imageName.S.toString();
      console.log("image key --> ", sp_key);
      postData.name = currentPost[0].name.S.toString();
      postData.location = currentPost[0].location.S.toString();
      postData.description = currentPost[0].description.S.toString();
      postData.imageName= sp_key;
      try{
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
        const image = await API.get(apiName, pathurl, myInit2);      
        postData.image = image.result;
        updatePost(postData);
        updateLoading(false);

      } catch(err) {
        console.log(err);
      }
      
    } catch (err) {
      console.log('error: ', err)
    }
  }
  if (loading) return <h3>Loading...</h3>
  console.log('post: ', post)
  return (
    <>
      <h1 className={titleStyle}>{post.name}</h1>
      <h3 className={locationStyle}>{post.location}</h3>
      <p>{post.description}</p>
      {post.imageName.endsWith("mp4") ? <video width="750" height="500" controls > <source src={post.image}/></video> : <img alt="post" className={imageStyle} src={post.image} /> }
    </>
  )
}

const titleStyle = css`
  margin-bottom: 7px;
`

const locationStyle = css`
  color: #0070f3;
  margin: 0;
`

const imageStyle = css`
  max-width: 500px;
  @media (max-width: 500px) {
    width: 100%;
  }
`