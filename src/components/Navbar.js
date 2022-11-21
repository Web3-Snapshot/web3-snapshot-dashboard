import React from 'react';
import {FaCoins} from 'react-icons/fa';
import {Link} from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
	return (
		<Link to='/'>
			<div className='navbar'>
				<FaCoins className='icon' />
				<h1> Web3 <span className='purple'>Smart</span> Dashboard</h1>
				<button>hello</button>
			</div>
		</Link>
	)
}

export default Navbar