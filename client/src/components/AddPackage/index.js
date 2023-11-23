import { useState } from "react";
import Cookies from 'js-cookie'
import { parse, format } from 'date-fns';
import './style.css'


const AddPackage = () => {
    const today = new Date();
    const formattedDate = format(today, 'yyyy-MM-dd');
    const formattedTime = format(today, 'HH:mm:ss');

    const [packageName, setPackageName] = useState('')
    const [date, setDate] = useState(formattedDate)
    const [time, setTime] = useState(formattedTime)
    const [place, setPlace] = useState('')
    const [status, setStatus] = useState('')
    const [errorMessage, setErrorMessage] = useState('')
    const [trackingId, setTrackingId] = useState('')

    const orderStatus = [
        'Order Placed',
        'Order Confirmed',
        'Order Shipped',
        'In Transit',
        'Package Arrived',
        'Package Left',
        'Out for Delivery',
        'Delivered',
    ]

    const handlePackageNameChange = (event) => {
        setPackageName(event.target.value)
    }

    const handleDateChange = (event) => {
        setDate(event.target.value)
    }

    const handleTimeChange = (event) => {
        setTime(event.target.value)
    }

    const handlePlaceChange = (event) => {
        setPlace(event.target.value)
    }

    const handleStatusChange = (event) => {
        setStatus(event.target.value)
    }

    const onClickAddPackage = async event => {
        event.preventDefault()
        if(packageName === '' || date === '' || time === '' || place === '' || status === '') {
            setErrorMessage('All fields are mandatory')
        }
        else {
            const parsedTime = parse(time, 'HH:mm:ss', new Date());
            console.log(time)
            const time12 = format(parsedTime, 'hh:mm:ss a');
            const parsedDate = parse(date, 'yyyy-MM-dd', new Date());
            const formattedDate = format(parsedDate, 'yyyy-MMM-dd-EEEE');
            const userId = Cookies.get('user_id')

            const packageData = {
                packageName: packageName,
                date: formattedDate,
                time: time12,
                place: place,
                status: status,
                userId
            }

            const options = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${Cookies.get('jwt_token')}`
                },
                body: JSON.stringify(packageData)
            }

            const response = await fetch('https://api-product-tracker.onrender.com/newpackage/', options)
            const data = await response.json()
            if(response.ok === true) {
                setPackageName('')
                setDate(formattedDate)
                setTime(formattedTime)
                setPlace('')
                setStatus('')
                setTrackingId(`Tracking ID: ${data.trackingId}`)
            } else {
                setErrorMessage(data.errorMsg)
            }
            console.log(data)
        }
    }

    return (
        <>
            <p className="tracking-id">{trackingId}</p>
            <form onSubmit={onClickAddPackage} className='add-package-form'>
                <h1 className="add-package-title">Add New Package</h1>
                <label className="add-package-label" htmlFor="packagename">Package Name</label>
                <input type="text" className="add-package-input" id="packagename" placeholder="Enter Package Name" value={packageName} onChange={handlePackageNameChange} />
                <label className="add-package-label" htmlFor="date">Date</label>
                <input type="date" className="add-package-input" id="date" placeholder="Enter Date" value={date} onChange={handleDateChange} />
                <label className="add-package-label" htmlFor="time">Time</label>
                <input type="time" className="add-package-input" id="time" step="1" placeholder="Enter Time" value={time} onChange={handleTimeChange} />
                <label className="add-package-label" htmlFor="place">Place</label>
                <input type="text" className="add-package-input" id="place" placeholder="Enter Place" value={place} onChange={handlePlaceChange} />
                <label className="add-package-label" htmlFor="status">Status</label>
                <select className="add-package-input" id="status" value={status} onChange={handleStatusChange}>
                    <option value="" disabled hidden>Select Status</option>
                    {orderStatus.map((status, index) => {
                        return (
                            <option key={index} value={status}>{status}</option>
                        )
                    })}
                </select>
                <button className="add-package-btn" type="submit">Add Package</button>
                {errorMessage && <p className="error-message">{errorMessage}</p>}
            </form>
        </>
    )
}

export default AddPackage;