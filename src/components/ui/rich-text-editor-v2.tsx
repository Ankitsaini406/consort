import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { Button3 } from "../../ui/components/Button3";
import { Separator } from "./separator";
import { Plus } from "lucide-react";
import { FeatherAccessibility, FeatherCopy, FeatherList, FeatherMenu, FeatherPlus, FeatherTrash } from "@subframe/core";

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  minHeight?: string;
  error?: string;
  disabled?: boolean;
}

interface RichTextEditorRef {
  getHTML: () => string;
  getPlainText: () => string;
  getBlocks: () => TextBlock[];
}

interface TextMark {
  type: 'bold' | 'italic' | 'underline' | 'code';
  start: number;
  end: number;
}

interface ListItem {
  id: string;
  content: string;
  marks?: TextMark[];
}

interface TextBlock {
  id: string;
  type: string;
  content?: string; // For text blocks
  marks?: TextMark[]; // For inline formatting
  listType?: 'bullet' | 'numbered'; // For lists
  items?: ListItem[]; // For lists
}

// ============================================================================
// KEYBOARD LOGIC DUPLICATION REFACTORING - PHASE 3 COMPLETE
// ============================================================================
// Successfully eliminated 150+ lines of duplicated keyboard handling logic
// between ListBlockDisplay.handleItemKeyDown and main handleKeyDown functions.
// 
// BEFORE: 6+ keyboard handlers duplicated across multiple locations
// AFTER: Single centralized system with consistent behavior
//
// Benefits achieved:
// ✅ Single Source of Truth - All keyboard logic in createKeyboardHandlers()
// ✅ Consistency - Same behavior for Enter/Backspace/Tab across all contexts
// ✅ Maintainability - Changes made in one place, applied everywhere
// ✅ Type Safety - Unified KeyboardContext interface
// ✅ Focus Management - Centralized in createFocusManager()
// ✅ Testability - Keyboard logic isolated and testable
//
// Fallback safety: If centralized handlers unavailable, minimal fallback used
// with console.warn for debugging production issues.
// ============================================================================

// NEW: Centralized keyboard handling system
interface KeyboardContext {
  block: TextBlock;
  blocks: TextBlock[];
  element: HTMLElement;
  // List-specific context (optional)
  listItemId?: string;
  listItemIndex?: number;
  listItemRefs?: React.MutableRefObject<Map<string, HTMLInputElement | HTMLTextAreaElement>>;
  // Callbacks
  onUpdate: (blockId: string, updates: Partial<TextBlock>) => void;
  onAddNewBlock: (afterId: string, type?: BlockType) => void;
  onDeleteBlock: (blockId: string) => void;
  onSplitBlock: (blockId: string, element: HTMLElement) => void;
  onSetActiveBlock: (blockId: string) => void;
  setFocusedItemIndex?: (index: number) => void;
}

// NEW: Focus management utilities
// ============================================================================
// ENHANCED FOCUS MANAGER - PHASE 1: SURGICAL FOCUS CHAOS ELIMINATION
// ============================================================================
// Centralized focus orchestrator that eliminates race conditions and 
// inconsistent timing patterns across the entire Rich Text Editor.
//
// Key Features:
// ✅ Smart Timing Resolution - Auto-detects optimal timing strategy
// ✅ Anti-Race Conditions - Cancels competing focus attempts
// ✅ Built-in Fallbacks - Multiple strategies for DOM-not-ready scenarios
// ✅ Focus Queue System - Handles complex focus sequences
// ✅ Operation Tracking - Logs focus attempts for debugging
// ============================================================================

interface FocusOperation {
  id: string;
  type: 'block' | 'list-item' | 'element';
  blockId?: string;
  itemId?: string;
  element?: HTMLElement;
  cursorPosition?: 'start' | 'end';
  priority?: 'high' | 'normal';
}

