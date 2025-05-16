import Select from "react-select";
import toast from "react-hot-toast";
import debounce from "lodash.debounce";
import Navbar from "../components/Navbar";
import BackToTop from "../components/BackToTop";
import AllKnowledgeCards from "../components/AllKC";
import AddKnowledgeCard from "../components/AddKnowledgeCard";
import UploadFileForCard from "../components/UploadFileForCard";
import knowledgeCardApi from "../services/KnowledgeCardService";
import "../css/Home.css";
import React, { useState, useEffect, useCallback, useMemo } from "react";

const Home = () => {
  const [kcData, setKcData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [allFetchedCards, setAllFetchedCards] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [filter, setFilter] = useState("All");
  const [inputValue, setInputValue] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [showSkeletonCard, setShowSkeletonCard] = useState(false);
  const [page, setPage] = useState(1);
  const [favPage, setFavPage] = useState(1);
  const [archivedPage, setArchivedPage] = useState(1);
  const [userId, setUserId] = useState(null);

  const selectedCategoryNames = selectedCategories.map((c) => c.value);
  const filterOptions = [
    { value: "All", label: "All" },
    { value: "Favourites", label: "Favourites" },
    { value: "Archived", label: "Archived" },
  ];
  const categoryOptions = categories.map((c) => ({
    value: c.name,
    label: c.name.toUpperCase(),
  }));

  //Fetching Knowledge Cards using backend API call
  const fetchKnowledgeCards = useCallback(async (pageNum = 1) => {
    setIsLoading(true);
    try {
      const newCards = await knowledgeCardApi.handleFetchKnowledgeCards(
        pageNum
      );

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
      toast.error("Failed to load your cards");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetching Favourite Knowledge Cards using backend API call
  const fetchFavouriteKnowledgeCards = useCallback(async (pageNum = 1) => {
    setIsLoading(true);

    try {
      const newCards =
        await knowledgeCardApi.handleFetchFavouriteKnowledgeCards(pageNum);
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
      toast.error("Failed to load your favourite cards");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetching Favourite Knowledge Cards using backend API call
  const fetchArchivedCards = useCallback(async (pageNum = 1) => {
    setIsLoading(true);

    try {
      const newCards = await knowledgeCardApi.handleFetchArchiveKnowledgeCards(
        pageNum
      );
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
      toast.error("Failed to load your archived cards");
    } finally {
      setIsLoading(false);
    }
  }, []);

  //fetching data and resetting data on filter change
  useEffect(() => {
    const fetchData = async () => {
      setHasMore(true);

      try {
        if (filter === "All") {
          if (page === 1) setAllFetchedCards([]);
          await fetchKnowledgeCards(page);
        } else if (filter === "Favourites") {
          if (favPage === 1) setKcData([]);
          await fetchFavouriteKnowledgeCards(favPage);
        } else if (filter === "Archived") {
          if (archivedPage === 1) setKcData([]);
          await fetchArchivedCards(archivedPage);
        }
      } catch (error) {
        console.error("Error fetching cards:", error);
        toast.error("Failed to load cards");
      }
    };

    fetchData();
  }, [
    filter,
    page,
    favPage,
    archivedPage,
    fetchKnowledgeCards,
    fetchFavouriteKnowledgeCards,
    fetchArchivedCards,
  ]);

  /* Filtering cards based on
  1. Search Query : for searching cards based on title, summary, tags, categories
  2. Category filter : based on selected categories in category filter
  */
  const filteredCards = useMemo(() => {
    const baseData = filter === "All" ? allFetchedCards : kcData;

    if (!searchQuery.trim() && selectedCategoryNames.length === 0)
      return baseData;

    const lowerQuery = searchQuery.toLowerCase();
    const queryWords = lowerQuery.split(/\s+/);

    return baseData.filter((card) => {
      const cardCategories =
        card?.category?.map((tag) => tag.toLowerCase()) || [];

      const matchesSearch = queryWords.some((qWord) =>
        [
          ...(card?.title?.toLowerCase().split(/\s+/) || []),
          ...cardCategories,
          ...(card?.summary?.toLowerCase().split(/\s+/) || []),
          ...(card?.tags?.map((tag) => tag.toLowerCase()) || []),
        ].includes(qWord)
      );

      const matchesCategory =
        selectedCategoryNames.length === 0 ||
        selectedCategoryNames.some((cat) =>
          cardCategories.includes(cat.toLowerCase())
        );

      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, filter, allFetchedCards, kcData, selectedCategoryNames]);

  // Search debouncing handler
  const debouncedSetSearchQuery = useMemo(
    () =>
      debounce((value) => {
        setSearchQuery(value);
        setIsSearching(false);
        setShowSkeletonCard(false);
      }, 500),
    []
  );

  // Changing value in Search bar
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    setIsSearching(true);
    setShowSkeletonCard(true);
    debouncedSetSearchQuery(value);
  };

  // handleStartSaving for setting SkeletonCard while adding a new card
  const handleStartSaving = () => {
    setShowSkeletonCard(true);
  };

  // handleSaved for removing SkeletonCard while new card is successfully added
  const handleSaved = () => {
    setShowSkeletonCard(false);
  };

  // handleSavedFail for removing SkeletonCard while new card fails to be added
  const handleSavedFail = () => {
    setShowSkeletonCard(false);
    toast.error("Card cannot be added!");
  };

  //removing cards from favourite filter in case of delete or archive
  const removeCardFromFavs = (cardId) => {
    setKcData((prev) => prev.filter((card) => card.card_id !== cardId));
  };

  //removing cards from archive filter in case of delete or unarchive
  const removeCardFromArchived = (cardId) => {
    setKcData((prev) => prev.filter((card) => card.card_id !== cardId));
  };

  //handleRemoveCard for handling removeCardFromX functions
  const handleRemoveCard = useCallback(
    (cardId) => {
      switch (filter) {
        case "Favourites":
          removeCardFromFavs(cardId);
          break;
        case "Archived":
          removeCardFromArchived(cardId);
          break;
        default:
          setAllFetchedCards((prev) =>
            prev.filter((card) => card.card_id !== cardId)
          );
      }
    },
    [filter]
  );

  // fetching user-defined and default categories
  const fetchCategories = async (userId) => {
    try {
      if (!userId) return;
      const response = await knowledgeCardApi.handleFetchCategories(userId);
      setCategories(response.data.categories || []);
      console.log("Fetched categories:", response.data.categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  // fetches categories again on adding new categories (for category filter)
  useEffect(() => {
    fetchCategories(userId);
  }, [userId]);

  const handleNewCategoryAdded = () => {
    if (userId) fetchCategories(userId);
  };

  //useEffect for getting userId from token
  useEffect(() => {
    const fetchUserId = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const userId = await knowledgeCardApi.getUserId(token);
          setUserId(userId);
        } catch (error) {
          console.error("Error fetching user ID:", error);
        }
      }
    };
    fetchUserId();
  }, []);

  return (
    <>
      <Navbar
        searchQuery={inputValue}
        handleSearchChange={handleSearchChange}
      />
      <div className="flex flex-col gap-6 px-4 sm:px-8 md:px-12 py-8">
        {/* Mobile Search Input */}
        <div className="block md:hidden w-full">
          <input
            type="text"
            placeholder="Search Your Cards..."
            value={inputValue}
            onChange={handleSearchChange}
            className="w-full border rounded border-gray-300 focus:outline-none focus:border-emerald-500 px-4 py-2 placeholder:text-emerald-800 placeholder:opacity-40 text-emerald-800 shadow-sm"
          />
        </div>

        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 w-full">
          {/* Add/Upload Buttons */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full lg:w-auto">
            <AddKnowledgeCard
              handleStartSaving={handleStartSaving}
              handleSaved={handleSaved}
              handleSavedFail={handleSavedFail}
              onSave={(newCard) => {
                setAllFetchedCards((prevCards) => [newCard, ...prevCards]);
                setShowSkeletonCard(false);
              }}
            />
            <UploadFileForCard
              handleStartSaving={handleStartSaving}
              handleSaved={handleSaved}
              handleSavedFail={handleSavedFail}
              onSave={(newCard) => {
                setAllFetchedCards((prevCards) => [newCard, ...prevCards]);
                setShowSkeletonCard(false);
              }}
            />
          </div>

          {/* Filter Selects */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full lg:w-auto">
            {/* Filter by Type */}
            <div className="relative w-full sm:w-52">
              <Select
                value={filterOptions.find((opt) => opt.value === filter)}
                onChange={(selected) => setFilter(selected.value)}
                options={filterOptions}
                className="w-full sm:w-52"
                styles={{
                  control: (base, state) => ({
                    ...base,
                    minHeight: "41px",
                    height: "41px",
                    width: "100%",
                    fontSize: "0.875rem",
                    padding: "0 8px",
                    borderColor: state.isFocused ? "#10B981" : "#ccc", // emerald-500
                    boxShadow: state.isFocused
                      ? "0 0 0 2px rgba(16, 185, 129, 0.4)"
                      : "none", // Emerald ring
                    "&:hover": {
                      borderColor: "#10B981",
                    },
                    overflow: "auto",
                    scrollbarWidth: "none",
                  }),
                  multiValue: (base) => ({
                    ...base,
                    backgroundColor: "#d1fae5",
                    color: "#065f46",
                    margin: "2px",
                  }),
                  multiValueContainer: (base) => ({
                    ...base,
                    display: "flex",
                    flexWrap: "nowrap",
                    overflowX: "auto",
                    maxHeight: "36px",
                    padding: "0",
                  }),
                  menuList: (base) => ({
                    ...base,
                    maxHeight: "200px",
                    overflowY: "auto",
                    scrollbarColor: "#10B981 #fff",
                  }),
                  option: (base) => ({
                    ...base,
                    color: "black",
                    backgroundColor: "white",
                    "&:hover": {
                      backgroundColor: "#d1fae5",
                      color: "#065f46",
                    },
                  }),
                }}
                components={{
                  DropdownIndicator: () => (
                    <svg
                      className="w-4 h-4 text-gray-500 mr-2"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  ),
                  IndicatorSeparator: () => null,
                }}
              />
            </div>

            {/* Category Select */}
            <div className="w-full sm:w-64">
              <Select
                isMulti
                options={categoryOptions}
                value={selectedCategories}
                onChange={(selected) => setSelectedCategories(selected)}
                closeMenuOnSelect={false}
                className="w-full"
                styles={{
                  control: (base, state) => ({
                    ...base,
                    minHeight: "41px",
                    height: "41px",
                    width: "100%",
                    fontSize: "0.875rem",
                    padding: "0 8px",
                    borderColor: state.isFocused ? "#10B981" : "#ccc", // emerald-500
                    boxShadow: state.isFocused
                      ? "0 0 0 2px rgba(16, 185, 129, 0.4)"
                      : "none", // Emerald ring
                    "&:hover": {
                      borderColor: "#10B981",
                    },
                    overflow: "auto",
                    scrollbarWidth: "none",
                  }),
                  multiValue: (base) => ({
                    ...base,
                    backgroundColor: "#d1fae5",
                    color: "#065f46",
                    margin: "2px",
                  }),
                  multiValueContainer: (base) => ({
                    ...base,
                    display: "flex",
                    flexWrap: "nowrap",
                    overflowX: "auto",
                    maxHeight: "36px",
                    padding: "0",
                  }),
                  menuList: (base) => ({
                    ...base,
                    maxHeight: "200px",
                    overflowY: "auto",
                    scrollbarColor: "#10B981 #fff",
                  }),
                  option: (base) => ({
                    ...base,
                    color: "black",
                    backgroundColor: "white",
                    "&:hover": {
                      backgroundColor: "#d1fae5",
                      color: "#065f46",
                    },
                  }),
                }}
                placeholder="Filter by category"
              />
            </div>
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
        isSearching={isSearching}
        showSkeletonCard={showSkeletonCard}
        loadMore={
          filter === "All"
            ? () => setPage((prev) => prev + 1)
            : filter === "Favourites"
            ? () => setFavPage((prev) => prev + 1)
            : filter === "Archived"
            ? () => setArchivedPage((prev) => prev + 1)
            : null
        }
        hasMore={
          filter === "All"
            ? hasMore
            : filter === "Favourites"
            ? hasMore
            : filter === "Archived"
            ? hasMore
            : false
        }
        removeCardFromUI={handleRemoveCard}
        userId={userId}
        handleNewCategoryAdded={handleNewCategoryAdded}
        currentFilter={filter}
      />
      <BackToTop />
    </>
  );
};

export default Home;
