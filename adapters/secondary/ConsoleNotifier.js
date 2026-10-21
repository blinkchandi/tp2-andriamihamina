// ADAPTATEUR SECONDAIRE : port Notifier, notification « e-mail » simulée dans la console.
export class ConsoleNotifier {
  async orderPlaced(order) {
    const { id, total } = order;
    console.log(`  [e-mail simulé] Commande ${id} payée : ${total} €`);
  }
}
