import Cookies from "js-cookie";
import { useState } from "react";
import {LineWave} from 'react-loader-spinner'

const GetTrackingDetails = () => {
    const [trackingNumber, setTrackingNumber] = useState('')
    const [packageDetails, setPackageDetails] = useState([])
    const [errorMessage, setErrorMessage] = useState('')
    const [loading, setLoading] = useState(false)
    

    const onChangeTrackingNumber = (event) => {
        setTrackingNumber(event.target.value)
    }

    const onClickTrack = async (event) => {
        event.preventDefault()
        if(trackingNumber !== '') {
            setLoading(true)
            const response = await fetch(`http://localhost:5000/tracking/${trackingNumber}/`, {
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
    )

    return (
        <>
            <form onSubmit={onClickTrack} className="add-package-form">
                <h1 className="add-package-title">Track Package Status</h1>
                <label htmlFor="tracking-number" className="label">Tracking Number</label>
                <div className="track-input-con">
                    <input type="text" id="tracking-number" placeholder="tracking number" className="track-input" onChange={onChangeTrackingNumber} />
                    <button type="submit" className="track-button">Track</button>
                </div>
                <p className="error-msg">{errorMessage}</p>
            </form>
            {loading ? renderLoader() : packageDetails.length > 0 ? renderPackageDetails() : null}
        </>
    )
}

export default GetTrackingDetails;