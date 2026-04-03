import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, FileText, BookOpen } from 'lucide-react';

// Sortable Item Component
function SortableWidget({ id, children, isCustomizing }: { id: string; children: React.ReactNode; isCustomizing: boolean }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id, disabled: !isCustomizing });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div ref={setNodeRef} style={style} className={`bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-200 dark:border-gray-800 mb-4 overflow-hidden ${isCustomizing ? 'ring-2 ring-indigo-500/50' : ''}`}>
      <div className="flex items-center px-4 py-3 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-800">
        {isCustomizing && (
          <button {...attributes} {...listeners} className="cursor-grab hover:text-indigo-600 dark:hover:text-indigo-400 mr-3 text-gray-400">
            <GripVertical className="w-5 h-5" />
          </button>
        )}
        <h3 className="font-semibold text-gray-900 dark:text-white flex items-center">
          {id === 'notes' && <FileText className="w-4 h-4 mr-2 text-indigo-500" />}
          {id === 'flashcards' && <BookOpen className="w-4 h-4 mr-2 text-emerald-500" />}
          {id === 'notes' ? 'Recent Notes' : 'Today\'s Review'}
        </h3>
      </div>
      <div className="p-4">
        {children}
      </div>
    </div>
  );
}

export function Dashboard() {
  const navigate = useNavigate();
  const [widgets, setWidgets] = useState(['notes', 'flashcards']);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [originalWidgets, setOriginalWidgets] = useState(['notes', 'flashcards']);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Fetch user settings on mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;
        const res = await fetch('/api/user/settings', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.widgetOrder && data.widgetOrder.length > 0) {
          setWidgets(data.widgetOrder);
          setOriginalWidgets(data.widgetOrder);
        }
      } catch (err) {
        console.error('Failed to fetch settings', err);
      }
    };
    fetchSettings();
  }, []);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = widgets.indexOf(active.id as string);
      const newIndex = widgets.indexOf(over.id as string);
      const newOrder = arrayMove(widgets, oldIndex, newIndex);
      
      setWidgets(newOrder);
    }
  };

  const handleSaveLayout = async () => {
    setIsCustomizing(false);
    setOriginalWidgets(widgets);
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      await fetch('/api/user/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ widgetOrder: widgets })
      });
    } catch (err) {
      console.error('Failed to save settings', err);
    }
  };

  const handleCancelLayout = () => {
    setIsCustomizing(false);
    setWidgets(originalWidgets);
  };

  const renderWidgetContent = (id: string) => {
    if (id === 'notes') {
      return (
        <div className="space-y-3">
          {[1, 2, 3].map((note) => (
            <div 
              key={note}
              onClick={() => !isCustomizing && navigate(`/notes?id=${note}`)}
              className={`p-3 rounded-lg border border-gray-100 dark:border-gray-800 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/20 transition-colors ${!isCustomizing ? 'cursor-pointer' : 'opacity-75'}`}
            >
              <h4 className="font-medium text-gray-900 dark:text-gray-100">Machine Learning Basics</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-1">
                Introduction to supervised and unsupervised learning algorithms...
              </p>
            </div>
          ))}
        </div>
      );
    }
    
    if (id === 'flashcards') {
      return (
        <div className="flex flex-col items-center justify-center py-6">
          <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-4">
            <span className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">20</span>
          </div>
          <p className="text-gray-600 dark:text-gray-400 mb-6 text-center">
            You have 20 cards due for review today. Keep up the streak!
          </p>
          <button 
            onClick={() => !isCustomizing && navigate('/flashcards/review')}
            disabled={isCustomizing}
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Review Now
          </button>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Welcome back, User!</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Here's your learning overview for today.</p>
        </div>
        
        {isCustomizing ? (
          <div className="flex items-center space-x-3">
            <button 
              onClick={handleCancelLayout}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleSaveLayout}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
            >
              Save Layout
            </button>
          </div>
        ) : (
          <button 
            onClick={() => setIsCustomizing(true)}
            className="px-4 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
          >
            Customize Dashboard
          </button>
        )}
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={widgets}
          strategy={verticalListSortingStrategy}
        >
          {widgets.map((id) => (
            <SortableWidget key={id} id={id} isCustomizing={isCustomizing}>
              {renderWidgetContent(id)}
            </SortableWidget>
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );
}
