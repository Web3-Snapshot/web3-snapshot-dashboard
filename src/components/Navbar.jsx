import React from "react";
import { FaCoins } from "react-icons/fa";
import { Link } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  return (
    <div>
      <Link to='/'>
        <div className='navbar'>
          <FaCoins className='icon' />
          <h1> Web3 Dashboard</h1>
        </div>
      </Link>
    </div>
  );
}

export default Navbar;
