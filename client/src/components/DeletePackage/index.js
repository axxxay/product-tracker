import Cookies from "js-cookie";
import { useState } from "react";
import './style.css'

const DeletePackage = () => {
    const [trackingNumber, setTrackingNumber] = useState('')
    const [errorMsg, setErrorMsg] = useState('')
    const [successMsg, setSuccessMsg] = useState('')

    const onChangeTrackingNumber = (event) => {
        setTrackingNumber(event.target.value)
    }

    const deletePackage = async event => {
        event.preventDefault()
        if (trackingNumber === '') {
            setErrorMsg('Tracking Number is required')
            setSuccessMsg('')
            return
        }
        const response = await fetch(`http://localhost:5000/tracking/delete/${trackingNumber}/`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${Cookies.get('jwt_token')}`
            }
        })
        const data = await response.json()
        if (response.ok === true) {
            setSuccessMsg(data.success)
            setErrorMsg('')
            setTrackingNumber('')
        } else {
            setErrorMsg(data.errorMsg)
            setSuccessMsg('')
        }
    }

    return (
        <form onSubmit={deletePackage} className="delete-form">
            <h2 className="delete-title">Delete Package</h2>
            <label className="delete-label" htmlFor="trackingnumber">Tracking Number</label>
            <input
                type="text"
                placeholder="Enter Tracking Number"
                value={trackingNumber}
                onChange={onChangeTrackingNumber}
                className="delete-input"
            />
            <button type="submit" className="delete-btn">Delete</button>
            {errorMsg && <p className="error-msg">{errorMsg}</p>}
            {successMsg && <p className="success-msg">{successMsg}</p>}
        </form>
    )
}

export default DeletePackage;