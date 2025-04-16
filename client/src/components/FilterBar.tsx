import React, { useState } from 'react';
import { useTodoContext } from '../context/TodoContext';
import styles from '../styles/FilterBar.module.css';

const FilterBar = () => {
  const { state, dispatch } = useTodoContext();
  const [searchInput, setSearchInput] = useState('');

  const handleFilterChange = (filter: 'all' | 'active' | 'completed') => {
    dispatch({ type: 'SET_FILTER', payload: filter });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
    dispatch({ type: 'SET_SEARCH_QUERY', payload: e.target.value });
  };

  return (
    <div className={styles.filterBar}>
      <div className={styles.filterButtons}>
        <button
          onClick={() => handleFilterChange('all')}
          className={state.filter === 'all' ? styles.active : ''}
          aria-label="Show all tasks"
        >
          All
        </button>
        <button
          onClick={() => handleFilterChange('active')}
          className={state.filter === 'active' ? styles.active : ''}
          aria-label="Show active tasks"
        >
          Active
        </button>
        <button
          onClick={() => handleFilterChange('completed')}
          className={state.filter === 'completed' ? styles.active : ''}
          aria-label="Show completed tasks"
        >
          Completed
        </button>
      </div>
      <input
        type="text"
        placeholder="Search tasks..."
        value={searchInput}
        onChange={handleSearchChange}
        className={styles.searchInput}
        aria-label="Search tasks"
      />
    </div>
  );
};

export default FilterBar;