# ADR-0001 : Architecture hexagonale pour le module Commande, avec un port de paiement

- Date : 2026-10-21
- Statut : Accepté
- Décideurs : Andriamihamina (TP 2, parcours Dev)

## Contexte

Le module Commande de ShopLite doit encaisser chaque commande avant de la confirmer. Aujourd'hui le paiement est simulé (`FakePayment`, qui refuse au-delà de 500 €) et les commandes sont stockées en mémoire. Mais un vrai prestataire de paiement sera branché plus tard, avec ses propres plafonds et ses propres refus, et le stockage passera à une base PostgreSQL. Ces deux briques vont donc changer, alors que les règles de la commande ne changent pas : client obligatoire, au moins une ligne, quantité entière positive, un seul changement de statut (`EN_ATTENTE` puis `PAYEE` ou `REFUSEE`). Enfin, on veut tester ces règles et le déroulé « payer, enregistrer, notifier » en quelques secondes, sans serveur, sans base et sans prestataire réel.

## Décision

Le domaine (`Order`) et le cas d'utilisation (`PlaceOrder`) sont isolés derrière des ports injectés (`orderRepository`, `catalog`, `payment`, `notifier`, `clock`, `ids`). Les adaptateurs (HTTP, mémoire, faux paiement, console) sont branchés uniquement dans `main.js`, et la règle « le domaine n'importe rien » est vérifiée par `npm run lint:archi`.

## Conséquences

- (+) Passer à un vrai prestataire ou à PostgreSQL revient à écrire un nouvel adaptateur et à changer une ligne de `main.js`. `Order` et `PlaceOrder` ne bougent pas.
- (+) Les règles du prestataire restent chez le prestataire : le plafond de 500 € est dans `FakePayment`, pas dans le métier.
- (+) 9 tests (entité et cas d'utilisation) tournent en moins d'une seconde, sans serveur ni base, grâce aux adaptateurs en mémoire, à une horloge fixe et à des ids fixes.
- (+) La règle de dépendance est vérifiée par un outil : un import d'adaptateur dans `domain/` fait échouer `lint:archi` (essayé : `Order.js -> ../adapters/secondary/FakePayment.js`).
- (-) Plus de fichiers et d'indirections : 8 fichiers de code pour un seul cas d'utilisation. Un nouvel arrivant doit comprendre ports, adaptateurs et composition root avant de suivre une commande.
- (-) Les ports ne sont que des contrats en commentaire (JavaScript n'a pas d'interface). Un adaptateur mal écrit n'est détecté qu'à l'exécution ou par les tests.
- (-) Avec PostgreSQL, il faudra écrire et maintenir la traduction entre l'objet `Order` (champs privés, statut) et les tables `orders` / `order_lines`.
- (-) `lint:archi` ne contrôle que `domain/` : rien n'empêche encore `application/` d'importer un adaptateur.

## Alternatives considérées

- **Architecture en couches classique** (contrôleur, service, accès aux données) : rejetée, parce que le service dépendrait directement de la couche de données et du SDK de paiement. Les tests demanderaient une base et un prestataire (ou de lourds mocks), et changer de prestataire obligerait à modifier le service.
- **Plafond de 500 € et appel au prestataire écrits directement dans `PlaceOrder`** : rejeté, parce que la règle appartient au prestataire. Elle changerait à chaque changement de prestataire et mélangerait métier et technique.
