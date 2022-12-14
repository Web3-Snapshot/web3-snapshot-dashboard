import React from "react";
import { FaCoins } from "react-icons/fa";
import { NavLink, Link } from "react-router-dom";
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
      {/* <div className='mainMenu'>
        <NavLink activeClassName='active' to='/prices'>
          <button>PRICES</button>
        </NavLink>
        <NavLink activeClassName='active' to='/supply'>
          <button>SUPPLY</button>
        </NavLink>
      </div> */}
    </div>
  );
}

export default Navbar;
