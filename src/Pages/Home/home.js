import React, { createContext, useContext, useReducer, useState } from 'react';
import '../../global.css';

// 1. DEFINIÇÃO DO CONTEXTO E ESTADO INICIAL
const TaskContext = createContext();

const initialState = {
  tasks: [],
  filter: 'all', // 'all', 'completed', 'pending'
};

// 2. DEFINIÇÃO DO REDUCER
function taskReducer(state, action) {
  switch (action.type) {
    case 'ADD_TASK':
      return {
        ...state,
        tasks: [
          ...state.tasks,
          {
            id: Date.now(),
            text: action.payload,
            completed: false,
            createdAt: new Date(),
            completedAt: null,
          },
        ],
      };
    case 'TOGGLE_TASK':
      return {
        ...state,
        tasks: state.tasks.map((task) => {
          if (task.id === action.payload) {
            const isCompleted = !task.completed;
            return {
              ...task,
              completed: isCompleted,
              completedAt: isCompleted ? new Date() : null,
            };
          }
          return task;
        }),
      };
    case 'REMOVE_TASK':
      return {
        ...state,
        tasks: state.tasks.filter((task) => task.id !== action.payload),
      };
    case 'SET_FILTER':
      return {
        ...state,
        filter: action.payload,
      };
    default:
      return state;
  }
}

// 3. COMPONENTE PROVIDER
function TaskProvider({ children }) {
  const [state, dispatch] = useReducer(taskReducer, initialState);

  return (
    <TaskContext.Provider value={{ state, dispatch }}>
      {children}
    </TaskContext.Provider>
  );
}

// Hook customizado para facilitar o uso do contexto
function useTasks() {
  return useContext(TaskContext);
}

// 4. COMPONENTES DA APLICAÇÃO

function Tarefa({ task }) {
  const { dispatch } = useTasks();

  const handleToggle = () => {
    dispatch({ type: 'TOGGLE_TASK', payload: task.id });
  };

  const handleRemove = () => {
    dispatch({ type: 'REMOVE_TASK', payload: task.id });
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <li className={`task-item ${task.completed ? 'completed' : ''}`}>
      <div className="task-content">
        <span className={`task-text ${task.completed ? 'completed-text' : ''}`}>
          {task.text}
        </span>
        <div className="task-actions">
          <button
            onClick={handleRemove}
            className="remove-button"
            aria-label="Remover tarefa"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="remove-icon"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
          <input
            type="checkbox"
            checked={task.completed}
            onChange={handleToggle}
            className="task-checkbox"
          />
        </div>
      </div>
      <div className="task-meta">
        <span className="created-date">
          Criada em: {formatDate(task.createdAt)}
        </span>
        {task.completed && task.completedAt && (
          <span className="completed-date">
            Concluída em: {formatDate(task.completedAt)}
          </span>
        )}
      </div>
    </li>
  );
}

function ListaDeTarefas() {
  const { state } = useTasks();
  const { tasks, filter } = state;

  const filteredTasks = tasks.filter((task) => {
    if (filter === 'completed') return task.completed;
    if (filter === 'pending') return !task.completed;
    return true; // 'all'
  });

  return (
    <div className="task-list-container">
      {filteredTasks.length > 0 ? (
        <ul className="task-list">
          {filteredTasks.map((task) => (
            <Tarefa key={task.id} task={task} />
          ))}
        </ul>
      ) : (
        <p className="no-tasks-message">Nenhuma tarefa encontrada.</p>
      )}
    </div>
  );
}

function AdicionarTarefaForm() {
  const [text, setText] = useState('');
  const { dispatch } = useTasks();
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim() || !/[a-zA-Z]/.test(text)) {
      setError(
        'Por favor, insira um nome de tarefa válido (deve conter letras).'
      );
      return;
    }

    dispatch({ type: 'ADD_TASK', payload: text });
    setText('');
    setError('');
  };

  return (
    <form onSubmit={handleSubmit} className="add-task-form">
      <div className="input-wrapper">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Digite o nome da tarefa..."
          className="task-input"
        />
        {error && <p className="error-message">{error}</p>}
      </div>
      <button type="submit" className="add-button">
        Adicionar
      </button>
    </form>
  );
}

function Filtros() {
  const { state, dispatch } = useTasks();
  const { filter } = state;

  const getButtonClass = (buttonFilter) => {
    return `filter-button ${filter === buttonFilter ? 'active' : ''}`;
  };

  return (
    <div className="filters-container">
      <button
        onClick={() => dispatch({ type: 'SET_FILTER', payload: 'all' })}
        className={getButtonClass('all')}
      >
        Todas
      </button>
      <button
        onClick={() => dispatch({ type: 'SET_FILTER', payload: 'pending' })}
        className={getButtonClass('pending')}
      >
        Pendentes
      </button>
      <button
        onClick={() => dispatch({ type: 'SET_FILTER', payload: 'completed' })}
        className={getButtonClass('completed')}
      >
        Concluídas
      </button>
    </div>
  );
}

/**
 * Componente Principal: Home
 * Responsabilidade: Estruturar a aplicação e prover o contexto global.
 */
export default function Home() {
  return (
    <TaskProvider>
      <GlobalStyles />
      <div className="app-container">
        <main className="main-content">
          <div className="card">
            <header className="card-header">
              <h1 className="title">Gerenciador de Tarefas</h1>
              <p className="subtitle">Organize as tarefas do seu dia a dia.</p>
            </header>

            <section>
              <h2 className="section-title">Nova Tarefa</h2>
              <AdicionarTarefaForm />
            </section>

            <section className="task-section">
              <Filtros />
              <ListaDeTarefas />
            </section>
          </div>
        </main>
      </div>
    </TaskProvider>
  );
}
