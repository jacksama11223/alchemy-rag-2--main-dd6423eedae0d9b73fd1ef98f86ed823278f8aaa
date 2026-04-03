import { useLocation } from 'react-router-dom';

export function Flashcards() {
  const location = useLocation();
  const isReviewing = location.pathname.includes('/review');

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        {isReviewing ? 'Reviewing Flashcards' : 'Flashcard Decks'}
      </h1>

      {isReviewing ? (
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <div className="w-full max-w-lg aspect-[3/2] bg-white dark:bg-gray-900 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-800 flex items-center justify-center p-8 cursor-pointer hover:shadow-xl transition-all transform hover:-translate-y-1">
            <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white">
              What is the difference between supervised and unsupervised learning?
            </h2>
          </div>
          <p className="mt-6 text-gray-500 dark:text-gray-400 text-sm">Click the card to flip</p>
          
          <div className="flex items-center space-x-4 mt-8 opacity-50">
            <button className="px-6 py-2 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 font-medium rounded-lg">Again</button>
            <button className="px-6 py-2 bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 font-medium rounded-lg">Hard</button>
            <button className="px-6 py-2 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 font-medium rounded-lg">Good</button>
            <button className="px-6 py-2 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 font-medium rounded-lg">Easy</button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {['Machine Learning', 'Data Structures', 'Algorithms', 'System Design'].map((deck) => (
            <div key={deck} className="bg-white dark:bg-gray-900 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 hover:border-emerald-300 dark:hover:border-emerald-700 cursor-pointer transition-all hover:shadow-md group">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{deck}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                45 cards • 12 due today
              </p>
              <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2">
                <div className="bg-emerald-500 h-2 rounded-full" style={{ width: '45%' }}></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
