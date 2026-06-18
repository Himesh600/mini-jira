import React, { useEffect, useState } from 'react';
import { useIssues, useUpdateIssue, useDeleteIssue } from './hooks/useIssues';
import { AlertCircle, Clock, GripVertical, Trash2, Edit2 } from 'lucide-react';
import EditIssueModal from './EditIssueModal';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

const statuses = ['OPEN', 'IN_PROGRESS', 'REVIEW', 'DONE'];

const IssueBoard = ({ projectId }) => {
  const { data: issues, isLoading, isError } = useIssues(projectId);
  const updateIssueMutation = useUpdateIssue();
  const deleteIssueMutation = useDeleteIssue(); 
  
  // We need local state so the card moves instantly when dropped, before the database replies
  const [editingIssue, setEditingIssue] = useState(null);
  const [boardData, setBoardData] = useState([]);

  // Sync our local state whenever the database data changes
  useEffect(() => {
    if (issues) setBoardData(issues);
  }, [issues]);

  if (isLoading) return <div className="animate-pulse flex gap-4 p-4 text-gray-500">Loading workspace...</div>;
  if (isError) return <div className="text-red-500">Failed to load issues.</div>;

  // The physics engine: What happens when you let go of a card
  const onDragEnd = (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const draggedIssue = boardData.find(issue => issue.id === draggableId);
    const updatedIssue = { ...draggedIssue, status: destination.droppableId };
    
    setBoardData(prevData => prevData.map(issue => 
      issue.id === draggableId ? updatedIssue : issue
    ));

    updateIssueMutation.mutate({ 
      id: draggableId, 
      status: destination.droppableId 
    });
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex gap-6 overflow-x-auto p-6 bg-gray-50 min-h-[500px] dark:bg-gray-900 select-none">
        
        {statuses.map((status) => {
          const columnIssues = boardData?.filter(i => i.status === status) || [];

          return (
            <Droppable droppableId={status} key={status}>
              {(provided, snapshot) => (
                <div 
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`flex-shrink-0 w-80 rounded-xl flex flex-col shadow-sm transition-colors duration-200 border border-transparent ${
                    snapshot.isDraggingOver ? 'bg-blue-50/50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' : 'bg-gray-100 dark:bg-gray-800'
                  }`}
                >
                  {/* Column Header */}
                  <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-gray-100/50 dark:bg-gray-800 rounded-t-xl">
                    <h3 className="font-bold text-gray-700 dark:text-gray-200 text-sm tracking-wide">{status.replace('_', ' ')}</h3>
                    <span className="text-xs bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2.5 py-0.5 rounded-full font-bold">
                      {columnIssues.length}
                    </span>
                  </div>
                  
                  {/* The Drop Zone Area */}
                  <div className="p-3 flex-1 overflow-y-auto space-y-3 min-h-[150px]">
                    {columnIssues.map((issue, index) => (
                      
                      <Draggable draggableId={issue.id} index={index} key={issue.id}>
                        {(provided, snapshot) => (
                          <div 
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            style={{...provided.draggableProps.style}}
                            className={`bg-white dark:bg-gray-700 p-4 rounded-lg border transition-all ${
                              snapshot.isDragging 
                                ? 'shadow-2xl ring-2 ring-blue-500 border-transparent scale-105 opacity-95 z-50' 
                                : 'shadow-sm border-gray-200 dark:border-gray-600 hover:border-blue-300 dark:hover:border-blue-500 hover:shadow-md'
                            }`}
                          >
                            <div className="flex justify-between items-start mb-3">
                              <div className="flex items-center gap-2">
                                <GripVertical className="w-4 h-4 text-gray-400 dark:text-gray-500 hover:text-gray-700 cursor-grab active:cursor-grabbing" />
                                <span className="text-xs font-bold text-gray-500 dark:text-gray-400">
                                  {issue.id.substring(0, 6).toUpperCase()}
                                </span>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                {issue.priority === 'CRITICAL' && <AlertCircle className="w-4 h-4 text-red-500" />}
                                
                                {/* ADDED: The Edit Button */}
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setEditingIssue(issue);
                                  }}
                                  className="text-gray-400 hover:text-blue-500 transition-colors p-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>

                                {/* The Delete Button */}
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation(); 
                                    if(window.confirm('Are you sure you want to delete this issue?')) {
                                      deleteIssueMutation.mutate(issue.id);
                                    }
                                  }}
                                  className="text-gray-400 hover:text-red-500 transition-colors p-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                            
                            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 leading-snug pl-6">
                              {issue.title}
                            </h4>
                            
                            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 pl-6">
                              <div className="flex items-center gap-1.5 font-medium">
                                <Clock className="w-3.5 h-3.5" />
                                {new Date(issue.createdAt).toLocaleDateString()}
                              </div>
                              {issue.assignedTo && (
                                <div className="w-6 h-6 rounded-full bg-blue-500 text-white flex items-center justify-center font-bold text-xs shadow-sm ring-2 ring-white dark:ring-gray-700">
                                  {issue.assignee?.name?.charAt(0)}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </Draggable>

                    ))}
                    {provided.placeholder}
                  </div>
                </div>
              )}
            </Droppable>
          );
        })}
      </div>

      {/* ADDED: The Edit Modal at the very end of the Context */}
      <EditIssueModal 
        isOpen={!!editingIssue} 
        onClose={() => setEditingIssue(null)} 
        issue={editingIssue} 
      />

    </DragDropContext>
  );
};

export default IssueBoard;