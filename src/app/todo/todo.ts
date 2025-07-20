import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

type TodoItem = {
  text: string;
  completed: boolean;
  createdAt: string;
};

@Component({
  selector: 'app-todo',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './todo.html',
  styleUrl: './todo.css',
})
export class Todo {
  todos = signal<TodoItem[]>(this.loadTodos());
  newTodo = signal<string>('');
  filter = signal<'all' | 'active' | 'completed'>(this.loadFilter());

  addTodo() {
    const todo = this.newTodo().trim();
    if (todo) {
      const date = new Date();
      const formattedDate = date.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
      this.todos.update(list => [...list, { text: todo, completed: false, createdAt: formattedDate }]);
      this.newTodo.set('');
      this.saveToSession();
    }
  }

  toggleComplete(index: number) {
    this.todos.update(list =>
      list.map((t, i) => i === index ? { ...t, completed: !t.completed } : t)
    );
    this.saveToSession();
  }

  deleteTodo(index: number) {
    this.todos.update(list => list.filter((_, i) => i !== index));
    this.saveToSession();
  }

  setFilter(f: 'all' | 'active' | 'completed') {
    this.filter.set(f);
    this.saveToSession();
  }

  clearCompleted() {
    this.todos.update(list => list.filter(todo => !todo.completed));
    this.saveToSession();
  }

  get filteredTodos() {
    return this.todos().filter(todo => {
      if (this.filter() === 'active') return !todo.completed;
      if (this.filter() === 'completed') return todo.completed;
      return true;
    });
  }

  get activeCount() {
    return this.todos().filter(todo => !todo.completed).length;
  }

  private saveToSession() {
    sessionStorage.setItem('todos', JSON.stringify(this.todos()));
    sessionStorage.setItem('filter', this.filter());
  }

  private loadTodos(): TodoItem[] {
    const saved = sessionStorage.getItem('todos');
    return saved ? JSON.parse(saved) : [];
  }

  private loadFilter(): 'all' | 'active' | 'completed' {
    const saved = sessionStorage.getItem('filter');
    return saved === 'active' || saved === 'completed' ? saved : 'all';
  }
}
