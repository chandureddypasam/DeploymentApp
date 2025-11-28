import React from 'react'
import TopNavigation from './TopNavigation'
import { useSelector } from 'react-redux';

function Leaves() {

    let userDetails = useSelector((store)=>{
        return store.userDetails
    
      });

  return (
    <div>
        <TopNavigation></TopNavigation>
      <h1>Leaves</h1>
     <h1>{userDetails.firstName} {userDetails.lastName}</h1>
     <img src={`https://deploymentapp-1-3la5.onrender.com${userDetails.profilePic}`} alt= ''></img>

    </div>
  )
}

export default Leaves
