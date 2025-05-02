
import React from 'react'
import styles from '../Login/LoginCard.module.css'
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { useUser } from '../../Usercontext'
import axios from 'axios';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import style from '../../Pages/Home/Home.module.css'
export default function LoginCard({ toadd, hide, position }) {
    const [username, setUsername] = useState("")
    const [name, setName] = useState("")
    const [password, setPassword] = useState('')
    const { role } = useUser()
    const navigate = useNavigate();


    console.log("....", toadd)


    const handleSave = async (e) => {
        e.preventDefault()

        try {
            const token = localStorage.getItem('authToken').trim()
            console.log(token)

            const url = process.env.REACT_APP_BACKEND_URL
            console.log(`${url}${toadd}`)
            const response = await axios.post(`${url}${toadd}`,
                {
                    name,
                    username,
                    password
                },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            )
            alert('Successfully Saved')
            hide()


        }
        catch (error) {
            console.error('Error during login', error)

        }
    }



    return (
        <>
 {/* style={{
                    width:"100%",
                    display:"flex",
                    height: "500px",
                    // padding: '40px',
                    backgroundColor: 'rgba(218, 216, 224, 0.6)',
                    justifyContent:"center",
                    alignItems:"center",
                    

                    

                }} */}
           

                <Form style={{
                    // border: "1px solid #ccc",
                    padding: "15px",
                    display: "flex",
                   justifyContent:"center",
                   alignItems:"center",
                    width: "100%", 
                    
                    maxWidth: '400px',
                    flexDirection: "column",
                   
                    // borderRadius: "10px"
                }}
                    onSubmit={handleSave}
                >
                    <h4 style={{
                        fontSize: '2rem',
                        color: '#fff',
                        fontWeight: 'bold',
                        marginBottom: '20px',
                    }}>{position}</h4>
                    <Form.Group className="mb-3" controlId="formBasicEmail">
                        <Form.Label>Name</Form.Label>
                        <Form.Control
                            style={{
                                maxWidth: '300px',
                                width: "80%",
                                padding: '10px 15px',
                                fontSize: '1.2rem',
                                border: 'none',
                                borderRadius: '18px',
                                outline: 'none',
                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                color: '#fff',
                                caretColor: '#fff',
                                transition: 'background-color 0.3s ease',
                            }}
                            required
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter Name"
                        />

                    </Form.Group>

                    <Form.Group className="mb-3" controlId="formBasicEmail">
                        <Form.Label>Username</Form.Label>
                        <Form.Control
                            style={{
                                maxWidth: '300px',
                                width: "80%",
                                width: '90%',
                                padding: '10px 15px',
                                fontSize: '1.2rem',
                                border: 'none',
                                borderRadius: '18px',
                                outline: 'none',
                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                color: '#fff',
                                caretColor: '#fff',
                                transition: 'background-color 0.3s ease',
                            }}
                            required
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="Enter UserName"
                        />
                    </Form.Group>
                    <Form.Group className="mb-3 " controlId="formBasicPassword">
                        <Form.Label>Password</Form.Label>
                        <Form.Control
                            style={{
                                maxWidth: '300px',
                                width: "80%",
                                width: '90%',
                                padding: '10px 15px',
                                fontSize: '1.2rem',
                                border: 'none',
                                borderRadius: '18px',
                                outline: 'none',
                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                color: '#fff',
                                caretColor: '#fff',
                                transition: 'background-color 0.3s ease',
                            }}
                            required
                            autoComplete="off"
                            minLength="5"
                            maxLength="10"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            type="text"
                            placeholder="Enter Password"
                        />
                    </Form.Group>

                    <Button
                        // className={style.Button}
                        style={{
                            width: '100%',
                            backgroundColor: 'rgba(218, 216, 224, 0.8)',
                            color: 'white',
                            border: 'none',
                            borderRadius: '28px',
                            cursor: 'pointer',
                            transition: 'background-color 0.3s, transform 0.3s',
                        }}
                        variant="primary"
                        type="submit"
                    >
                        Add
                    </Button>
                </Form>
           

        </>
    )
}
