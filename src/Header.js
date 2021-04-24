import React from 'react';
import { css } from '@emotion/css';
import { Link } from 'react-router-dom';
import { AmplifySignOut } from '@aws-amplify/ui-react';

export default function Header({user}) {
  return (
    <div className={headerContainer}>
      <div className={gridcontainer}>
        <div className={gridchild}>
        <h1 className={headerStyle}>OctankView</h1> 
        </div>
        <div className={gridchild2}>
          <AmplifySignOut button-text="Sign Out"></AmplifySignOut>
        </div>
     </div>
     <h3 className="font-medium text-gray-500 my-2">Hello {user.username}!</h3>
     <Link to="/" className={linkStyle}>All Posts</Link>
    </div>
  )
}

const headerContainer = css`
  padding-top: 20px;
  display: 'flex';
  alignItems: 'center';
  background-color: #808080;
  color: white;
  padding: 40px;
`

const headerStyle = css`
  font-size: 40px;
  margin-top: 0px;
`

const linkStyle = css`
  color: white;
  font-weight: bold;
  text-decoration: none;
  margin-right: 10px;
  :hover {
    color: #058aff;
  }
`
const gridcontainer = css`
display: flex;
`

const gridchild = css`
flex:1;
align-items: flex-start;
`
const gridchild2 = css`
align-items: flex-end;
`