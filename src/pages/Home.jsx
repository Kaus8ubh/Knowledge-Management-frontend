import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import "../css/Home.css";
import AllKnowledgeCards from "../components/AllKC";
import AddKnowledgeCard from "../components/AddKnowledgeCard";
import SkeletonCard from "../components/SkeletonCard";
import { ToastContainer } from "react-toastify";

const Home = () => {
  const [kcData, setKcData] = useState([]);
  const backendUrl = import.meta.env.VITE_BACKEND_URL || "http://localhost:8000";
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState("All");
  const [showSkeletonCard, setShowSkeletonCard] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [favPage, setFavPage] = useState(1);
  const [archivedPage, setArchivedPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [allFetchedCards, setAllFetchedCards] = useState([]);

  
  // Function to fetch knowledge cards
  const fetchKnowledgeCards = useCallback(async (pageNum = 1) => {
    setIsLoading(true);
  const token = localStorage.getItem("token");

  try {
    const response = await axios.get(`${backendUrl}/knowledge-card/`, {
      params: { token, skip: (pageNum - 1)*4, limit: 4 },
    });

    const newCards = response.data;
    if (pageNum === 1) {
      setAllFetchedCards(newCards);
    } else {
      setAllFetchedCards((prev) => [...prev, ...newCards]);
    }

    if (newCards.length === 0) {
      setHasMore(false);
    }
  } catch (error) {
    console.error("Error fetching knowledge cards:", error);
  } finally {
    setIsLoading(false);
  }
  }, [backendUrl]);

  //useeffect for all KC 
  useEffect(() => {
    if (filter === "All") {
      fetchKnowledgeCards(page);
    }
  }, [page, fetchKnowledgeCards]);

  const handleSearchChange = (event) => {
    setSearchQuery(event.target.value);
  };

  // Favourite KC
  const fetchFavouriteKnowledgeCards = useCallback(async (pageNum = 1) => {
    setIsLoading(true);
    const token = localStorage.getItem("token");
  
    try {
      const response = await axios.get(`${backendUrl}/knowledge-card/favourite`, {
        params: { token, skip: (pageNum - 1) * 4, limit: 4 },
      });
  
      const newCards = response.data;
      if (pageNum === 1) {
        setKcData(newCards);
      } else {
        setKcData((prev) => [...prev, ...newCards]);
      }
  
      if (newCards.length === 0) {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error fetching favourite knowledge cards:", error);
    } finally {
      setIsLoading(false);
    }
  }, [backendUrl]);

  // Archived KC
  const fetchArchivedCards = useCallback(async (pageNum = 1) => {
    setIsLoading(true);
    const token = localStorage.getItem("token");
  
    try {
      const response = await axios.get(`${backendUrl}/knowledge-card/archive`, {
        params: { token, skip: (pageNum - 1) * 4, limit: 4 },
      });
  
      const newCards = response.data;
      if (pageNum === 1) {
        setKcData(newCards);
      } else {
        setKcData((prev) => [...prev, ...newCards]);
      }
  
      if (newCards.length === 0) {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error fetching favourite knowledge cards:", error);
    } finally {
      setIsLoading(false);
    }
  }, [backendUrl]);
  

  // dropdown filter
  useEffect(() => {
    setPage(1);
    setFavPage(1);
    setHasMore(true);

    if (filter === "All") {
      setAllFetchedCards([]);
      setKcData([]);
      fetchKnowledgeCards(1);
    } else if (filter === "Favourites") {
      setKcData([]);
      fetchFavouriteKnowledgeCards(1);
    } else if (filter === "Archived") {
      fetchArchivedCards();
    }
  }, [filter, fetchKnowledgeCards, fetchFavouriteKnowledgeCards, fetchArchivedCards]);

  const getFilteredCards = () => {
    const baseData = filter === "All" ? allFetchedCards : kcData;
  
    if (!searchQuery.trim()) return baseData;
  
    return baseData.filter((card) =>
      card?.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card?.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card?.summary?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card?.tags?.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  };
  
  const filteredCards = getFilteredCards();

  const handleStartSaving = () => {
    setShowSkeletonCard(true);
  };

  const handleSaved = () => {
    setShowSkeletonCard(false);
  };

  const removeCardFromFavs = (cardId) => {
    setKcData((prev) => prev.filter((card) => card.card_id !== cardId));
  };
  
  const removeCardFromArchived = (cardId) => {
    setKcData((prev) => prev.filter((card) => card.card_id !== cardId));
  };

  const handleRemoveCard = useCallback((cardId) => {
    switch (filter) {
      case "Favourites":
        removeCardFromFavs(cardId);
        break;
      case "Archived":
        removeCardFromArchived(cardId);
        break;
      default:
        setAllFetchedCards((prev) => prev.filter((card) => card.card_id !== cardId));
    }
  }, [filter]);

  //useeffect for favourites
    useEffect(() => {
      if (filter === "Favourites") {
        fetchFavouriteKnowledgeCards(favPage);
      }
    }, [favPage, fetchFavouriteKnowledgeCards, filter]);

  //useEffect for Archives
    useEffect(() => {
      if (filter === "Archives") {
        fetchArchivedCards(archivedPage);
      }
    }, [archivedPage, fetchArchivedCards, filter]);

  return ( 
  <>
      <Navbar searchQuery={searchQuery} handleSearchChange={handleSearchChange}/>

      <div className="flex flex-col md:flex-row items-center justify-between mx-12 my-10 gap-4">
        <div className="w-full md:w-1/3 lg:hidden shadow-sm">
          <input
            type="text"
            placeholder="Search Your Cards..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full border rounded border-gray-300 focus:outline-none focus:border-emerald-500 px-4 py-2 placeholder:text-emerald-800 placeholder:opacity-40 text-emerald-800"
          />
        </div>

        <div className="flex items-center gap-4 ml-auto">
        <div className={`transition-all duration-200 ease-in-out transform ${
          filter === 'Favourites' ? "scale-105" :
          filter === 'Archived' ? "scale-105" :
          "scale-105"
        }`}>
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 rounded border border-gray-300 bg-white text-emerald-800 focus:outline-none focus:ring-2 focus:ring-emerald-400"
            >
              <option value="All">All</option>
              <option value="Favourites">Favourites</option>
              <option value="Archived">Archived</option>
            </select>
        </div>
        <div className="justify-end w-full md:w-auto">
          <AddKnowledgeCard 
            onSave={(newCard) => {
              setAllFetchedCards((prevCards) => [newCard, ...prevCards]);
              setShowSkeletonCard(false);
            }}
          handleStartSaving={handleStartSaving} handleSaved={handleSaved}/>
        </div>
        </div>

      </div>
      {/* <div className='flex justify-end mx-12 lg:pt-6 text-emerald-700 lg:text-3xl'>
          <p>Home</p>
        </div> */}
        <AllKnowledgeCards
          cardData={filteredCards}
          refreshCards={fetchKnowledgeCards}
          isLoading={isLoading}
          showSkeletonCard={showSkeletonCard}
          loadMore={filter === "All" ? () => setPage((prev) => prev + 1) : filter === "Favourites"? ()=> setFavPage((prev) => prev + 1) : filter === "Archived"? ()=> setArchivedPage((prev) => prev + 1) :null}
          hasMore={filter === "All" ? hasMore : filter === "Favourites"? hasMore : filter === "Archived"? hasMore : false}
          removeCardFromUI={handleRemoveCard}
        />
        
        {/* Toast Notification */}
        <ToastContainer position="bottom-right"/>
        </>    
  );
};

export default Home;
