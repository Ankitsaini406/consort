// A simple, lightweight event emitter
type Handler = (data?: any) => void;

class EventEmitter {
  private events: Record<string, Handler[]> = {};

  on(event: string, handler: Handler): void {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(handler);
  }

  off(event: string, handler: Handler): void {
    if (!this.events[event]) {
      return;
    }
    this.events[event] = this.events[event].filter(h => h !== handler);
  }

  emit(event: string, data?: any): void {
    if (!this.events[event]) {
      return;
    }
    this.events[event].forEach(handler => handler(data));
  }
}

const eventEmitter = new EventEmitter();
export default eventEmitter; 