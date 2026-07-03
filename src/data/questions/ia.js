export default [
  {
    level: 'inter',
    q: "Qu'est-ce que le RAG (Retrieval-Augmented Generation) ?",
    choices: [
      'Un fine-tuning du modèle sur des données privées',
      "Rechercher (souvent par similarité vectorielle) les documents pertinents et les injecter dans le prompt pour que le LLM réponde à partir de VOS données, à jour et sourcées",
      'Un modèle génératif entraîné par renforcement',
      'Un cache de réponses du LLM',
    ],
    answer: 1,
    explain:
      "Pipeline type : découper les documents en chunks → calculer des embeddings → stocker en base vectorielle (pgvector marche très bien depuis Postgres !) → à chaque question, retrouver les k chunks les plus proches → les mettre dans le contexte du prompt. Beaucoup moins coûteux et plus maintenable qu'un fine-tuning pour de la connaissance métier.",
  },
  {
    level: 'inter',
    q: "Dans une API de LLM, à quoi sert le paramètre `temperature` ?",
    choices: [
      "À limiter le coût de l'appel",
      "À contrôler l'aléa de l'échantillonnage : basse (~0) = réponses déterministes et factuelles, haute (~1) = réponses variées et créatives",
      'À définir la longueur maximale de réponse',
      'À activer le mode raisonnement',
    ],
    answer: 1,
    explain:
      "Le modèle produit une distribution de probabilités sur le prochain token ; la température l'aplatit ou l'accentue. Pour de l'extraction de données, de la classification ou du code : température basse. Pour du brainstorming ou de la rédaction : plus haute. (max_tokens contrôle la longueur.)",
  },
  {
    level: 'avance',
    q: "Qu'est-ce que le « function calling » / « tool use » d'un LLM ?",
    choices: [
      'Le LLM exécute du code sur ses serveurs',
      "On décrit des fonctions (nom, paramètres, schéma JSON) ; le modèle répond par une demande d'appel structurée, VOTRE code exécute la fonction et renvoie le résultat au modèle qui poursuit",
      'Un plugin navigateur du chatbot',
      "Une technique de fine-tuning sur des API",
    ],
    answer: 1,
    explain:
      "Le modèle ne « fait » rien : il émet une intention structurée (`{\"name\": \"search_orders\", \"arguments\": {\"client_id\": 42}}`), c'est votre application qui exécute et renvoie le résultat. C'est la brique de base des agents. Côté PHP, ça s'intègre très bien dans un service Symfony qui boucle jusqu'à la réponse finale.",
  },
  {
    level: 'avance',
    q: "Pourquoi les embeddings sont-ils l'outil clé de la recherche sémantique ?",
    choices: [
      'Ils compressent le texte pour économiser du stockage',
      "Ils projettent le texte dans un espace vectoriel où la proximité (cosinus) reflète la similarité de SENS : « facture impayée » matche « relance de règlement » sans mot commun",
      'Ils indexent les mots-clés plus vite que LIKE',
      'Ils chiffrent les données sensibles',
    ],
    answer: 1,
    explain:
      "Contrairement au full-text (lexical), la recherche vectorielle capture la sémantique. En pratique on combine souvent les deux (recherche hybride + reranking). Pour un backend PHP : pgvector ajoute le type `vector` et les index HNSW à Postgres — pas besoin d'une base vectorielle dédiée pour commencer.",
  },
]
