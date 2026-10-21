// ADAPTATEUR SECONDAIRE (piloté) : implémente le port OrderRepository.
export class InMemoryOrderRepository {
  #orders = new Map();
  async save(order) {
    this.#orders.set(order.id, order);
  }
  async findById(id) {
    return this.#orders.get(id) ?? null; // null si la commande n'existe pas
  }
}
