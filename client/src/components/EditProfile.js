import React, { useEffect, useRef, useState } from 'react'
import TopNavigation from './TopNavigation';
import { useSelector } from 'react-redux';

function EditProfile() {
    let firstNameInputRef = useRef();
     let lastNameInputRef = useRef();
      let emailInputRef = useRef();
       let passwordInputRef = useRef();
     let ageInputRef = useRef();
      let mobileNoInputRef = useRef();
      let profilePicInputRef = useRef();

      let [profilePic,setprofilePic] = useState("https://www.pngall.com/wp-content/uploads/5/User-Profile-PNG-Image.png");

      let userDetails = useSelector((store)=>{
        return store.userDetails;
      });

      useEffect(()=>{
      firstNameInputRef.current.value = userDetails.firstName;
      lastNameInputRef.current.value = userDetails.lastName;
      emailInputRef.current.value = userDetails.email;
      ageInputRef.current.value = userDetails.age;
      mobileNoInputRef.current.value = userDetails.mobileNo;
      setprofilePic(`http://localhost:3333/${userDetails.profilePic}`)
      
      },[])

    

   
    
    let updateProfile = async()=>{
        let dataToSend = new FormData();
        dataToSend.append("firstName",firstNameInputRef.current.value);
        dataToSend.append("lastName",lastNameInputRef.current.value);
        dataToSend.append("email",emailInputRef.current.value);
        dataToSend.append("password",passwordInputRef.current.value);
        dataToSend.append("age",ageInputRef.current.value);
        dataToSend.append("mobileNo",mobileNoInputRef.current.value);

        for(let i=0; i<profilePicInputRef.current.files.length;i++){
             dataToSend.append("profilePic",profilePicInputRef.current.files[i])
        }
       
        let reqOptions={
            method:"PATCH",
            body:dataToSend,
        }


        let JSONData = await fetch("http://localhost:3333/updateProfile",reqOptions);
        let JSOData = await JSONData.json();
        console.log(JSOData);
        alert(JSOData.msg);

    }

  return (
    <div className='App'>
        <TopNavigation></TopNavigation>
      <form>
        <h1>Edit Profile</h1>
        <div>
            <label>First Name</label>
            <input ref={firstNameInputRef}></input>
        </div>

        <div>
            <label>Last Name</label>
            <input  ref={lastNameInputRef} ></input>
        </div>

        <div>
            <label>Email</label>
            <input ref={emailInputRef} readOnly></input>
        </div>

        <div>
            <label>Password</label>
            <input ref={passwordInputRef} ></input>
        </div>

        <div>
            <label>Age</label>
            <input ref={ageInputRef}></input>
        </div>

        <div>
            <label>Mobile</label>
            <input ref={mobileNoInputRef} ></input>
        </div>

        <div>
            <label>Profile Pic</label>
            <input ref={profilePicInputRef} 
            type="file" onChange={(e)=>{
            let selectedPath = URL.createObjectURL(e.target.files[0]); 
            setprofilePic(selectedPath);   

            }}></input>
        </div>
        <img src={profilePic} alt ='' ></img>
        <div>
            
            <button type="button" onClick={()=>{
                 updateProfile();
            }}>Update Profile</button>
        </div>
      </form>
      
    </div>
  )
}

export default EditProfile

