import { useScene } from '../../state/sceneStore.jsx';

export function GroupManager() {
  const { objects, selectedIds, groups = [] } = useScene();
  
  // Temporarily disable group functions during migration
  const createGroup = () => console.log('Group management temporarily disabled');
  const ungroupObjects = () => console.log('Group management temporarily disabled');
  const addObjectToGroup = () => console.log('Group management temporarily disabled');
  const removeObjectFromGroup = () => console.log('Group management temporarily disabled');

  const handleCreateGroup = () => {
    if (selectedIds.length >= 2) {
      createGroup(selectedIds, `Group ${groups.length + 1}`);
    }
  };

  const handleUngroup = (groupId) => {
    ungroupObjects(groupId);
  };

  const selectedObjects = objects.filter(obj => selectedIds.includes(obj.id));
  const canGroup = selectedIds.length >= 2;
  const selectedGroups = groups.filter(group => 
    selectedIds.some(id => group.objectIds.includes(id))
  );

  return (
    <div className="absolute bottom-2 left-2 z-20 bg-gray-900 text-white p-3 rounded-lg shadow-xl">
      <h4 className="text-sm font-semibold mb-2">Group Operations</h4>
      
      <div className="flex gap-2 mb-2">
        <button
          onClick={handleCreateGroup}
          disabled={!canGroup}
          className={`px-3 py-1 text-xs rounded ${
            canGroup 
              ? 'bg-blue-600 hover:bg-blue-700 text-white' 
              : 'bg-gray-700 text-gray-400 cursor-not-allowed'
          }`}
          title={`Group ${selectedIds.length} selected objects`}
        >
          📦 Group ({selectedIds.length})
        </button>

        {selectedGroups.length > 0 && (
          <button
            onClick={() => selectedGroups.forEach(group => handleUngroup(group.id))}
            className="px-3 py-1 text-xs rounded bg-orange-600 hover:bg-orange-700 text-white"
            title={`Ungroup ${selectedGroups.length} groups`}
          >
            📤 Ungroup ({selectedGroups.length})
          </button>
        )}
      </div>

      {/* Active groups display */}
      {groups.length > 0 && (
        <div className="space-y-1">
          <div className="text-xs text-gray-400">Active Groups:</div>
          {groups.map(group => (
            <div key={group.id} className="flex items-center justify-between text-xs bg-gray-800 p-1 rounded">
              <span>{group.name} ({group.objectIds.length} objects)</span>
              <button
                onClick={() => handleUngroup(group.id)}
                className="text-red-400 hover:text-red-300 ml-2"
                title="Ungroup"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="text-xs text-gray-400 mt-2">
        💡 Select 2+ objects to create a group
      </div>
    </div>
  );
}
