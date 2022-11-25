import React, { useState } from "react";
import { FaCoins } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  const [toggleState, setToggleState] = useState("state1");
  const navigate = useNavigate();

  function handlePricesButton(evt) {
    setToggleState("state1");
    // fetch prices data here
    navigate("/");
  }

  function handleSupplyButton(evt) {
    setToggleState("state2");
    // fetch supply data here
    navigate("/supply");
  }

  return (
    <div>
      <Link to="/">
        <div className="navbar">
          <FaCoins className="icon" />
          <h1>
            {" "}
            Web3 <span className="purple">Smart</span> Dashboard
          </h1>
        </div>
      </Link>
      <div className="mainMenu">
        <button
          className={toggleState === "state1" ? "active" : ""}
          onClick={handlePricesButton}
        >
          PRICES
        </button>
        <button
          className={toggleState === "state2" ? "active" : ""}
          onClick={handleSupplyButton}
        >
          SUPPLY
        </button>
      </div>
    </div>
  );
}

export default Navbar;
