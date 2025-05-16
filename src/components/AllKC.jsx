import AddKnowledgeCard from "./AddKnowledgeCard";
import KnowledgeCard from "./KnowledgeCard";
import SkeletonCard from "./SkeletonCard";
import { useRef, useCallback, useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import SavingSkeletonCard from "./SavingSkeletonCard";

const AllKnowledgeCards = ({
  cardData,
  refreshCards,
  isLoading = false,
  isSearching = false,
  showSkeletonCard = false,
  loadMore,
  hasMore,
  removeCardFromUI,
  currentTab,
  userId,
  handleNewCategoryAdded,
  currentFilter,
}) => {
  const observer = useRef();
  const { user } = useContext(AuthContext);

  const lastCardRef = useCallback(
    (node) => {
      if (isLoading) return;
      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasMore) {
            loadMore();
          }
        },
        { rootMargin: "50px" }
      );

      if (node) observer.current.observe(node);
    },
    [isLoading, hasMore, loadMore]
  );

  return (
    <div className="px-8 md:px-12 mt-8">
      <div className="grid gap-6 grid-cols-[repeat(auto-fill,minmax(300px,1fr))]">
        {/* Always show SavingSkeletonCard if flag is true */}
        {showSkeletonCard && !isSearching && <SavingSkeletonCard />}

        {/* Search skeletons */}
        {isSearching && (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        )}

        {/* Initial loading skeletons */}
        {!isSearching && isLoading && (!cardData || cardData.length === 0) && (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        )}

        {/* Knowledge cards */}
        {!isSearching &&
          cardData &&
          cardData.length > 0 &&
          cardData.map((card, index) => {
            const isLast = index === cardData.length - 1;
            return (
              user && (
                <div
                  ref={isLast ? lastCardRef : null}
                  key={card.card_id}
                  className="h-auto">
                  <KnowledgeCard
                    cardData={card}
                    refreshCards={refreshCards}
                    removeCardFromUI={removeCardFromUI}
                    currentTab={currentTab}
                    userId={userId}
                    handleNewCategoryAdded={handleNewCategoryAdded}
                    currentFilter={currentFilter}
                  />
                </div>
              )
            );
          })}

        {/* Empty state */}
        {!isLoading &&
          !isSearching &&
          (!cardData || cardData.length === 0) &&
          !showSkeletonCard && (
            <div className="flex flex-col items-center justify-center w-full py-20 text-center col-span-full">
              <img
                src="no-cards-2.png"
                alt="No Cards"
                className="w-64 opacity-60 mb-4"
              />
              <p className="text-emerald-700 text-lg font-medium">
                No knowledge cards found
              </p>
            </div>
          )}

        {/* Pagination loading */}
        {isLoading && hasMore && !showSkeletonCard && (
          <>
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </>
        )}
      </div>
    </div>
  );
};

export default AllKnowledgeCards;
