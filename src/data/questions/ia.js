export default [
  {
    level: 'inter',
    q: "Qu'est-ce que le RAG (Retrieval-Augmented Generation) ?",
    choices: [
      "Un fine-tuning léger (type LoRA) du modèle sur les documents internes de l'entreprise, refait à chaque mise à jour",
      'Rechercher les documents pertinents (similarité vectorielle) et les injecter dans le prompt pour une réponse sourcée et à jour',
      'Un cache sémantique des réponses du LLM, invalidé automatiquement quand les documents sources changent',
      'Une technique de génération contrainte garantissant que chaque affirmation cite un document source vérifiable',
    ],
    answer: 1,
    explain:
      "Pipeline type : découper les documents en chunks → embeddings → base vectorielle (pgvector fonctionne très bien dans Postgres) → à chaque question, retrouver les k chunks les plus proches → les injecter dans le contexte du prompt.",
    why: "Pour de la connaissance métier à jour, le RAG bat le fine-tuning en coût et en maintenance — et ton profil back-end + Postgres est exactement celui qui l'implémente.",
    doc: 'https://fr.wikipedia.org/wiki/G%C3%A9n%C3%A9ration_augment%C3%A9e_de_r%C3%A9cup%C3%A9ration',
  },
  {
    level: 'inter',
    q: "Dans une API de LLM, à quoi sert le paramètre `temperature` ?",
    choices: [
      'Il plafonne le coût de l\'appel en tokens de sortie ; à zéro, la réponse est tronquée au strict minimum',
      'Il contrôle l\'aléa de l\'échantillonnage : basse ≈ déterministe et factuel, haute ≈ varié et créatif',
      'Il active le mode raisonnement étendu du modèle dès que sa valeur dépasse un seuil d\'environ 0,7',
      'Il pondère la fenêtre de contexte : plus il est haut, plus les tokens anciens sont progressivement oubliés',
    ],
    answer: 1,
    explain:
      "Le modèle produit une distribution de probabilités sur le prochain token ; la température l'aplatit ou l'accentue. Extraction, classification, code : température basse. Brainstorming, rédaction : plus haute. (La longueur, c'est max_tokens.)",
    why: "Mal réglée, la température explique des sorties « aléatoires » qu'on prend pour des bugs d'intégration — premier réglage à vérifier.",
    doc: 'https://docs.claude.com/en/api/messages',
  },
  {
    level: 'avance',
    q: "Qu'est-ce que le « function calling » / « tool use » d'un LLM ?",
    choices: [
      'Le LLM exécute le code de la fonction dans une sandbox distante sécurisée puis renvoie le résultat final',
      'On décrit des fonctions (schéma JSON) ; le modèle émet une demande d\'appel structurée, VOTRE code exécute et renvoie le résultat',
      'Un fine-tuning du modèle sur la documentation OpenAPI de vos endpoints internes pour qu\'il les connaisse',
      'Un plugin navigateur qui autorise le chatbot à appeler vos API en votre nom avec vos cookies de session',
    ],
    answer: 1,
    explain:
      "Le modèle ne « fait » rien : il émet une intention structurée (`{\"name\": \"search_orders\", \"arguments\": {...}}`), votre application exécute et renvoie le résultat au modèle, qui poursuit. C'est la brique de base des agents.",
    why: "Côté back-end Symfony, c'est toi qui écris la boucle exécution → résultat → réponse finale — compétence d'intégration LLM très demandée.",
    doc: 'https://docs.claude.com/en/docs/agents-and-tools/tool-use/overview',
  },
  {
    level: 'avance',
    q: 'Pourquoi les embeddings sont-ils la clé de la recherche sémantique ?',
    choices: [
      'Ils compressent le texte (façon LZ) pour accélérer les comparaisons exactes entre grands corpus de documents',
      'Ils projettent le texte dans un espace vectoriel où la proximité reflète la similarité de SENS, sans mot commun requis',
      'Ils indexent les mots-clés dans un arbre B inversé, comme un moteur full-text classique mais optimisé',
      "Ils chiffrent les données sensibles tout en préservant l'ordre lexicographique nécessaire aux tris SQL",
    ],
    answer: 1,
    explain:
      "Contrairement au full-text (lexical), la recherche vectorielle capture la sémantique : « facture impayée » matche « relance de règlement ». En pratique on combine souvent les deux (recherche hybride + reranking). pgvector ajoute le type `vector` et les index HNSW à Postgres.",
    why: "Le cœur de tout RAG — et avec pgvector, pas besoin d'une base vectorielle dédiée pour commencer depuis ton stack existant.",
    doc: 'https://github.com/pgvector/pgvector',
  },
]
