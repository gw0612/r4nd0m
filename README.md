# R4ND0M

Générateur d'aléa à partir du bruit physique d'un capteur photo. Tout se passe dans le navigateur : la photo n'est jamais stockée ni envoyée.

## Fonctionnement

1. Deux images brutes consécutives sont lues depuis la caméra (`getUserMedia` → canvas → `getImageData`, sans JPEG).
2. La différence entre les deux images isole le bruit du capteur. Elle passe des tests issus de la norme NIST SP 800-90B :
   - tests de santé : Repetition Count Test (§4.4.1) et Adaptive Proportion Test (§4.4.2), α = 2⁻²⁰, H revendiquée = 0,5 bit/échantillon ;
   - estimateurs de min-entropie : Most Common Value (§6.3.1) et Markov (§6.3.3), combinés selon §3.1.3.

   Une capture trop pauvre en bruit est refusée. Il faut au moins 256 + 64 bits d'entropie estimée (§3.1.5).
3. Les pixels sont mélangés à `crypto.getRandomValues` et à `performance.now()`, puis hachés en SHA-256.
4. Le résultat est étendu avec HKDF-SHA256, sans biais : rejection sampling, jamais de modulo.
5. Les tampons sont remis à zéro et la caméra est coupée.

Une politique de sécurité (CSP `connect-src 'none'`) empêche toute requête réseau depuis la page.

Ces tests sont une vérification à l'exécution. Ils ne valent ni validation ni certification SP 800-90B.

## Formats

- Mot de passe : caractères ou phrase de passe (liste BIP-39 française de 2048 mots).
- Clé : hex, base64, UUID v4.
- Nombre : intervalle d'entiers, dés.
- Tirage : pile ou face, tirage ou mélange d'une liste.

Jusqu'à 20 résultats d'un coup. Un bouton permet de masquer le résultat à l'écran. Le presse-papiers est effacé 30 s après la copie (option).

## Utilisation

L'app est installable (PWA) et fonctionne hors ligne une fois chargée. La caméra exige HTTPS, ou `localhost` en local :

```sh
npx serve .
```

## Crédits

Liste de mots : [BIP-39 French wordlist](https://github.com/bitcoin/bips/blob/master/bip-0039/french.txt).