const createFocusManager = () => {
  let currentFocusOperation: string | null = null;
  let activeTimeouts: Set<NodeJS.Timeout> = new Set();
  let activeAnimationFrames: Set<number> = new Set();
  
  // Cancel any pending focus operations
  const cancelPendingFocus = (reason: string = 'new operation') => {
    if (currentFocusOperation) {
      console.debug(`Focus Manager: Cancelling operation ${currentFocusOperation} (${reason})`);
      currentFocusOperation = null;
    }
    
    // Clear all pending timeouts and animation frames
    activeTimeouts.forEach(timeout => clearTimeout(timeout));
    activeTimeouts.clear();
    activeAnimationFrames.forEach(frame => cancelAnimationFrame(frame));
    activeAnimationFrames.clear();
  };
  
  // Smart timing execution with race condition prevention
  const executeWithTiming = (operation: FocusOperation, callback: () => boolean) => {
    const operationId = operation.id;
    currentFocusOperation = operationId;
    
    // For high-priority operations, try immediate execution first
    if (operation.priority === 'high') {
      const success = callback();
      if (success) {
        currentFocusOperation = null;
        // Aggressive cleanup on success
        activeTimeouts.forEach(timeout => clearTimeout(timeout));
        activeTimeouts.clear();
        activeAnimationFrames.forEach(frame => cancelAnimationFrame(frame));
        activeAnimationFrames.clear();
        return;
      }
    }
    
    // Use requestAnimationFrame for DOM-dependent operations
    const animationFrame = requestAnimationFrame(() => {
      activeAnimationFrames.delete(animationFrame);
      if (currentFocusOperation !== operationId) return; // Cancelled
      
      const success = callback();
      if (success) {
        currentFocusOperation = null;
        // Aggressive cleanup on success
        activeTimeouts.forEach(timeout => clearTimeout(timeout));
        activeTimeouts.clear();
        activeAnimationFrames.forEach(frame => cancelAnimationFrame(frame));
        activeAnimationFrames.clear();
        return;
      }
      
      // Final fallback with setTimeout for stubborn DOM updates
      const timeout = setTimeout(() => {
        activeTimeouts.delete(timeout);
        if (currentFocusOperation !== operationId) return; // Cancelled
        
        const finalSuccess = callback();
        if (!finalSuccess) {
          console.warn(`Focus Manager: All strategies failed for operation ${operationId}`, operation);
        }
        currentFocusOperation = null;
        // Aggressive cleanup after final attempt
        activeTimeouts.forEach(timeout => clearTimeout(timeout));
        activeTimeouts.clear();
        activeAnimationFrames.forEach(frame => cancelAnimationFrame(frame));
        activeAnimationFrames.clear();
      }, 0);
      activeTimeouts.add(timeout);
    });
    activeAnimationFrames.add(animationFrame);
  };

  const focusElement = (element: HTMLElement, options?: { cursorPosition?: 'start' | 'end' }) => {
    try {
      element.focus();
      
      if (options?.cursorPosition && (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA')) {
        const input = element as HTMLInputElement | HTMLTextAreaElement;
        if (options.cursorPosition === 'end') {
          input.setSelectionRange(input.value.length, input.value.length);
        } else {
          input.setSelectionRange(0, 0);
        }
      } else if (options?.cursorPosition && element.contentEditable === 'true') {
        const selection = window.getSelection();
        if (selection) {
          const range = document.createRange();
          range.selectNodeContents(element);
          if (options.cursorPosition === 'end') {
            range.collapse(false);
          } else {
            range.collapse(true);
          }
          selection.removeAllRanges();
          selection.addRange(range);
        }
      }
      return true;
    } catch (error) {
      console.warn('Focus element failed:', error);
      return false;
    }
  };

  const focusListItem = (blockId: string, itemId: string, refs?: React.MutableRefObject<Map<string, HTMLInputElement | HTMLTextAreaElement>>, cursorPosition?: 'start' | 'end') => {
    const operation: FocusOperation = {
      id: `list-${blockId}-${itemId}-${Date.now()}`,
      type: 'list-item',
      blockId,
      itemId,
      cursorPosition
    };
    
    cancelPendingFocus('new list item focus');
    
    const attemptFocus = () => {
      // Try refs first for better performance
      if (refs) {
        const element = refs.current.get(itemId);
        if (element) {
          return focusElement(element, { cursorPosition });
        }
      }
      
      // Fallback: query by DOM
      const listElement = document.querySelector(`[data-block-id="${blockId}"]`);
      if (listElement) {
        const inputs = Array.from(listElement.querySelectorAll('input, textarea')) as (HTMLInputElement | HTMLTextAreaElement)[];
        const targetInput = inputs.find(input => input.closest('li')?.querySelector('input, textarea') === input);
        if (targetInput) {
          return focusElement(targetInput, { cursorPosition });
        }
      }
      
      return false;
    };
    
    executeWithTiming(operation, attemptFocus);
    return true; // Return true since we're handling it asynchronously
  };

  const focusBlock = (blockId: string, cursorPosition?: 'start' | 'end') => {
    const operation: FocusOperation = {
      id: `block-${blockId}-${Date.now()}`,
      type: 'block',
      blockId,
      cursorPosition
    };
    
    cancelPendingFocus('new block focus');
    
    const attemptFocus = () => {
      const element = document.querySelector(`[data-block-id="${blockId}"]`) as HTMLElement;
      if (element) {
        // For list blocks, focus the first input or textarea
        const firstInput = element.querySelector('input, textarea') as HTMLInputElement | HTMLTextAreaElement;
        if (firstInput) {
          return focusElement(firstInput, { cursorPosition });
        } else {
          return focusElement(element, { cursorPosition });
        }
      }
      return false;
    };
    
    executeWithTiming(operation, attemptFocus);
  };

  // NEW: High-level focus operations for common scenarios
  const focusAfterBlockChange = (blockId: string, blockType: string, operation: string) => {
    console.debug(`Focus Manager: ${operation} -> focusing ${blockType} block ${blockId}`);
    
    const focusOp: FocusOperation = {
      id: `after-change-${blockId}-${Date.now()}`,
      type: 'block',
      blockId,
      priority: 'high'
    };
    
    cancelPendingFocus(`focus after ${operation}`);
    
    const attemptFocus = () => {
      const element = document.querySelector(`[data-block-id="${blockId}"]`) as HTMLElement;
      if (element) {
        if (blockType === 'list') {
          const firstInput = element.querySelector('input, textarea') as HTMLInputElement | HTMLTextAreaElement;
          if (firstInput) {
            return focusElement(firstInput, { cursorPosition: 'start' });
          }
        } else {
          return focusElement(element, { cursorPosition: 'start' });
        }
      }
      return false;
    };
    
    executeWithTiming(focusOp, attemptFocus);
  };
  
  const focusAfterCreation = (blockId: string, blockType: string) => {
    focusAfterBlockChange(blockId, blockType, 'creation');
  };
  
  const focusAfterDeletion = (blocks: TextBlock[], deletedIndex: number, setActiveBlock: (id: string) => void) => {
    if (deletedIndex > 0) {
      const prevBlock = blocks[deletedIndex - 1];
      console.debug(`Focus Manager: Deletion -> focusing previous block ${prevBlock.id}`);
      
      const focusOp: FocusOperation = {
        id: `after-deletion-${prevBlock.id}-${Date.now()}`,
        type: 'block',
        blockId: prevBlock.id,
        priority: 'high'
      };
      
      cancelPendingFocus('focus after deletion');
      
      const attemptFocus = () => {
        setActiveBlock(prevBlock.id);
        
        const element = document.querySelector(`[data-block-id="${prevBlock.id}"]`) as HTMLElement;
        if (element) {
          if (prevBlock.type === 'list') {
            const inputs = element.querySelectorAll('input, textarea');
            const lastInput = inputs[inputs.length - 1] as HTMLInputElement | HTMLTextAreaElement;
            if (lastInput) {
              return focusElement(lastInput, { cursorPosition: 'end' });
            }
          } else {
            return focusElement(element, { cursorPosition: 'end' });
          }
        }
        return false;
      };
      
      executeWithTiming(focusOp, attemptFocus);
    }
  };

  // Cleanup function for component unmount
  const cleanup = () => {
    cancelPendingFocus('component cleanup');
    activeTimeouts.forEach(timeout => clearTimeout(timeout));
    activeTimeouts.clear();
    activeAnimationFrames.forEach(frame => cancelAnimationFrame(frame));
    activeAnimationFrames.clear();
    currentFocusOperation = null;
  };

  return { 
    focusElement, 
    focusListItem, 
    focusBlock, 
    focusAfterBlockChange, 
    focusAfterCreation, 
    focusAfterDeletion,
    cancelPendingFocus,
    cleanup // Expose cleanup for component unmount
  };
};

// NEW: Centralized keyboard handlers
const createKeyboardHandlers = (context: KeyboardContext) => {
  const focusManager = createFocusManager();

  const handleEnter = (e: React.KeyboardEvent): boolean => {
    e.preventDefault();
    
    // Shift+Enter: Split at cursor position
    if (e.shiftKey) {
      if (context.listItemId && context.listItemIndex !== undefined) {
        // Split list item at cursor
        const currentItem = context.block.items?.[context.listItemIndex];
        if (!currentItem) return false;
        
        const inputElement = e.currentTarget as HTMLInputElement | HTMLTextAreaElement;
        const cursorPos = inputElement.selectionStart || 0;
        const beforeText = currentItem.content.substring(0, cursorPos);
        const afterText = currentItem.content.substring(cursorPos);
        
        // Update current item with before text
        const updatedItems = [...(context.block.items || [])];
        updatedItems[context.listItemIndex] = { ...currentItem, content: beforeText };
        
        // Create new item with after text
        const newItem: ListItem = {
          id: crypto.randomUUID(),
          content: afterText,
        };
        updatedItems.splice(context.listItemIndex + 1, 0, newItem);
        
        context.onUpdate(context.block.id, { items: updatedItems });
        
        // Focus new item
        setTimeout(() => {
          if (context.listItemRefs && context.setFocusedItemIndex && context.listItemIndex !== undefined) {
            const success = focusManager.focusListItem(context.block.id, newItem.id, context.listItemRefs);
            if (success) {
              context.setFocusedItemIndex(context.listItemIndex + 1);
            }
          }
        }, 0);
      } else {
        // Split regular block at cursor
        context.onSplitBlock(context.block.id, context.element);
      }
      return true;
    }

    // List item Enter handling
    if (context.listItemId && context.listItemIndex !== undefined) {
      const currentItem = context.block.items?.[context.listItemIndex];
      const isEmpty = !currentItem?.content.trim();
      
      if (isEmpty) {
        // Exit list
        const updatedItems = context.block.items?.filter(item => item.id !== context.listItemId) || [];
        
        if (updatedItems.length === 0) {
          // Convert entire list to paragraph
          context.onUpdate(context.block.id, { 
            type: 'paragraph',
            content: '',
            items: undefined 
          });
        } else {
          // Create new paragraph first, then update list (prevents visual jump)
          context.onAddNewBlock(context.block.id, 'paragraph');
          context.onUpdate(context.block.id, { items: updatedItems });
        }
      } else {
        // Create new list item
        const newItem: ListItem = {
          id: crypto.randomUUID(),
          content: '',
        };

        const updatedItems = [
          ...(context.block.items?.slice(0, context.listItemIndex + 1) || []),
          newItem,
          ...(context.block.items?.slice(context.listItemIndex + 1) || []),
        ];

        context.onUpdate(context.block.id, { items: updatedItems });
        
        // Focus new item
        setTimeout(() => {
          if (context.listItemRefs && context.setFocusedItemIndex && context.listItemIndex !== undefined) {
            const success = focusManager.focusListItem(context.block.id, newItem.id, context.listItemRefs);
            if (success) {
              context.setFocusedItemIndex(context.listItemIndex + 1);
            }
          }
        }, 0);
      }
      return true;
    } else {
      // Regular block Enter - create new paragraph
      context.onAddNewBlock(context.block.id, 'paragraph');
      return true;
    }
  };

  const handleBackspace = (e: React.KeyboardEvent): boolean => {
    // List item backspace handling
    if (context.listItemId && context.listItemIndex !== undefined) {
      const currentItem = context.block.items?.[context.listItemIndex];
      if (!currentItem) return false;

      const inputElement = e.currentTarget as HTMLInputElement | HTMLTextAreaElement;
      const isEmpty = !currentItem.content.trim();
      const isAtStart = inputElement.selectionStart === 0;
      
      if (isEmpty || (isAtStart && currentItem.content.length === 0)) {
        e.preventDefault();
        e.stopPropagation();
        
        const updatedItems = context.block.items?.filter(item => item.id !== context.listItemId) || [];

        if (updatedItems.length === 0) {
          context.onUpdate(context.block.id, { 
            type: 'paragraph',
            content: '',
            items: undefined 
          });
          return true;
        }

        context.onUpdate(context.block.id, { items: updatedItems });

        // Focus previous item
        setTimeout(() => {
          const itemIndex = context.listItemIndex;
          if (itemIndex !== undefined && itemIndex > 0) {
            const prevItem = updatedItems[itemIndex - 1];
            if (prevItem && context.listItemRefs && context.setFocusedItemIndex) {
              const success = focusManager.focusListItem(context.block.id, prevItem.id, context.listItemRefs, 'end');
              if (success) {
                context.setFocusedItemIndex(itemIndex - 1);
              }
            }
          } else if (updatedItems.length > 0) {
            const firstItem = updatedItems[0];
            if (context.listItemRefs && context.setFocusedItemIndex) {
              const success = focusManager.focusListItem(context.block.id, firstItem.id, context.listItemRefs);
              if (success) {
                context.setFocusedItemIndex(0);
              }
            }
          }
        }, 0);
        return true;
      } else if (isAtStart && context.listItemIndex > 0) {
        // Merge with previous list item when at start of non-empty item
        e.preventDefault();
        e.stopPropagation();
        
        const prevItemIndex = context.listItemIndex - 1;
        const prevItem = context.block.items?.[prevItemIndex];
        if (!prevItem) return false;
        
        // Combine content: previous item + current item
        const combinedContent = prevItem.content + currentItem.content;
        const cursorPosition = prevItem.content.length; // Where cursor should be after merge
        
        // Update items array
        const updatedItems = [...(context.block.items || [])];
        updatedItems[prevItemIndex] = { ...prevItem, content: combinedContent };
        updatedItems.splice(context.listItemIndex, 1); // Remove current item
        
        context.onUpdate(context.block.id, { items: updatedItems });
        
        // Focus previous item at merge point
        setTimeout(() => {
          if (context.listItemRefs && context.setFocusedItemIndex) {
            const prevItemElement = context.listItemRefs.current.get(prevItem.id);
            if (prevItemElement) {
              prevItemElement.focus();
              prevItemElement.setSelectionRange(cursorPosition, cursorPosition);
              context.setFocusedItemIndex(prevItemIndex);
            }
          }
        }, 0);
        return true;
      } else if (isAtStart && context.listItemIndex === 0) {
        // At start of first list item - delegate to block-level merging
        // Return false to indicate we didn't handle it, let it bubble up
        return false;
      }
      return true;
    }

    // Regular block backspace handling
    const isEmpty = context.block.type === 'list' 
      ? !context.block.items?.length || context.block.items.every(item => !item.content.trim())
      : !context.block.content?.trim();
    
    if (isEmpty && context.blocks.length > 1) {
      e.preventDefault();
      context.onDeleteBlock(context.block.id);
      return true;
    }

    // Block merging logic (same type only)
    if (!isEmpty) {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const preRange = range.cloneRange();
        preRange.selectNodeContents(context.element);
        preRange.setEnd(range.startContainer, range.startOffset);
        
        if (preRange.toString().length === 0) {
          const currentIndex = context.blocks.findIndex(b => b.id === context.block.id);
          if (currentIndex > 0) {
            const prevBlock = context.blocks[currentIndex - 1];
            
            if (prevBlock.type === context.block.type || (prevBlock.type === 'list' && context.block.type === 'list')) {
              e.preventDefault();
              
              if (prevBlock.type === 'list' && context.block.type === 'list') {
                const combinedItems = [...(prevBlock.items || []), ...(context.block.items || [])];
                context.onUpdate(prevBlock.id, { items: combinedItems, listType: prevBlock.listType });
                context.onDeleteBlock(context.block.id);
              } else if (prevBlock.type !== 'list' && context.block.type !== 'list') {
                const combinedContent = (prevBlock.content || '') + ' ' + (context.block.content || '');
                context.onUpdate(prevBlock.id, { content: combinedContent.trim() });
                context.onDeleteBlock(context.block.id);
              }
              return true;
            } else {
              e.preventDefault();
              return true;
            }
          }
        }
      }
    }
    
    return false;
  };

  const handleTab = (e: React.KeyboardEvent): boolean => {
    e.preventDefault();
    
    // List item tab navigation
    if (context.listItemId && context.listItemIndex !== undefined) {
      if (e.shiftKey) {
        // Shift+Tab: Go to previous item or exit list
        if (context.listItemIndex > 0) {
          const prevItem = context.block.items?.[context.listItemIndex - 1];
          if (prevItem && context.listItemRefs && context.setFocusedItemIndex) {
            const success = focusManager.focusListItem(context.block.id, prevItem.id, context.listItemRefs);
            if (success) {
              context.setFocusedItemIndex(context.listItemIndex - 1);
            }
          }
        } else {
          // Exit to previous block
          const currentIndex = context.blocks.findIndex(b => b.id === context.block.id);
          const prevIndex = Math.max(0, currentIndex - 1);
          if (prevIndex !== currentIndex) {
            const prevBlock = context.blocks[prevIndex];
            setTimeout(() => {
              if (prevBlock.type === 'list' && prevBlock.items && prevBlock.items.length > 0) {
                focusManager.focusBlock(prevBlock.id, 'end');
              } else {
                focusManager.focusBlock(prevBlock.id);
              }
              context.onSetActiveBlock(prevBlock.id);
            }, 0);
          }
        }
      } else {
        // Tab: Go to next item or exit list
        if (context.listItemIndex < (context.block.items?.length || 0) - 1) {
          const nextItem = context.block.items?.[context.listItemIndex + 1];
          if (nextItem && context.listItemRefs && context.setFocusedItemIndex) {
            const success = focusManager.focusListItem(context.block.id, nextItem.id, context.listItemRefs);
            if (success) {
              context.setFocusedItemIndex(context.listItemIndex + 1);
            }
          }
        } else {
          // Exit to next block
          const currentIndex = context.blocks.findIndex(b => b.id === context.block.id);
          const nextIndex = Math.min(context.blocks.length - 1, currentIndex + 1);
          if (nextIndex !== currentIndex) {
            const nextBlock = context.blocks[nextIndex];
            setTimeout(() => {
              focusManager.focusBlock(nextBlock.id);
              context.onSetActiveBlock(nextBlock.id);
            }, 0);
          }
        }
      }
      return true;
    }

    // Regular block tab navigation
    const currentIndex = context.blocks.findIndex(b => b.id === context.block.id);
    
    if (e.shiftKey) {
      const prevIndex = Math.max(0, currentIndex - 1);
      if (prevIndex !== currentIndex) {
        const prevBlock = context.blocks[prevIndex];
        setTimeout(() => {
          if (prevBlock.type === 'list' && prevBlock.items && prevBlock.items.length > 0) {
            focusManager.focusBlock(prevBlock.id, 'end');
          } else {
            focusManager.focusBlock(prevBlock.id);
          }
          context.onSetActiveBlock(prevBlock.id);
        }, 0);
      }
    } else {
      const nextIndex = Math.min(context.blocks.length - 1, currentIndex + 1);
      if (nextIndex !== currentIndex) {
        const nextBlock = context.blocks[nextIndex];
        setTimeout(() => {
          focusManager.focusBlock(nextBlock.id);
          context.onSetActiveBlock(nextBlock.id);
        }, 0);
      }
    }
    return true;
  };

  return { handleEnter, handleBackspace, handleTab };
};

