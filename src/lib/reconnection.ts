export class ReconnectionHandler {
  private retryCount = 0;
  private maxRetries = 5;
  private baseDelay = 1000;

  async attemptReconnection(reconnectFn: () => Promise<void>): Promise<boolean> {
    if (this.retryCount >= this.maxRetries) {
      console.error("Max reconnection attempts reached");
      return false;
    }

    const delay = this.baseDelay * Math.pow(2, this.retryCount);
    this.retryCount++;

    try {
      await new Promise((resolve) => setTimeout(resolve, delay));
      await reconnectFn();
      this.reset();
      return true;
    } catch (error) {
      console.error(`Reconnection attempt ${this.retryCount} failed:`, error);
      return this.attemptReconnection(reconnectFn);
    }
  }

  reset() {
    this.retryCount = 0;
  }

  getRetryCount(): number {
    return this.retryCount;
  }
}
