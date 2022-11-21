import React from 'react';
import {FaCoins} from 'react-icons/fa';
import {Link} from 'react-router-dom';
import './Navbar.css';


function Navbar() {
	return (
		<div>
			<Link to='/'>
				<div className='navbar'>
					<FaCoins className='icon' />
					<h1> Web3 <span className='purple'>Smart</span> Dashboard</h1>
				</div>
			</Link>
			<div className='mainMenu'>
				<button onClick={changePage1} id="btn1" className="btnPressed">PRICES</button>
				<button onClick={changePage2} id="btn2" >SUPPLY</button>
			</div>
		</div>
	);
}



const btn1 = document.querySelector("#btn1");
const btn2 = document.querySelector("#btn2");

function changePage1() {
	// btn1.classList.remove("btnPressed");
	// btn2.classList.add("btnPressed");
	console.log(this)
	console.log(btn2)
  }

  function changePage2() {
    // btn2.classList.remove("btnPressed");
	// btn1.classList.add("btnPressed");
  }

  export default Navbar