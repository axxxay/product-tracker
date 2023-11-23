import { useState } from 'react'
import { Redirect, useHistory } from 'react-router-dom'
import Cookies from 'js-cookie'
import './style.css'
import AddPackage from '../AddPackage'
import UpdatePackageStatus from '../UpdatePackageStatus'
import DeletePackage from '../DeletePackage'
import GetTrackingDetails from '../GetTrackingDetails'


const AdminPanel = () => {

    const [adminAction, setAdminAction] = useState('')
    const history = useHistory()

    const onClickAdminAction = (event) => {
        setAdminAction(event.target.value)
    }

    const onClickLogout = () => {
        Cookies.remove('jwt_token')
        history.replace('/login')
    }

    const renderAdminAction = () => {
        switch(adminAction) {
            case 'get':
                return <GetTrackingDetails />
            case 'new':
                return <AddPackage />
            case 'update':
                return <UpdatePackageStatus />
            case 'delete':
                return <DeletePackage />
            default:
                return null
        }
    }

    const admin = parseInt(Cookies.get('admin'))
    if(admin === 0) {
        return (
            <Redirect to='/' />
        )
    }

    return (
        <div className='admin-panel-container'>
            <h1 className='admin-panel-title'>Welcome to Admin Panel</h1>
            <button className='admin-panel-logout-btn' onClick={onClickLogout}>Logout</button>
            <div className='admin-panel-btn-container'>
                <button className='admin-panel-btn' value='get' onClick={onClickAdminAction}>Get Package</button>
                <button className='admin-panel-btn' value='new' onClick={onClickAdminAction}>Add New Package</button>
                <button className='admin-panel-btn' value='update' onClick={onClickAdminAction}>Update Package</button>
                <button className='admin-panel-btn' value='delete' onClick={onClickAdminAction}>Delete Package</button>
            </div>
            {renderAdminAction()}
        </div>
    )

}

export default AdminPanel;