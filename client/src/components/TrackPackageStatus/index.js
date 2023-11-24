import Cookies from "js-cookie";
import { Redirect, useHistory } from "react-router-dom";
import { useState } from "react";
import {LineWave} from 'react-loader-spinner'
import Box from '@mui/material/Box';
import Stepper from '@mui/material/Stepper';
import Step from '@mui/material/Step';
import StepLabel from '@mui/material/StepLabel';
import './style.css';

const TrackPackageStatus = () => {
    const [trackingNumber, setTrackingNumber] = useState('')
    const [packageDetails, setPackageDetails] = useState([])
    const [errorMessage, setErrorMessage] = useState('')
    const [loading, setLoading] = useState(false)
    const [status, setStatus] = useState([])
    
    const history = useHistory()

    const onChangeTrackingNumber = (event) => {
        setTrackingNumber(event.target.value)
    }

    const onClickLogout = () => {
        Cookies.remove('jwt_token')
        history.replace('/login')
    }

    const onClickTrack = async (event) => {
        event.preventDefault()
        if(trackingNumber !== '') {
            setLoading(true)
            const dev_url = 'http://localhost:5000/'
            const prod_url = 'https://api-product-tracker.onrender.com/'
            const response = await fetch(`${prod_url}tracking/${trackingNumber}/`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${Cookies.get('jwt_token')}`
                }
            })
            if(response.ok === true) {
                const data = await response.json()
                console.log(data)
                setPackageDetails(data)
                setErrorMessage('')
                setLoading(false)
                const packageStatus = data.map((packageDetail) => packageDetail.status)
                setStatus(packageStatus)
            } else {
                setErrorMessage('*Invalid tracking number.')
                setLoading(false)
            }
        }
    }

    const renderLoader = () => {
        return (
            <div className="loader-container">
                <LineWave
                    height="100"
                    width="100"
                    color="#0C356A"
                    ariaLabel="line-wave"
                    wrapperStyle={{}}
                    wrapperClass=""
                    visible={true}
                    firstLineColor=""
                    middleLineColor=""
                    lastLineColor=""
                />
            </div>
        )
    }

    const renderPackageDetails = () => (
        <>
            <h1 className="package-details-title">Package Name: <span className="span">{packageDetails[0].package_name}</span></h1>
            <div>
                <Box sx={{ width: '100%', color: 'red' }}>
                    <Stepper activeStep={status.length} orientation="horizontal">
                        {status.map((label) => (
                        <Step key={label}>
                            <StepLabel>{label}</StepLabel>
                        </Step>
                        ))}
                    </Stepper>
                </Box>
            </div>
            <ul className="package-details-list">
                <li className="package-details-item-head">
                    <p className="package-details-item">Date</p>
                    <p className="package-details-item">Time</p>
                    <p className="package-details-item">Place</p>
                    <p className="package-details-item">Status</p>
                </li>
                {packageDetails.map((packageDetail) => {
                    return (
                        <li className="package-details-item-body" key={packageDetail.id}>
                            <p className="package-details-item-2">{packageDetail.date}</p>
                            <p className="package-details-item-2">{packageDetail.time}</p>
                            <p className="package-details-item-2">{packageDetail.place}</p>
                            <p className="package-details-item-2">{packageDetail.status}</p>
                        </li>
                    )
                })}
            </ul>
        </>
    )

    const admin = parseInt(Cookies.get('admin'))
    if(admin === 1) {
        return (
            <Redirect to='/admin' />
        )
    }

    return (
        <div className="track-container">
            <h1 className="track-title">Track Package Status</h1>
            <button className='admin-panel-logout-btn' onClick={onClickLogout}>Logout</button>
            <form onSubmit={onClickTrack} className="track-form">
                <label htmlFor="tracking-number" className="label">Tracking Number</label>
                <div className="track-input-con">
                    <input type="text" id="tracking-number" placeholder="tracking number" className="track-input" onChange={onChangeTrackingNumber} />
                    <button type="submit" className="track-button">Track</button>
                </div>
                <p className="error-msg">{errorMessage}</p>
            </form>
            {loading ? renderLoader() : packageDetails.length > 0 ? renderPackageDetails() : null}
        </div>
    )
}

export default TrackPackageStatus;