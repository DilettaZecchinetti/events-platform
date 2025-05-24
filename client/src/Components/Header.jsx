import React from 'react'
import { Button } from '../components/ui/button'
import { Link } from 'react-router-dom'
import logo from "../assets/logo.png"


function Header() {
    return (
        <header className='w-full border-b '>
            <div className='wrapper max-w-7xl mx-auto p-5 md:px-10 xl:px-0 w-full lg:mx-auto flex items-center justify-between '>
                <Link href="/" className="w-6">
                    <img src={logo} width={100} height={80} alt="Logo"></img>
                </Link>
                <div className='flex justify-end gap-3'>
                    <Button className="bg-blue-600 text-white px-6 py-3">Sign In</Button> </div>


            </div>
        </header >
    )
}

export default Header