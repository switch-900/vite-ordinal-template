// Undo/Redo system for the 3D Builder App

class UndoRedoManager {
  constructor() {
    this.history = [];
    this.currentIndex = -1;
    this.maxHistorySize = 50;
  }

  // Save current state to history
  saveState(state, actionDescription = 'Unknown Action') {
    // Remove any future states if we're not at the end
    if (this.currentIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.currentIndex + 1);
    }

    // Add new state
    this.history.push({
      state: JSON.parse(JSON.stringify(state)), // Deep clone
      description: actionDescription,
      timestamp: Date.now()
    });

    // Limit history size
    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
    } else {
      this.currentIndex++;
    }
  }

  // Get previous state
  undo() {
    if (this.canUndo()) {
      this.currentIndex--;
      return this.history[this.currentIndex];
    }
    return null;
  }

  // Get next state
  redo() {
    if (this.canRedo()) {
      this.currentIndex++;
      return this.history[this.currentIndex];
    }
    return null;
  }

  // Check if undo is possible
  canUndo() {
    return this.currentIndex > 0;
  }

  // Check if redo is possible
  canRedo() {
    return this.currentIndex < this.history.length - 1;
  }

  // Get current state info
  getCurrentInfo() {
    if (this.currentIndex >= 0 && this.currentIndex < this.history.length) {
      return this.history[this.currentIndex];
    }
    return null;
  }

  // Get undo info
  getUndoInfo() {
    if (this.canUndo()) {
      return this.history[this.currentIndex - 1];
    }
    return null;
  }

  // Get redo info
  getRedoInfo() {
    if (this.canRedo()) {
      return this.history[this.currentIndex + 1];
    }
    return null;
  }

  // Clear history
  clear() {
    this.history = [];
    this.currentIndex = -1;
  }
}

export const undoRedoManager = new UndoRedoManager();