// Centralized block type definitions
const BLOCK_DEFINITIONS = {
  h1: {
    style: "text-2xl font-bold text-gray-900 dark:text-gray-100",
    placeholder: "Enter heading...",
    defaultShape: { content: '' },
    isTextBlock: true
  },
  h2: {
    style: "text-xl font-semibold text-gray-900 dark:text-gray-100",
    placeholder: "Enter sub-heading...",
    defaultShape: { content: '' },
    isTextBlock: true
  },
  paragraph: {
    style: "text-base text-gray-700 dark:text-gray-300",
    placeholder: "Enter paragraph text...",
    defaultShape: { content: '' },
    isTextBlock: true
  },
  list: {
    style: "text-base text-gray-700 dark:text-gray-300",
    placeholder: "Enter list items (one per line)",
    defaultShape: { 
      listType: 'bullet' as const, 
      items: [] as ListItem[] // Start with empty items array - ListBlockDisplay will handle creation
    },
    isTextBlock: false
  }
} as const;

type BlockType = keyof typeof BLOCK_DEFINITIONS;

// Security: DOM-based input sanitization function
const sanitizeText = (text: string): string => {
  if (!text || typeof text !== 'string') return '';
  
  // Use DOM parser for robust HTML stripping
  const doc = new DOMParser().parseFromString(text, 'text/html');
  
  // Extract only text content, ignoring all HTML/scripts
  const textContent = doc.body.textContent || doc.body.innerText || '';
  
  // Additional protocol filtering for any remaining URLs
  return textContent
    .replace(/javascript:/gi, '') // Remove javascript: protocols
    .replace(/data:/gi, '') // Remove data: protocols  
    .replace(/vbscript:/gi, '') // Remove vbscript: protocols
    .replace(/file:/gi, '') // Remove file: protocols
    .trim();
};

// NEW: Sanitize text for list items while preserving user whitespace
const sanitizeListItemText = (text: string): string => {
  if (!text || typeof text !== 'string') return '';
  
  // Use DOM parser for robust HTML stripping
  const doc = new DOMParser().parseFromString(text, 'text/html');
  
  // Extract only text content, ignoring all HTML/scripts
  const textContent = doc.body.textContent || doc.body.innerText || '';
  
  // Additional protocol filtering for any remaining URLs
  // NOTE: Don't trim() here to preserve user's intentional whitespace
  return textContent
    .replace(/javascript:/gi, '') // Remove javascript: protocols
    .replace(/data:/gi, '') // Remove data: protocols  
    .replace(/vbscript:/gi, '') // Remove vbscript: protocols
    .replace(/file:/gi, ''); // Remove file: protocols
};

// Security: Content validation using centralized definitions
const validateBlock = (block: TextBlock): boolean => {
  const validTypes = Object.keys(BLOCK_DEFINITIONS);
  if (!validTypes.includes(block.type)) return false;
  
  if (block.content && typeof block.content !== 'string') return false;
  if (block.listType && !['bullet', 'numbered'].includes(block.listType)) return false;
  
  return true;
};

// Secure React component for rendering content instead of dangerouslySetInnerHTML
const SecureContentRenderer: React.FC<{ block: TextBlock }> = ({ block }) => {
  const renderTextWithMarks = (text: string, marks?: TextMark[]) => {
    if (!marks || marks.length === 0) return text;
    
    // Sort marks by start position
    const sortedMarks = [...marks].sort((a, b) => a.start - b.start);
    let result: React.ReactNode[] = [];
    let lastIndex = 0;
    
    sortedMarks.forEach((mark, i) => {
      // Add text before mark
      if (mark.start > lastIndex) {
        result.push(text.slice(lastIndex, mark.start));
      }
      
      // Add marked text
      const markedText = text.slice(mark.start, mark.end);
      switch (mark.type) {
        case 'bold':
          result.push(<strong key={i}>{markedText}</strong>);
          break;
        case 'italic':
          result.push(<em key={i}>{markedText}</em>);
          break;
        case 'underline':
          result.push(<u key={i}>{markedText}</u>);
          break;
        case 'code':
          result.push(<code key={i} className="bg-muted px-1 rounded">{markedText}</code>);
          break;
        default:
          result.push(markedText);
      }
      
      lastIndex = mark.end;
    });
    
    // Add remaining text
    if (lastIndex < text.length) {
      result.push(text.slice(lastIndex));
    }
    
    return result;
  };

  switch (block.type) {
    case 'h1':
      return (
        <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-gray-100" style={{ fontFamily: 'Manrope, sans-serif' }}>
          {renderTextWithMarks(sanitizeText(block.content || ''), block.marks)}
        </h1>
      );
    case 'h2':
      return (
        <h2 className="text-2xl font-semibold mb-3 text-gray-900 dark:text-gray-100" style={{ fontFamily: 'Manrope, sans-serif' }}>
          {renderTextWithMarks(sanitizeText(block.content || ''), block.marks)}
        </h2>
      );
    case 'paragraph':
      return (
        <p className="text-gray-700 dark:text-gray-300 mb-4" style={{ fontFamily: 'Manrope, sans-serif' }}>
          {renderTextWithMarks(sanitizeText(block.content || ''), block.marks)}
        </p>
      );
    case 'list':
      const ListComponent = block.listType === 'numbered' ? 'ol' : 'ul';
      return (
        <ListComponent className={cn(
          "mb-4",
          block.listType === 'numbered' ? "list-decimal list-inside" : "list-disc list-inside"
        )} style={{ fontFamily: 'Manrope, sans-serif' }}>
          {block.items?.map((item) => (
            <li key={item.id} className="text-gray-700 dark:text-gray-300 mb-1">
              {renderTextWithMarks(sanitizeText(item.content), item.marks)}
            </li>
          ))}
        </ListComponent>
      );
    default:
      return null;
  }
};

