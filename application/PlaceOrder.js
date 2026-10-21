// CAS D'UTILISATION (port entrant) : « passer une commande ».
// Il dépend de PORTS SORTANTS injectés, décrits ici par leur contrat :
//   orderRepository : { save(order), findById(id) }
//   catalog         : { priceOf(sku) }               -> prix unitaire ou undefined
//   payment         : { charge({ orderId, amount }) } -> { ok: true } ou { ok: false, reason }
//   notifier        : { orderPlaced(order) }
//   clock / ids     : { now() } / { next() }          -> rend le code déterministe en test
// Il n'importe que le domaine et ne fait jamais `new` d'un adaptateur.
import { Order } from '../domain/Order.js';

export class PlaceOrder {
  constructor({ orderRepository, catalog, payment, notifier, clock, ids }) {
    Object.assign(this, { orderRepository, catalog, payment, notifier, clock, ids });
  }

  async handle({ customerId, items }) {
    // 1. prix de chaque produit
    const lines = (items ?? []).map(({ sku, qty }) => {
      const unitPrice = this.catalog.priceOf(sku);
      if (unitPrice === undefined) throw new Error(`Produit inconnu : ${sku}`);
      return { sku, qty, unitPrice };
    });
    // 2. création de la commande (le domaine vérifie ses règles)
    const order = new Order({
      id: this.ids.next(),
      customerId,
      lines,
      createdAt: this.clock.now(),
    });
    // 3. paiement, 4. payée ou refusée selon la réponse du prestataire
    const paiement = await this.payment.charge({ orderId: order.id, amount: order.total });
    if (paiement.ok) order.marquerPayee();
    else order.marquerRefusee(paiement.reason);
    // 5. enregistrée dans les deux cas
    await this.orderRepository.save(order);
    // 6. notification seulement si payée
    if (order.statut === 'PAYEE') await this.notifier.orderPlaced(order);
    // 7.
    return order;
  }
}
