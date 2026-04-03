import { useSearchParams } from 'react-router-dom';

export function Notes() {
  const [searchParams] = useSearchParams();
  const noteId = searchParams.get('id');

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        {noteId ? `Editing Note #${noteId}` : 'All Notes'}
      </h1>
      
      {noteId ? (
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 p-6 min-h-[500px]">
          <input 
            type="text" 
            defaultValue="Machine Learning Basics" 
            className="w-full text-3xl font-bold bg-transparent border-none outline-none text-gray-900 dark:text-white mb-4 placeholder:text-gray-300 dark:placeholder:text-gray-700"
            placeholder="Note Title"
          />
          <textarea 
            className="w-full h-full min-h-[400px] bg-transparent border-none outline-none text-gray-700 dark:text-gray-300 resize-none"
            defaultValue="Introduction to supervised and unsupervised learning algorithms..."
            placeholder="Start typing your notes here..."
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5].map((note) => (
            <div key={note} className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 hover:border-indigo-300 dark:hover:border-indigo-700 cursor-pointer transition-all hover:shadow-md">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Note Title {note}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-3">
                This is a preview of the note content. It shows the first few lines of what you've written to help you identify the note quickly.
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