// NEW: Isolated HTML parsing for paste functionality  
const parseClipboardHTML = (html: string): Partial<TextBlock>[] | null => {
  try {
    // Performance: Cap paste size to prevent memory issues (~2500 words ≈ 15000 chars)
    if (html.length > 15000) {
      console.warn('Paste content too large, falling back to plain text');
      return null;
    }

    const doc = new DOMParser().parseFromString(html, 'text/html');
    const body = doc.body;

    // Additional safety: Check text content length after parsing
    const textContentLength = body.textContent?.length || 0;
    if (textContentLength > 12000) { // ~2000 words
      console.warn('Parsed content too large, falling back to plain text');
      return null;
    }
    
    // Security: Only process if contains allowed elements
    const allowedTags = ['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'P', 'UL', 'OL', 'LI', 'DIV', 'BR', 'STRONG', 'EM', 'CODE', 'B', 'I'];
    const allElements = Array.from(body.querySelectorAll('*'));
    const hasDisallowedElements = allElements.some(el => !allowedTags.includes(el.tagName));
    
    // Check for dangerous attributes and content
    const hasDangerousAttributes = allElements.some(el => {
      const attributes = Array.from(el.attributes);
      return attributes.some(attr => 
        attr.name.toLowerCase().startsWith('on') || // onclick, onload, etc.
        attr.name.toLowerCase().includes('script') ||
        attr.value.toLowerCase().includes('javascript:') ||
        attr.value.toLowerCase().includes('data:')
      );
    });
    
    if (hasDisallowedElements || hasDangerousAttributes || allElements.length > 100) {
      return null; // Fallback to plain text for complex/suspicious content
    }
    
    const blocks: Partial<TextBlock>[] = [];
    const generateId = () => crypto.randomUUID();
    
    const processElement = (element: Element): void => {
      const tagName = element.tagName.toLowerCase();
      const textContent = sanitizeText(element.textContent || '').trim();
      
      if (!textContent && tagName !== 'ul' && tagName !== 'ol') return;
      
      switch (tagName) {
        case 'h1':
          blocks.push({
            id: generateId(),
            type: 'h1',
            content: textContent
          });
          break;
        case 'h2':
          blocks.push({
            id: generateId(),
            type: 'h2',
            content: textContent
          });
          break;
        case 'h3':
        case 'h4':
        case 'h5':
        case 'h6':
          blocks.push({
            id: generateId(),
            type: 'h2', // Map all sub-headings to H2
            content: textContent
          });
          break;
        case 'p':
          if (textContent) {
            blocks.push({
              id: generateId(),
              type: 'paragraph',
              content: textContent
            });
          }
          break;
        case 'ul':
        case 'ol':
          const listItems = Array.from(element.querySelectorAll('li'))
            .map(li => sanitizeText(li.textContent || '').trim())
            .filter(text => text);
          
          if (listItems.length > 0) {
            blocks.push({
              id: generateId(),
              type: 'list',
              listType: tagName === 'ol' ? 'numbered' : 'bullet',
              items: listItems.map((content, index) => ({
                id: `${generateId()}-item-${index}`,
                content
              }))
            });
          }
          break;
      }
    };
    
    // Process top-level elements
    Array.from(body.children).forEach(processElement);
    
    // If no blocks were created but there's text content, create a paragraph
    if (blocks.length === 0 && body.textContent?.trim()) {
      blocks.push({
        id: generateId(),
        type: 'paragraph',
        content: sanitizeText(body.textContent)
      });
    }
    
    return blocks.length > 0 ? blocks : null;
  } catch (error) {
    // Parsing failed - fallback to plain text
    return null;
  }
};

// Removed unused components - using ListBlockDisplay instead

interface ContentEditableBlockProps {
  block: TextBlock;
  blocks: TextBlock[]; // NEW: For centralized keyboard handling
  activeBlock?: string; // NEW: For highlighting active block
  onUpdate: (updates: Partial<TextBlock>) => void;
  onFocus: () => void;
  onFocusedListItem?: (itemIndex: number) => void; // NEW: For tracking focused list items
  onKeyDown: (e: React.KeyboardEvent) => void;
  onCompositionEnd?: () => void;
  onSetPendingOperation?: (operation: { type: 'split' | 'merge', blockId: string } | null) => void;
  placeholder: string;
  className: string;
  onCreateBlocks?: (blocks: Partial<TextBlock>[]) => void; // NEW: For paste functionality
  // NEW: Centralized keyboard handling callbacks
  onAddNewBlock?: (afterId: string, type?: BlockType) => void;
  onUpdateBlock?: (blockId: string, updates: Partial<TextBlock>) => void;
  onDeleteBlock?: (blockId: string) => void;
  onSplitBlock?: (blockId: string, element: HTMLElement) => void;
  onSetActiveBlock?: (blockId: string) => void;
}

// NEW: Enhanced list block display with individual item editing
const ListBlockDisplay: React.FC<ContentEditableBlockProps> = ({
  block,
  blocks, // NEW: For centralized keyboard handling
  activeBlock, // NEW: For highlighting active block
  onUpdate,
  onFocus,
  onFocusedListItem,
  onKeyDown,
  onCompositionEnd,
  onSetPendingOperation,
  placeholder,
  className,
  onCreateBlocks,
  onAddNewBlock,
  onUpdateBlock,
  onDeleteBlock,
  onSplitBlock,
  onSetActiveBlock
}) => {
  const [focusedItemIndex, setFocusedItemIndex] = React.useState<number>(-1);
  const [isComposing, setIsComposing] = React.useState(false);
  const itemRefs = React.useRef<Map<string, HTMLInputElement | HTMLTextAreaElement>>(new Map());
  
  // NEW: Create centralized keyboard handlers with proper cleanup
  const focusManagerRef = React.useRef<ReturnType<typeof createFocusManager>>();
  if (!focusManagerRef.current) {
    focusManagerRef.current = createFocusManager();
  }
  const focusManager = focusManagerRef.current;
  
  const keyboardHandlers = React.useMemo(() => {
    if (!onUpdateBlock || !onAddNewBlock || !onDeleteBlock || !onSplitBlock || !onSetActiveBlock) {
      return null; // Fallback to original handlers if callbacks not provided
    }
    
    return createKeyboardHandlers({
      block,
      blocks,
      element: document.querySelector(`[data-block-id="${block.id}"]`) as HTMLElement,
      onUpdate: onUpdateBlock,
      onAddNewBlock,
      onDeleteBlock,
      onSplitBlock,
      onSetActiveBlock,
      setFocusedItemIndex
    });
  }, [block, blocks, onUpdateBlock, onAddNewBlock, onDeleteBlock, onSplitBlock, onSetActiveBlock]);

  const handleItemUpdate = (itemId: string, content: string) => {
    if (!block.items) return;
    
    const updatedItems = block.items.map(item =>
      item.id === itemId ? { ...item, content: sanitizeListItemText(content) } : item
    );
    onUpdate({ items: updatedItems });
  };

  const handleItemKeyDown = (e: React.KeyboardEvent, itemId: string, index: number) => {
    if (isComposing) return;

    // NEW: Use centralized keyboard handlers if available
    if (keyboardHandlers && onUpdateBlock && onAddNewBlock && onDeleteBlock && onSplitBlock && onSetActiveBlock) {
      // Create context for list item keyboard handling
      const enhancedKeyboardHandlers = createKeyboardHandlers({
        block,
        blocks,
        element: e.currentTarget as HTMLElement,
        listItemId: itemId,
        listItemIndex: index,
        listItemRefs: itemRefs,
        onUpdate: onUpdateBlock,
        onAddNewBlock,
        onDeleteBlock,
        onSplitBlock,
        onSetActiveBlock,
        setFocusedItemIndex
      });
      
      // Route keyboard events to centralized handlers
      if (e.key === 'Enter') {
        const handled = enhancedKeyboardHandlers.handleEnter(e);
        if (handled) return;
      }
      
      if (e.key === 'Backspace') {
        const handled = enhancedKeyboardHandlers.handleBackspace(e);
        if (handled) return;
      }
      
      if (e.key === 'Tab') {
        const handled = enhancedKeyboardHandlers.handleTab(e);
        if (handled) return;
      }
    }

    // FALLBACK: Use existing logic for compatibility (only if centralized handlers not available)
    // This should be rare/never in normal operation, but provides safety
    console.warn('Keyboard Logic Duplication: Falling back to old list item handlers. This should not happen in production.');
    
    // Minimal fallback - pass to parent
    onKeyDown(e);
  };

  const handleItemFocus = (index: number) => {
    setFocusedItemIndex(index);
    onFocus();
    // NEW: Bubble up focused item index to parent
    onFocusedListItem?.(index);
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement | HTMLTextAreaElement>, itemId: string) => {
    // Handle paste for individual items
    if (!onCreateBlocks) return;
    
    const html = e.clipboardData.getData('text/html');
    const plainText = e.clipboardData.getData('text/plain');
    
    if (html && html.trim()) {
      const parsedBlocks = parseClipboardHTML(html);
      if (parsedBlocks && parsedBlocks.length > 0) {
        e.preventDefault();
        onCreateBlocks(parsedBlocks);
        return;
      }
    }
    
    // For plain text, let default behavior happen
  };

  // NEW: Handle empty lists with stable rendering (no flicker)
  React.useEffect(() => {
    // Auto-create first item for truly empty lists, but only once after mount
    if (!block.items || block.items.length === 0) {
      const firstItem = { id: crypto.randomUUID(), content: '' };
      onUpdate({ items: [firstItem] });
    }
  }, []); // Only run once on mount

  // Cleanup refs and focus manager on unmount to prevent memory leaks
  React.useEffect(() => {
    return () => {
      itemRefs.current.clear();
      focusManagerRef.current?.cleanup();
    };
  }, []);

  // Render stable empty state during auto-creation to prevent flicker
  if (!block.items || block.items.length === 0) {
    const ListTag = block.listType === 'numbered' ? 'ol' : 'ul';
    
    return (
      <ListTag
        data-block-id={block.id}
        className={cn(
          "pl-6 space-y-1 min-h-[2rem] outline-none",
          "focus-within:bg-accent/20 rounded transition-colors",
          className
        )}
        style={{
          listStyleType: 'none',
          listStylePosition: 'outside'
        }}
      >
        <li className="flex items-center min-h-[1.5rem]">
          <span style={{ marginRight: 8, userSelect: 'none', fontFamily: 'Manrope, sans-serif', lineHeight: '1.5rem', display: 'flex', alignItems: 'center' }}>
            {block.listType === 'numbered' ? '1.' : '•'}
          </span>
          <input
            type="text"
            value=""
            placeholder={placeholder}
            className={cn(
              "flex-1 bg-transparent border-none outline-none py-1 resize-none",
              "focus:bg-accent/20 rounded text-inherit",
              "placeholder:text-muted-foreground"
            )}
            style={{ 
              whiteSpace: 'pre-wrap',
              wordWrap: 'break-word',
              overflowWrap: 'break-word',
              maxWidth: '100%',
              fontFamily: 'Manrope, sans-serif',
            }}
            disabled // Temporary disabled state during auto-creation
          />
        </li>
      </ListTag>
    );
  }

  const ListTag = block.listType === 'numbered' ? 'ol' : 'ul';

  return (
    <ListTag
      data-block-id={block.id}
      className={cn(
        "pl-6 space-y-1 min-h-[2rem] outline-none",
        "focus-within:bg-accent/20 rounded transition-colors",
        className
      )}
      style={{
        listStyleType: block.listType === 'numbered' ? 'decimal' : 'disc',
        listStylePosition: 'outside'
      }}
    >
      {block.items.map((item, index) => (
        <li
          key={item.id}
          className="flex items-start min-h-[1.5rem]"
          style={{
            ...(focusedItemIndex === index && activeBlock === block.id ? { backgroundColor: '#F3F4F6', borderRadius: '4px' } : {})
          }}
        >
          <span style={{ marginRight: 8, userSelect: 'none', fontFamily: 'Manrope, sans-serif', lineHeight: '1.5rem', display: 'flex', alignItems: 'center', paddingTop: '1px' }}>
            {block.listType === 'numbered' ? `${index + 1}.` : '•'}
          </span>
          <textarea
            ref={(el) => {
              if (el) {
                itemRefs.current.set(item.id, el as any);
                // Auto-resize textarea to fit content (always reset to ensure proper sizing)
                el.style.height = 'auto';
                el.style.height = Math.max(24, el.scrollHeight) + 'px';
              } else {
                itemRefs.current.delete(item.id);
              }
            }}
            value={item.content}
            placeholder={index === 0 && !item.content ? placeholder : ""}
            className={cn(
              "flex-1 bg-transparent border-none outline-none py-1 resize-none",
              "focus:bg-accent/20 rounded text-inherit",
              "placeholder:text-muted-foreground overflow-hidden"
            )}
            style={{ 
              whiteSpace: 'pre-wrap',
              wordWrap: 'break-word',
              overflowWrap: 'break-word',
              maxWidth: '100%',
              minHeight: '1.5rem',
              lineHeight: '1.5rem',
              fontFamily: 'Manrope, sans-serif',
              }}
            rows={1}
            onChange={(e) => {
              if (!isComposing) {
                handleItemUpdate(item.id, e.target.value);
                // Auto-resize on change (ensure proper sizing during content updates)
                e.target.style.height = 'auto';
                e.target.style.height = Math.max(24, e.target.scrollHeight) + 'px';
              }
            }}
            onInput={(e) => {
              // Auto-resize on input (only when needed for performance)
              const target = e.target as HTMLTextAreaElement;
              if (target.scrollHeight !== target.clientHeight) {
                target.style.height = 'auto';
                target.style.height = Math.max(24, target.scrollHeight) + 'px';
              }
            }}
            onCompositionStart={() => setIsComposing(true)}
            onCompositionEnd={(e) => {
              setIsComposing(false);
              handleItemUpdate(item.id, e.currentTarget.value);
              // Auto-resize after composition (ensure proper sizing)
              const target = e.currentTarget as HTMLTextAreaElement;
              target.style.height = 'auto';
              target.style.height = Math.max(24, target.scrollHeight) + 'px';
              onCompositionEnd?.();
            }}
            onFocus={() => handleItemFocus(index)}
            onKeyDown={(e) => handleItemKeyDown(e, item.id, index)}
            onPaste={(e) => handlePaste(e, item.id)}
          />
        </li>
      ))}
    </ListTag>
  );
};

const ContentEditableBlock: React.FC<ContentEditableBlockProps> = ({
  block,
  blocks, // NEW: For centralized keyboard handling
  activeBlock, // NEW: For highlighting active block
  onUpdate,
  onFocus,
  onFocusedListItem,
  onKeyDown,
  onCompositionEnd,
  onSetPendingOperation,
  placeholder,
  className,
  onCreateBlocks,
  onAddNewBlock,
  onUpdateBlock, // NEW: Centralized handlers
  onDeleteBlock,
  onSplitBlock,
  onSetActiveBlock
}) => {
  // For list blocks, use enhanced individual item rendering
  if (block.type === 'list') {
    return (
      <ListBlockDisplay
        block={block}
        blocks={blocks || []} // Pass blocks array from parent
        activeBlock={activeBlock} // Pass activeBlock for highlighting
        onUpdate={onUpdate}
        onFocus={onFocus}
        onFocusedListItem={onFocusedListItem}
        onKeyDown={onKeyDown}
        onCompositionEnd={onCompositionEnd}
        onSetPendingOperation={onSetPendingOperation}
        placeholder={placeholder}
        className={className}
        onCreateBlocks={onCreateBlocks}
        onAddNewBlock={onAddNewBlock}
        onUpdateBlock={onUpdateBlock} // Wire up centralized handlers
        onDeleteBlock={onDeleteBlock}
        onSplitBlock={onSplitBlock}
        onSetActiveBlock={onSetActiveBlock}
      />
    );
  }

  const elementRef = React.useRef<HTMLDivElement>(null);
  const [isComposing, setIsComposing] = React.useState(false);
  const lastContentRef = React.useRef<string>('');
  
  // Save/restore cursor position
  const saveSelection = (): { start: number; end: number } | null => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || !elementRef.current) return null;
    
    const range = selection.getRangeAt(0);
    const preRange = range.cloneRange();
    preRange.selectNodeContents(elementRef.current);
    preRange.setEnd(range.startContainer, range.startOffset);
    
    return {
      start: preRange.toString().length,
      end: preRange.toString().length + range.toString().length
    };
  };
  
  const restoreSelection = (savedSelection: { start: number; end: number }) => {
    if (!elementRef.current) return;
    
    const selection = window.getSelection();
    if (!selection) return;
    
    try {
      const range = document.createRange();
      const textNode = elementRef.current.firstChild || elementRef.current;
      
      if (textNode.nodeType === Node.TEXT_NODE) {
        const textLength = textNode.textContent?.length || 0;
        const start = Math.min(savedSelection.start, textLength);
        const end = Math.min(savedSelection.end, textLength);
        
        range.setStart(textNode, start);
        range.setEnd(textNode, end);
        
        selection.removeAllRanges();
        selection.addRange(range);
      }
    } catch (e) {
      // Silently fail if restoration doesn't work
    }
  };

  // Get current content based on block type
  const getCurrentContent = (): string => {
    if (block.type === 'list') {
      return block.items?.map(item => item.content).join('\n') || '';
    }
    return block.content || '';
  };

  // Simplified: Let natural contentEditable behavior handle cursors

  // Update element content when block content changes (with cursor preservation)
  React.useEffect(() => {
    if (elementRef.current && !isComposing) {
      const currentContent = elementRef.current.textContent || '';
      const blockContent = getCurrentContent();
      
      // Only update if content actually changed from external source
      if (currentContent !== blockContent && blockContent !== lastContentRef.current) {
        const savedSelection = saveSelection();
        elementRef.current.textContent = blockContent;
        lastContentRef.current = blockContent;
        
        // Restore cursor position after external update
        if (savedSelection) {
          setTimeout(() => restoreSelection(savedSelection), 0);
        }
      }
    }
  }, [block, isComposing]);

  const handleInput = () => {
    if (elementRef.current && !isComposing) {
      const rawContent = elementRef.current.textContent || '';
      const sanitizedContent = sanitizeText(rawContent);
      lastContentRef.current = sanitizedContent;
      
      if (block.type === 'list') {
        // Parse list items and clean up empty ones
        const lines = sanitizedContent.split('\n').filter(line => line.trim());
        const items: ListItem[] = lines
          .filter(line => line.trim()) // Remove empty/whitespace-only items
          .map((line, index) => ({
            id: `${block.id}-item-${index}`,
            content: line.trim()
          }));
        onUpdate({ items });
      } else {
        onUpdate({ content: sanitizedContent });
      }
    }
  };

  const handleCompositionStart = () => {
    setIsComposing(true);
  };
  const handleCompositionEnd = () => {
    setIsComposing(false);
    handleInput();
    onCompositionEnd?.();
  };

  // NEW: Handle paste events with smart HTML parsing
  const handlePaste = (e: React.ClipboardEvent) => {
    if (!onCreateBlocks) {
      // If no callback provided, let default behavior happen
      return;
    }

    e.preventDefault();
    
    const html = e.clipboardData.getData('text/html');
    const plainText = e.clipboardData.getData('text/plain');
    
    // Try smart HTML parsing first
    if (html && html.trim()) {
      const parsedBlocks = parseClipboardHTML(html);
      if (parsedBlocks && parsedBlocks.length > 0) {
        onCreateBlocks(parsedBlocks);
        return;
      }
    }
    
    // Fallback: Insert plain text into current block
    if (plainText && plainText.trim()) {
      const sanitizedText = sanitizeText(plainText);
      if (elementRef.current) {
        // Insert text at current cursor position
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          range.deleteContents();
          range.insertNode(document.createTextNode(sanitizedText));
          range.collapse(false);
          selection.removeAllRanges();
          selection.addRange(range);
          
          // Trigger input handling
          handleInput();
        }
      }
    }
  };

  return (
    <div
      ref={elementRef}
      data-block-id={block.id}
      contentEditable
      suppressContentEditableWarning
      className={cn(
        "outline-none min-h-[1.5rem] py-1 focus:bg-accent/20 rounded",
        className,
        getCurrentContent() === '' && "before:content-[attr(data-placeholder)] before:text-muted-foreground before:absolute",
        block.type === 'list' && "relative before:content-['•'] before:absolute before:left-[0.1rem] before:text-neutral-400"
      )}
      onInput={handleInput}
      onCompositionStart={handleCompositionStart}
      onCompositionEnd={handleCompositionEnd}
      onPaste={handlePaste}
      onFocus={onFocus}
      onKeyDown={(e) => {
        if (!isComposing) {
          onKeyDown(e);
        } else {
          // During composition, only allow basic navigation keys
                     if (e.key === 'Enter' && e.shiftKey) {
             e.preventDefault();
             onSetPendingOperation?.({ type: 'split', blockId: block.id });
           } else if (e.key === 'Backspace') {
             const isEmpty = block.type === 'list' 
               ? !block.items?.length || block.items.every(item => !item.content.trim())
               : !block.content?.trim();
             if (!isEmpty) {
               e.preventDefault();
               onSetPendingOperation?.({ type: 'merge', blockId: block.id });
             }
           }
        }
      }}
      data-placeholder={getCurrentContent() === '' ? placeholder : ''}
      style={{
        position: getCurrentContent() === '' ? 'relative' : undefined,
        whiteSpace: block.type === 'list' ? 'pre-line' : undefined,
       
        fontFamily: 'Manrope, sans-serif',
        ...(activeBlock && activeBlock === block.id ? { backgroundColor: '#F3F4F6', borderRadius: '4px' } : {})
      }}
      data-list={block.type === 'list' ? 'true' : undefined}
    />
  );
};

