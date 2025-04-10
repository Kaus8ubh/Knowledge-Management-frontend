import AddKnowledgeCard from "./AddKnowledgeCard";
import KnowledgeCard from "./KnowledgeCard";
import SkeletonCard from "./SkeletonCard";

const AllKnowledgeCards = ({ cardData, refreshCards, isLoading}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-start w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  // Show empty image if not loading and no data
  if (!cardData || cardData.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center w-full py-20 text-center">
        <img src="no-cards-2.png" alt="No Cards" className="w-64 opacity-60 mb-4" />
        <p className="text-emerald-700 text-lg font-medium">No knowledge cards found</p>
      </div>
    );
  }
  

  return (
    <div className="flex flex-wrap gap-8 mt-8 px-20 mx-12">
      {cardData.sort((a,b) => {
        return new Date(b.created_at) - new Date(a.created_at);
      }).map((card) => (
        <KnowledgeCard
          key={card.card_id}
          cardData={card}
          refreshCards={refreshCards}
        />
      ))}
    </div>
  );
};

export default AllKnowledgeCards;
