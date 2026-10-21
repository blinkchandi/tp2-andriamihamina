// COMPOSITION ROOT : le SEUL fichier qui connaît tous les adaptateurs.
// Il les crée, les branche sur les ports de PlaceOrder et démarre l'API HTTP.
import { PlaceOrder } from './application/PlaceOrder.js';
import { createHttpServer } from './adapters/primary/httpServer.js';
import { InMemoryOrderRepository } from './adapters/secondary/InMemoryOrderRepository.js';
import { StaticCatalog } from './adapters/secondary/StaticCatalog.js';
import { FakePayment } from './adapters/secondary/FakePayment.js';
import { ConsoleNotifier } from './adapters/secondary/ConsoleNotifier.js';

const orderRepository = new InMemoryOrderRepository();
let n = 0;
const placeOrder = new PlaceOrder({
  orderRepository,
  catalog: new StaticCatalog(),
  payment: new FakePayment(),
  notifier: new ConsoleNotifier(),
  clock: { now: () => new Date().toISOString() },
  ids: { next: () => `CMD-${String(++n).padStart(4, '0')}` },
});

const PORT = Number(process.env.PORT) || 3001; // le 3000 sert au modèle
createHttpServer({ placeOrder, orderRepository }).listen(PORT, () => {
  console.log(`API ShopLite (TP 2) sur http://localhost:${PORT}  (Ctrl+C pour arrêter)`);
});
