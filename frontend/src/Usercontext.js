import React,{createContext, useContext, useState} from 'react'

export const UserContext = createContext()

export const UserProvider = ({children})=>{
const [role,setRole]=useState('')
localStorage.setItem("role",role)
console.log(localStorage.getItem("role"))
return(
    <UserContext.Provider value={{role,setRole}}>
        {children}
    </UserContext.Provider>
)
}

export const useUser=()=>{
    return useContext(UserContext)
}