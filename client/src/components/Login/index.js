import { useState } from "react";
import Cookies from 'js-cookie';
import { Redirect, useHistory } from "react-router-dom";
import './style.css';

const Login = () => {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [errorMessage, setErrorMessage] = useState('')
    const history = useHistory()

    const onChangeUsername = (event) => {
        setUsername(event.target.value)
    }

    const onChangePassword = (event) => {
        setPassword(event.target.value)
    }


    const onClickLogin = async (event) => {
        event.preventDefault()
        if(username === '' || password === '') {
            setErrorMessage('*Username and password are required.')
        } else {
            setErrorMessage('')
            const dev_url = 'http://localhost:5000/'
            const prod_url = 'https://api-product-tracker.onrender.com/'
            const response = await fetch(`${prod_url}login/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({username, password})
            })
            if(response.ok === true) {
                const data = await response.json()
                console.log(data)
                Cookies.set('jwt_token', data.jwtToken, {expires: 30})
                Cookies.set('user_id', data.id, {expires: 30})
                Cookies.set('admin', data.admin, {expires: 30})
                const admin = parseInt(Cookies.get('admin'))
                if (admin === 0) {
                    history.replace('/')
                } else {
                    history.replace('/admin')                
                }
            } else {
                setErrorMessage('*Invalid username or password.')
            }
        }
    }

    const jwtToken = Cookies.get('jwt_token')
    if(jwtToken !== undefined) {
        const admin = parseInt(Cookies.get('admin'))
        if (admin === 0) {
            return (
                <Redirect to='/' />
            )
        } else {
            return (
                <Redirect to='/admin' />
            )
        }
    }

    return (
        <div className="login-container">
            <form onSubmit={onClickLogin} className="login-form">
                <h1 className="login-title">User/Admin Login</h1>
                <label htmlFor="username" className="label">Username</label>
                <input type="text" id="username" placeholder="username" className="login-input" onChange={onChangeUsername} />
                <label htmlFor="password" className="label">Password</label>
                <input type="password" id="password" placeholder="password" className="login-input" onChange={onChangePassword} />
                <button type="submit" className="login-button">Login</button>
                <p className="error-msg">{errorMessage}</p>
            </form>
        </div>
    )
}

export default Login;