import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import "../css/Home.css";
import AllKnowledgeCards from "../components/AllKC";

const Home = () => {
  const [kcData, setKcData] = useState([]);
  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";
  const [searchQuery, setSearchQuery] = useState("");
  // Function to fetch knowledge cards
  const fetchKnowledgeCards = () => {
  const token = localStorage.getItem("token");

    axios
      .get(`${backendUrl}/knowledge-card/`, { params: { token } })
      .then((response) => {
        setKcData(response.data);
      })
      .catch((error) => {
        console.error("Error fetching knowledge cards:", error);
      });
  };

  useEffect(() => {
    fetchKnowledgeCards();
  }, []);

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const filteredCards = kcData.filter((card) => {
    return (
      card.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.tags.some((tag) =>
        tag.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }
  );

  return (
    <div className="home-container">
      <Navbar />
      <div className="search-container">
        <input
          type="text"
          placeholder="Search Your Cards..."
          value={searchQuery}
          onChange={handleSearchChange}
          className="search-input"
        />
      </div>
      <div className="all-cards-section">
        <AllKnowledgeCards cardData={filteredCards} refreshCards={fetchKnowledgeCards} />
      </div>
    </div>
  );
};

export default Home;