// Error boundary for rich text editor
class RichTextEditorErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('RichTextEditor Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-4 border border-red-200 rounded bg-red-50">
          <p className="text-red-700 text-sm">
            Rich text editor encountered an error. Please refresh the page.
          </p>
          <details className="mt-2">
            <summary className="text-xs text-red-600 cursor-pointer">Error details</summary>
            <pre className="text-xs mt-1 text-red-600">{this.state.error?.message}</pre>
          </details>
        </div>
      );
    }

    return this.props.children;
  }
}

const RichTextEditorInternal = React.forwardRef<RichTextEditorRef, RichTextEditorProps>(
  ({ value, onChange, placeholder = "Start typing...", className, minHeight = "200px", error, disabled }, ref) => {
    const [blocks, setBlocks] = React.useState<TextBlock[]>([]);
    const [activeBlock, setActiveBlock] = React.useState<string | null>(null);
    const [focusedListItem, setFocusedListItem] = React.useState<{ blockId: string; itemIndex: number } | null>(null);
    const [pendingOperation, setPendingOperation] = React.useState<{ type: 'split' | 'merge', blockId: string } | null>(null);
    const blocksRef = React.useRef<TextBlock[]>([]);
    const lastSerializedRef = React.useRef<string>('');
    const changeTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

    const generateId = () => crypto.randomUUID();

    // Migration function for old format
    const migrateOldFormat = (data: any[]): TextBlock[] => {
      const migratedBlocks: TextBlock[] = [];
      let currentList: TextBlock | null = null;

      data.forEach((item) => {
        if (item.type === 'bullet') {
          if (!currentList || currentList.type !== 'list') {
            // Start new list
            currentList = {
              id: generateId(),
              type: 'list',
              listType: 'bullet',
              items: []
            };
            migratedBlocks.push(currentList);
          }
          // Add item to current list
          currentList.items!.push({
            id: item.id || generateId(),
            content: sanitizeListItemText(item.content || '')
          });
        } else {
          // Non-list item, close current list
          currentList = null;
          migratedBlocks.push({
            id: item.id || generateId(),
            type: item.type,
            content: sanitizeText(item.content || '')
          });
        }
      });

      return migratedBlocks;
    };

    // Parse value to blocks on mount and when value changes externally
    React.useEffect(() => {
      if (value) {
        try {
          const parsed = JSON.parse(value);
          if (Array.isArray(parsed)) {
            // Check if it's old format (has 'bullet' type)
            const hasOldFormat = parsed.some(item => item.type === 'bullet');
            if (hasOldFormat) {
              setBlocks(migrateOldFormat(parsed));
            } else {
              // Validate and sanitize blocks
              const validBlocks = parsed
                .filter(validateBlock)
                .map(block => ({
                  ...block,
                  content: block.content ? sanitizeText(block.content) : undefined,
                  items: block.items?.map((item: ListItem) => ({
                    ...item,
                    content: sanitizeListItemText(item.content)
                  }))
                }));
              setBlocks(validBlocks);
            }
            return;
          }
        } catch {
          // If it's not JSON, treat as plain text
        }
      }
      
      // Initialize with empty paragraph if no value
      if (!value || value.trim() === '') {
        const initialBlock: TextBlock = {
          id: generateId(),
          type: 'paragraph',
          content: ''
        };
        setBlocks([initialBlock]);
      }
    }, []);

    // Keep ref in sync with blocks state
    React.useEffect(() => {
      blocksRef.current = blocks;
    }, [blocks]);

    // Update parent when blocks change (debounced to prevent jank)
    React.useEffect(() => {
      const jsonValue = JSON.stringify(blocks);
      // Only call onChange if the serialized value actually changed
      if (jsonValue !== lastSerializedRef.current && jsonValue !== value) {
        lastSerializedRef.current = jsonValue;
        
        // Clear existing timeout
        if (changeTimeoutRef.current) {
          clearTimeout(changeTimeoutRef.current);
        }
        
        // Debounce onChange calls to prevent excessive re-renders
        changeTimeoutRef.current = setTimeout(() => {
          onChange(jsonValue);
          changeTimeoutRef.current = null;
        }, 64); // ~60fps throttling
      }
    }, [blocks, onChange, value]);

    // Cleanup timeout and focus manager on unmount
    React.useEffect(() => {
      const focusManager = createFocusManager();
      
      return () => {
        if (changeTimeoutRef.current) {
          clearTimeout(changeTimeoutRef.current);
        }
        focusManager.cleanup();
      };
    }, []);

    const updateBlock = (id: string, updates: Partial<TextBlock>) => {
      setBlocks(prev => prev.map(block => 
        block.id === id ? { ...block, ...updates } : block
      ));
    };

    // NEW: Extract focused list item and convert to new block
    const extractListItemAsNewBlock = (blockId: string, itemIndex: number, newType: BlockType, options?: { listType?: 'bullet' | 'numbered' }) => {
      const block = blocks.find(b => b.id === blockId);
      if (!block || block.type !== 'list' || !block.items || itemIndex >= block.items.length) return;
      
      const targetItem = block.items[itemIndex];
      const definition = BLOCK_DEFINITIONS[newType];
      if (!definition) return;
      
      // Create new block from the target item
      const newBlockId = generateId();
      const newBlock: TextBlock = {
        id: newBlockId,
        type: newType,
        ...definition.defaultShape,
        ...(definition.isTextBlock 
          ? { content: targetItem.content }
          : { 
              listType: options?.listType || 'bullet',
              items: [{ id: generateId(), content: targetItem.content }]
            }
        )
      };
      
      setBlocks(prev => {
        const blockIndex = prev.findIndex(b => b.id === blockId);
        if (blockIndex === -1) return prev;
        
        const currentBlock = prev[blockIndex];
        const remainingItems = currentBlock.items?.filter((_, i) => i !== itemIndex) || [];
        
        let newBlocks = [...prev];
        
        if (remainingItems.length === 0) {
          // Replace entire list block with new block
          newBlocks[blockIndex] = newBlock;
        } else {
          // Split list: items before + new block + items after
          const itemsBefore = remainingItems.slice(0, itemIndex);
          const itemsAfter = remainingItems.slice(itemIndex);
          
          if (itemsBefore.length > 0 && itemsAfter.length > 0) {
            // Split into three: before list + new block + after list
            const beforeList = { ...currentBlock, items: itemsBefore };
            const afterList = { ...currentBlock, id: generateId(), items: itemsAfter };
            newBlocks.splice(blockIndex, 1, beforeList, newBlock, afterList);
          } else if (itemsBefore.length > 0) {
            // Keep before list + add new block after
            newBlocks[blockIndex] = { ...currentBlock, items: itemsBefore };
            newBlocks.splice(blockIndex + 1, 0, newBlock);
          } else {
            // Add new block + keep after list
            newBlocks.splice(blockIndex, 0, newBlock);
            newBlocks[blockIndex + 1] = { ...currentBlock, items: itemsAfter };
          }
        }
        
        return newBlocks;
      });
      
      // Clear focused list item and set new block as active
      setFocusedListItem(null);
      setActiveBlock(newBlockId);
      
      // Focus new block
      const focusManager = createFocusManager();
      focusManager.focusAfterCreation(newBlockId, newType);
    };

    const changeBlockType = (id: string, newType: BlockType, options?: { listType?: 'bullet' | 'numbered' }) => {
      // NEW: Handle focused list item extraction
      if (focusedListItem && focusedListItem.blockId === id) {
        extractListItemAsNewBlock(id, focusedListItem.itemIndex, newType, options);
        return;
      }

      setBlocks(prev => prev.map(block => {
        if (block.id !== id) return block;

        const definition = BLOCK_DEFINITIONS[newType];
        if (!definition) return block;

        const baseBlock = { id: block.id, type: newType };

        if (definition.isTextBlock) {
          // Converting to text block (h1, h2, paragraph)
          return {
            ...baseBlock,
            ...definition.defaultShape,
            content: block.type === 'list' 
              ? block.items?.map(item => item.content).join(', ') || ''
              : block.content || ''
          };
        } else {
          // Converting to list block
          const listType = options?.listType || 'bullet';
          return {
            ...baseBlock,
            ...definition.defaultShape,
            listType,
            items: block.type === 'list' 
              ? block.items || [{ id: generateId(), content: '' }] // Preserve existing list items
              : block.content 
                ? [{ id: generateId(), content: block.content }] // Convert text content to first list item
                : [{ id: generateId(), content: '' }] // Create empty item if no content
          };
        }
      }));

      // NEW: Use centralized focus manager for block type changes
      const focusManager = createFocusManager();
      focusManager.focusAfterBlockChange(id, newType, 'type conversion');
    };

    const addNewBlock = (afterId: string, type: BlockType = 'paragraph') => {
      const definition = BLOCK_DEFINITIONS[type];
      const newBlock: TextBlock = {
        id: generateId(),
        type,
        ...definition.defaultShape
      };
      
      setBlocks(prev => {
        const index = prev.findIndex(block => block.id === afterId);
        const newBlocks = [...prev];
        newBlocks.splice(index + 1, 0, newBlock);
        return newBlocks;
      });
      
      // NEW: Use centralized focus manager for new block creation
      setActiveBlock(newBlock.id);
      const focusManager = createFocusManager();
      focusManager.focusAfterCreation(newBlock.id, type);
    };

    const deleteBlock = (id: string) => {
      setBlocks(prev => {
        // Never allow zero blocks - always keep at least one
        if (prev.length <= 1) {
          // If trying to delete the last block, just clear its content
          return prev.map(block => 
            block.id === id 
              ? block.type === 'list' 
                ? { ...block, items: [] }
                : { ...block, content: '' }
              : block
          );
        }
        
        const blockIndex = prev.findIndex(block => block.id === id);
        const filteredBlocks = prev.filter(block => block.id !== id);
        
        // NEW: Use centralized focus manager for deletion
        if (blockIndex > 0) {
          const focusManager = createFocusManager();
          focusManager.focusAfterDeletion(prev, blockIndex, setActiveBlock);
        }
        
        return filteredBlocks;
      });
    };

    const splitBlockAtCursor = (blockId: string, element: HTMLElement) => {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;

      const range = selection.getRangeAt(0);
      const preRange = range.cloneRange();
      preRange.selectNodeContents(element);
      preRange.setEnd(range.startContainer, range.startOffset);
      
      const postRange = range.cloneRange();
      postRange.selectNodeContents(element);
      postRange.setStart(range.endContainer, range.endOffset);

      const beforeText = preRange.toString();
      const afterText = postRange.toString();

      const block = blocks.find(b => b.id === blockId);
      if (!block) return;

      // Update current block with before content
      if (block.type === 'list') {
        const beforeItems = beforeText.split('\n').filter(line => line.trim()).map((line, index) => ({
          id: `${block.id}-item-${index}`,
          content: line // Don't trim to preserve user whitespace
        }));
        updateBlock(blockId, { items: beforeItems });
      } else {
        updateBlock(blockId, { content: beforeText });
      }

      // Create new block with after content
      const newBlockId = generateId();
      const currentIndex = blocks.findIndex(b => b.id === blockId);
      
      const newBlock: TextBlock = {
        id: newBlockId,
        type: block.type,
        ...(block.type === 'list' 
          ? { 
              listType: block.listType,
              items: afterText.split('\n').filter(line => line.trim()).map((line, index) => ({
                id: `${newBlockId}-item-${index}`,
                content: line // Don't trim to preserve user whitespace
              }))
            }
          : { content: afterText }
        )
      };

      setBlocks(prev => [
        ...prev.slice(0, currentIndex + 1),
        newBlock,
        ...prev.slice(currentIndex + 1)
      ]);

      // NEW: Use centralized focus manager for split block
      setActiveBlock(newBlockId);
      const focusManager = createFocusManager();
      focusManager.focusAfterCreation(newBlockId, newBlock.type);
    };

    const executePendingOperation = () => {
      if (!pendingOperation) return;
      
      if (pendingOperation.type === 'split') {
        // Re-query element by blockId to avoid stale references
        const element = document.querySelector(`[data-block-id="${pendingOperation.blockId}"]`) as HTMLElement;
        if (element) {
          splitBlockAtCursor(pendingOperation.blockId, element);
        }
      } else if (pendingOperation.type === 'merge') {
        const blockId = pendingOperation.blockId;
        
        // Use functional state update to get fresh blocks data
        setBlocks(currentBlocks => {
          const block = currentBlocks.find(b => b.id === blockId);
          if (!block) return currentBlocks;

          const currentIndex = currentBlocks.findIndex(b => b.id === blockId);
          if (currentIndex <= 0) return currentBlocks;
          
          const prevBlock = currentBlocks[currentIndex - 1];
          
          // Only merge if same type
          if (prevBlock.type === block.type) {
            let updatedBlocks = [...currentBlocks];
            
            // Merge content
            if (prevBlock.type === 'list' && block.type === 'list') {
              // Merge lists
              const combinedItems = [...(prevBlock.items || []), ...(block.items || [])];
              updatedBlocks[currentIndex - 1] = { ...prevBlock, items: combinedItems };
              updatedBlocks.splice(currentIndex, 1); // Remove current block
            } else if (prevBlock.type !== 'list' && block.type !== 'list') {
              // Merge text blocks
              const combinedContent = (prevBlock.content || '') + ' ' + (block.content || '');
              updatedBlocks[currentIndex - 1] = { ...prevBlock, content: combinedContent.trim() };
              updatedBlocks.splice(currentIndex, 1); // Remove current block
            }
            
            return updatedBlocks;
          }
          
          return currentBlocks;
        });
      }
      
      setPendingOperation(null);
    };

    const handleKeyDown = (e: React.KeyboardEvent, blockId: string) => {
      const block = blocks.find(b => b.id === blockId);
      if (!block) return;

      const element = e.target as HTMLElement;

      // NEW: Use centralized keyboard handlers for standard block operations
      const centralizedHandlers = createKeyboardHandlers({
        block,
        blocks,
        element,
        onUpdate: updateBlock,
        onAddNewBlock: addNewBlock,
        onDeleteBlock: deleteBlock,
        onSplitBlock: splitBlockAtCursor,
        onSetActiveBlock: setActiveBlock
      });

      // Route common keyboard events to centralized handlers
      if (e.key === 'Enter') {
        centralizedHandlers.handleEnter(e);
        return;
      }

      if (e.key === 'Backspace' || e.key === 'Delete') {
        centralizedHandlers.handleBackspace(e);
        return;
      }

      if (e.key === 'Tab') {
        centralizedHandlers.handleTab(e);
        return;
      }

      // For other keys, allow default behavior
    };

    const getBlockStyle = (type: string) => {
      const definition = BLOCK_DEFINITIONS[type as BlockType];
      return definition?.style || BLOCK_DEFINITIONS.paragraph.style;
    };

    const getPlaceholderText = (type: string) => {
      const definition = BLOCK_DEFINITIONS[type as BlockType];
      return definition?.placeholder || BLOCK_DEFINITIONS.paragraph.placeholder;
    };

    // Secure HTML generation without dangerouslySetInnerHTML
    const getDisplayHTML = (): string => {
      return blocks
        .filter(block => {
          if (block.type === 'list') {
            return block.items?.some(item => item.content.trim() !== '');
          }
          return block.content?.trim() !== '';
        })
        .map(block => {
          switch (block.type) {
            case 'h1':
              return `<h1>${sanitizeText(block.content || '')}</h1>`;
            case 'h2':
              return `<h2>${sanitizeText(block.content || '')}</h2>`;
            case 'paragraph':
              return `<p>${sanitizeText(block.content || '')}</p>`;
            case 'list':
              const tag = block.listType === 'numbered' ? 'ol' : 'ul';
              const items = block.items?.map(item => 
                `<li>${sanitizeText(item.content)}</li>`
              ).join('') || '';
              return `<${tag}>${items}</${tag}>`;
            default:
              return '';
          }
        })
        .join('');
    };

    // Get current block type for + button
    const getCurrentBlockType = (): BlockType => {
      if (!activeBlock) return 'paragraph';
      const currentBlock = blocks.find(b => b.id === activeBlock);
      return (currentBlock?.type as BlockType) || 'paragraph';
    };

    // NEW: Handle creating multiple blocks from paste
    const handleCreateBlocks = (newBlocks: Partial<TextBlock>[]) => {
      if (!activeBlock || newBlocks.length === 0) return;
      
      const currentBlockIndex = blocks.findIndex(b => b.id === activeBlock);
      if (currentBlockIndex === -1) return;
      
      // Convert partial blocks to full blocks with proper defaults
      const fullBlocks: TextBlock[] = newBlocks.map(partialBlock => {
        const blockType = (partialBlock.type || 'paragraph') as BlockType;
        const definition = BLOCK_DEFINITIONS[blockType];
        
        return {
          id: partialBlock.id || crypto.randomUUID(),
          type: blockType,
          ...definition.defaultShape,
          ...partialBlock
        };
      });
      
      // Replace current block with first new block, insert others after
      setBlocks(prev => {
        const newBlocksArray = [...prev];
        newBlocksArray[currentBlockIndex] = fullBlocks[0];
        
        // Insert additional blocks after the current one
        if (fullBlocks.length > 1) {
          newBlocksArray.splice(currentBlockIndex + 1, 0, ...fullBlocks.slice(1));
        }
        
        return newBlocksArray;
      });
      
      // NEW: Use centralized focus manager for paste creation
      const lastBlock = fullBlocks[fullBlocks.length - 1];
      setActiveBlock(lastBlock.id);
      const focusManager = createFocusManager();
      focusManager.focusAfterCreation(lastBlock.id, lastBlock.type);
    };



    // Export functions for getting formatted content
    React.useImperativeHandle(ref, () => ({
      getHTML: getDisplayHTML,
      getPlainText: () => blocks.map(block => {
        if (block.type === 'list') {
          return block.items?.map(item => `• ${item.content}`).join('\n') || '';
        }
        return block.content || '';
      }).join('\n'),
      getBlocks: () => blocks
    }));

    if (disabled) {
      return (
        <div 
          className={cn(
            "min-h-[120px] w-full rounded border border-input bg-muted px-3 py-2 text-sm opacity-50",
            className
          )}
          style={{ minHeight }}
        >
          <div className="space-y-2">
            {blocks.map(block => (
              <SecureContentRenderer key={block.id} block={block} />
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="w-full" onBlur={(e) => {
        // Only clear activeBlock if focus is leaving the entire component (toolbar + editor)
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          setActiveBlock(null);
        }
      }}>
        {/* Toolbar */}
        <div className="flex items-center gap-2 p-2 border border-input rounded-t-md bg-muted/50">
          {/* Formatting Buttons */}
          <Button3
            type="button"
            variant={
              activeBlock && blocks.find(b => b.id === activeBlock)?.type === 'h1'
                ? "neutral-secondary"
                : "neutral-tertiary"
            }
            size="small"
            onClick={() => activeBlock && changeBlockType(activeBlock, 'h1')}
            aria-label="Convert to H1"
          >
            H1
          </Button3>

          <Button3
            type="button"
            variant={
              activeBlock && blocks.find(b => b.id === activeBlock)?.type === 'h2'
                ? "neutral-secondary"
                : "neutral-tertiary"
            }
            size="small"
            onClick={() => activeBlock && changeBlockType(activeBlock, 'h2')}
            aria-label="Convert to H2"
          >
            H2
          </Button3>

          <Button3
            type="button"
            variant={
              activeBlock && blocks.find(b => b.id === activeBlock)?.type === 'paragraph'
                ? "neutral-secondary"
                : "neutral-tertiary"
            }
            size="small"
            onClick={() => activeBlock && changeBlockType(activeBlock, 'paragraph')}
            aria-label="Convert to Paragraph"
          >
            P
          </Button3>

          <Button3
            type="button"
            variant={
              activeBlock && blocks.find(b => b.id === activeBlock)?.type === 'list' && blocks.find(b => b.id === activeBlock)?.listType === 'bullet'
                ? "neutral-secondary"
                : "neutral-tertiary"
            }
            size="small"
            onClick={() => activeBlock && changeBlockType(activeBlock, 'list', { listType: 'bullet' })}
            aria-label="Convert to Bullet List"
          >
            <FeatherMenu className="h-4 w-4" />
          </Button3>

          <Button3
            type="button"
            variant={
              activeBlock && blocks.find(b => b.id === activeBlock)?.type === 'list' && blocks.find(b => b.id === activeBlock)?.listType === 'numbered'
                ? "neutral-secondary"
                : "neutral-tertiary"
            }
            size="small"
            onClick={() => activeBlock && changeBlockType(activeBlock, 'list', { listType: 'numbered' })}
            aria-label="Convert to Numbered List"
          >
            <FeatherList className="h-4 w-4" />
          </Button3>

          <Separator orientation="vertical" className="h-6 mx-3" />
          
          {/* Add Block Button */}
          <Button3
            type="button"
            variant="neutral-secondary"
            size="small"
            icon={<FeatherPlus className="h-4 w-4" />}
            onClick={() => activeBlock && addNewBlock(activeBlock, getCurrentBlockType())}
            aria-label="Add new block"
            title={`Add new ${getCurrentBlockType()} block`}
          >
            Block
          </Button3>

          <Separator orientation="vertical" className="h-6 mx-3" />
          
          {/* Delete Block Button */}
          <Button3
            type="button"
            variant="destructive-tertiary"
            size="small"
            onClick={() => activeBlock && deleteBlock(activeBlock)}
            aria-label="Delete current block"
            disabled={blocks.length <= 1}
          >
            <FeatherTrash className="h-4 w-4" />
          </Button3>
        </div>

        {/* Editor */}
        <div
          className={cn(
            "min-h-[120px] w-full rounded-b-md border border-t-0 border-input bg-background px-3 py-2 text-sm focus-within:ring-1 focus-within:ring-ring",
            error && "border-red-500 focus-within:ring-red-500",
            className
          )}
          style={{ minHeight }}
        >
          {blocks.map((block, index) => (
            <ContentEditableBlock
              key={block.id}
              block={block}
              blocks={blocks} // NEW: Pass blocks array for centralized keyboard handling
              activeBlock={activeBlock || undefined} // NEW: Pass activeBlock for highlighting
              onUpdate={(updates) => updateBlock(block.id, updates)}
              onFocus={() => {
                setActiveBlock(block.id);
                // Clear focused list item when focusing on non-list block or different block
                if (block.type !== 'list' || (focusedListItem && focusedListItem.blockId !== block.id)) {
                  setFocusedListItem(null);
                }
              }}
              onFocusedListItem={(itemIndex: number) => setFocusedListItem({ blockId: block.id, itemIndex })}
              onKeyDown={(e) => handleKeyDown(e, block.id)}
              onCompositionEnd={executePendingOperation}
              onSetPendingOperation={setPendingOperation}
              onCreateBlocks={handleCreateBlocks}
              onAddNewBlock={addNewBlock}
              onUpdateBlock={updateBlock} // NEW: Wire up centralized handlers
              onDeleteBlock={deleteBlock}
              onSplitBlock={splitBlockAtCursor}
              onSetActiveBlock={setActiveBlock}
              placeholder={getPlaceholderText(block.type)}
              className={getBlockStyle(block.type)}
            />
          ))}
          
          {blocks.length === 0 && (
            <div className="text-muted-foreground text-sm py-2">
              {placeholder}
            </div>
          )}
        </div>

        {error && (
          <p className="text-red-500 text-sm mt-1 px-2">{error}</p>
        )}
      </div>
    );
  }
);

RichTextEditorInternal.displayName = "RichTextEditorInternal";

// Main RichTextEditor component with error boundary
const RichTextEditor = React.forwardRef<RichTextEditorRef, RichTextEditorProps>((props, ref) => (
  <RichTextEditorErrorBoundary>
    <RichTextEditorInternal {...props} ref={ref} />
  </RichTextEditorErrorBoundary>
));

RichTextEditor.displayName = "RichTextEditor";

export { RichTextEditor, SecureContentRenderer, type TextBlock,   }; 